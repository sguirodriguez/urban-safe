import { Button } from '@/components/button/button';
import { categoryIcon } from '@/shared/helpers/category-icon';
import type { AlertEvent, Category } from '@/shared/types';
import { Navigation, Plus, ShieldCheck } from 'lucide-react';
import styles from './sidebar.module.css';

type SidebarProps = {
  categories: Category[];
  events: AlertEvent[];
  categoryId: number | null;
  onCategoryChange: (id: number | null) => void;
  onOpenReport: () => void;
};

export function Sidebar({
  categories,
  events,
  categoryId,
  onCategoryChange,
  onOpenReport,
}: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.intro}>
        <span className={styles.eyebrown}>Painel da cidade</span>
        <h1 className={styles.title}>Visão geral</h1>
        <p className={styles.description}>
          Veja os alertas mais recentes compartilhados pela sua comunidade.
        </p>
      </div>

      <div className={styles.statsCard}>
        <div>
          <strong className={styles.statsNumber}>{events.length}</strong>
          <span className={styles.statsLabel}>Alertas ativos</span>
        </div>
        <span className={styles.liveBadge}>
          <Navigation size={12} />
          Ao vivo
        </span>
      </div>

      <div className={styles.filtersBlock}>
        <span className={styles.filtersLabel}>Filtrar por categoria</span>
        <nav className={styles.filterList}>
          <button
            type="button"
            onClick={() => onCategoryChange(null)}
            className={`${styles.filterItem} ${categoryId === null ? styles.active : ''}`}
          >
            <span className={styles.filterLabel}>Todos os alertas</span>
            <span className={styles.filterCount}>{events.length}</span>
          </button>

          {categories.map((category) => {
            const Icon = categoryIcon(category.icon, category.slug);
            const count = events.filter((event) => event.categoryId === category.id).length;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onCategoryChange(category.id)}
                className={`${styles.filterItem} ${categoryId === category.id ? styles.active : ''}`}
              >
                <span className={styles.filterIcon} style={{ color: category.color }}>
                  <Icon size={16} />
                </span>
                <span className={styles.filterLabel}>{category.name}</span>
                <span className={styles.filterCount}>{count}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className={styles.safetyCard}>
        <ShieldCheck size={20} className={styles.safetyIcon} />
        <div>
          <strong>Você está seguro?</strong>
          <p>Ajude alguém perto de você.</p>
        </div>
      </div>

      <Button variant="primary" size="lg" icon={<Plus size={18} />} onClick={onOpenReport}>
        Reportar ocorrência
      </Button>
    </aside>
  );
}
