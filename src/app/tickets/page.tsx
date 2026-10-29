import type { Metadata } from "next";
import { nextMonth, previousMonth, todayIn } from "@/lib/format";
import { parkstack } from "@/lib/parkstack";
import { TicketForm } from "./ticket-form";

export const metadata: Metadata = { title: "Tickets" };

type Props = { searchParams: Promise<{ month?: string }> };

export default async function TicketsPage({ searchParams }: Props) {
  const [park, tickets] = await Promise.all([parkstack.park(), parkstack.tickets()]);
  const today = todayIn(park.timezone);
  const thisMonth = today.slice(0, 7);
  const asked = (await searchParams).month;
  const month = asked && /^\d{4}-(0[1-9]|1[0-2])$/.test(asked) && asked >= thisMonth ? asked : thisMonth;
  const availability = await parkstack.availability(month);

  return (
    <section className="section">
      <div className="wrap">
        <h1>Tickets</h1>
        {/* While tickets are not on sale online, there is nothing to buy. */}
        {!tickets.onSaleOnline || !tickets.items.length ? (
          <p className="muted">Tickets are not on sale online at the moment.</p>
        ) : (
          <TicketForm
            park={{ seller: park.seller, demo: park.demo }}
            tickets={tickets}
            availability={availability}
            today={today}
            previous={month > thisMonth ? previousMonth(month) : null}
            next={nextMonth(month)}
          />
        )}
      </div>
    </section>
  );
}
