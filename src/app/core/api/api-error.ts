/**
 * Represents a standardized API error structure.
 * The backend .NET API returns errors in a consistent format,
 * this interface mirrors that for the frontend.
 */
export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>; // Validation errors dictionary
}

/**
 * Maps HTTP status codes to user-friendly messages.
 */
const DEFAULT_ERROR_MESSAGES: Record<number, string> = {
  0: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
  400: 'Dados inválidos. Verifique as informações enviadas.',
  401: 'Você não está autenticado.',
  403: 'Você não tem permissão para esta ação.',
  404: 'Recurso não encontrado.',
  409: 'Conflito ao processar a solicitação.',
  422: 'Os dados enviados não puderam ser processados.',
  500: 'Erro interno do servidor. Tente novamente mais tarde.',
};

/**
 * Parses an HTTP error response into a standardized ApiError object.
 */
export function parseApiError(error: any): ApiError {
  const status = error?.status ?? 0;

  // If the backend returned a structured body
  if (error?.error) {
    const body = error.error;

    // Backend returns { message, errors } pattern
    if (typeof body === 'object' && body.message) {
      return {
        message: body.message,
        statusCode: status,
        errors: body.errors ?? undefined,
      };
    }

    // Backend returns a plain string
    if (typeof body === 'string') {
      return {
        message: body,
        statusCode: status,
      };
    }
  }

  // Fallback to default messages
  return {
    message: DEFAULT_ERROR_MESSAGES[status] ?? `Erro inesperado (${status}).`,
    statusCode: status,
  };
}
