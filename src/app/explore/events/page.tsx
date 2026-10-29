import type { Metadata } from "next";
import { Cards } from "@/components/cards";
import { parkstack } from "@/lib/parkstack";

export const metadata: Metadata = { title: "Events" };

export default async function EventsPage() {
  const { items } = await parkstack.events();
  const card = (event: (typeof items)[number]) => ({ href: `/explore/events/${event.slug}`, name: event.name, summary: event.summary, photo: event.photo, line: event.when });
  const coming = items.filter((event) => !event.past);
  const past = items.filter((event) => event.past);
  return (
    <section className="section">
      <div className="wrap">
        <h1>Events</h1>
        {coming.length ? <Cards items={coming.map(card)} /> : <p className="muted">No events coming up at the moment.</p>}
        {/* Past events newest first, kept apart as an archive. */}
        {past.length ? (
          <>
            <h2 style={{ marginTop: "3rem" }}>Past events</h2>
            <Cards items={past.map(card)} />
          </>
        ) : null}
      </div>
    </section>
  );
}
