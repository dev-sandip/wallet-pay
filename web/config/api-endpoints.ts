export const API_ENDPOINTS = {
  wallet: {
    create: "/wallet",
    getUserBalance: (phoneNumber: string) => `/wallet/${phoneNumber}/balance`,
    list: "/wallet",
  },

  transaction: {
    list: "/wallet/transactions",
  },
};

export const QUERY_KEYS = {
  wallet: {
    all: ["wallets"] as const,
    list: () => [...QUERY_KEYS.wallet.all, "list"] as const,
    getUserBalance: (phoneNumber: string) =>
      [...QUERY_KEYS.wallet.all, "getUserBalance", phoneNumber] as const,
  },

  transaction: {
    all: ["transactions"] as const,
    list: () => [...QUERY_KEYS.transaction.all, "list"] as const,
    getTransactions: (params?: {
      limit?: number;
      cursor?: string;
      type?: "SENT" | "RECEIVED";
    }) => [...QUERY_KEYS.transaction.all, "getTransactions", params] as const,
  },
};
