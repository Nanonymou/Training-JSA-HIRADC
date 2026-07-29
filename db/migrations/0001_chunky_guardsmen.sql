CREATE TABLE "quiz_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"training_id" text DEFAULT 'jsa-hiradc' NOT NULL,
	"peserta_nama" text NOT NULL,
	"peserta_email" text NOT NULL,
	"jabatan" text,
	"lokasi" text,
	"score" integer NOT NULL,
	"correct" integer NOT NULL,
	"total" integer NOT NULL,
	"lulus" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
