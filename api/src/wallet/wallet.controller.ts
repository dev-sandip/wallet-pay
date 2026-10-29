import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateWalletDto } from './dtos/create-wallet.dto.js';
import {
  AuthGuard,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';
import { WalletService } from './wallet.service.js';

@Controller('wallet')
@UseGuards(AuthGuard)
@ApiTags('Wallet')
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}
  @Post()
  @ApiOperation({ summary: 'Create a wallet' })
  @ApiBody({ type: CreateWalletDto })
  async createWallet(
    @Body() dto: CreateWalletDto,
    @Session() session: UserSession,
  ) {
    return await this.walletService.createWallet(dto, session.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get the authenticated user wallets' })
  async getUserWallets(@Session() session: UserSession) {
    return await this.walletService.getUserWallet(session.user.id);
  }

  @Get('/:phoneNumber/balance')
  @ApiOperation({ summary: 'Get the balance of a wallet by phone number' })
  async getWalletBalance(
    @Session() session: UserSession,
    @Param('phoneNumber') phoneNumber: string,
  ) {
    return await this.walletService.getBalance(phoneNumber, session.user.id);
  }

  @Delete('/:walletId')
  @ApiOperation({ summary: 'Delete a wallet by ID' })
  async deleteWallet(
    @Session() session: UserSession,
    @Param('walletId') walletId: string,
  ) {
    await this.walletService.deleteWallet(walletId, session.user.id);
    return { message: 'Wallet deleted successfully' };
  }
}
