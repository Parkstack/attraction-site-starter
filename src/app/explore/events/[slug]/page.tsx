import type { Metadata } from "next";
import Link from "next/link";
import { Markdown } from "@/components/markdown";
import { Photo } from "@/components/photo";
import { missing } from "@/lib/not-found";
import { parkstack } from "@/lib/parkstack";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await parkstack.event((await params).slug);
  return event ? { title: event.seo.title ?? event.name, description: event.seo.description ?? event.summary ?? undefined } : {};
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const event = await parkstack.event(slug);
  if (!event) return missing(`/explore/events/${slug}`);
  return (
    <article className="section">
      <div className="wrap">
        <p className="small">
          <Link href="/explore/events">Events</Link>
        </p>
        <h1>{event.name}</h1>
        <p className="total">{event.when}</p>
        {event.showtimes.length ? <p>Showtimes: {event.showtimes.join(", ")}</p> : null}
        {event.location || event.attraction ? (
          <p className="muted">
            {event.location}
            {event.attraction ? (
              <>
                {event.location ? " · " : ""}
                At <Link href={`/explore/attractions/${event.attraction.slug}`}>{event.attraction.name}</Link>
              </>
            ) : null}
          </p>
        ) : null}
        <Photo image={event.photos[0] ?? null} sizes="(min-width: 1150px) 1150px, 100vw" />
        <Markdown text={event.description} />
      </div>
    </article>
  );
}
