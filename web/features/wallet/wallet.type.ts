import { z } from "zod";

export const walletSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
  currency: z.string(),
  balanceMinor: z.number(),
  status: z.enum(["ACTIVE", "SUSPENDED", "CLOSED"]),
  phoneNumber: z.string(),
});

export type Wallet = z.infer<typeof walletSchema>;

export const newWalletSchema = z.object({
  userId: z.string(),
  phoneNumber: z.string(),
  id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  currency: z.string().optional(),
  balanceMinor: z.number().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "CLOSED"]).optional(),
});

export type NewWallet = z.infer<typeof newWalletSchema>;

export const walletBalanceResponseSchema = z.object({
  balanceMinor: z.number(),
  balance: z.number(),
  currency: z.string(),
  formattedBalance: z.string(),
});

export type WalletBalanceResponse = z.infer<typeof walletBalanceResponseSchema>;
