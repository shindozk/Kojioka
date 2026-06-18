import { ErrorCode, ErrorContext } from './error-codes'

export class KojiokaError extends Error {
  readonly code: ErrorCode
  readonly context: ErrorContext
  readonly isRetryable: boolean

  constructor(message: string, code: ErrorCode, context: ErrorContext = {}, isRetryable = false) {
    super(message)
    this.name = 'KojiokaError'
    this.code = code
    this.context = context
    this.isRetryable = isRetryable
  }

  static networkError(message: string, context?: ErrorContext): KojiokaError {
    return new KojiokaError(message, ErrorCode.NETWORK_ERROR, context, true)
  }

  static timeout(message: string, context?: ErrorContext): KojiokaError {
    return new KojiokaError(message, ErrorCode.TIMEOUT, context, true)
  }

  static rateLimited(message: string, context?: ErrorContext): KojiokaError {
    return new KojiokaError(message, ErrorCode.RATE_LIMITED, context, true)
  }

  static notFound(message: string, context?: ErrorContext): KojiokaError {
    return new KojiokaError(message, ErrorCode.NOT_FOUND, context, false)
  }

  static invalidResponse(message: string, context?: ErrorContext): KojiokaError {
    return new KojiokaError(message, ErrorCode.INVALID_RESPONSE, context, false)
  }

  static streamFailed(message: string, context?: ErrorContext): KojiokaError {
    return new KojiokaError(message, ErrorCode.STREAM_FAILED, context, true)
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      isRetryable: this.isRetryable,
    }
  }
}
