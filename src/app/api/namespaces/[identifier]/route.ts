import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateNamespaceSchema } from "@/lib/validations/namespace";

/**
 * PATCH /api/namespaces/[identifier]
 * Update a namespace's name and/or description.
 * Owner-only. The identifier field is immutable and ignored if sent.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ identifier: string }> }
) {
  const supabase = await createClient();
  const { identifier } = await params;

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

  // Validate the identifier format from the URL
  if (!/^[A-Z0-9]{5}$/.test(identifier)) {
    return NextResponse.json(
      { error: "Invalid namespace identifier format" },
      { status: 400 }
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

  const validation = updateNamespaceSchema.safeParse(body);
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

  const updates = validation.data;

  // Check that at least one field is being updated
  if (!updates.name && updates.description === undefined) {
    return NextResponse.json(
      { error: "No fields to update. Provide name and/or description." },
      { status: 400 }
    );
  }

  // Fetch the namespace to verify ownership
  const { data: existing, error: fetchError } = await supabase
    .from("namespaces")
    .select("id, owner_id")
    .eq("identifier", identifier)
    .maybeSingle();

  if (fetchError) {
    console.error("Failed to fetch namespace:", fetchError);
    return NextResponse.json(
      { error: "Failed to fetch namespace" },
      { status: 500 }
    );
  }

  if (!existing) {
    return NextResponse.json(
      { error: "Namespace not found" },
      { status: 404 }
    );
  }

  if (existing.owner_id !== user.id) {
    return NextResponse.json(
      { error: "Only the namespace owner can edit it" },
      { status: 403 }
    );
  }

  // Build the update object (only include provided fields)
  const updateFields: Record<string, string | null> = {};
  if (updates.name !== undefined) {
    updateFields.name = updates.name;
  }
  if (updates.description !== undefined) {
    updateFields.description = updates.description;
  }

  // Perform the update (RLS also enforces ownership)
  const { data: namespace, error: updateError } = await supabase
    .from("namespaces")
    .update(updateFields)
    .eq("identifier", identifier)
    .select("id, identifier, name, description, owner_id, created_at")
    .single();

  if (updateError) {
    console.error("Failed to update namespace:", updateError);
    return NextResponse.json(
      { error: "Failed to update namespace" },
      { status: 500 }
    );
  }

  return NextResponse.json({ namespace });
}
