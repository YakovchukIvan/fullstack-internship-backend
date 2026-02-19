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

  time(label: string, context?: string): EndTimer {
    const start = performance.now();
    return (extraMessage?: string) => {
      const ms = (performance.now() - start).toFixed(2);
      const suffix = extraMessage ? ` | ${extraMessage}` : '';
      const message = `${label} - ${ms}ms${suffix}`;

      if (context || this.context) {
        super.log(message, context || this.context);
      } else {
        super.log(message);
      }
    };
  }

  async measure<T>(label: string, fn: () => Promise<T>, context?: string): Promise<T> {
    const end = this.time(label, context);
    try {
      const result = await fn();
      end();
      return result;
    } catch (err) {
      end('error');
      throw err;
    }
  }

  logError(message: string, error: unknown, context?: string): void {
    const stack = error instanceof Error ? error.stack : undefined;
    super.error(message, stack, context);
  }
}
