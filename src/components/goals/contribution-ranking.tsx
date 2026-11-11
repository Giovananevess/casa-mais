import { formatCurrency } from "@/lib/currency";
import type { GoalRankingItem } from "@/types/goals";

export function ContributionRanking({ ranking }: { ranking: GoalRankingItem[] }) {
  return (
    <article className="bg-card rounded-3xl border p-6">
      <h2 className="text-xl font-semibold">Quem contribuiu mais</h2>

      <div className="mt-7 space-y-6">
        {ranking.map((person) => (
          <div key={person.userId}>
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{person.name}</p>

                <p className="text-muted-foreground mt-1 text-sm">
                  {formatCurrency(person.amount)} em {person.contributionCount} aporte(s)
                </p>
              </div>

              <p className="font-semibold">{person.percentage.toFixed(0)}%</p>
            </div>

            <div className="bg-muted mt-3 h-2.5 overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full"
                style={{
                  width: `${person.percentage}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
