import { Button } from '@/components/button/button';
import { createEvent } from '@/shared/api/events';
import { geocode } from '@/shared/api/locations';
import { reverseGeocode } from '@/shared/api/nominatim';
import { lookupCep } from '@/shared/api/viacep';
import { ApiError } from '@/shared/helpers/api-error';
import { categoryIcon } from '@/shared/helpers/category-icon';
import { handleError } from '@/shared/helpers/handle-error';
import { notifyError, notifySuccess } from '@/shared/helpers/notify';
import type { Category, Coordinates } from '@/shared/types';
import { divIcon, Marker as LeafletMarker, type LeafletEvent } from 'leaflet';
import { ArrowRight, Compass, LocateFixed, X } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import styles from '@/components/modal/modal.module.css';

type ReportFormProps = {
  categories: Category[];
  onClose: () => void;
  onCreated: () => void;
};

type AddressMode = 'manual' | 'device';

function readDevicePosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('unavailable'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => reject(new Error('denied')),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    );
  });
}

const pinIcon = divIcon({
  html: '<span style="display:block;width:16px;height:16px;border-radius:9999px;background:#0d9488;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.3)"></span>',
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, 16);
    const id = window.setTimeout(() => map.invalidateSize(), 80);
    return () => window.clearTimeout(id);
  }, [center, map]);

  return null;
}

