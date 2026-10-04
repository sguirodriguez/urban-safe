import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { LocateFixed, Plus } from 'lucide-react';
import { Button } from '@/components/button/button';
import { mockAlerts, type AlertCategory } from './mock-alerts';
import 'leaflet/dist/leaflet.css';
import styles from './map-view.module.css';

type MapViewProps = {
  onOpenReport: () => void;
};

const categoryColors: Record<AlertCategory, string> = {
    furto: '#0ea5e9',
    assalto: '#f59e0b',
    tiroteio: '#ef4444',
};

const categoryLabels: Record<AlertCategory, string> = {
    furto: 'Furto',
    assalto: 'Assalto',
    tiroteio: 'Tiroteio',
};

function createMarkerIcon(color: string) {
    return divIcon({
        html: `<span style="background:${color}"></span>`,
        className: styles.marker,
        iconSize: [16, 16],
    });
}

export function MapView({ onOpenReport }: MapViewProps) {

    const center: [number, number] = [-23.5015, -47.4526]; // CENTRO

    return (
        <section className={styles.mapSection}>
            <div className={styles.header}>
                <div>
                    <span className={styles.eyebrow}>Mapa de ocorrências</span>
                    <h2 className={styles.title}>O que está acontecendo por perto?</h2>
                </div>

                <div className={styles.actions}>
                    <Button variant="secondary" size="md" icon={<LocateFixed size={16} />}>
                    Minha localização
                    </Button>
                    <Button variant="primary" size="md" icon={<Plus size={16}/>}onClick={onOpenReport} >
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

                    {mockAlerts.map((alert) => (
                        <Marker
                        key={alert.id}
                        position={[alert.lat, alert.lng]}
                        icon={createMarkerIcon(categoryColors[alert.category])}
                        >
                            <Popup>{categoryLabels[alert.category]}</Popup>
                        </Marker>
                    ))}
                </MapContainer>

                <div className={styles.legend}>
                    {(Object.keys(categoryLabels) as AlertCategory[]).map((category) => (
                        <span key={category} className={styles.legendItem}>
                            <span
                                className={styles.legendDot}
                                style={{ backgroundColor: categoryColors[category] }}
                            />
                            {categoryLabels[category]}
                        </span>
                    ))}
                </div>

                <div className={styles.footer}>
                    <span className={styles.footerLeft}>
                        <span className={styles.liveDot} />
                        Atualizado agora
                    </span>
                    <span>{mockAlerts.length} alertas nesta área</span>
                </div>
            </div>
        </section>
    );
}
