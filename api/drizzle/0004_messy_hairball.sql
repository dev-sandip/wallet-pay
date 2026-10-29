CREATE TYPE "public"."transfer_status" AS ENUM('PENDING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TABLE "transfers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sender_wallet_id" varchar(255) NOT NULL,
	"receiver_wallet_id" varchar(255) NOT NULL,
	"amount_minor" integer NOT NULL,
	"status" "transfer_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "transfers_sender_created_idx" ON "transfers" USING btree ("sender_wallet_id","created_at");--> statement-breakpoint
CREATE INDEX "transfers_receiver_created_idx" ON "transfers" USING btree ("receiver_wallet_id","created_at");--> statement-breakpoint
CREATE INDEX "transfers_status_created_idx" ON "transfers" USING btree ("status","created_at");