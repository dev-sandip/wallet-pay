import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/config/api-endpoints";
import { WalletService } from "./wallet.service";
import { CreateWallet, TransactionQuery } from "./wallet.type";

export function useGetUserBalance(phoneNumber: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.wallet.getUserBalance(phoneNumber)],
    queryFn: () => WalletService.getUserBalance(phoneNumber),
    enabled: Boolean(phoneNumber),
  });
}
export function useGetUserWallets() {
  return useQuery({
    queryKey: [QUERY_KEYS.wallet.list()],
    queryFn: () => WalletService.getUserWallets(),
  });
}

export function useGetTransactions(params: TransactionQuery) {
  return useQuery({
    queryKey: [QUERY_KEYS.transaction.list(), params],
    queryFn: () => WalletService.getTransactions(params),
  });
}
export function useCreateWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateWallet) => WalletService.createWallet(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.wallet.create(),
      });
    },
  });
}
