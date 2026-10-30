"use client";

import { useRouter } from "next/navigation";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";
import {
  CheckCircle2,
  ArrowRight,
  ReceiptText,
  Wallet,
  ShieldCheck,
  Copy,
} from "lucide-react";

import { TransferFundResponse } from "@/features/wallet/wallet.type";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "../ui/toast";

interface TransferSuccessProps {
  transaction: TransferFundResponse;
}

export function TransferSuccess({ transaction }: TransferSuccessProps) {
  const router = useRouter();
  const { width, height } = useWindowSize();

  const isCompleted = transaction.status === "COMPLETED";

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-NP", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatAmount = (amountMinor: number) => {
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 2,
    }).format(amountMinor / 100);
  };

  const copyTransactionId = async () => {
    try {
      await navigator.clipboard.writeText(transaction.id);

      toast.add({
        title: "Copied",
        description: "Transaction ID copied to clipboard",
        type: "success",
      });
    } catch {
      toast.add({
        title: "Failed",
        description: "Failed to copy transaction ID",
        type: "error",
      });
    }
  };

  return (
    <>
      {/* Success Confetti */}
      {isCompleted && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={250}
          recycle={false}
          gravity={0.15}
          tweenDuration={8000}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            pointerEvents: "none",
            zIndex: 100,
          }}
        />
      )}

      <div className="mx-auto w-full max-w-xl px-4 py-8">
        <Card className="overflow-hidden">
          {/* Header */}
          <CardHeader className="flex flex-col items-center justify-center space-y-2 pb-6 pt-10 text-center">
            <div
              className={`mx-auto flex size-20 shrink-0 items-center justify-center rounded-full ${
                isCompleted
                  ? "bg-green-100 dark:bg-green-950"
                  : "bg-yellow-100 dark:bg-yellow-950"
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="size-11 shrink-0 text-green-600" />
              ) : (
                <ShieldCheck className="size-11 shrink-0 text-yellow-600" />
              )}
            </div>

            <CardTitle className="text-2xl font-bold">
              {isCompleted ? "Transfer Successful!" : "Transfer Processing"}
            </CardTitle>

            <CardDescription className="max-w-sm text-center">
              {isCompleted
                ? "Your money has been successfully transferred to the receiver."
                : "Your transfer is being processed. Please check the transaction status before retrying."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-7">
            {/* Amount Section */}
            <div className="rounded-xl border bg-muted/40 px-4 py-7 text-center">
              <p className="text-sm text-muted-foreground">
                Amount Transferred
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                {formatAmount(transaction.amountMinor)}
              </h2>

              <div
                className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                  isCompleted
                    ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
                }`}
              >
                <ShieldCheck className="size-4" />
                {transaction.status}
              </div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Transaction Details</h3>

                <span className="text-xs text-muted-foreground">
                  Transfer Receipt
                </span>
              </div>

              <div className="space-y-4 text-sm">
                {/* Transaction ID */}
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] items-center gap-3">
                  <span className="text-muted-foreground">Transaction ID</span>

                  <div className="flex min-w-0 items-center justify-end gap-2">
                    <span className="truncate text-right font-medium">
                      {transaction.id}
                    </span>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0"
                      onClick={copyTransactionId}
                      aria-label="Copy transaction ID"
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Sender Wallet */}
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] items-center gap-3">
                  <span className="text-muted-foreground">Sender Wallet</span>

                  <span
                    className="break-all text-right font-medium"
                    title={transaction.senderWalletId}
                  >
                    {transaction.senderWalletId}
                  </span>
                </div>

                <Separator />

                {/* Receiver Wallet */}
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] items-center gap-3">
                  <span className="text-muted-foreground">Receiver Wallet</span>

                  <span
                    className="break-all text-right font-medium"
                    title={transaction.receiverWalletId}
                  >
                    {transaction.receiverWalletId}
                  </span>
                </div>

                <Separator />

                {/* Transaction Date */}
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] items-center gap-3">
                  <span className="text-muted-foreground">
                    Transaction Date
                  </span>

                  <span className="text-right font-medium">
                    {formatDate(transaction.createdAt)}
                  </span>
                </div>

                <Separator />

                {/* Status */}
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] items-center gap-3">
                  <span className="text-muted-foreground">
                    Transaction Status
                  </span>

                  <span
                    className={`text-right font-semibold ${
                      isCompleted ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {transaction.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button onClick={() => router.push("/wallet")} className="w-full">
                <Wallet className="mr-2 size-4" />
                Go to Wallet
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push("/wallet/transactions")}
                className="w-full"
              >
                <ReceiptText className="mr-2 size-4" />
                Transactions
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
              <ShieldCheck className="size-4 shrink-0" />
              Keep your transaction ID for future reference.
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
