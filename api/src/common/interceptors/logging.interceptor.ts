import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    const { method, originalUrl } = request;
    const url = originalUrl ?? request.url;
    const startTime = Date.now();

    this.logger.log(`Incoming Request: ${method} ${url}`);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;

        this.logger.log(
          `Outgoing Response: ${method} ${url} | ` +
            `Status: ${response.statusCode} | ${duration}ms`,
        );
      }),
      catchError((error: unknown) => {
        const duration = Date.now() - startTime;

        const statusCode =
          typeof error === 'object' &&
          error !== null &&
          'status' in error &&
          typeof error.status === 'number'
            ? error.status
            : 500;

        this.logger.error(
          `Request Failed: ${method} ${url} | ` +
            `Status: ${statusCode} | ${duration}ms`,
        );

        return throwError(() => error);
      }),
      finalize(() => {
        // Runs when the request stream completes, errors, or is cancelled.
        // Avoid logging again here because tap/catchError already log outcomes.
      }),
    );
  }
}
