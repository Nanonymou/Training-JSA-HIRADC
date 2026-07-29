import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Database schema — quiz question bank.
 *
 * The question bank is normalised into two tables so the correct answer is a
 * property of an option row, not an index that can drift: `questions` holds the
 * prompt, `question_options` holds each choice with an `is_correct` flag and an
 * authoring `position`. `training_id` scopes questions to a training topic (kept
 * a plain slug for now; the TRAININGS table arrives with the multi-training CMS
 * phase). This mirrors the frontend's mock shape — pilihan[] → option rows,
 * kunci → the option flagged correct — so serving from here won't change the API.
 */

export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  trainingId: text("training_id").notNull().default("jsa-hiradc"),
  soal: text("soal").notNull(),
  /** Question category, for filtering the bank (e.g. JSA, HIRADC). */
  category: text("category").notNull().default("Umum"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const questionOptions = pgTable("question_options", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  /** The option text shown to the peserta. */
  label: text("label").notNull(),
  /** Whether this option is the correct answer. */
  isCorrect: boolean("is_correct").notNull().default(false),
  /** Authoring order; the UI shuffles at attempt time, not here. */
  position: integer("position").notNull().default(0),
});

/**
 * A peserta record (PRD: PESERTA).
 *
 * The identity every activity is recorded against, captured when the Daftar Hadir
 * is signed. Department defaults to QHSE; the system stamps waktu_hadir and (from
 * the request) browser and ip.
 */
