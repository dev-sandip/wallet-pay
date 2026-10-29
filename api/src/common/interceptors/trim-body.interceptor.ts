import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

function deepTrim(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.trim();
  }

  // Preserve Date objects instead of converting them to {}
  if (value instanceof Date) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(deepTrim);
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, deepTrim(val)]),
    );
  }

  return value;
}

/**
 * Trims strings recursively in the incoming request body.
 * Register globally before ValidationPipe.
 */
@Injectable()
export class TrimBodyInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{ body?: unknown }>();

    if (request.body && typeof request.body === 'object') {
      request.body = deepTrim(request.body);
    }

    return next.handle();
  }
}
