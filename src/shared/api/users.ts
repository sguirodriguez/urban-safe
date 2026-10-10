import { request } from '@/shared/helpers/request';
import type { User } from '@/shared/types';

export function getMe() {
  return request<User>({
    url: '/users/me',
  });
}
