"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Flag,
  Loader2,
  Plus,
  Target,
} from "lucide-react";
import { toast } from "sonner";

import { createGoalAction } from "@/app/(app)/actions/goals";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function parseCurrency(value: string) {
  const parsed = Number(
    value
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".")
  );

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

export function CreateGoalDialog() {
  const router = useRouter();

  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [targetAmount, setTargetAmount] =
    useState("");

  const [initialAmount, setInitialAmount] =
    useState("");

  const [targetDate, setTargetDate] =
    useState("");

  const [priority, setPriority] =
    useState<
      "low" | "medium" | "high"
    >("medium");

  const [icon, setIcon] =
    useState("target");

  const [color, setColor] =
    useState("emerald");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setLoading(true);

    const result = await createGoalAction({
      name,
      description,
      targetAmount:
        parseCurrency(targetAmount),
      initialAmount:
        parseCurrency(initialAmount),
      targetDate,
      priority,
      icon,
      color,
    });

    setLoading(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    setOpen(false);

    router.push(
      `/metas/${result.goalId}`
    );
    router.refresh();
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
      >
        <Plus />
        Nova meta
      </Button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Target className="size-5" />
            </div>

            <DialogTitle className="mt-4 text-2xl">
              Nova meta financeira
            </DialogTitle>

            <DialogDescription>
              Crie um objetivo para vocês
              acompanharem juntos.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className="mt-3 space-y-5"
          >
            <div className="space-y-2">
              <Label>Nome da meta</Label>

              <Input
                placeholder="Ex.: Viagem para Gramado"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>

              <Textarea
                placeholder="Conte um pouco sobre esse objetivo..."
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Valor desejado</Label>

                <Input
                  inputMode="decimal"
                  placeholder="12.000,00"
                  value={targetAmount}
                  onChange={(event) =>
                    setTargetAmount(
                      event.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Valor inicial</Label>

                <Input
                  inputMode="decimal"
                  placeholder="0,00"
                  value={initialAmount}
                  onChange={(event) =>
                    setInitialAmount(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Data objetivo</Label>

                <Input
                  type="date"
                  value={targetDate}
                  onChange={(event) =>
                    setTargetDate(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Prioridade</Label>

                <select
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target.value as
                        | "low"
                        | "medium"
                        | "high"
                    )
                  }
                  className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="low">
                    Baixa
                  </option>

                  <option value="medium">
                    Média
                  </option>

                  <option value="high">
                    Alta
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Ícone</Label>

                <select
                  value={icon}
                  onChange={(event) =>
                    setIcon(event.target.value)
                  }
                  className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="target">
                    🎯 Objetivo
                  </option>

                  <option value="plane">
                    ✈️ Viagem
                  </option>

                  <option value="house">
                    🏠 Casa ou reforma
                  </option>

                  <option value="car">
                    🚗 Veículo
                  </option>

                  <option value="shield">
                    🛡️ Reserva
                  </option>

                  <option value="heart">
                    ❤️ Sonho do casal
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Cor</Label>

                <select
                  value={color}
                  onChange={(event) =>
                    setColor(
                      event.target.value
                    )
                  }
                  className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="emerald">
                    Verde
                  </option>

                  <option value="blue">
                    Azul
                  </option>

                  <option value="violet">
                    Violeta
                  </option>

                  <option value="amber">
                    Dourado
                  </option>

                  <option value="rose">
                    Rosa
                  </option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setOpen(false)
                }
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Flag />
                    Criar meta
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}