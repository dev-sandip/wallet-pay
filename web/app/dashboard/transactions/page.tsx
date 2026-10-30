"use client";

import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  ReceiptText,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { useGetTransactions } from "@/features/wallet/wallet.queries";
import type {
  Transaction,
  TransactionQuery,
} from "@/features/wallet/wallet.type";

type TransactionFilter = "ALL" | "SENT" | "RECEIVED";

export default function TransactionsPage() {
  const [limit, setLimit] = useState(10);
  const [type, setType] = useState<TransactionFilter>("ALL");

  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([
    undefined,
  ]);

  const cursor = cursorHistory[cursorHistory.length - 1];

  const query: TransactionQuery = {
    limit,
    ...(cursor ? { cursor } : {}),
    ...(type !== "ALL" ? { type } : {}),
  };

  const { data, isLoading, isError } = useGetTransactions(query);

  const transactions = data ?? [];
  const hasNextPage = transactions.length === limit;
  const currentPage = cursorHistory.length;

  const resetPagination = (newLimit = limit, newType = type) => {
    setLimit(newLimit);
    setType(newType);
    setCursorHistory([undefined]);
  };

  const handleNext = () => {
    const nextCursor = transactions[transactions.length - 1]?.id;

    if (!nextCursor || !hasNextPage) return;

    setCursorHistory((previous) => [...previous, nextCursor]);
  };

  const handlePrevious = () => {
    if (cursorHistory.length <= 1) return;

    setCursorHistory((previous) => previous.slice(0, -1));
  };

  const formatAmount = (amountMinor: number, currency: string) =>
    (amountMinor / 100).toLocaleString("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusStyle = (status: Transaction["status"]) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";

      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-100";

      case "FAILED":
        return "bg-rose-50 text-rose-700 border-rose-100";

      case "CANCELLED":
        return "bg-muted text-muted-foreground border-border";

      default:
        return "";
    }
  };

  const getStatusLabel = (status: Transaction["status"]) => {
    switch (status) {
      case "COMPLETED":
        return "Successful";
      case "PENDING":
        return "Processing";
      case "FAILED":
        return "Unsuccessful";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  return (
    <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-5xl space-y-7">
        {/* Header */}
        <header className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wallet className="h-4 w-4" />
            <span>Wallet</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Transactions
          </h1>

          <p className="text-sm text-muted-foreground">
            Keep track of your wallet activity.
          </p>
        </header>

        {/* Filters */}
        <Card className="rounded-xl border shadow-none">
          <CardContent className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-1 rounded-lg bg-muted/70 p-1">
              {(
                [
                  { label: "All", value: "ALL" },
                  { label: "Sent", value: "SENT" },
                  { label: "Received", value: "RECEIVED" },
                ] as const
              ).map((filter) => (
                <Button
                  key={filter.value}
                  size="sm"
                  variant={type === filter.value ? "secondary" : "ghost"}
                  className={`h-8 px-4 text-xs ${
                    type === filter.value
                      ? "bg-background shadow-sm hover:bg-background"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => resetPagination(limit, filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>

            <Select
              value={String(limit)}
              onValueChange={(value) => resetPagination(Number(value))}
            >
              <SelectTrigger className="h-9 w-full sm:w-36.25">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {[10, 25, 50, 100].map((value) => (
                  <SelectItem key={value} value={String(value)}>
                    {value} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="overflow-hidden rounded-xl border shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-5 py-4">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">
                Recent activity
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Your wallet transaction history
              </p>
            </div>

            <ReceiptText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>

          <Separator />

          <CardContent className="p-0">
            {/* Loading */}
            {isLoading ? (
              <div className="divide-y">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex animate-pulse items-center gap-4 px-5 py-5"
                  >
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-32 rounded bg-muted" />
                      <div className="h-3 w-24 rounded bg-muted" />
                    </div>
                    <div className="h-4 w-20 rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                <p className="text-sm font-medium text-destructive">
                  Unable to load transactions
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Please try again later.
                </p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <ReceiptText className="h-5 w-5 text-muted-foreground" />
                </div>

                <p className="text-sm font-medium">No transactions found</p>

                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  Your wallet activity will appear here once you make or receive
                  a transaction.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {transactions.map((transaction) => {
                  const isReceived = transaction.type === "RECEIVED";

                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center gap-3 px-4 py-5 transition-colors hover:bg-muted/30 sm:gap-4 sm:px-5"
                    >
                      {/* Icon */}
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          isReceived
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {isReceived ? (
                          <ArrowDownLeft className="h-5 w-5" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="truncate text-sm font-medium">
                          {transaction.counterparty?.name || "Unknown"}
                        </p>

                        <p className="truncate text-xs text-muted-foreground">
                          {transaction.counterparty?.phoneNumber ||
                            "No phone number"}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <Badge
                            variant="outline"
                            className={`h-5 rounded-md px-1.5 text-[10px] font-medium ${
                              isReceived
                                ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                                : "border-rose-100 bg-rose-50 text-rose-700"
                            }`}
                          >
                            {isReceived ? "Received" : "Sent"}
                          </Badge>

                          <Badge
                            variant="outline"
                            className={`h-5 rounded-md px-1.5 text-[10px] font-medium ${getStatusStyle(
                              transaction.status,
                            )}`}
                          >
                            {getStatusLabel(transaction.status)}
                          </Badge>
                        </div>

                        <p className="pt-1 text-[11px] text-muted-foreground">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>

                      {/* Amount */}
                      <div className="shrink-0 text-right">
                        <p
                          className={`text-sm font-semibold tabular-nums ${
                            isReceived ? "text-emerald-600" : "text-foreground"
                          }`}
                        >
                          {isReceived ? "+" : "-"}
                          {formatAmount(
                            transaction.amountMinor,
                            transaction.currency,
                          )}
                        </p>

                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {getStatusLabel(transaction.status)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>

          {/* Pagination */}
          <Separator />

          <div className="flex items-center justify-between px-4 py-3 sm:px-5">
            <p className="text-xs text-muted-foreground">
              Page{" "}
              <span className="font-medium text-foreground">{currentPage}</span>
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                disabled={currentPage === 1 || isLoading}
                onClick={handlePrevious}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                disabled={
                  !hasNextPage || isLoading || transactions.length === 0
                }
                onClick={handleNext}
              >
                Next
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
