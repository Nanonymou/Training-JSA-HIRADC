ALTER TABLE "uploads" ADD COLUMN "notif_status" text DEFAULT 'Belum' NOT NULL;--> statement-breakpoint
ALTER TABLE "uploads" ADD COLUMN "notif_sent_at" timestamp with time zone;