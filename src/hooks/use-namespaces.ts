"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  Namespace,
  CreateNamespaceInput,
  UpdateNamespaceInput,
  IdentifierCheckResult,
} from "@/types/namespace";

/**
 * Hook for fetching and managing namespaces.
 * Connects to the real API routes at /api/namespaces.
 */
export function useNamespaces() {
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNamespaces = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/namespaces");
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(
          body.error || `Failed to load namespaces (${response.status})`
        );
      }
      const data = await response.json();
      setNamespaces(data.namespaces ?? []);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load namespaces. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNamespaces();
  }, [fetchNamespaces]);

  const createNamespace = async (
    input: CreateNamespaceInput
  ): Promise<Namespace> => {
    const response = await fetch("/api/namespaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(
        body.message || body.error || "Failed to create namespace"
      );
    }

    const data = await response.json();
    const newNamespace: Namespace = data.namespace;

    // Prepend the new namespace to the list (newest first)
    setNamespaces((prev) => [newNamespace, ...prev]);
    return newNamespace;
  };

  const updateNamespace = async (
    identifier: string,
    input: UpdateNamespaceInput
  ): Promise<Namespace> => {
    const response = await fetch(`/api/namespaces/${identifier}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(
        body.message || body.error || "Failed to update namespace"
      );
    }

    const data = await response.json();
    const updatedNamespace: Namespace = data.namespace;

    // Update the namespace in the list
    setNamespaces((prev) =>
      prev.map((ns) =>
        ns.identifier === identifier ? updatedNamespace : ns
      )
    );
    return updatedNamespace;
  };

  return {
    namespaces,
    isLoading,
    error,
    fetchNamespaces,
    createNamespace,
    updateNamespace,
  };
}

/**
 * Hook for checking identifier availability with debouncing.
 * Calls /api/namespaces/check?identifier=XXXXX after a 300ms debounce.
 */
export function useIdentifierCheck() {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<IdentifierCheckResult | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const checkIdentifier = useCallback((identifier: string) => {
    // Clear any pending debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    // Abort any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }

    // Reset state if identifier is not valid format
    if (!/^[A-Z0-9]{5}$/.test(identifier)) {
      setResult(null);
      setCheckError(null);
      setIsChecking(false);
      return;
    }

    setIsChecking(true);
    setCheckError(null);

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch(
          `/api/namespaces/check?identifier=${encodeURIComponent(identifier)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error || "Failed to check availability");
        }

        const data: IdentifierCheckResult = await response.json();
        setResult(data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return; // Ignore aborted requests
        }
        setCheckError(
          err instanceof Error ? err.message : "Failed to check availability"
        );
        setResult(null);
      } finally {
        setIsChecking(false);
      }
    }, 300);
  }, []);

  const resetCheck = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setResult(null);
    setCheckError(null);
    setIsChecking(false);
  }, []);

  return {
    isChecking,
    result,
    checkError,
    checkIdentifier,
    resetCheck,
  };
}
