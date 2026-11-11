import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-2xl">
        <Compass className="size-6" />
      </div>

      <h1 className="mt-5 text-2xl font-semibold tracking-tight">Página não encontrada</h1>

      <p className="text-muted-foreground mt-2 max-w-sm text-sm">
        O endereço que você tentou acessar não existe ou foi removido.
      </p>

      <Button className="mt-6" render={<Link href="/dashboard" />}>
        Voltar para o início
      </Button>
    </main>
  );
}
