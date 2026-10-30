import { api } from "@/lib/axios";
import {
  CreateWallet,
  Transaction,
  TransactionQuery,
  TransferFundResponse,
  TransferFunds,
  Wallet,
  WalletBalanceResponse,
} from "./wallet.type";
import { ApiResponse } from "@/lib/api/types";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export const WalletService = {
  async getUserBalance(phoneNumber: string): Promise<WalletBalanceResponse> {
    const response = await api.get<ApiResponse<WalletBalanceResponse>>(
      API_ENDPOINTS.wallet.getUserBalance(phoneNumber),
    );
    return response.data.data;
  },
  async getUserWallets(): Promise<Wallet[]> {
    const response = await api.get<ApiResponse<Wallet[]>>(
      API_ENDPOINTS.wallet.list,
    );
    return response.data.data;
  },

  async getTransactions(params: TransactionQuery): Promise<Transaction[]> {
    const response = await api.get<ApiResponse<{ data: Transaction[] }>>(
      API_ENDPOINTS.transaction.list,
      { params },
    );

    return response.data.data.data;
  },
  async createWallet(data: CreateWallet) {
    const response = await api.post<ApiResponse<Wallet>>(
      API_ENDPOINTS.wallet.create,
      data,
    );
    return response.data.data;
  },
  //it requires ideomptency key to avoid duplicate transactions, so we will need to generate a unique key for each transfer request in request header as well
  async transferFunds(data: TransferFunds, idempotencyKey: string) {
    const response = await api.post<ApiResponse<TransferFundResponse>>(
      API_ENDPOINTS.transfer.transferFunds,
      data,
      {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      },
    );

    return response.data.data;
  },
};
