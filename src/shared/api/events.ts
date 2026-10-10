import { request } from '@/shared/helpers/request';
import type { AlertEvent, ConfirmationType, EventConfirmation } from '@/shared/types';

export type CreateEventBody = {
  categoryId: number;
  description: string;
  street: string;
  streetNumber: string;
  neighborhood: string;
  city: string;
  state: string;
  cep?: string;
  latitude?: number;
  longitude?: number;
};

export function listEvents(neighborhoodId?: number) {
  return request<AlertEvent[]>({
    url: '/events',
    params: neighborhoodId ? { neighborhoodId } : undefined,
  });
}

export function createEvent(body: CreateEventBody) {
  return request<AlertEvent>({
    url: '/events',
    method: 'POST',
    body,
  });
}

export function confirmEvent(id: string, type: ConfirmationType) {
  return request<EventConfirmation>({
    url: `/events/${id}/confirmations`,
    method: 'POST',
    body: { type },
  });
}
