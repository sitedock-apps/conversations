import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NamespacesView } from "@/components/namespace/namespaces-view";

export default async function NamespacesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return <NamespacesView currentUserId={user.id} />;
}
