export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

export interface Logger {
  debug(message: string, ...args: unknown[]): void
  info(message: string, ...args: unknown[]): void
  warn(message: string, ...args: unknown[]): void
  error(message: string, ...args: unknown[]): void
}

export class ConsoleLogger implements Logger {
  private level: LogLevel

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(`[Kojioka:DEBUG] ${message}`, ...args)
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.INFO) {
      console.info(`[Kojioka:INFO] ${message}`, ...args)
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(`[Kojioka:WARN] ${message}`, ...args)
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(`[Kojioka:ERROR] ${message}`, ...args)
    }
  }
}

export class NoopLogger implements Logger {
  debug(_message?: string, ..._args: unknown[]): void {}
  info(_message?: string, ..._args: unknown[]): void {}
  warn(_message?: string, ..._args: unknown[]): void {}
  error(_message?: string, ..._args: unknown[]): void {}
}
