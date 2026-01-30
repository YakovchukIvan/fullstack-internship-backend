import { Logger } from '@nestjs/common';

type EndTimer = (extraMessage?: string) => void;

export class AppLogger extends Logger {
  constructor(context = 'App') {
    super(context);
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
