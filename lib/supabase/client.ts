import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Variables de entorno públicas de Supabase para Next.js.
 */
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://c--23540cc4-848d-4acd-b40a-eca8394537c7-prod.lovable.cloud";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_Lxn_Bbiek8NPLpfFtwVlPw_P2F3nxay";

/**
 * Cliente singleton de Supabase tipado con la base de datos de ComunidadConectada.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
