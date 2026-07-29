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
