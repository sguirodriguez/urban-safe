import axios from 'axios';
import { ApiError } from '@/shared/helpers/api-error';
import { notifyError } from '@/shared/helpers/notify';

const CODE_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'E-mail ou senha incorretos',
  EMAIL_ALREADY_USED: 'Este e-mail já está cadastrado',
  UNAUTHORIZED: 'Sessão expirada',
  VALIDATION_ERROR: 'Dados inválidos',
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

  if (axios.isAxiosError(error) && !error.response) {
    return 'Não foi possível conectar ao servidor';
  }

  return GENERIC_MESSAGE;
}
