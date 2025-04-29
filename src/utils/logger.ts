// filepath: src/utils/logger.ts
import fs from 'fs';
import path from 'path';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private logDirectory: string;

  constructor() {
    this.logDirectory = path.join(__dirname, '../../logs');
    this.ensureLogDirectoryExists();
  }

  private ensureLogDirectoryExists(): void {
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory, { recursive: true });
    }
  }

  private getLogFilePath(level: LogLevel): string {
    const date = new Date();
    const fileName = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${level}.log`;
    return path.join(this.logDirectory, fileName);
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (meta) {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return logMessage + '\n';
  }

  private log(level: LogLevel, message: string, meta?: any): void {
    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Log to console
    console[level](formattedMessage);
    
    // Log to file
    const logFilePath = this.getLogFilePath(level);
    fs.appendFileSync(logFilePath, formattedMessage);
  }

  info(message: string, meta?: any): void {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: any): void {
    this.log('warn', message, meta);
  }

  error(message: string, meta?: any): void {
    this.log('error', message, meta);
  }

  debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV !== 'production') {
      this.log('debug', message, meta);
    }
  }
}

export default new Logger();