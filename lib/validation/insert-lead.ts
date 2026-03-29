import { z } from "zod";

export const insertLeadInputSchema = z.object({
  campaign_id: z.string().uuid("Invalid campaign id"),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(500, "Name is too long"),
  linkedin_url: z
    .union([z.string().url("Invalid LinkedIn URL"), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  email: z
    .union([z.string().email("Invalid email"), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  personalised_pitch: z
    .union([z.string().max(20_000, "Pitch is too long"), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === undefined || v === "" ? null : v)),
});

export type InsertLeadInput = z.input<typeof insertLeadInputSchema>;
