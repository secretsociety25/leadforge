/**
 * Client-safe Supabase entrypoint (browser / Client Components).
 * For Server Components, actions, and Route Handlers use `@/lib/supabase/server`.
 * For webhooks / admin operations use `@/lib/supabase/admin`.
 */
export type {
  Database,
  Enums,
  Json,
  Tables,
  TypedSupabaseClient,
  UserTier,
} from "./database.types";
export { createClient } from "./supabase/client";
