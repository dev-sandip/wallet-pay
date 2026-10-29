import { api } from "@/lib/axios";
import { WalletBalanceResponse } from "./wallet.type";
import { ApiResponse } from "@/lib/api/types";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export const WalletService = {
  async getUserBalance(phoneNumber: string): Promise<WalletBalanceResponse> {
    const response = await api.get<ApiResponse<WalletBalanceResponse>>(
      API_ENDPOINTS.wallet.getUserBalance(phoneNumber),
    );
    return response.data.data;
  },
};
