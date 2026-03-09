import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkIdentifierSchema } from "@/lib/validations/namespace";

/**
 * GET /api/namespaces/check?identifier=XXXXX
 * Check if a namespace identifier is available.
 * Used for real-time form validation (debounced on the client).
 *
 * Uses a SECURITY DEFINER function to check across ALL namespaces,
 * not just ones visible to the current user via RLS.
 */
export async function GET(request: Request) {
  const supabase = await createClient();

  // Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // Parse the identifier from query params
  const { searchParams } = new URL(request.url);
  const identifier = searchParams.get("identifier");

  const validation = checkIdentifierSchema.safeParse({ identifier });
  if (!validation.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 }
    );
  }

  const validIdentifier = validation.data.identifier;

  // Use the SECURITY DEFINER function to check availability across all namespaces
  const { data: available, error } = await supabase.rpc(
    "check_namespace_identifier_available",
    { check_identifier: validIdentifier }
  );

  if (error) {
    console.error("Failed to check identifier availability:", error);
    return NextResponse.json(
      { error: "Failed to check identifier availability" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    identifier: validIdentifier,
    available: available === true,
  });
}
