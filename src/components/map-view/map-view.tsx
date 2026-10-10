import { Button } from '@/components/button/button';
import { notifyError } from '@/shared/helpers/notify';
import { categoryIcon } from '@/shared/helpers/category-icon';
import type { AlertEvent, Category, EventStatus, Neighborhood } from '@/shared/types';
import { divIcon } from 'leaflet';
import { LocateFixed, Plus, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './map-view.module.css';

type MapViewProps = {
  categories: Category[];
  neighborhoods: Neighborhood[];
  events: AlertEvent[];
  onOpenReport: () => void;
  onToggleFilters: () => void;
  onCloseFilters: () => void;
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

function formatCreatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function formatCep(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 8) return value;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
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

function RevealSelected({ event }: { event: AlertEvent | null }) {
  const map = useMap();

  useEffect(() => {
    if (!event) return;
    const zoom = Math.max(map.getZoom(), 15);
    const projected = map.project([event.latitude, event.longitude], zoom);
    const narrow = window.matchMedia('(max-width: 767px)').matches;
    const shifted = projected.add([narrow ? 0 : 140, narrow ? -120 : 0]);
    map.panTo(map.unproject(shifted, zoom), { animate: true });
  }, [event, map]);

  return null;
}

function CloseOnMapClick({ active, onClose }: { active: boolean; onClose: () => void }) {
  useMapEvents({
    click(event) {
      if (!active) return;
      const target = event.originalEvent.target;
      if (target instanceof Element && target.closest('.leaflet-marker-icon')) return;
      onClose();
    },
  });

  return null;
}

export function MapView({
  categories,
  neighborhoods,
  events,
  onOpenReport,
  onToggleFilters,
  onCloseFilters,
}: MapViewProps) {
  const [focus, setFocus] = useState<{ position: [number, number]; token: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const center: [number, number] = events.length
    ? [events[0].latitude, events[0].longitude]
    : DEFAULT_CENTER;

  const selected = events.find((event) => event.id === selectedId) ?? null;
  const selectedCategory = selected
    ? categories.find((item) => item.id === selected.categoryId)
    : undefined;
  const selectedNeighborhood = selected
    ? neighborhoods.find((item) => item.id === selected.neighborhoodId)
    : undefined;
  const SelectedIcon = selectedCategory
    ? categoryIcon(selectedCategory.icon, selectedCategory.slug)
    : null;

  useEffect(() => {
    if (!selectedId) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setSelectedId(null);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedId]);

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

  return (
    <section className={styles.mapSection}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Mapa de ocorrências</span>
          <h2 className={styles.title}>O que está acontecendo por perto?</h2>
        </div>

        <div className={styles.actions}>
          <div className={styles.filtersButton}>
            <Button
              variant="secondary"
              size="md"
              icon={<SlidersHorizontal size={16} />}
              onClick={onToggleFilters}
            >
              Filtros
            </Button>
          </div>
          <Button
            variant="secondary"
            size="md"
            icon={<LocateFixed size={16} />}
            onClick={handleLocate}
            aria-label="Minha localização"
          >
            <span className={styles.locateLabel}>Minha localização</span>
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
          <RevealSelected event={selected} />
          <CloseOnMapClick active={selected !== null} onClose={() => setSelectedId(null)} />

          {events.map((event) => {
            const category = categories.find((item) => item.id === event.categoryId);
            const color = category?.color ?? '#64748b';

            return (
              <Marker
                key={event.id}
                position={[event.latitude, event.longitude]}
                icon={createMarkerIcon(color)}
                eventHandlers={{
                  click: () => {
                    onCloseFilters();
                    setSelectedId(event.id);
                  },
                }}
              />
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

        {selected && (
          <>
            <div className={styles.panelBackdrop} />
            <aside className={styles.panel} role="dialog" aria-modal="true" aria-labelledby="event-detail-title">
              <div className={styles.panelHeader}>
                {SelectedIcon && (
                  <span
                    className={styles.panelIcon}
                    style={{ backgroundColor: selectedCategory?.color ?? '#64748b' }}
                  >
                    <SelectedIcon size={18} />
                  </span>
                )}
                <div className={styles.panelHeading}>
                  <span className={styles.panelEyebrow}>Ponto de perigo</span>
                  <h3 id="event-detail-title" className={styles.panelTitle}>
                    {selectedCategory?.name ?? 'Alerta'}
                  </h3>
                </div>
                <button
                  type="button"
                  className={styles.panelClose}
                  aria-label="Fechar"
                  onClick={() => setSelectedId(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <p className={styles.panelDescription}>{selected.description}</p>

              <dl className={styles.panelFacts}>
                <div className={styles.panelFact}>
                  <dt>Endereço</dt>
                  <dd>
                    {selected.street}, {selected.streetNumber}
                  </dd>
                </div>
                {selectedNeighborhood && (
                  <div className={styles.panelFact}>
                    <dt>Bairro</dt>
                    <dd>
                      {selectedNeighborhood.name}, {selectedNeighborhood.city} - {selectedNeighborhood.state}
                    </dd>
                  </div>
                )}
                {selected.cep && (
                  <div className={styles.panelFact}>
                    <dt>CEP</dt>
                    <dd>{formatCep(selected.cep)}</dd>
                  </div>
                )}
                <div className={styles.panelFact}>
                  <dt>Status</dt>
                  <dd>
                    <span className={styles.panelStatus}>{STATUS_LABELS[selected.status]}</span>
                  </dd>
                </div>
                <div className={styles.panelFact}>
                  <dt>Registrado em</dt>
                  <dd>{formatCreatedAt(selected.createdAt)}</dd>
                </div>
              </dl>
            </aside>
          </>
        )}
      </div>
    </section>
  );
}
