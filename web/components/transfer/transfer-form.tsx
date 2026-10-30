"use client";

import { useState } from "react";
import { TransferFunds } from "@/features/wallet/wallet.type";

interface TransferFormProps {
  onSubmit: (data: TransferFunds) => void;
}

export function TransferForm({ onSubmit }: TransferFormProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      receiverPhoneNumber: phoneNumber,
      amount: Number(amount),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium">
          Receiver phone number
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="9812345678"
          required
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Amount</label>
        <input
          type="number"
          min="1"
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          required
          className="w-full rounded-lg border p-3"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-primary p-3 text-white"
      >
        Continue
      </button>
    </form>
  );
}
