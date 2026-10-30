import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateWalletDto } from './dtos/create-wallet.dto.js';
import {
  AuthGuard,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';
import { WalletService } from './wallet.service.js';
import { TransactionQueryDto } from './dtos/transaction-query.dto.js';

@Controller('wallet')
@UseGuards(AuthGuard)
@ApiTags('Wallet')
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}
  @Post()
  @ApiOperation({ summary: 'Create a wallet' })
  @ApiBody({ type: CreateWalletDto })
  @ApiResponse({ status: 201, description: 'Wallet created successfully' })
  async createWallet(
    @Body() dto: CreateWalletDto,
    @Session() session: UserSession,
  ) {
    return await this.walletService.createWallet(dto, session.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get the authenticated user wallets' })
  @ApiResponse({
    status: 200,
    description: 'User wallets returned successfully',
  })
  async getUserWallets(@Session() session: UserSession) {
    return await this.walletService.getUserWallet(session.user.id);
  }

  @Get('/:phoneNumber/balance')
  @ApiOperation({ summary: 'Get the balance of a wallet by phone number' })
  @ApiParam({ name: 'phoneNumber', type: String })
  @ApiResponse({
    status: 200,
    description: 'Wallet balance returned successfully',
  })
  async getWalletBalance(
    @Session() session: UserSession,
    @Param('phoneNumber') phoneNumber: string,
  ) {
    return await this.walletService.getBalance(phoneNumber, session.user.id);
  }

  @Delete('/:walletId')
  @ApiOperation({ summary: 'Delete a wallet by ID' })
  @ApiParam({ name: 'walletId', type: String })
  @ApiResponse({ status: 200, description: 'Wallet deleted successfully' })
  async deleteWallet(
    @Session() session: UserSession,
    @Param('walletId') walletId: string,
  ) {
    await this.walletService.deleteWallet(walletId, session.user.id);
    return { message: 'Wallet deleted successfully' };
  }

  @Get('transactions')
  @ApiOperation({
    summary: 'Get wallet transaction history',
    description:
      "Returns sent and received transactions for the authenticated user's wallet.",
  })
  @ApiQuery({ type: TransactionQueryDto })
  @ApiResponse({
    status: 200,
    description: 'Transaction history returned successfully',
  })
  async getRecentTransactions(
    @Session() session: UserSession,
    @Query() query: TransactionQueryDto,
  ) {
    return this.walletService.getRecentTransactions(session.user.id, query);
  }
}
