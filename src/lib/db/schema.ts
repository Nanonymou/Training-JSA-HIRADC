import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
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
  waktuUnggah: timestamp("waktu_unggah", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const questionsRelations = relations(questions, ({ many }) => ({
  options: many(questionOptions),
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
