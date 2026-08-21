import {
  UserRound,
  Users,
} from "lucide-react";

import type {
  SettingsMember,
} from "@/types/settings";

export function HouseholdMembersCard({
  members,
}: {
  members: SettingsMember[];
}) {
  return (
    <section className="rounded-3xl border bg-card p-6">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Users className="size-5" />
        </div>

        <div>
          <h2 className="text-lg font-semibold">
            Pessoas da casa
          </h2>

          <p className="text-sm text-muted-foreground">
            Pessoas que participam das finanças.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {members.map(
          (member) => (
            <div
              key={member.user_id}
              className="flex items-center gap-3 rounded-2xl border p-4"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                <UserRound className="size-4" />
              </div>

              <div>
                <p className="font-medium">
                  {member.name}
                </p>

                {member.email && (
                  <p className="text-sm text-muted-foreground">
                    {member.email}
                  </p>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}