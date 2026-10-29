import type { Metadata } from "next";
import Link from "next/link";
import { hoursText, longDate, nextMonth, previousMonth, todayIn } from "@/lib/format";
import { parkstack } from "@/lib/parkstack";

export const metadata: Metadata = { title: "Opening hours" };

type Props = { searchParams: Promise<{ month?: string }> };

export default async function OpeningHoursPage({ searchParams }: Props) {
  const park = await parkstack.park();
  const today = todayIn(park.timezone);
  const thisMonth = today.slice(0, 7);
  const asked = (await searchParams).month;
  const month = asked && /^\d{4}-(0[1-9]|1[0-2])$/.test(asked) && asked >= thisMonth ? asked : thisMonth;
  const first = month === thisMonth ? today : `${month}-01`;
  const last = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0)).toISOString().slice(0, 10);
  const { days } = await parkstack.hours(first, last);
  const monthName = new Date(`${month}-15T12:00:00Z`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
  return (
    <section className="section">
      <div className="wrap">
        <h1>Opening hours</h1>
        <p className="muted">{monthName}</p>
        <table className="hours">
          <tbody>
            {days.map((day) => {
              // A day with no hours from the park says nothing, rather than "closed".
              const text = hoursText(day);
              return (
                <tr key={day.date}>
                  <th scope="row">{longDate(day.date)}</th>
                  <td>{text ?? ""}</td>
                  <td className="label">{day.label ?? ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p>
          {month > thisMonth ? <Link href={`/plan-your-visit/opening-hours?month=${previousMonth(month)}`}>Previous month</Link> : null}
          {month > thisMonth ? " · " : ""}
          <Link href={`/plan-your-visit/opening-hours?month=${nextMonth(month)}`}>Next month</Link>
        </p>
      </div>
    </section>
  );
}
