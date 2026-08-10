ALTER TABLE "materi_versions" DROP CONSTRAINT "materi_versions_training_id_trainings_id_fk";
--> statement-breakpoint
ALTER TABLE "materi_versions" ALTER COLUMN "training_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "materi_versions" ALTER COLUMN "training_id" SET DEFAULT 'jsa-hiradc';