import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateWalletDto {
  @ApiPropertyOptional({
    description: 'Wallet currency code (ISO 4217)',
    example: 'NPR',
    default: 'NPR',
    minLength: 3,
    maxLength: 3,
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  @Matches(/^[A-Z]{3}$/, {
    message: 'Currency must be a 3-letter uppercase currency code',
  })
  currency?: string = 'NPR';

  @ApiProperty({
    description: 'Nepali mobile number (10 digits, without country code)',
    example: '9841234567',
  })
  @IsString()
  @Matches(/^(?:9[678]\d{8})$/, {
    message: 'Phone number must be a valid 10-digit Nepali mobile number',
  })
  phoneNumber!: string;
}
