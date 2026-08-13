import { CalendarSummary } from "@/components/calendar/calendar-summary";
import { CalendarView } from "@/components/calendar/calendar-view";
import { MonthNavigation } from "@/components/calendar/month-navigation";
import { normalizeMonthValue } from "@/lib/calendar";
import { getCalendarData } from "@/services/calendar";

type CalendarPageProps = {
  searchParams: Promise<{
    month?: string;
  }>;
};

export default async function CalendarPage({
  searchParams,
}: CalendarPageProps) {
  const parameters = await searchParams;

  const referenceMonth =
    normalizeMonthValue(parameters.month);

  const calendar =
    await getCalendarData(
      referenceMonth
    );

  return (
    <div className="space-y-8 pb-8">
      <MonthNavigation
        referenceMonth={
          referenceMonth
        }
      />

      <CalendarSummary
        summary={calendar.summary}
      />

      <CalendarView
        referenceMonth={
          referenceMonth
        }
        expenses={calendar.expenses}
        options={calendar.options}
      />
    </div>
  );
}