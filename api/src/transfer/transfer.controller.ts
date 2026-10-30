import {
  Body,
  Controller,
  Headers,
  Ip,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TransferService } from './transfer.service.js';
import {
  AuthGuard,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';
import { TransferFundsDto } from './dtos/transfer-funds.dto.js';
import type { Request } from 'express';

@Controller('transfer')
@ApiTags('transfer')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class TransferController {
  constructor(private readonly transferService: TransferService) {}
  @Post()
  @ApiOperation({ summary: 'Transfer funds to another user' })
  @ApiBody({ type: TransferFundsDto })
  @ApiResponse({ status: 201, description: 'Funds transferred successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid transfer request' })
  async transferFunds(
    @Session() userSession: UserSession,
    @Body() dto: TransferFundsDto,
    @Headers('idempotency-key') idempotencyKey: string,
    @Ip() ipAddress: string,
    @Req() req: Request,
  ) {
    return this.transferService.transferFunds(dto, userSession.user.id, {
      idempotencyKey,
      ipAddress,
      userAgent: req.headers['user-agent'],
    });
  }
}
