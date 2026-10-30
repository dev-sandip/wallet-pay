"use client";

import React, { createContext, useContext, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth";

type AuthContextValue = ReturnType<typeof authClient.useSession>;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const session = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();

  const publicRoutes = ["/login", "/signup"];

  const isPublicRoute = publicRoutes.includes(pathname) || pathname === "/";

  useEffect(() => {
    if (
      !session.isPending &&
      !isPublicRoute &&
      (session.error || !session.data?.user)
    ) {
      router.replace("/login");
    }
  }, [
    router,
    pathname,
    isPublicRoute,
    session.data?.user,
    session.error,
    session.isPending,
  ]);

  if (
    !isPublicRoute &&
    (session.isPending || session.error || !session.data?.user)
  ) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={session}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
