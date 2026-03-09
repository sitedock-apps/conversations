"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { Namespace, UpdateNamespaceInput } from "@/types/namespace";

interface EditNamespaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  namespace: Namespace | null;
  onSubmit: (
    identifier: string,
    input: UpdateNamespaceInput
  ) => Promise<void>;
}

export function EditNamespaceDialog({
  open,
  onOpenChange,
  namespace,
  onSubmit,
}: EditNamespaceDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Populate form when namespace changes or dialog opens
  useEffect(() => {
    if (namespace && open) {
      setName(namespace.name);
      setDescription(namespace.description ?? "");
      setSubmitError(null);
      setIsSubmitting(false);
    }
  }, [namespace, open]);

  // Reset when closing
  useEffect(() => {
    if (!open) {
      setSubmitError(null);
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namespace || !name.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(namespace.identifier, {
        name: name.trim(),
        description: description.trim() || null,
      });
      onOpenChange(false);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to update namespace"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanges =
    namespace &&
    (name.trim() !== namespace.name ||
      (description.trim() || null) !== (namespace.description ?? null));

  const canSubmit = name.trim().length > 0 && hasChanges && !isSubmitting;

  if (!namespace) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Namespace</DialogTitle>
          <DialogDescription>
            Update the name or description. The identifier cannot be changed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identifier (read-only badge) */}
          <div className="space-y-2">
            <Label>Identifier</Label>
            <div>
              <Badge
                className="font-mono text-sm font-bold tracking-widest"
                aria-label={`Identifier: ${namespace.identifier} (read-only)`}
              >
                {namespace.identifier}
              </Badge>
              <p className="mt-1 text-xs text-muted-foreground">
                The identifier cannot be changed after creation.
              </p>
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="edit-ns-name">Name</Label>
            <Input
              id="edit-ns-name"
              placeholder="Namespace name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSubmitError(null);
              }}
              disabled={isSubmitting}
              maxLength={50}
              autoFocus
              aria-describedby="edit-ns-name-hint"
            />
            <p
              id="edit-ns-name-hint"
              className="text-xs text-muted-foreground"
            >
              {name.length}/50 characters
            </p>
          </div>

          {/* Description Textarea */}
          <div className="space-y-2">
            <Label htmlFor="edit-ns-description">
              Description{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Textarea
              id="edit-ns-description"
              placeholder="A short description of this namespace..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setSubmitError(null);
              }}
              disabled={isSubmitting}
              maxLength={200}
              rows={3}
              aria-describedby="edit-ns-description-hint"
            />
            <p
              id="edit-ns-description-hint"
              className="text-xs text-muted-foreground"
            >
              {description.length}/200 characters
            </p>
          </div>

          {/* Submit Error */}
          {submitError && (
            <p className="text-sm text-destructive" role="alert">
              {submitError}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
