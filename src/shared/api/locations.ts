import { request } from '@/shared/helpers/request';
import type { Coordinates } from '@/shared/types';

export type GeocodeBody = {
  street: string;
  streetNumber: string;
  neighborhood: string;
  city: string;
  state: string;
  cep?: string;
};

export function geocode(body: GeocodeBody) {
  return request<Coordinates>({
    url: '/locations/geocode',
    method: 'POST',
    body,
  });
}
