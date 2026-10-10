import { Logo } from '@/components/logo/logo';
import { Button } from '@/components/button/button';
import { useAuth } from '@/shared/context/auth-context';
import type { Neighborhood } from '@/shared/types';
import { ChevronDown, LogOut, MapPin } from 'lucide-react';
import styles from './header.module.css';

type HeaderProps = {
  neighborhoods: Neighborhood[];
  neighborhoodId: number | null;
  onNeighborhoodChange: (id: number | null) => void;
};

export function Header({ neighborhoods, neighborhoodId, onNeighborhoodChange }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className={styles.header}>
      <Logo />

      <label className={styles.location}>
        <MapPin size={16} className={styles.pin} />
        <select
          className={styles.locationSelect}
          value={neighborhoodId ?? ''}
          aria-label="Filtrar por bairro"
          onChange={(event) => {
            const value = event.target.value;
            onNeighborhoodChange(value ? Number(value) : null);
          }}
        >
          <option value="">Todos os bairros</option>
          {neighborhoods.map((neighborhood) => (
            <option key={neighborhood.id} value={neighborhood.id}>
              {neighborhood.name}, {neighborhood.city} - {neighborhood.state}
            </option>
          ))}
        </select>
        <ChevronDown size={15} className={styles.chevron} />
      </label>

      <div className={styles.right}>
        <span className={styles.avatar}>
          {(user?.name ?? user?.email ?? 'U').slice(0, 1).toUpperCase()}
        </span>
        <div className={styles.logout}>
          <Button variant="ghost" size="sm" icon={<LogOut size={16} />} onClick={logout}>
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
