import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/** Browser-safe Supabase client — uses the publishable key, never the secret key. */
export const supabase = createClient(supabaseUrl, supabaseKey);
