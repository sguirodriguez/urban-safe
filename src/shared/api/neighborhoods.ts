import { request } from '@/shared/helpers/request';
import type { Neighborhood } from '@/shared/types';

export function listNeighborhoods() {
  return request<Neighborhood[]>({
    url: '/neighborhoods',
  });
}