export const peserta = pgTable("peserta", {
  id: uuid("id").primaryKey().defaultRandom(),
  trainingId: text("training_id").notNull().default("jsa-hiradc"),
  nama: text("nama").notNull(),
  email: text("email").notNull(),
  jabatan: text("jabatan").notNull(),
  lokasi: text("lokasi").notNull(),
  departemen: text("departemen").notNull().default("QHSE"),
  browser: text("browser"),
  ip: text("ip"),
  waktuHadir: timestamp("waktu_hadir", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * A recorded quiz result (PRD: QUIZ_RECORD).
 *
 * One row per submitted attempt. The peserta's identity is denormalised here —
 * name, email, job, and site — because the Daftar Hadir is a cookie session, not
 * a peserta table yet; keeping the fields on the row lets the Data Peserta report
 * aggregate results per site without a join. `score` is the percentage and
 * `lulus` the pass/fail at submit time.
 */
export const quizAttempts = pgTable("quiz_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  trainingId: text("training_id").notNull().default("jsa-hiradc"),
  pesertaNama: text("peserta_nama").notNull(),
  pesertaEmail: text("peserta_email").notNull(),
  jabatan: text("jabatan"),
  lokasi: text("lokasi"),
  score: integer("score").notNull(),
  correct: integer("correct").notNull(),
  total: integer("total").notNull(),
  lulus: boolean("lulus").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * A submitted latihan file (PRD: UPLOAD_LATIHAN).
 *
 * One row per uploaded file. `urlBerkas` is the Vercel Blob URL; `status` starts
 * "Pending" and an admin later moves it to Disetujui / Perlu Revisi / Ditolak
 * with an optional comment. Peserta identity is denormalised (as elsewhere)
 * since attendance is a cookie session, not a peserta table — so the review and
 * Data Peserta screens can list and filter per site without a join.
 */
export const uploads = pgTable("uploads", {
  id: uuid("id").primaryKey().defaultRandom(),
  trainingId: text("training_id").notNull().default("jsa-hiradc"),
  pesertaNama: text("peserta_nama").notNull(),
  pesertaEmail: text("peserta_email").notNull(),
  lokasi: text("lokasi"),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  fileExt: text("file_ext").notNull(),
  urlBerkas: text("url_berkas").notNull(),
  status: text("status").notNull().default("Pending"),
  adminComment: text("admin_comment"),
  /** Admin who last set the status (email), null until first reviewed. */
  reviewedBy: text("reviewed_by"),
  /** When the status was last changed by an admin; null until reviewed. */
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  /** Peserta notification email state: Belum / Terkirim / Gagal. */
  notifStatus: text("notif_status").notNull().default("Belum"),
  /** When the notification email was last sent; null until sent. */
  notifSentAt: timestamp("notif_sent_at", { withTimezone: true }),
  waktuUnggah: timestamp("waktu_unggah", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Training topics (PRD: TRAININGS) for the multi-training CMS.
 */
export const trainings = pgTable("trainings", {
  id: uuid("id").primaryKey().defaultRandom(),
  /**
   * Stable slug that scopes content to this training. Matches the `training_id`
   * text columns on questions/peserta/uploads/quiz_attempts (default
   * "jsa-hiradc"), so a training row and its content share one key.
   */
  slug: text("slug").notNull().unique(),
  judul: text("judul").notNull(),
  deskripsi: text("deskripsi").notNull().default(""),
  aktif: boolean("aktif").notNull().default(false),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * A saved revision of a training's material (version history).
 *
 * Each converted DOCX / edit is a version; exactly one per training is `current`.
 */
export const materiVersions = pgTable("materi_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  trainingId: uuid("training_id")
    .notNull()
    .references(() => trainings.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  catatan: text("catatan").notNull().default(""),
  updatedBy: text("updated_by"),
  isCurrent: boolean("is_current").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * A chapter of a material version. The sections (headings + variant + content)
 * are stored as JSON since their shape is nested and read as a unit.
 */
export const materiChapters = pgTable("materi_chapters", {
  id: uuid("id").primaryKey().defaultRandom(),
  versionId: uuid("version_id")
    .notNull()
    .references(() => materiVersions.id, { onDelete: "cascade" }),
  position: integer("position").notNull().default(0),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  minutes: integer("minutes").notNull().default(0),
  sections: jsonb("sections").$type<unknown[]>().notNull().default([]),
});

export const questionsRelations = relations(questions, ({ many }) => ({
  options: many(questionOptions),
}));

export const trainingsRelations = relations(trainings, ({ many }) => ({
  versions: many(materiVersions),
}));

export const materiVersionsRelations = relations(
  materiVersions,
  ({ one, many }) => ({
    training: one(trainings, {
      fields: [materiVersions.trainingId],
      references: [trainings.id],
    }),
    chapters: many(materiChapters),
  }),
);

export const materiChaptersRelations = relations(materiChapters, ({ one }) => ({
  version: one(materiVersions, {
    fields: [materiChapters.versionId],
    references: [materiVersions.id],
  }),
}));

export const questionOptionsRelations = relations(
  questionOptions,
  ({ one }) => ({
    question: one(questions, {
      fields: [questionOptions.questionId],
      references: [questions.id],
    }),
  }),
);

export type QuestionRow = typeof questions.$inferSelect;
export type NewQuestionRow = typeof questions.$inferInsert;
export type QuestionOptionRow = typeof questionOptions.$inferSelect;
export type NewQuestionOptionRow = typeof questionOptions.$inferInsert;
export type QuizAttemptRow = typeof quizAttempts.$inferSelect;
export type NewQuizAttemptRow = typeof quizAttempts.$inferInsert;
export type UploadRow = typeof uploads.$inferSelect;
export type NewUploadRow = typeof uploads.$inferInsert;
export type PesertaRow = typeof peserta.$inferSelect;
export type NewPesertaRow = typeof peserta.$inferInsert;
export type TrainingRow = typeof trainings.$inferSelect;
export type NewTrainingRow = typeof trainings.$inferInsert;
export type MateriVersionRow = typeof materiVersions.$inferSelect;
export type NewMateriVersionRow = typeof materiVersions.$inferInsert;
export type MateriChapterRow = typeof materiChapters.$inferSelect;
export type NewMateriChapterRow = typeof materiChapters.$inferInsert;
