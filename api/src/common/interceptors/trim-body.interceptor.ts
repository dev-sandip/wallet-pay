import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

function deepTrim(value: unknown): unknown {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) return value.map(deepTrim);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, deepTrim(v)]),
    );
  }
  return value;
}

/**
 * Deep-trims every string in the request body.
 * Register globally in main.ts BEFORE ValidationPipe runs.
 */
@Injectable()
export class TrimBodyInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{ body?: unknown }>();
    if (req.body && typeof req.body === 'object') {
      req.body = deepTrim(req.body);
    }
    return next.handle();
  }
}
