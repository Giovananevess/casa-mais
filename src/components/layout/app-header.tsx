import { Bell, CalendarDays, Search } from "lucide-react";

import { LogoutButton } from "@/components/layout/logout-button";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type AppHeaderProps = {
  name: string;
  email: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getGreeting() {
  const currentHour = Number(
    new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      hour12: false,
      timeZone: "America/Sao_Paulo",
    }).format(new Date()),
  );

  if (currentHour < 12) {
    return "Bom dia";
  }

  if (currentHour < 18) {
    return "Boa tarde";
  }

  return "Boa noite";
}

export function AppHeader({ name, email }: AppHeaderProps) {
  const greeting = getGreeting();

  const currentDate = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    timeZone: "America/Sao_Paulo",
  }).format(new Date());

  return (
    <header className="bg-background/80 sticky top-0 z-30 border-b backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <MobileSidebar />

          <div className="min-w-0">
            <p className="truncate font-medium">
              {greeting}, {name} <span aria-hidden="true">👋</span>
            </p>

            <div className="text-muted-foreground mt-1 hidden items-center gap-1.5 text-xs sm:flex">
              <CalendarDays className="size-3.5" />

              <span className="first-letter:uppercase">{currentDate}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="bg-muted/20 text-muted-foreground hidden h-10 w-64 items-center gap-2 rounded-xl border px-3 text-sm xl:flex"
            aria-label="Pesquisa estará disponível em breve"
          >
            <Search className="size-4" />

            <span className="flex-1">Pesquisar</span>

            <kbd className="bg-background rounded-md border px-1.5 py-0.5 text-[10px]">⌘ K</kbd>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="relative rounded-xl"
            aria-label="Notificações"
          >
            <Bell />

            <span className="bg-primary absolute top-2 right-2 size-1.5 rounded-full" />
          </Button>

          <div className="bg-border hidden h-8 w-px sm:block" />

          <div className="hidden items-center gap-3 sm:flex">
            <Avatar className="size-10 border shadow-sm">
              <AvatarFallback className="bg-muted font-medium">
                {getInitials(name) || "C+"}
              </AvatarFallback>
            </Avatar>

            <div className="hidden max-w-44 lg:block">
              <p className="truncate text-sm font-medium">{name}</p>

              <p className="text-muted-foreground truncate text-xs">{email}</p>
            </div>
          </div>

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
