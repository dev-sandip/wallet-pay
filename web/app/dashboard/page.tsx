"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EyeIcon } from "@/components/ui/morphing-icons";

import {
  useGetTransactions,
  useGetUserWallets,
} from "@/features/wallet/wallet.queries";

import { TransactionQuery } from "@/features/wallet/wallet.type";
import { useAuth } from "@/components/providers/auth-provider";

export default function DashboardPage() {
  const { data: session } = useAuth();

  const [balanceVisible, setBalanceVisible] = useState(true);
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionLimit, setTransactionLimit] = useState(10);

  const { data: wallets } = useGetUserWallets();

  const { data: transactionData, isLoading: transactionsLoading } =
    useGetTransactions({
      page: transactionPage,
      limit: transactionLimit,
    } as TransactionQuery);

  const user = session?.user;
  const wallet = wallets?.[0];

  // Transaction response handling
  const transactionResult = (transactionData ?? {}) as {
    data?: unknown;
    transactions?: unknown;
    pagination?: {
      page?: number;
      totalPages?: number;
      total?: number;
    };
    totalPages?: number;
    total?: number;
  };

  const transactionItems = Array.isArray(transactionData)
    ? transactionData
    : Array.isArray(transactionResult.data)
      ? transactionResult.data
      : Array.isArray(transactionResult.transactions)
        ? transactionResult.transactions
        : [];

  const totalPages = Math.max(
    transactionResult.pagination?.totalPages ??
      transactionResult.totalPages ??
      1,
    1,
  );

  const totalTransactions =
    transactionResult.pagination?.total ??
    transactionResult.total ??
    transactionItems.length;

  // Flexible transaction field detection
  const getTransactionValue = (
    transaction: Record<string, unknown>,
    keys: string[],
  ) => {
    const key = Object.keys(transaction).find((item) =>
      keys.includes(item.toLowerCase()),
    );

    return key ? transaction[key] : undefined;
  };

  const formatDate = (value: unknown) => {
    if (!value) return "Date unavailable";

    const date = new Date(String(value));

    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (value: unknown) => {
    if (value === null || value === undefined || value === "") {
      return "0.00";
    }

    const amount = Number(value);

    if (!Number.isFinite(amount)) return String(value);

    return Math.abs(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getTransactionDetails = (item: unknown, index: number) => {
    const transaction = item as Record<string, unknown>;

    const type = String(
      getTransactionValue(transaction, [
        "type",
        "transactiontype",
        "direction",
        "category",
      ]) ?? "",
    );

    const status = String(
      getTransactionValue(transaction, ["status", "transactionstatus"]) ?? "",
    );

    const amount = getTransactionValue(transaction, [
      "amount",
      "amountminor",
      "value",
    ]);

    const name = getTransactionValue(transaction, [
      "name",
      "username",
      "sendername",
      "receivername",
      "recipientname",
      "customername",
      "counterpartyname",
      "partyname",
    ]);

    const phone = getTransactionValue(transaction, [
      "phone",
      "phonenumber",
      "mobilenumber",
      "contactnumber",
      "senderphone",
      "receiverphone",
      "accountnumber",
      "accountno",
      "referencenumber",
      "transactionnumber",
      "transactionid",
    ]);

    const description = getTransactionValue(transaction, [
      "description",
      "title",
      "purpose",
      "narration",
      "remark",
    ]);

    const date = getTransactionValue(transaction, [
      "createdat",
      "date",
      "transactiondate",
      "timestamp",
    ]);

    const isCredit = /credit|deposit|received|refund|topup/i.test(type);

    const isDebit = /debit|withdraw|payment|transfer|sent/i.test(type);

    const isFailed = /failed|rejected|cancelled/i.test(status);
    const isPending = /pending|processing/i.test(status);

    const displayName =
      name && String(name).trim()
        ? String(name)
        : String(description || type || "Transaction");

    const displayType = type
      ? type.replace(/_/g, " ")
      : isCredit
        ? "Money received"
        : "Money sent";

    return {
      id: String(getTransactionValue(transaction, ["id", "_id"]) ?? index),
      name: displayName,
      phone: phone ? String(phone) : "",
      type: displayType,
      amount,
      date,
      status,
      isCredit,
      isDebit,
      isFailed,
      isPending,
    };
  };

  const currency = wallet?.currency ?? "INR";

  const formatCurrency = (amount: unknown) => {
    const value = Number(amount) / 100;

    if (!Number.isFinite(value)) return "—";

    return Math.abs(value).toLocaleString("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <header>
          <p className="text-sm font-medium text-muted-foreground">Dashboard</p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Welcome, {user?.name || "there"}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s an overview of your wallet.
          </p>
        </header>

        {/* Wallet - Original Design */}
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
                {balanceVisible && wallet
                  ? (wallet.balanceMinor / 100).toLocaleString("en-IN", {
                      style: "currency",
                      currency: wallet.currency,
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
              {wallets?.length ?? 0} wallet
              {wallets?.length === 1 ? "" : "s"} connected
            </p>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Recent transactions
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Your latest wallet activity.
              </p>
            </div>

            <span className="text-xs text-muted-foreground">
              {totalTransactions} transactions
            </span>
          </div>

          <Card className="overflow-hidden rounded-xl shadow-none">
            <CardContent className="p-0">
              {transactionsLoading ? (
                <div className="divide-y">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="flex animate-pulse items-center gap-3 p-5"
                    >
                      <div className="h-11 w-11 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-32 rounded bg-muted" />
                        <div className="h-3 w-24 rounded bg-muted" />
                      </div>
                      <div className="h-4 w-20 rounded bg-muted" />
                    </div>
                  ))}
                </div>
              ) : transactionItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <span className="text-xl">↗</span>
                  </div>

                  <p className="font-medium">No transactions yet</p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Your transactions will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {transactionItems.map((item, index) => {
                    const transaction = getTransactionDetails(item, index);

                    const isCredit = transaction.isCredit;

                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-muted/30 sm:px-5"
                      >
                        {/* Icon */}
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                            isCredit
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          <span className="text-xl font-semibold">
                            {isCredit ? "↓" : "↑"}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {transaction.name}
                          </p>

                          {transaction.phone && (
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {transaction.phone}
                            </p>
                          )}

                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="text-xs capitalize text-muted-foreground">
                              {transaction.type}
                            </span>

                            {transaction.status && (
                              <>
                                <span className="text-muted-foreground">·</span>

                                <span
                                  className={`text-[11px] font-medium capitalize ${
                                    transaction.isFailed
                                      ? "text-rose-600"
                                      : transaction.isPending
                                        ? "text-amber-600"
                                        : "text-emerald-600"
                                  }`}
                                >
                                  {transaction.status}
                                </span>
                              </>
                            )}
                          </div>

                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {formatDate(transaction.date)}
                          </p>
                        </div>

                        {/* Amount */}
                        <div className="shrink-0 text-right">
                          <p
                            className={`text-sm font-semibold tabular-nums ${
                              isCredit
                                ? "text-emerald-600"
                                : transaction.isFailed
                                  ? "text-muted-foreground"
                                  : "text-foreground"
                            }`}
                          >
                            {isCredit ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </p>

                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {transaction.isFailed
                              ? "Unsuccessful"
                              : transaction.isPending
                                ? "Processing"
                                : "Transaction"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-4 sm:px-5">
                <p className="text-xs text-muted-foreground">
                  Page {transactionPage} of {totalPages}
                </p>

                <div className="flex items-center gap-2">
                  <select
                    aria-label="Transactions per page"
                    value={transactionLimit}
                    onChange={(event) => {
                      setTransactionLimit(Number(event.target.value));
                      setTransactionPage(1);
                    }}
                    className="h-8 rounded-md border bg-background px-2 text-xs"
                  >
                    {[10, 25, 50, 100].map((limit) => (
                      <option key={limit} value={limit}>
                        {limit} / page
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    disabled={transactionPage === 1 || transactionsLoading}
                    onClick={() => setTransactionPage((page) => page - 1)}
                    className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    disabled={
                      transactionPage >= totalPages || transactionsLoading
                    }
                    onClick={() => setTransactionPage((page) => page + 1)}
                    className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
