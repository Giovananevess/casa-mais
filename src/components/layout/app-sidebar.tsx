"use client";

import Link from "next/link";
import { Banknote } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChartNoAxesCombined,
  CreditCard,
  Goal,
  HouseHeart,
  LayoutDashboard,
  Settings,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
  name: "Receitas",
  href: "/receitas",
  icon: Banknote,
},
  {
    name: "Contas",
    href: "/contas",
    icon: CreditCard,
  },
  {
    name: "Calendário",
    href: "/calendario",
    icon: CalendarDays,
  },
  {
    name: "Histórico",
    href: "/historico",
    icon: ChartNoAxesCombined,
  },
  {
    name: "Metas",
    href: "/metas",
    icon: Goal,
  },
  {
    name: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
];

type AppSidebarProps = {
  onNavigate?: () => void;
};

export function AppSidebar({
  onNavigate,
}: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-20 items-center border-b border-sidebar-border px-5">
        <Link
          href="/dashboard"
          className="group flex items-center gap-3"
          onClick={onNavigate}
        >
          <div className="flex size-11 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm transition-transform duration-300 group-hover:scale-105">
            <HouseHeart className="size-5" />
          </div>

          <div>
            <p className="text-xl font-semibold tracking-tight">
              Casa+
            </p>

            <p className="text-xs text-sidebar-foreground/55">
              Finanças da nossa casa
            </p>
          </div>
        </Link>
      </div>

      <div className="px-4 pt-6">
        <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/40">
          Menu principal
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname.startsWith(
                `${item.href}/`
              ));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                "transition duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground/65 hover:translate-x-0.5 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              {isActive && (
                <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-sidebar-primary" />
              )}

              <Icon
                className={cn(
                  "size-5 transition-transform duration-200 group-hover:scale-105",
                  isActive &&
                    "text-sidebar-primary"
                )}
              />

              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <div className="relative overflow-hidden rounded-2xl border border-sidebar-border bg-sidebar-accent/40 p-4">
          <div className="absolute -right-8 -top-8 size-20 rounded-full bg-sidebar-primary/10 blur-2xl" />

          <div className="relative">
            <div className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary/10 text-sidebar-primary">
              <Sparkles className="size-4" />
            </div>

            <p className="mt-3 text-sm font-medium">
              Casa organizada
            </p>

            <p className="mt-1 text-xs leading-relaxed text-sidebar-foreground/50">
              Acompanhe contas, metas e a divisão financeira do casal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}