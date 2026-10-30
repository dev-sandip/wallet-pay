import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/config/api-endpoints";
import { WalletService } from "./wallet.service";
import { TransactionQuery } from "./wallet.type";

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
// export function useCreateUser() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (input: CreateUserInput) =>
//       usersService.create(input),

//     onSuccess: async () => {
//       await queryClient.invalidateQueries({
//         queryKey: QUERY_KEYS.users.all,
//       });
//     },
//   });
