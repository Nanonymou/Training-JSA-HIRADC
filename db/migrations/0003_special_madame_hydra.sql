CREATE TABLE "peserta" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"training_id" text DEFAULT 'jsa-hiradc' NOT NULL,
	"nama" text NOT NULL,
	"email" text NOT NULL,
	"jabatan" text NOT NULL,
	"lokasi" text NOT NULL,
	"departemen" text DEFAULT 'QHSE' NOT NULL,
	"browser" text,
	"ip" text,
	"waktu_hadir" timestamp with time zone DEFAULT now() NOT NULL
);
