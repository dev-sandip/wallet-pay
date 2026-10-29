import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
/** Logs the HTTP method, URL, status code, and request duration. */
export class LoggingInterceptor implements NestInterceptor {
  /** Logger used for HTTP request and error messages. */
  private readonly logger = new Logger('HTTP');

  /**
   * Intercepts an HTTP request and logs its completion or failure details.
   *
   * @param context Execution context for the current request.
   * @param next Handler for the next interceptor or route handler.
   * @returns Observable containing the route handler result.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const statusCode = response.statusCode;
          const duration = Date.now() - startTime;

          this.logger.log(`${method} ${url} ${statusCode} - ${duration}ms`);
        },
        error: (err) => {
          const statusCode = err.status || 500;
          const duration = Date.now() - startTime;

          this.logger.error(
            `${method} ${url} ${statusCode} - ${duration}ms - Error: ${err.message}`,
          );
        },
      }),
    );
  }
}
