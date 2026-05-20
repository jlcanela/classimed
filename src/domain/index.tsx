import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-orm/effect-schema';
import { glossaryTerms } from '../db/schema';

// Schema for inserting a user - can be used to validate API requests
export const GlossaryTermInsert = createInsertSchema(glossaryTerms);
export type GlossaryTermInsert = typeof GlossaryTermInsert.Type;

// Schema for updating a user - can be used to validate API requests
export const GlossaryTermUpdate = createUpdateSchema(glossaryTerms);
export type GlossaryTermUpdate = typeof GlossaryTermUpdate.Type;

// Schema for selecting a user - can be used to validate API responses
export const GlossaryTermSelect = createSelectSchema(glossaryTerms);
export type GlossaryTermSelect = typeof GlossaryTermSelect.Type;

