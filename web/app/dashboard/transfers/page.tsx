"use client";

import { useRef, useState } from "react";
import { TransferForm } from "@/components/transfer/transfer-form";
import { ConfirmTransferDialog } from "@/components/transfer/confirm-transfer-dialog";
import {
  TransferFundResponse,
  TransferFunds,
} from "@/features/wallet/wallet.type";
import { useTransferFunds } from "@/features/wallet/wallet.queries";
import { TransferSuccess } from "@/components/transfer/transfer-sucess";

export default function TransferPage() {
  const [transferData, setTransferData] = useState<TransferFunds | null>(null);
  const [completedTransaction, setCompletedTransaction] =
    useState<TransferFundResponse | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Preserve the same key when retrying a transfer.
  const idempotencyKeyRef = useRef<string | null>(null);

  const transferMutation = useTransferFunds();

  const handleFormSubmit = (data: TransferFunds) => {
    setTransferData(data);
    setIsConfirmOpen(true);
  };

  const handleConfirmTransfer = async () => {
    if (!transferData || transferMutation.isPending) return;

    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = crypto.randomUUID();
    }

    try {
      const result = await transferMutation.mutateAsync({
        data: transferData,
        idempotencyKey: idempotencyKeyRef.current,
      });

      idempotencyKeyRef.current = null;

      setCompletedTransaction(result);
      setIsConfirmOpen(false);
      setTransferData(null);
    } catch (error) {
      console.error("Transfer failed:", error);
    }
  };

  const handleCancel = () => {
    if (transferMutation.isPending) return;

    setIsConfirmOpen(false);
    setTransferData(null);
    idempotencyKeyRef.current = null;
    transferMutation.reset();
  };
  if (completedTransaction) {
    return <TransferSuccess transaction={completedTransaction} />;
  }
  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="mb-2 text-2xl font-bold">Transfer Funds</h1>

      <p className="mb-6 text-sm text-gray-500">
        Send money securely to another wallet.
      </p>

      <TransferForm onSubmit={handleFormSubmit} />

      <ConfirmTransferDialog
        open={isConfirmOpen}
        data={transferData}
        isPending={transferMutation.isPending}
        onConfirm={handleConfirmTransfer}
        onCancel={handleCancel}
      />

      {transferMutation.isError && (
        <p className="mt-4 text-sm text-red-600">
          Transfer could not be completed. You can retry safely.
        </p>
      )}
    </div>
  );
}
