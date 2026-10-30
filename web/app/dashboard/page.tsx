"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EyeIcon } from "@/components/ui/morphing-icons";
import { useGetUserWallets } from "@/features/wallet/wallet.queries";

import { useAuth } from "@/components/providers/auth-provider";

export default function DashboardPage() {
  const { data: session } = useAuth();
  const [balanceVisible, setBalanceVisible] = useState(true);

  const { data: wallets } = useGetUserWallets();

  const user = session?.user;
  const recentTransactions = [
    { id: 1, title: "Coffee shop", date: "Today", amount: "-₹120.00" },
    { id: 2, title: "Added money", date: "Yesterday", amount: "+₹1,000.00" },
  ];

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">
              Welcome, {user?.name || "there"}
            </h1>
            <p className="text-muted-foreground">
              Here&apos;s an overview of your wallet.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>My wallet</CardTitle>
              <Badge>Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <p className="text-3xl font-bold">
                {balanceVisible && wallets?.[0]
                  ? (wallets[0].balanceMinor / 100).toLocaleString("en-IN", {
                      style: "currency",
                      currency: wallets[0].currency,
                    })
                  : "₹XXX.XX"}
              </p>
              <button
                type="button"
                aria-label={balanceVisible ? "Hide balance" : "Show balance"}
                onClick={() => setBalanceVisible((visible) => !visible)}
                className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <EyeIcon closed={!balanceVisible} size={22} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              {wallets?.length ?? 0} wallet{wallets?.length === 1 ? "" : "s"}{" "}
              connected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{transaction.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.date}
                  </p>
                </div>
                <p className="font-medium">{transaction.amount}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
