"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/cliente";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível sair da conta.";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
  type="button"
  variant="ghost"
  size="sm"
  className="rounded-xl text-muted-foreground hover:text-foreground"
  onClick={handleLogout}
  disabled={isLoading}
>
  {isLoading ? (
    <Loader2 className="animate-spin" />
  ) : (
    <LogOut />
  )}

  <span className="hidden lg:inline">
    Sair
  </span>
</Button>
  );
}