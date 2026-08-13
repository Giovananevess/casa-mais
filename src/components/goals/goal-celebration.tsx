"use client";

import { PartyPopper } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type GoalCelebrationProps = {
  open: boolean;
  onOpenChange: (
    open: boolean
  ) => void;
  goalName: string;
};

export function GoalCelebration({
  open,
  onOpenChange,
  goalName,
}: GoalCelebrationProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PartyPopper className="size-9" />
          </div>

          <div className="mt-4 text-6xl">
            🎉
          </div>

          <DialogTitle className="mt-3 text-3xl">
            Meta concluída!
          </DialogTitle>

          <DialogDescription className="text-base">
            Parabéns! Vocês alcançaram a meta{" "}
            <strong>{goalName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-5 rounded-2xl border bg-primary/5 p-5 text-center">
          <p className="font-medium">
            Mais uma conquista de vocês 💚
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Todo o esforço registrado no Casa+
            valeu a pena.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}