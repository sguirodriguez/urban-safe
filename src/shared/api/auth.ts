import { request } from '@/shared/helpers/request';
import type { User } from '@/shared/types';

export type AuthResponse = {
  token: string;
  user: User;
};

export type RegisterBody = {
  name: string;
  email: string;
  password: string;
};

export type LoginBody = {
  email: string;
  password: string;
};

export function register(body: RegisterBody) {
  return request<AuthResponse>({
    url: '/auth/register',
    method: 'POST',
    body,
  });
}

export function login(body: LoginBody) {
  return request<AuthResponse>({
    url: '/auth/login',
    method: 'POST',
    body,
  });
}
