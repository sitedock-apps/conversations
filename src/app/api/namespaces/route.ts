import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createNamespaceSchema } from "@/lib/validations/namespace";

/**
 * GET /api/namespaces
 * List all namespaces the authenticated user owns or participates in.
 * RLS handles the filtering automatically.
 */
export async function GET() {
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

  // Fetch namespaces (RLS filters to owned + participated)
  const { data: namespaces, error } = await supabase
    .from("namespaces")
    .select("id, identifier, name, description, owner_id, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Failed to fetch namespaces:", error);
    return NextResponse.json(
      { error: "Failed to fetch namespaces" },
      { status: 500 }
    );
  }

  return NextResponse.json({ namespaces });
}

/**
 * POST /api/namespaces
 * Create a new namespace.
 * Rate-limited to max 3 namespaces per user (enforced server-side).
 */
export async function POST(request: Request) {
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

  // Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const validation = createNamespaceSchema.safeParse(body);
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

  const { name, identifier, description } = validation.data;

  // Rate limit: max 3 namespaces per user
  const { count, error: countError } = await supabase
    .from("namespaces")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id);

  if (countError) {
    console.error("Failed to check namespace count:", countError);
    return NextResponse.json(
      { error: "Failed to verify namespace limit" },
      { status: 500 }
    );
  }

  if (count !== null && count >= 3) {
    return NextResponse.json(
      {
        error: "Namespace limit reached",
        message:
          "You can create a maximum of 3 namespaces. Contact support to increase your limit.",
        limit: 3,
        current: count,
      },
      { status: 429 }
    );
  }

  // Check identifier uniqueness before insert (user-friendly error)
  const { data: existing } = await supabase
    .from("namespaces")
    .select("id")
    .eq("identifier", identifier)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      {
        error: "Identifier already taken",
        message: `The identifier "${identifier}" is already in use. Please choose a different one.`,
      },
      { status: 409 }
    );
  }

  // Create the namespace
  const { data: namespace, error: insertError } = await supabase
    .from("namespaces")
    .insert({
      name,
      identifier,
      description,
      owner_id: user.id,
    })
    .select("id, identifier, name, description, owner_id, created_at")
    .single();

  if (insertError) {
    // Handle unique constraint violation (race condition)
    if (insertError.code === "23505") {
      return NextResponse.json(
        {
          error: "Identifier already taken",
          message: `The identifier "${identifier}" is already in use. Please choose a different one.`,
        },
        { status: 409 }
      );
    }

    console.error("Failed to create namespace:", insertError);
    return NextResponse.json(
      { error: "Failed to create namespace" },
      { status: 500 }
    );
  }

  return NextResponse.json({ namespace }, { status: 201 });
}
