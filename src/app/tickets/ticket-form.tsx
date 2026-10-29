"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { longDate, money } from "@/lib/format";
import type { Availability, Park, Tickets } from "@/lib/parkstack";
import { startCheckout, type CheckoutState } from "./actions";

type Props = {
  park: Pick<Park, "seller" | "demo">;
  tickets: Tickets;
  availability: Availability;
  today: string;
  previous: string | null;
  next: string;
};

export function TicketForm({ park, tickets, availability, today, previous, next }: Props) {
  const [state, action, pending] = useActionState<CheckoutState, FormData>(startCheckout, { message: null });
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [visitDate, setVisitDate] = useState("");

  const chosen = tickets.items.filter((ticket) => (quantities[ticket.id] ?? 0) > 0);
  const datedChosen = chosen.filter((ticket) => ticket.dated);
  const count = chosen.reduce((sum, ticket) => sum + (quantities[ticket.id] ?? 0), 0);

  // Days every chosen dated ticket can be booked on.
  const days = useMemo(
    () =>
      availability.days.filter(
        (day) => day.status === "available" && datedChosen.every((ticket) => day.tickets.find((entry) => entry.id === ticket.id)?.available),
      ),
    [availability, datedChosen],
  );
  const date = days.some((day) => day.date === visitDate) ? visitDate : "";

  // A dated ticket for today costs its price on the day, when it has one; everything else the advance price.
  const unit = (ticket: Tickets["items"][number]) => (ticket.dated && date === today && ticket.priceOnTheDayPence != null ? ticket.priceOnTheDayPence : ticket.pricePence);
  const total = chosen.reduce((sum, ticket) => sum + unit(ticket) * (quantities[ticket.id] ?? 0), 0);
  const ready = count > 0 && count <= tickets.maxPerOrder && (!datedChosen.length || date);

  return (
    <form action={action} className="ticket-form">
      <fieldset>
        <legend className="total">Choose your tickets</legend>
        {tickets.items.map((ticket) => (
          <div key={ticket.id} className="ticket-row">
            <div>
              <p style={{ margin: 0, fontWeight: 700 }}>{ticket.name}</p>
              <p className="small" style={{ margin: 0 }}>
                {money(ticket.pricePence)}
                {ticket.priceOnTheDayPence != null ? ` · ${money(ticket.priceOnTheDayPence)} on the day` : ""}
                {ticket.includesVat ? " inc. VAT" : ""}
                {ticket.daysLine ? ` · ${ticket.daysLine}` : ""}
              </p>
              {ticket.description ? <p className="small muted" style={{ margin: 0 }}>{ticket.description}</p> : null}
              {ticket.reentryLine ? <p className="small muted" style={{ margin: 0 }}>{ticket.reentryLine}</p> : null}
            </div>
            <label>
              <span className="small">How many </span>
              <input
                type="number"
                aria-label={`How many ${ticket.name} tickets`}
                name={`qty:${ticket.id}`}
                min={0}
                max={tickets.maxPerOrder}
                value={quantities[ticket.id] ?? 0}
                onChange={(event) => setQuantities({ ...quantities, [ticket.id]: Math.max(0, Number(event.target.value) || 0) })}
              />
            </label>
          </div>
        ))}
      </fieldset>
      <input type="hidden" name="dated" value={tickets.items.filter((ticket) => ticket.dated).map((ticket) => ticket.id).join(",")} />

      {datedChosen.length ? (
        <div className="field">
          <label htmlFor="visitDate">Day of your visit</label>
          <select id="visitDate" name="visitDate" value={date} onChange={(event) => setVisitDate(event.target.value)} required>
            <option value="">Choose a day</option>
            {days.map((day) => {
              const few = Math.min(...datedChosen.map((ticket) => day.tickets.find((entry) => entry.id === ticket.id)?.fewLeft ?? Infinity));
              return (
                <option key={day.date} value={day.date}>
                  {longDate(day.date)}
                  {day.label ? ` · ${day.label}` : ""}
                  {Number.isFinite(few) ? ` · ${few} left` : ""}
                </option>
              );
            })}
          </select>
          <p className="small">
            {previous ? <Link href={`/tickets?month=${previous}`}>Earlier month</Link> : null}
            {previous ? " · " : ""}
            <Link href={`/tickets?month=${next}`}>Later month</Link>
            {availability.todayCutOff ? ` · Today’s tickets are on sale until ${availability.todayCutOff}.` : ""}
          </p>
        </div>
      ) : null}

      <label className="field">
        Email address
        <input type="email" name="email" autoComplete="email" required />
        <span className="small">Your tickets are sent here.</span>
      </label>
      <label className="field">
        Name
        <input type="text" name="name" autoComplete="name" />
      </label>

      {count > tickets.maxPerOrder ? <p className="error">An online order can hold up to {tickets.maxPerOrder} tickets.</p> : null}
      {state.message ? (
        <p className="error" role="alert">
          {state.message}
        </p>
      ) : null}

      {/* Before paying: who the guest buys from, and the terms they agree to. */}
      <p className="small">
        {park.seller.name ? `Sold by ${park.seller.name}. ` : ""}By continuing to payment you agree to our <Link href="/ticket-terms">ticket terms</Link>.
        {park.demo ? " This is a demonstration park: nothing is charged." : " You pay by card on Stripe’s secure page, and your tickets are emailed straight away."}
      </p>
      <button type="submit" className="button" disabled={!ready || pending}>
        {pending ? "Starting payment…" : `Continue to payment${count ? ` · ${money(total)}` : ""}`}
      </button>
    </form>
  );
}
