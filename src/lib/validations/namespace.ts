import { z } from "zod";

/**
 * Validation schema for creating a new namespace.
 */
export const createNamespaceSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be 50 characters or less")
    .trim(),
  identifier: z
    .string()
    .length(5, "Identifier must be exactly 5 characters")
    .regex(
      /^[A-Z0-9]{5}$/,
      "Identifier must be exactly 5 uppercase letters or digits"
    ),
  description: z
    .string()
    .max(200, "Description must be 200 characters or less")
    .trim()
    .optional()
    .nullable()
    .transform((val) => val || null),
});

/**
 * Validation schema for updating a namespace (name and/or description only).
 * Identifier is excluded -- it cannot be changed after creation.
 */
export const updateNamespaceSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be 50 characters or less")
    .trim()
    .optional(),
  description: z
    .string()
    .max(200, "Description must be 200 characters or less")
    .trim()
    .optional()
    .nullable()
    .transform((val) => val || null),
});

/**
 * Validation schema for checking identifier availability.
 */
export const checkIdentifierSchema = z.object({
  identifier: z
    .string()
    .length(5, "Identifier must be exactly 5 characters")
    .regex(
      /^[A-Z0-9]{5}$/,
      "Identifier must be exactly 5 uppercase letters or digits"
    ),
});

export type CreateNamespaceInput = z.infer<typeof createNamespaceSchema>;
export type UpdateNamespaceInput = z.infer<typeof updateNamespaceSchema>;
export type CheckIdentifierInput = z.infer<typeof checkIdentifierSchema>;
