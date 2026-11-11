import { redirect } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { NoHousehold } from "@/components/layout/no-household";
import { AuthError, getSessionContext } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let context;

  try {
    context = await getSessionContext();
  } catch (error) {
    if (!(error instanceof AuthError)) throw error;

    if (error.reason === "unauthenticated") redirect("/login");

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return <NoHousehold email={user?.email ?? ""} />;
  }

  const { supabase, user } = context;

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .maybeSingle();

  const email = user.email ?? "";
  const fallbackName = email.split("@")[0] || "Usuário";
  const name = profile?.name || fallbackName;

  return (
    <div className="bg-muted/15 min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r lg:block">
        <AppSidebar />
      </aside>

      <div className="lg:pl-72">
        <AppHeader name={name} email={email} />

        <main className="relative min-h-[calc(100vh-5rem)] overflow-hidden p-4 sm:p-6 lg:p-8">
          <div className="bg-primary/[0.025] pointer-events-none absolute top-0 left-1/4 -z-10 size-96 rounded-full blur-3xl" />

          <div className="bg-muted pointer-events-none absolute right-0 bottom-0 -z-10 size-96 rounded-full blur-3xl" />

          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
