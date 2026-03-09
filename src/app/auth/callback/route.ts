import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getSafeRedirect(next: string | null): string {
  if (!next) return "/inbox";
  // Must be a relative path starting with / and not containing // or a protocol
  if (/^\/(?!\/)/.test(next) && !/^[a-z][a-z\d+\-.]*:/i.test(next)) {
    return next;
  }
  return "/inbox";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeRedirect(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If the code exchange failed or no code was provided,
  // redirect to login with an error indicator
  return NextResponse.redirect(`${origin}/?error=auth_callback_error`);
}
