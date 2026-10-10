import { Button } from '@/components/button/button';
import { confirmEvent } from '@/shared/api/events';
import { handleError } from '@/shared/helpers/handle-error';
import { notifyError, notifySuccess } from '@/shared/helpers/notify';
import type { AlertEvent, Category, ConfirmationType, EventStatus, Neighborhood } from '@/shared/types';
import { divIcon } from 'leaflet';
import { LocateFixed, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './map-view.module.css';

type MapViewProps = {
  categories: Category[];
  neighborhoods: Neighborhood[];
  events: AlertEvent[];
  onOpenReport: () => void;
  onConfirmed: () => void;
};

const STATUS_LABELS: Record<EventStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  expired: 'Expirado',
  removed: 'Removido',
};

const DEFAULT_CENTER: [number, number] = [-23.5015, -47.4526];

function createMarkerIcon(color: string) {
  return divIcon({
    html: `<span style="background:${color}"></span>`,
    className: styles.marker,
    iconSize: [16, 16],
  });
}

function ShowEvents({ events }: { events: AlertEvent[] }) {
  const map = useMap();
  const seen = useRef(false);

  useEffect(() => {
    if (seen.current || events.length === 0) return;
    seen.current = true;
    map.setView([events[0].latitude, events[0].longitude], 14);
  }, [events, map]);

  return null;
}

function FlyTo({ target }: { target: { position: [number, number]; token: number } | null }) {
  const map = useMap();

  useEffect(() => {
    if (!target) return;
    map.flyTo(target.position, 15);
  }, [target, map]);

  return null;
}

export function MapView({
  categories,
  neighborhoods,
  events,
  onOpenReport,
  onConfirmed,
}: MapViewProps) {
  const [focus, setFocus] = useState<{ position: [number, number]; token: number } | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const center: [number, number] = events.length
    ? [events[0].latitude, events[0].longitude]
    : DEFAULT_CENTER;

  function handleLocate() {
    if (!navigator.geolocation) {
      notifyError('Geolocalização não disponível neste navegador');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFocus({
          position: [position.coords.latitude, position.coords.longitude],
          token: Date.now(),
        });
      },
      () => notifyError('Não foi possível obter sua localização'),
    );
  }

  async function handleConfirmation(eventId: string, type: ConfirmationType) {
    setPendingId(eventId);
    try {
      await confirmEvent(eventId, type);
      notifySuccess(type === 'confirmar' ? 'Alerta confirmado' : 'Alerta denunciado');
      onConfirmed();
    } catch (error) {
      handleError(error);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <section className={styles.mapSection}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Mapa de ocorrências</span>
          <h2 className={styles.title}>O que está acontecendo por perto?</h2>
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" size="md" icon={<LocateFixed size={16} />} onClick={handleLocate}>
            Minha localização
          </Button>
          <Button variant="primary" size="md" icon={<Plus size={16} />} onClick={onOpenReport}>
            Reportar
          </Button>
        </div>
      </div>

      <div className={styles.mapWrapper}>
        <MapContainer center={center} zoom={14} className={styles.map}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ShowEvents events={events} />
          <FlyTo target={focus} />

          {events.map((event) => {
            const category = categories.find((item) => item.id === event.categoryId);
            const neighborhood = neighborhoods.find((item) => item.id === event.neighborhoodId);
            const color = category?.color ?? '#64748b';

            return (
              <Marker
                key={event.id}
                position={[event.latitude, event.longitude]}
                icon={createMarkerIcon(color)}
              >
                <Popup>
                  <div className={styles.popup}>
                    <strong className={styles.popupTitle}>{category?.name ?? 'Alerta'}</strong>
                    <p className={styles.popupDescription}>{event.description}</p>
                    <span className={styles.popupMeta}>
                      {event.street}, {event.streetNumber}
                      {neighborhood ? ` · ${neighborhood.name}` : ''}
                    </span>
                    <span className={styles.popupMeta}>{STATUS_LABELS[event.status]}</span>
                    <div className={styles.popupActions}>
                      <Button
                        type="button"
                        size="sm"
                        variant="primary"
                        disabled={pendingId === event.id}
                        onClick={() => handleConfirmation(event.id, 'confirmar')}
                      >
                        Confirmar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={pendingId === event.id}
                        onClick={() => handleConfirmation(event.id, 'denunciar')}
                      >
                        Denunciar
                      </Button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        <div className={styles.legend}>
          {categories.map((category) => (
            <span key={category.id} className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: category.color }} />
              {category.name}
            </span>
          ))}
        </div>

        <div className={styles.footer}>
          <span className={styles.footerLeft}>
            <span className={styles.liveDot} />
            Atualizado agora
          </span>
          <span>
            {events.length} {events.length === 1 ? 'alerta nesta área' : 'alertas nesta área'}
          </span>
        </div>
      </div>
    </section>
  );
}
