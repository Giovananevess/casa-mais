import { HouseHeart } from "lucide-react";

import { LogoutButton } from "@/components/layout/logout-button";

export function NoHousehold({ email }: { email: string }) {
  return (
    <main className="bg-muted/30 flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="bg-primary text-primary-foreground flex size-16 items-center justify-center rounded-2xl">
        <HouseHeart className="size-8" />
      </div>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Quase lá!</h1>

      <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
        A conta <strong className="text-foreground">{email}</strong> ainda não está vinculada a
        nenhuma casa. Peça para quem administra a casa adicionar você como membro.
      </p>

      <div className="mt-6">
        <LogoutButton />
      </div>
    </main>
  );
}
