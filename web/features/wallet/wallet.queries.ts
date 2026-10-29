import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/config/api-endpoints";
import { WalletService } from "./wallet.service";

export function useGetUserBalance(phoneNumber: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.wallet.getUserBalance(phoneNumber)],
    queryFn: () => WalletService.getUserBalance(phoneNumber),
    enabled: Boolean(phoneNumber),
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
