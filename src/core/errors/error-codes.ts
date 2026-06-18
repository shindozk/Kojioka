export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMITED = 'RATE_LIMITED',
  NOT_FOUND = 'NOT_FOUND',
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  STREAM_FAILED = 'STREAM_FAILED',
  CACHE_ERROR = 'CACHE_ERROR',
  UNKNOWN = 'UNKNOWN',
}

export interface ErrorContext {
  provider?: string
  endpoint?: string
  statusCode?: number
  retryAttempt?: number
}
