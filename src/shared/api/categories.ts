import { request } from '@/shared/helpers/request';
import type { Category } from '@/shared/types';

export function listCategories() {
  return request<Category[]>({
    url: '/categories',
  });
}
