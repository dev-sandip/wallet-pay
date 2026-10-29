import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DrizzleModule } from '@nestjs/drizzle';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { db } from './db/database.js';
import { auth } from './auth/auth.js';
import { WalletController } from './wallet/wallet.controller.js';
import { WalletService } from './wallet/wallet.service.js';
import { WalletModule } from './wallet/wallet.module.js';
@Module({
  imports: [
    // 1. Official NestJS Drizzle Module
    DrizzleModule.forRoot({
      db, // Pass the shared instance
      autoCloseConnection: false, // Required when providing a custom `db` instance
    }),
    AuthModule.forRoot({
      auth, // Pass your auth instance
    }),
    WalletModule,
  ],
  controllers: [AppController, WalletController],
  providers: [AppService, WalletService],
})
export class AppModule {}
