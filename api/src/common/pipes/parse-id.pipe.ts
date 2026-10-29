import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates a route param / query as UUID.
 * Unlike the built-in ParseUUIDPipe, returns a consistent error shape
 * and optionally enforces a version prefix ("4" => must start with 4).
 */
@Injectable()
export class ParseUuidPipe implements PipeTransform<string, string> {
  constructor(private readonly version?: '1' | '2' | '3' | '4' | '5') {}

  transform(value: string, metadata: ArgumentMetadata): string {
    const field = metadata.data ?? 'id';

    if (typeof value !== 'string' || !UUID_RE.test(value)) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Validation failed',
        errors: [{ field, message: `${field} must be a valid UUID` }],
      });
    }

    if (this.version && value[14] !== this.version) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Validation failed',
        errors: [{ field, message: `${field} must be a UUID v${this.version}` }],
      });
    }

    return value;
  }
}
