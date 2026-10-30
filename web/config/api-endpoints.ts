export const API_ENDPOINTS = {
  wallet: {
    create: "/wallet",
    getUserBalance: (phoneNumber: string) => `/wallet/${phoneNumber}/balance`,
    list: "/wallet",
  },
};

export const QUERY_KEYS = {
  wallet: {
    all: ["wallets"] as const,
    list: () => [...QUERY_KEYS.wallet.all, "list"] as const,
    getUserBalance: (phoneNumber: string) =>
      [...QUERY_KEYS.wallet.all, "getUserBalance", phoneNumber] as const,
  },
};
