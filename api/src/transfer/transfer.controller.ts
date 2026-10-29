import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TransferService } from './transfer.service.js';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { TransferFundsDto } from './dtos/transfer-funds.dto.js';

@Controller('transfer')
@ApiTags('transfer')
@ApiBearerAuth()
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
  ) {
    return this.transferService.transferFunds(dto, userSession.user.id);
  }
}
