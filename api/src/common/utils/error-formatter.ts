import {
  BadRequestException,
  ValidationError,
} from '@nestjs/common';

/**
 * Returns a flat, consistent error shape for ALL validation failures:
 * { statusCode, message, errors: [{ field, message }] }
 * Pass to ValidationPipe({ exceptionFactory }).
 */
export function validationExceptionFactory(errors: ValidationError[]) {
  const flatten = (
    errs: ValidationError[],
    prefix = '',
  ): Array<{ field: string; message: string }> =>
    errs.flatMap((e) => {
      const field = prefix ? `${prefix}.${e.property}` : e.property;
      const own = Object.values(e.constraints ?? {}).map((message) => ({
        field,
        message,
      }));
      return own.length
        ? own
        : flatten(e.children ?? [], field);
    });

  return new BadRequestException({
    statusCode: 400,
    message: 'Validation failed',
    errors: flatten(errors),
  });
}
