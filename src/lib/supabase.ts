// Re-export Supabase client utilities
// Use these imports for specific contexts:
//   - "@/lib/supabase/client"  -- Browser/client components
//   - "@/lib/supabase/server"  -- Server components and route handlers
//   - "@/lib/supabase/middleware" -- Next.js middleware

export { createClient as createBrowserClient } from "./supabase/client";
export { createClient as createServerClient } from "./supabase/server";
