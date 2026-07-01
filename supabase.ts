import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createBrowserClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

export function isSupabaseConfigured() {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes("votre-projet") &&
      !supabaseAnonKey.includes("votre-cle")
  );
}

export const PHOTOS_BUCKET = "Photos-mariages";
