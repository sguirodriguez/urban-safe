import { Logo } from '@/components/logo/logo';
import { Button } from '@/components/button/button';
import { useAuth } from '@/shared/context/auth-context';
import { LogOut, MapPin, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import styles from './header.module.css';

export function Header() {
  const { user, logout } = useAuth();
  const [location] = useState('Sorocaba, SP');

  return (
    <header className={styles.header}>
      <Logo />

      <div className={styles.location}>
        <MapPin size={16} className={styles.pin} />
        <span>{location}</span>
        <ChevronDown size={15} className={styles.chevron} />
      </div>

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
