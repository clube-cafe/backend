/**
 * Logger centralizado para melhor rastreamento e debug
 */

export class Logger {
  private static readonly LOG_LEVELS = {
    ERROR: "ERROR",
    WARN: "WARN",
    INFO: "INFO",
    DEBUG: "DEBUG",
  };

  private static formatLog(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? JSON.stringify(data, null, 2) : "";
    return `[${timestamp}] [${level}] ${message}${dataStr ? `\n${dataStr}` : ""}`;
  }

  static error(message: string, error?: any): void {
    const logMessage = this.formatLog(this.LOG_LEVELS.ERROR, message, error);
    console.error(logMessage);
  }

  static warn(message: string, data?: any): void {
    const logMessage = this.formatLog(this.LOG_LEVELS.WARN, message, data);
    console.warn(logMessage);
  }

  static info(message: string, data?: any): void {
    const logMessage = this.formatLog(this.LOG_LEVELS.INFO, message, data);
    console.log(logMessage);
  }

  static debug(message: string, data?: any): void {
    if (process.env.DEBUG) {
      const logMessage = this.formatLog(this.LOG_LEVELS.DEBUG, message, data);
      console.debug(logMessage);
    }
  }
}
