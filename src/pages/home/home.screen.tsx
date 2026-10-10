import { Header } from '@/components/header/header';
import { MapView } from '@/components/map-view/map-view';
import { Modal } from '@/components/modal/modal';
import { Sidebar } from '@/components/sidebar/sidebar';
import { listCategories } from '@/shared/api/categories';
import { listEvents } from '@/shared/api/events';
import { listNeighborhoods } from '@/shared/api/neighborhoods';
import { handleError } from '@/shared/helpers/handle-error';
import type { AlertEvent, Category, Neighborhood } from '@/shared/types';
import { useEffect, useState } from 'react';
import styles from './home.screen.module.css';
import { ReportForm } from './report-form';

export function HomeScreen() {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [neighborhoodId, setNeighborhoodId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCatalog() {
      try {
        const [nextCategories, nextNeighborhoods] = await Promise.all([
          listCategories(),
          listNeighborhoods(),
        ]);
        if (!active) return;
        setCategories(nextCategories);
        setNeighborhoods(nextNeighborhoods);
      } catch (error) {
        if (active) handleError(error);
      }
    }

    loadCatalog();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      try {
        const nextEvents = await listEvents(neighborhoodId ?? undefined);
        if (!active) return;
        setEvents(nextEvents);
      } catch (error) {
        if (active) handleError(error);
      }
    }

    loadEvents();

    return () => {
      active = false;
    };
  }, [neighborhoodId]);

  const visibleEvents = categoryId
    ? events.filter((event) => event.categoryId === categoryId)
    : events;

  async function reloadEvents() {
    try {
      setEvents(await listEvents(neighborhoodId ?? undefined));
    } catch (error) {
      handleError(error);
    }
  }

  async function handleCreated() {
    setIsReportOpen(false);
    try {
      const [nextEvents, nextNeighborhoods] = await Promise.all([
        listEvents(neighborhoodId ?? undefined),
        listNeighborhoods(),
      ]);
      setEvents(nextEvents);
      setNeighborhoods(nextNeighborhoods);
    } catch (error) {
      handleError(error);
    }
  }

  return (
    <div className={styles.root}>
      <Header
        neighborhoods={neighborhoods}
        neighborhoodId={neighborhoodId}
        onNeighborhoodChange={setNeighborhoodId}
      />
      <div className={styles.content}>
        <Sidebar
          categories={categories}
          events={events}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          onOpenReport={() => setIsReportOpen(true)}
        />
        <MapView
          categories={categories}
          neighborhoods={neighborhoods}
          events={visibleEvents}
          onOpenReport={() => setIsReportOpen(true)}
          onConfirmed={reloadEvents}
        />
      </div>

      <Modal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)}>
        <ReportForm
          categories={categories}
          onClose={() => setIsReportOpen(false)}
          onCreated={handleCreated}
        />
      </Modal>
    </div>
  );
}
