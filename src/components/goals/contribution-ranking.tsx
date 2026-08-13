import { formatCurrency } from "@/lib/currency";
import type {
  GoalRankingItem,
} from "@/types/goals";

export function ContributionRanking({
  ranking,
}: {
  ranking: GoalRankingItem[];
}) {
  return (
    <article className="rounded-3xl border bg-card p-6">
      <h2 className="text-xl font-semibold">
        Quem contribuiu mais
      </h2>

      <div className="mt-7 space-y-6">
        {ranking.map((person) => (
          <div key={person.userId}>
            <div className="flex justify-between">
              <div>
                <p className="font-medium">
                  {person.name}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {formatCurrency(
                    person.amount
                  )}{" "}
                  em{" "}
                  {person.contributionCount}{" "}
                  aporte(s)
                </p>
              </div>

              <p className="font-semibold">
                {person.percentage.toFixed(
                  0
                )}
                %
              </p>
            </div>

            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
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