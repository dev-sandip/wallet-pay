"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  CreateWallet,
  CreateWalletFormValues,
  CreateWalletSchema,
} from "@/features/wallet/wallet.type";

import {
  useCreateWallet,
  useGetUserWallets,
} from "@/features/wallet/wallet.queries";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldGroup,
} from "@/components/ui/field";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Wallet as WalletIcon,
  Phone,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";

import { toast } from "@/components/ui/toast";

export default function WalletPage() {
  const { data: wallets, isLoading, isError } = useGetUserWallets();

  const createWallet = useCreateWallet();

  const form = useForm<CreateWalletFormValues, unknown, CreateWallet>({
    resolver: zodResolver(CreateWalletSchema),
    defaultValues: {
      currency: "NPR",
      phoneNumber: "",
    },
  });

  const existingWallet = wallets?.[0];

  const onSubmit = async (values: CreateWallet) => {
    // Prevent duplicate wallet creation
    if (wallets && wallets.length > 0) {
      toast.add({
        title: "Wallet already exists",
        type: "error",
        description:
          "You already have a wallet. You cannot create another one.",
      });

      return;
    }

    try {
      await createWallet.mutateAsync(values);

      toast.add({
        title: "Wallet created successfully",
        type: "success",
        description: "Your wallet is ready to use.",
      });

      form.reset();
    } catch (error: unknown) {
      toast.add({
        title: "Failed to create wallet",
        type: "error",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while creating your wallet.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="font-medium text-destructive">
              Failed to load wallet details.
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Please refresh the page and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ----------------------------------
  // Existing Wallet
  // ----------------------------------

  if (existingWallet) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Wallet</h1>

          <p className="text-muted-foreground">
            Manage and view your wallet information.
          </p>
        </div>

        <Card className="overflow-hidden">
          <div className="bg-primary p-6 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <WalletIcon className="size-6" />
                <span className="font-semibold">My Wallet</span>
              </div>

              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                {existingWallet.status}
              </span>
            </div>

            <p className="mt-8 text-sm text-primary-foreground/80">
              Available Balance
            </p>

            <h2 className="mt-1 text-4xl font-bold">
              {existingWallet.currency}{" "}
              {(existingWallet.balanceMinor / 100).toLocaleString("en-NP", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm text-primary-foreground/80">
                Wallet ID
              </span>

              <span className="text-sm font-medium">{existingWallet.id}</span>
            </div>
          </div>

          <CardContent className="space-y-5 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <Phone className="size-5" />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>

                  <p className="font-medium">{existingWallet.phoneNumber}</p>
                </div>
              </div>

              <CheckCircle2 className="size-5 text-green-500" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <WalletIcon className="size-5" />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Currency</p>

                  <p className="font-medium">{existingWallet.currency}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Created At</p>

              <p className="font-medium">
                {new Date(existingWallet.createdAt).toLocaleDateString(
                  "en-NP",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>

              <p className="font-medium">
                {new Date(existingWallet.updatedAt).toLocaleDateString("en-NP")}
              </p>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />

                <p className="text-sm font-medium">
                  Your wallet is already registered.
                </p>
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                You cannot create another wallet with this account.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ----------------------------------
  // Create Wallet Form
  // ----------------------------------

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Create Your Wallet
        </h1>

        <p className="mt-1 text-muted-foreground">
          Create your digital wallet to start managing your money.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <WalletIcon className="size-6 text-primary" />
          </div>

          <CardTitle>Create a New Wallet</CardTitle>

          <CardDescription>
            Enter your mobile number and select your preferred currency.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            <FieldGroup>
              {/* Phone Number */}

              <Controller
                control={form.control}
                name="phoneNumber"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Mobile Number</FieldLabel>

                    <div className="relative">
                      <Phone className="absolute left-3 top-3 size-4 text-muted-foreground" />

                      <Input
                        {...field}
                        id={field.name}
                        type="tel"
                        placeholder="98XXXXXXXX"
                        className="pl-10"
                        maxLength={10}
                        autoComplete="tel-national"
                        aria-invalid={fieldState.invalid}
                      />
                    </div>

                    <FieldDescription>
                      Enter your valid 10-digit Nepali mobile number.
                    </FieldDescription>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Currency */}

              <Controller
                control={form.control}
                name="currency"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Wallet Currency
                    </FieldLabel>

                    <Select
                      name={field.name}
                      value={field.value ?? "NPR"}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="NPR">
                          NPR - Nepalese Rupee
                        </SelectItem>

                        <SelectItem value="USD">USD - US Dollar</SelectItem>

                        <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                      </SelectContent>
                    </Select>

                    <FieldDescription>
                      Select the currency for your wallet.
                    </FieldDescription>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            {/* Submit */}

            <Button
              type="submit"
              className="w-full"
              disabled={createWallet.isPending || !form.formState.isDirty}
            >
              {createWallet.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Creating Wallet...
                </>
              ) : (
                <>
                  Create Wallet
                  <ArrowUpRight className="ml-2 size-4" />
                </>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              By creating a wallet, you agree to the applicable wallet terms and
              conditions.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
