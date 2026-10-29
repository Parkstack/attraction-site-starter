import Link from "next/link";
import { Cards } from "@/components/cards";
import { hoursText, money } from "@/lib/format";
import { parkstack } from "@/lib/parkstack";

export default async function HomePage() {
  const [park, hours, attractions, events] = await Promise.all([parkstack.park(), parkstack.hours(), parkstack.attractions(), parkstack.events()]);
  const today = hours.days[0];
  const todayText = today ? hoursText(today) : null;
  const upcoming = events.items.filter((event) => !event.past).slice(0, 3);
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <h1>{park.name}</h1>
          {park.tagline ? <p>{park.tagline}</p> : null}
          {todayText ? (
            <p>
              <strong>Today:</strong> {todayText}
              {today?.label ? ` · ${today.label}` : ""}
            </p>
          ) : null}
          {park.tickets.onSaleOnline ? (
            <p>
              <Link href="/tickets" className="button">
                Buy tickets
                {park.tickets.fromPence != null ? ` from ${money(park.tickets.fromPence)}${park.tickets.fromIncludesVat ? " inc. VAT" : ""}` : ""}
              </Link>
            </p>
          ) : null}
        </div>
      </section>

      {attractions.items.length ? (
        <section className="section">
          <div className="wrap">
            <h2>Attractions</h2>
            <Cards
              items={attractions.items.slice(0, 6).map((item) => ({ href: `/explore/attractions/${item.slug}`, name: item.name, summary: item.summary, photo: item.photo, status: item.status, isNew: item.isNew }))}
            />
            <p>
              <Link href="/explore/attractions">See every attraction</Link>
            </p>
          </div>
        </section>
      ) : null}

      {upcoming.length ? (
        <section className="section">
          <div className="wrap">
            <h2>What’s on</h2>
            <Cards items={upcoming.map((event) => ({ href: `/explore/events/${event.slug}`, name: event.name, summary: event.summary, photo: event.photo, line: event.when }))} />
          </div>
        </section>
      ) : null}
    </>
  );
}
