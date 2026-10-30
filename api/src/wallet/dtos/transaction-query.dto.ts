import { IsEnum, IsInt, IsOptional, Max, Min, IsString } from 'class-validator';

import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum TransactionType {
  SENT = 'SENT',
  RECEIVED = 'RECEIVED',
}

export class TransactionQueryDto {
  @ApiPropertyOptional({ type: Number, default: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ enum: TransactionType, enumName: 'TransactionType' })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;
}
