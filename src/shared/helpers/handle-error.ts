import axios from 'axios';
import { ViaCepError } from '@/shared/api/viacep';
import { ApiError } from '@/shared/helpers/api-error';
import { notifyError } from '@/shared/helpers/notify';

const CODE_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'E-mail ou senha incorretos',
  EMAIL_ALREADY_USED: 'Este e-mail já está cadastrado',
  UNAUTHORIZED: 'Sessão expirada',
  VALIDATION_ERROR: 'Dados inválidos',
  CATEGORY_NOT_FOUND: 'Categoria não encontrada',
  LOCATION_NOT_FOUND: 'Não encontramos esse endereço. Marque o ponto no mapa.',
  EVENT_NOT_FOUND: 'Evento não encontrado',
  CONFIRMATION_ALREADY_EXISTS: 'Você já registrou uma resposta para este alerta',
};

const GENERIC_MESSAGE = 'Ocorreu um erro, tente novamente mais tarde.';

export function handleError(error: unknown): string {
  const message = resolveMessage(error);
  notifyError(message);
  return message;
}

function resolveMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return CODE_MESSAGES[error.code] ?? GENERIC_MESSAGE;
  }

  if (error instanceof ViaCepError) {
    return error.message;
  }

  if (axios.isAxiosError(error) && !error.response) {
    return 'Não foi possível conectar ao servidor';
  }

  return GENERIC_MESSAGE;
}
