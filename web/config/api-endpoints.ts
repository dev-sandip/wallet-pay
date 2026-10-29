export const API_ENDPOINTS = {
  wallet: {
    create: "/wallet",
    getUserBalance: (phoneNumber: string) => `/wallet/${phoneNumber}/balance`,
  },
};

export const QUERY_KEYS = {
  wallet: {
    all: ["wallets"] as const,
    getUserBalance: (phoneNumber: string) =>
      [...QUERY_KEYS.wallet.all, "getUserBalance", phoneNumber] as const,
  },
};
