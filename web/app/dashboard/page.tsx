"use client";

import { authClient } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetUserBalance } from "@/features/wallet/wallet.queries";

export default function DashboardPage() {
  const { data: session, isPending, error } = authClient.useSession();
  const router = useRouter();
  const phoneNumber = "9748706471";
  const { data } = useGetUserBalance(phoneNumber);
  useEffect(() => {
    if (!isPending && (error || !session?.user)) {
      router.replace("/login");
    }
  }, [isPending, error, session, router]);

  if (isPending || error || !session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  const user = session.user;

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Dashboard</CardTitle>
            <Badge>Protected route</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          <p>
            <strong>Name:</strong> {user.name || "Not provided"}
          </p>
          <p>
            <strong>Email:</strong> {user.email || "Not provided"}
          </p>
          <p>
            <strong>ID:</strong> {user.id}
          </p>
          <p>
            <strong>Balance:</strong> {data?.balance ?? "Not available"}
          </p>
          <p>
            <strong>Formatted balance:</strong> {data?.formattedBalance}
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
