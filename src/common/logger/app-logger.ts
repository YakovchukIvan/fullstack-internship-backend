import { Injectable, ConsoleLogger } from '@nestjs/common';

type EndTimer = (extraMessage?: string) => void;
@Injectable()
export class AppLogger extends ConsoleLogger {
  constructor(context = 'App') {
    super(context);
  }

  setLoggerContext(context: string): void {
    this.context = context;
  }

  time(label: string): EndTimer {
    const start = Date.now();
    return (extraMessage?: string) => {
      const ms = Date.now() - start;
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

  errorUnknown(message: string, err: unknown): void {
    if (err instanceof Error) {
      this.error(message, err.stack);
    } else {
      this.error(message, String(err));
    }
  }
}
