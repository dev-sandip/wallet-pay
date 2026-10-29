import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

interface ParseMoneyOptions {
  readonly decimals?: number;
  readonly maxDigits?: number;
}

@Injectable()
export class ParseMoneyPipe
  implements PipeTransform<unknown, bigint>
{
  private readonly decimals: number;
  private readonly maxDigits: number;
  private readonly pattern: RegExp;

  constructor(options: ParseMoneyOptions = {}) {
    this.decimals = options.decimals ?? 2;
    this.maxDigits = options.maxDigits ?? 10;

    if (!Number.isInteger(this.decimals) || this.decimals < 0) {
      throw new TypeError('decimals must be a non-negative integer');
    }

    if (!Number.isInteger(this.maxDigits) || this.maxDigits < 1) {
      throw new TypeError('maxDigits must be a positive integer');
    }

    this.pattern = new RegExp(
      `^\\d{1,${this.maxDigits}}(?:\\.\\d{1,${this.decimals}})?$`,
    );
  }

  transform(value: unknown, metadata: ArgumentMetadata): bigint {
    const field = metadata.data ?? 'amount';

    if (typeof value !== 'string') {
      throw this.error(field, `${field} must be a decimal string`);
    }

    const raw = value.trim();

    if (!this.pattern.test(raw)) {
      throw this.error(
        field,
        `${field} must be a positive number with up to ${this.decimals} decimals`,
      );
    }

    const [whole, fraction = ''] = raw.split('.');

    const minorUnits =
      BigInt(whole) * 10n ** BigInt(this.decimals) +
      BigInt(fraction.padEnd(this.decimals, '0'));

    if (minorUnits <= 0n) {
      throw this.error(
        field,
        `${field} must be greater than 0`,
      );
    }

    return minorUnits;
  }

  private error(field: string, message: string): BadRequestException {
    return new BadRequestException({
      statusCode: 400,
      message: 'Validation failed',
      errors: [{ field, message }],
    });
  }
}
