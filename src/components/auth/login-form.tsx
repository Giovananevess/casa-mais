"use client";

import { FormEvent, useState } from "react";
import { HouseHeart, Loader2, LockKeyhole, Mail } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AUTH_ERRORS: Record<string, string> = {
  invalid_credentials: "E-mail ou senha incorretos.",
  email_not_confirmed: "Confirme seu e-mail antes de entrar.",
  over_request_rate_limit: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
  user_banned: "Este acesso está bloqueado.",
};

function getAuthErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code?: string }).code);
    if (AUTH_ERRORS[code]) return AUTH_ERRORS[code];
  }

  return "Não foi possível entrar. Verifique seus dados e tente novamente.";
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.session) {
        throw new Error("Sessão inválida.");
      }

      toast.success("Login realizado com sucesso.");

      window.location.assign("/dashboard");
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
      setIsLoading(false);
    }
  }

  return (
    <main className="bg-muted/30 flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md rounded-3xl shadow-sm">
        <CardHeader className="items-center space-y-4 text-center">
          <div className="bg-primary text-primary-foreground flex size-16 items-center justify-center rounded-2xl">
            <HouseHeart className="size-8" />
          </div>

          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Casa+</h1>

            <p className="text-muted-foreground mt-2 text-sm">
              O controle financeiro da nossa casa.
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>

              <div className="relative">
                <Mail className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />

                <Input
                  id="email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  className="pl-10"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>

              <div className="relative">
                <LockKeyhole className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />

                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  className="pl-10"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <p className="text-muted-foreground mt-6 text-center text-xs">
            Acesso exclusivo de Renato e Giovana.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
