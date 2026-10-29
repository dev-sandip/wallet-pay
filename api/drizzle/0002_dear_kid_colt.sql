ALTER TABLE "wallets" ADD COLUMN "phone_number" varchar(20);--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_phone_number_unique" UNIQUE("phone_number");