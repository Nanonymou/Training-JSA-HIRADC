ALTER TABLE "trainings" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "trainings" ADD CONSTRAINT "trainings_slug_unique" UNIQUE("slug");