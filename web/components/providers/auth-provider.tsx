"use client";
import React, { createContext, useContext, useEffect } from "react";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth";

type AuthContextValue = ReturnType<typeof authClient.useSession>;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const session = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session.isPending && (session.error || !session.data?.user)) {
      router.replace("/login");
    }
  }, [router, session.data?.user, session.error, session.isPending]);

  return (
    <AuthContext.Provider value={session}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