export function ReportForm({ categories, onClose, onCreated }: ReportFormProps) {
  const [categoryId, setCategoryId] = useState<number | null>(categories[0]?.id ?? null);
  const [description, setDescription] = useState('');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pin, setPin] = useState<Coordinates | null>(null);
  const [viewCenter, setViewCenter] = useState<[number, number] | null>(null);
  const [needsManualPin, setNeedsManualPin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lookingUpCep, setLookingUpCep] = useState(false);
  const [locating, setLocating] = useState(false);
  const [addressMode, setAddressMode] = useState<AddressMode>('manual');

  const lookedUpCep = useRef<string | null>(null);
  const geocodedKey = useRef<string | null>(null);
  const addressKeyRef = useRef('');

  const cepDigits = cep.replace(/\D/g, '');
  const addressKey = [
    street.trim(),
    streetNumber.trim(),
    neighborhood.trim(),
    city.trim(),
    state.trim(),
    cepDigits.length === 8 ? cepDigits : '',
  ].join('|');
  addressKeyRef.current = addressKey;

  useEffect(() => {
    if (addressMode === 'device') return;

    const [streetValue, numberValue, neighborhoodValue, cityValue, stateValue, cepValue] =
      addressKey.split('|');
    const complete = Boolean(
      streetValue && numberValue && neighborhoodValue && cityValue && stateValue.length === 2,
    );

    if (!complete) return;
    if (pin && geocodedKey.current === addressKey) return;

    if (pin && geocodedKey.current !== addressKey) {
      setPin(null);
      setViewCenter(null);
      return;
    }

    if (geocodedKey.current === addressKey) return;

    const key = addressKey;
    const timer = window.setTimeout(async () => {
      try {
        const result = await geocode({
          street: streetValue,
          streetNumber: numberValue,
          neighborhood: neighborhoodValue,
          city: cityValue,
          state: stateValue,
          cep: cepValue || undefined,
        });
        if (addressKeyRef.current !== key) return;
        geocodedKey.current = key;
        setNeedsManualPin(false);
        setPin(result);
        setViewCenter([result.latitude, result.longitude]);
      } catch (error) {
        if (addressKeyRef.current !== key) return;
        geocodedKey.current = key;
        if (error instanceof ApiError && error.code === 'LOCATION_NOT_FOUND') {
          setNeedsManualPin(true);
        }
        handleError(error);
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [addressKey, pin, addressMode]);

  async function handleCepChange(value: string) {
    setCep(value);
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 8 || lookedUpCep.current === digits) return;

    lookedUpCep.current = digits;
    setLookingUpCep(true);
    try {
      const address = await lookupCep(digits);
      setStreet(address.street);
      setNeighborhood(address.neighborhood);
      setCity(address.city);
      setState(address.state);
    } catch (error) {
      lookedUpCep.current = null;
      handleError(error);
    } finally {
      setLookingUpCep(false);
    }
  }

  function clearAddress() {
    setCep('');
    setStreet('');
    setStreetNumber('');
    setNeighborhood('');
    setCity('');
    setState('');
    setPin(null);
    setViewCenter(null);
    setNeedsManualPin(false);
    lookedUpCep.current = null;
    geocodedKey.current = null;
  }

  function switchAddressMode(next: AddressMode) {
    if (next === addressMode) return;
    clearAddress();
    setAddressMode(next);
  }

  async function handleMarkPin() {
    try {
      const next = await readDevicePosition();
      geocodedKey.current = addressKeyRef.current;
      setNeedsManualPin(false);
      setPin(next);
      setViewCenter([next.latitude, next.longitude]);
    } catch (error) {
      notifyError(
        error instanceof Error && error.message === 'unavailable'
          ? 'Geolocalização não disponível neste navegador'
          : 'Não foi possível obter sua localização',
      );
    }
  }

  async function handleUseDeviceAddress() {
    setLocating(true);
    try {
      const next = await readDevicePosition();
      const reversed = await reverseGeocode(next.latitude, next.longitude);
      let streetValue = reversed.street;
      let neighborhoodValue = reversed.neighborhood;
      let cityValue = reversed.city;
      let stateValue = reversed.state;
      const cepValue = reversed.cep;

      if (cepValue.length === 8) {
        try {
          const viaCep = await lookupCep(cepValue);
          lookedUpCep.current = cepValue;
          if (viaCep.street) streetValue = viaCep.street;
          if (viaCep.neighborhood) neighborhoodValue = viaCep.neighborhood;
          if (viaCep.city) cityValue = viaCep.city;
          if (viaCep.state) stateValue = viaCep.state;
        } catch {
          lookedUpCep.current = null;
        }
      }

      setCep(cepValue);
      setStreet(streetValue);
      setStreetNumber(reversed.streetNumber);
      setNeighborhood(neighborhoodValue);
      setCity(cityValue);
      setState(stateValue);
      setNeedsManualPin(false);
      setPin(next);
      setViewCenter([next.latitude, next.longitude]);
    } catch (error) {
      if (error instanceof Error && (error.message === 'unavailable' || error.message === 'denied')) {
        notifyError(
          error.message === 'unavailable'
            ? 'Geolocalização não disponível neste navegador'
            : 'Não foi possível obter sua localização',
        );
      } else {
        handleError(error);
      }
    } finally {
      setLocating(false);
    }
  }

  function handleDragEnd(event: LeafletEvent) {
    const marker = event.target as LeafletMarker;
    const { lat, lng } = marker.getLatLng();
    const next = {
      latitude: lat,
      longitude: lng,
    };
    geocodedKey.current = addressKeyRef.current;
    setPin(next);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!categoryId) {
      notifyError('Escolha o tipo de ocorrência');
      return;
    }

    setSubmitting(true);
    try {
      await createEvent({
        categoryId,
        description: description.trim(),
        street: street.trim(),
        streetNumber: streetNumber.trim(),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim(),
        cep: cepDigits.length === 8 ? cepDigits : undefined,
        ...(pin ? { latitude: pin.latitude, longitude: pin.longitude } : {}),
      });
      notifySuccess('Alerta publicado');
      onCreated();
    } catch (error) {
      handleError(error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.modalHeader}>
        <span className={styles.kicker}>NOVO ALERTA</span>
        <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Fechar">
          <X size={20} />
        </button>
      </div>

      <h2 className={styles.modalTitle}>Reportar ocorrência</h2>
      <p className={styles.modalSubtitle}>Ajude sua comunidade com informações precisas.</p>

      <div className={styles.formGroup}>
        <label className={styles.label}>Qual é o tipo de ocorrência?</label>
        {categories.length === 0 ? (
          <span className={styles.helperText}>Nenhuma categoria disponível.</span>
        ) : (
          <div className={styles.typeGrid}>
            {categories.map((category) => {
              const Icon = categoryIcon(category.icon, category.slug);
              const active = categoryId === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  className={`${styles.typeCard} ${active ? styles.typeCardActive : ''}`}
                  style={active ? { borderColor: category.color, color: category.color } : undefined}
                  onClick={() => setCategoryId(category.id)}
                >
                  <Icon size={24} className={styles.typeIcon} />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="report-description">
          O que aconteceu?
        </label>
        <textarea
          id="report-description"
          className={styles.textarea}
          placeholder="Descreva brevemente o que você viu..."
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Onde aconteceu?</label>
        <div className={styles.modeSwitch}>
          <button
            type="button"
            className={`${styles.modeOption} ${addressMode === 'manual' ? styles.modeOptionActive : ''}`}
            onClick={() => switchAddressMode('manual')}
          >
            Digitar endereço
          </button>
          <button
            type="button"
            className={`${styles.modeOption} ${addressMode === 'device' ? styles.modeOptionActive : ''}`}
            onClick={() => switchAddressMode('device')}
          >
            Minha localização
          </button>
        </div>

        {addressMode === 'device' && (
          <button
            type="button"
            className={styles.locateBtn}
            onClick={handleUseDeviceAddress}
            disabled={locating}
          >
            <LocateFixed size={16} />
            {locating ? 'Buscando localização...' : 'Usar minha localização'}
          </button>
        )}

        <div className={styles.fieldGrid}>
          <label className={`${styles.field} ${styles.fieldFull}`}>
            <span className={styles.fieldLabel}>CEP</span>
            <input
              className={styles.textInput}
              inputMode="numeric"
              placeholder="00000-000"
              value={cep}
              onChange={(event) => handleCepChange(event.target.value)}
            />
          </label>
          <label className={`${styles.field} ${styles.fieldFull}`}>
            <span className={styles.fieldLabel}>Rua</span>
            <input
              className={styles.textInput}
              value={street}
              onChange={(event) => setStreet(event.target.value)}
              required
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Número</span>
            <input
              className={styles.textInput}
              value={streetNumber}
              onChange={(event) => setStreetNumber(event.target.value)}
              required
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Bairro</span>
            <input
              className={styles.textInput}
              value={neighborhood}
              onChange={(event) => setNeighborhood(event.target.value)}
              required
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Cidade</span>
            <input
              className={styles.textInput}
              value={city}
              onChange={(event) => setCity(event.target.value)}
              required
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>UF</span>
            <input
              className={styles.textInput}
              value={state}
              maxLength={2}
              onChange={(event) => setState(event.target.value.toUpperCase())}
              required
            />
          </label>
        </div>

        {addressMode === 'manual' && lookingUpCep && (
          <span className={styles.helperText}>Buscando CEP...</span>
        )}

        {addressMode === 'manual' && needsManualPin && (
          <div className={styles.addressActions}>
            <button type="button" className={styles.compassBtn} onClick={handleMarkPin}>
              <Compass size={18} />
            </button>
            <span className={styles.inlineHint}>
              Marque o ponto com a bússola e arraste se precisar.
            </span>
          </div>
        )}

        {addressMode === 'device' && (
          <span className={styles.helperText}>
            {locating
              ? 'Buscando sua localização...'
              : pin
                ? streetNumber
                  ? 'O ponto é a localização do seu dispositivo. Arraste se precisar.'
                  : 'Confira o número. Ele nem sempre vem da localização.'
                : 'Toque no botão para preencher o endereço com o aparelho.'}
          </span>
        )}

        {pin && viewCenter && (
          <MapContainer center={viewCenter} zoom={16} className={styles.pinMap} scrollWheelZoom={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Recenter center={viewCenter} />
            <Marker
              position={[pin.latitude, pin.longitude]}
              icon={pinIcon}
              draggable
              eventHandlers={{ dragend: handleDragEnd }}
            />
          </MapContainer>
        )}
      </div>

      <div className={styles.modalFooter}>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Publicando...' : 'Publicar alerta'} <ArrowRight size={18} />
        </Button>
      </div>
    </form>
  );
}
