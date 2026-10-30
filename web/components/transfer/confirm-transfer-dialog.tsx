"use client";

import { TransferFunds } from "@/features/wallet/wallet.type";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertTriangle, ArrowRight } from "lucide-react";

interface ConfirmTransferDialogProps {
  open: boolean;
  data: TransferFunds | null;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmTransferDialog({
  open,
  data,
  isPending,
  onConfirm,
  onCancel,
}: ConfirmTransferDialogProps) {
  if (!data) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value && !isPending) {
          onCancel();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Transfer</DialogTitle>
          <DialogDescription>
            Please review the transfer details before proceeding.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Receiver</span>
              <span className="font-medium">{data.receiverPhoneNumber}</span>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="text-xl font-bold">
                NPR {data.amount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>
              Please verify the receiver&apos;s phone number and transfer
              amount. This transaction may not be reversible.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={onCancel}
          >
            Cancel
          </Button>

          <Button type="button" disabled={isPending} onClick={onConfirm}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Confirm & Send
                <ArrowRight className="ml-2 size-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
