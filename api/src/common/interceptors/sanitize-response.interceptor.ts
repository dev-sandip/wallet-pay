import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class SanitizeResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(
      map((data) => this.removePassword(data)),
    );
  }

  private removePassword(data: unknown): unknown {
    if (!data) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.removePassword(item));
    }

    if (typeof data === 'object') {
      const obj = data as Record<string, unknown>;

      const { password, ...rest } = obj;

      return Object.fromEntries(
        Object.entries(rest).map(([key, value]) => [
          key,
          this.removePassword(value),
        ]),
      );
    }

    return data;
  }
}
