"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Loader2, Check, X } from "lucide-react";
import { suggestIdentifier, isValidIdentifierFormat } from "@/lib/namespace-utils";
import { useIdentifierCheck } from "@/hooks/use-namespaces";
import type { CreateNamespaceInput } from "@/types/namespace";

interface CreateNamespaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateNamespaceInput) => Promise<void>;
}

export function CreateNamespaceDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateNamespaceDialogProps) {
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasManuallyEditedIdentifier, setHasManuallyEditedIdentifier] =
    useState(false);

  const { isChecking, result, checkError, checkIdentifier, resetCheck } =
    useIdentifierCheck();

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setName("");
      setIdentifier("");
      setDescription("");
      setIsSubmitting(false);
      setSubmitError(null);
      setHasManuallyEditedIdentifier(false);
      resetCheck();
    }
  }, [open, resetCheck]);

  // Auto-suggest identifier when name changes (unless manually edited)
  const handleNameChange = useCallback(
    (value: string) => {
      setName(value);
      setSubmitError(null);
      if (!hasManuallyEditedIdentifier && value.trim().length > 0) {
        const suggested = suggestIdentifier(value);
        setIdentifier(suggested);
        checkIdentifier(suggested);
      }
    },
    [hasManuallyEditedIdentifier, checkIdentifier]
  );

  const handleIdentifierChange = (value: string) => {
    // Auto-uppercase, strip non-alphanumeric, limit to 5 chars
    const sanitized = value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 5);
    setIdentifier(sanitized);
    setHasManuallyEditedIdentifier(true);
    setSubmitError(null);
    checkIdentifier(sanitized);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !isValidIdentifierFormat(identifier)) return;
    if (result && !result.available) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit({
        name: name.trim(),
        identifier,
        description: description.trim() || null,
      });
      onOpenChange(false);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to create namespace"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isIdentifierValid = isValidIdentifierFormat(identifier);
  const isAvailable = result?.available === true;
  const isTaken = result?.available === false;
  const canSubmit =
    name.trim().length > 0 &&
    isIdentifierValid &&
    isAvailable &&
    !isChecking &&
    !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Namespace</DialogTitle>
          <DialogDescription>
            Create a namespace to organize your team's conversations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="ns-name">Name</Label>
            <Input
              id="ns-name"
              placeholder="e.g. Anthropic, Marketing Team"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              disabled={isSubmitting}
              maxLength={50}
              autoFocus
              aria-describedby="ns-name-hint"
            />
            <p id="ns-name-hint" className="text-xs text-muted-foreground">
              {name.length}/50 characters
            </p>
          </div>

          {/* Identifier Input */}
          <div className="space-y-2">
            <Label htmlFor="ns-identifier">Identifier</Label>
            <div className="relative">
              <Input
                id="ns-identifier"
                placeholder="ANTPC"
                value={identifier}
                onChange={(e) => handleIdentifierChange(e.target.value)}
                disabled={isSubmitting}
                maxLength={5}
                className="font-mono uppercase tracking-widest pr-10"
                aria-describedby="ns-identifier-status"
              />
              {/* Status indicator inside input */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isChecking && (
                  <Loader2
                    className="h-4 w-4 animate-spin text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
                {!isChecking && isIdentifierValid && isAvailable && (
                  <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                )}
                {!isChecking && isIdentifierValid && isTaken && (
                  <X className="h-4 w-4 text-destructive" aria-hidden="true" />
                )}
              </div>
            </div>
            <div id="ns-identifier-status" aria-live="polite">
              {isChecking && (
                <p className="text-xs text-muted-foreground">
                  Checking availability...
                </p>
              )}
              {!isChecking && isIdentifierValid && isAvailable && (
                <p className="text-xs text-emerald-600">
                  Available
                </p>
              )}
              {!isChecking && isIdentifierValid && isTaken && (
                <p className="text-xs text-destructive">
                  This identifier is already taken. Try a different one.
                </p>
              )}
              {!isChecking && checkError && (
                <p className="text-xs text-destructive">{checkError}</p>
              )}
              {!isIdentifierValid && identifier.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Must be exactly 5 uppercase letters or digits
                </p>
              )}
              {identifier.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  5-character code (A-Z, 0-9). Auto-suggested from name.
                </p>
              )}
            </div>
          </div>

          {/* Description Textarea */}
          <div className="space-y-2">
            <Label htmlFor="ns-description">
              Description{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Textarea
              id="ns-description"
              placeholder="A short description of this namespace..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setSubmitError(null);
              }}
              disabled={isSubmitting}
              maxLength={200}
              rows={3}
              aria-describedby="ns-description-hint"
            />
            <p
              id="ns-description-hint"
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
                  Creating...
                </>
              ) : (
                "Create Namespace"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
