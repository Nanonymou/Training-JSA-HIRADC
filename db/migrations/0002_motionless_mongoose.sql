CREATE TABLE "uploads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"training_id" text DEFAULT 'jsa-hiradc' NOT NULL,
	"peserta_nama" text NOT NULL,
	"peserta_email" text NOT NULL,
	"lokasi" text,
	"file_name" text NOT NULL,
	"file_size" integer NOT NULL,
	"file_ext" text NOT NULL,
	"url_berkas" text NOT NULL,
	"status" text DEFAULT 'Pending' NOT NULL,
	"admin_comment" text,
	"waktu_unggah" timestamp with time zone DEFAULT now() NOT NULL
);
