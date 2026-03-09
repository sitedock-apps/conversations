"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useNamespaces } from "@/hooks/use-namespaces";
import { NamespaceList } from "./namespace-list";
import { CreateNamespaceDialog } from "./create-namespace-dialog";
import { EditNamespaceDialog } from "./edit-namespace-dialog";
import type {
  Namespace,
  CreateNamespaceInput,
  UpdateNamespaceInput,
} from "@/types/namespace";

interface NamespacesViewProps {
  currentUserId: string;
}

export function NamespacesView({ currentUserId }: NamespacesViewProps) {
  const {
    namespaces,
    isLoading,
    error,
    fetchNamespaces,
    createNamespace,
    updateNamespace,
  } = useNamespaces();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingNamespace, setEditingNamespace] = useState<Namespace | null>(
    null
  );

  const handleCreate = async (input: CreateNamespaceInput) => {
    const ns = await createNamespace(input);
    toast.success(`Namespace "${ns.name}" created successfully.`);
  };

  const handleEdit = (namespace: Namespace) => {
    setEditingNamespace(namespace);
    setIsEditOpen(true);
  };

  const handleUpdate = async (
    identifier: string,
    input: UpdateNamespaceInput
  ) => {
    const ns = await updateNamespace(identifier, input);
    toast.success(`Namespace "${ns.name}" updated successfully.`);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between md:mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Namespaces
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize your conversations by team or company.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">New Namespace</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* Namespace List */}
      <NamespaceList
        namespaces={namespaces}
        currentUserId={currentUserId}
        isLoading={isLoading}
        error={error}
        onCreateNamespace={() => setIsCreateOpen(true)}
        onEditNamespace={handleEdit}
        onRetry={fetchNamespaces}
      />

      {/* Create Dialog */}
      <CreateNamespaceDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
      />

      {/* Edit Dialog */}
      <EditNamespaceDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        namespace={editingNamespace}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
