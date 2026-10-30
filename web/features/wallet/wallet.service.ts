import { api } from "@/lib/axios";
import {
  Transaction,
  TransactionQuery,
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
};
