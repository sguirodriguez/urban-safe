import { useState } from "react";
import { Target, TriangleAlert, Flame, Navigation, ShieldCheck, Plus } from "lucide-react";
import { Button } from "@/components/button/button";
import  styles  from "./sidebar.module.css";

type SidebarProps = {
  onOpenReport: () => void;
};

type CategoryID = 'todos' | 'Furto' | 'assalto' | 'tiroteio';

interface FilterOption {
    id: CategoryID;
    label: string;
    count: number;
    icon: React.ReactNode;
}

const filters: FilterOption[] = [
    { id: 'todos', label: 'Todos os alertas', count: 5, icon: null },
    { id: 'Furto', label: 'Furto', count: 2, icon: <Target size={16} /> },
    { id: 'assalto', label: 'Assalto', count: 2, icon: <TriangleAlert size={16} /> },
    { id: 'tiroteio', label: 'Tiroteio', count: 1, icon: <Flame size={16} /> },
];

export function Sidebar({ onOpenReport }: SidebarProps) {
    const [activeFilter, setActiveFilter] = useState<CategoryID>('todos');

    return (
        <aside className={styles.sidebar}>
            <div className={styles.intro}>
                <span className={styles.eyebrown}>Painel da cidade</span>
                <h1 className={styles.title}>Visão geral</h1>
                <p className={styles.description}>Veja os alertas mais recentes compartilhados pela sua comunidade.</p>
            </div>

            <div className={styles.statsCard}>
                <div>
                    <strong className={styles.statsNumber}>5</strong>
                    <span className={styles.statsLabel}>Alertas ativos</span>
                </div>
                <span className={styles.liveVadge}>
                    <Navigation size={12} />
                    Ao vivo
                </span>
            </div>

            <div className={styles.filtersBlock}>
                <span className={styles.filtersLabel}>Filtrar por categoria </span>
                <nav className={styles.filterList}>
                    {filters.map((filter) => (
                        <button
                            key={filter.id}
                            type="button"
                            onClick={() => setActiveFilter(filter.id)}
                            className={`${styles.filterItem} ${activeFilter === filter.id ? styles.filterItemActive : ''}`}>
                            {filter.icon && <span className={styles.filterIcon}>{filter.icon}</span>}
                            <span className={styles.filterLabel}>{filter.label}</span>
                            <span className={styles.filterCount}>{filter.count}</span>
                        </button>
                    ))}
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
