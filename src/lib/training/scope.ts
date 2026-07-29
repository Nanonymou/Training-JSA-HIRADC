/**
 * The training scope every content query runs under.
 *
 * Each content row (questions, peserta, uploads, quiz_attempts) carries a
 * `training_id` slug, and every read/write is scoped to one training so the
 * portal can host several without their data bleeding together. This module is
 * the single source of that key: the default matches the `training_id` column
 * defaults in the schema, and `resolveTrainingId` normalises a caller-supplied
 * slug (query param, cookie, session) down to a usable value.
 *
 * The seed data (used when no database is configured) all belongs to the default
 * training, so a repository serving the seed should return it only when the
 * resolved scope is the default and an empty set otherwise — that keeps the
 * dev/seed path honouring the same isolation the DB path enforces.
 */
export const DEFAULT_TRAINING_ID = "jsa-hiradc";

/** Normalise a caller-supplied training slug, falling back to the default. */
export function resolveTrainingId(source?: string | null): string {
  const value = source?.trim();
  return value ? value : DEFAULT_TRAINING_ID;
}

/** Whether the resolved scope is the seed's training (so seed data applies). */
export function isDefaultTraining(trainingId: string): boolean {
  return resolveTrainingId(trainingId) === DEFAULT_TRAINING_ID;
}
