"use client";

import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
        <TriangleAlert className="size-6" />
      </div>

      <h2 className="mt-5 text-xl font-semibold tracking-tight">Algo deu errado</h2>

      <p className="text-muted-foreground mt-2 max-w-sm text-sm">
        Não conseguimos carregar esta página agora. Verifique sua conexão e tente novamente.
      </p>

      {error.digest ? (
        <p className="text-muted-foreground mt-2 font-mono text-xs">Código: {error.digest}</p>
      ) : null}

      <Button className="mt-6" onClick={() => unstable_retry()}>
        <RotateCcw />
        Tentar novamente
      </Button>
    </div>
  );
}
