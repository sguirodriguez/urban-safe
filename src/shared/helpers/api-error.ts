export class ApiError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export type ApiErrorBody = {
  code: string;
  statusCode: number;
  message: string;
};
