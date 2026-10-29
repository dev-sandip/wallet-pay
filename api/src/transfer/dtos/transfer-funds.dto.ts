import { IsInt, IsPhoneNumber, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferFundsDto {
  @ApiProperty({ example: '9812345678' })
  @IsPhoneNumber('NP')
  receiverPhoneNumber: string;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  amount: number;
}
