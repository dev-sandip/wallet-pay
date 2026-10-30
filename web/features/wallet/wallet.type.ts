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

export const transactionTypeSchema = z.enum(["SENT", "RECEIVED"]);

export type TransactionType = z.infer<typeof transactionTypeSchema>;

export const transactionQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  cursor: z.string().optional(),
  type: transactionTypeSchema.optional(),
});

export const transactionSchema = z.object({
  id: z.string().uuid(),

  type: z.enum(["SENT", "RECEIVED"]),

  amountMinor: z.number().int().nonnegative(),

  currency: z.string().length(3),

  status: z.enum(["PENDING", "COMPLETED", "FAILED", "CANCELLED"]),

  counterparty: z.object({
    name: z.string(),
    phoneNumber: z.string(),
  }),

  createdAt: z.iso.datetime(),
});

export type Transaction = z.infer<typeof transactionSchema>;

export type TransactionQuery = z.infer<typeof transactionQuerySchema>;

export const CreateWalletSchema = z.object({
  currency: z
    .string()
    .length(3)
    .regex(/^[A-Z]{3}$/, {
      message: "Currency must be a 3-letter uppercase currency code",
    })
    .optional()
    .default("NPR"),

  phoneNumber: z.string().regex(/^(?:9[678]\d{8})$/, {
    message: "Phone number must be a valid 10-digit Nepali mobile number",
  }),
});

// Raw form values (before Zod validation)
export type CreateWalletFormValues = z.input<typeof CreateWalletSchema>;

// Validated values (after Zod validation)
export type CreateWallet = z.output<typeof CreateWalletSchema>;
