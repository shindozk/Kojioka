import { KojiokaError } from '../errors'
import { Logger } from '../logger'

export interface RetryOptions {
  maxAttempts?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
}

export class RetryManager {
  private maxAttempts: number
  private baseDelay: number
  private maxDelay: number
  private backoffFactor: number
  private logger: Logger

  constructor(options: RetryOptions = {}, logger?: Logger) {
    this.maxAttempts = options.maxAttempts ?? 3
    this.baseDelay = options.baseDelay ?? 1000
    this.maxDelay = options.maxDelay ?? 30_000
    this.backoffFactor = options.backoffFactor ?? 2
    this.logger = logger ?? { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} }
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined

    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        if (error instanceof KojiokaError && !error.isRetryable) {
          throw error
        }

        if (attempt === this.maxAttempts) {
          break
        }

        const delay = this.calculateDelay(attempt)
        this.logger.warn(`Attempt ${attempt}/${this.maxAttempts} failed, retrying in ${delay}ms...`)
        await this.sleep(delay)
      }
    }

    throw lastError ?? KojiokaError.networkError('All retry attempts exhausted')
  }

  private calculateDelay(attempt: number): number {
    const delay = this.baseDelay * Math.pow(this.backoffFactor, attempt - 1)
    return Math.min(delay, this.maxDelay)
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
