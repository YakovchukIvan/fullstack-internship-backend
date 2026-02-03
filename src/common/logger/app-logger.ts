import { Injectable, ConsoleLogger } from '@nestjs/common';

type EndTimer = (extraMessage?: string) => void;

@Injectable()
export class AppLogger extends ConsoleLogger {
  constructor(context?: string) {
    super(context || 'AppLogger');
  }

  setLoggerContext(context: string): void {
    this.context = context;
  }

  time(label: string): EndTimer {
    const start = performance.now();
    return (extraMessage?: string) => {
      const ms = (performance.now() - start).toFixed(2);
      const suffix = extraMessage ? ` | ${extraMessage}` : '';
      this.log(`${label} - ${ms}ms${suffix}`);
    };
  }

  async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const end = this.time(label);
    try {
      const result = await fn();
      end();
      return result;
    } catch (err) {
      end('error');
      throw err;
    }
  }

  logError(message: string, error: unknown): void {
    const stack = error instanceof Error ? error.stack : undefined;
    this.error(message, stack);
  }
}
