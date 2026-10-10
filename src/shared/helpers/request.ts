import axios, { type AxiosError } from 'axios';
import { ApiError, type ApiErrorBody } from '@/shared/helpers/api-error';

export const TOKEN_STORAGE_KEY = 'alerta-token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3333',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const body = error.response?.data;
    if (body?.code) {
      return Promise.reject(
        new ApiError(body.code, body.statusCode ?? error.response?.status ?? 500, body.message),
      );
    }

    if (error.response) {
      return Promise.reject(
        new ApiError('INTERNAL_ERROR', error.response.status, 'Algo deu errado. Tente de novo.'),
      );
    }

    return Promise.reject(error);
  },
);

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type RequestOptions = {
  url: string;
  method?: HttpMethod;
  params?: Record<string, string | number>;
  body?: unknown;
};

export async function request<T>({
  url,
  method = 'GET',
  params,
  body,
}: RequestOptions): Promise<T> {
  const response = await api.request<T>({
    url,
    method,
    params,
    data: body,
  });
  return response.data;
}
