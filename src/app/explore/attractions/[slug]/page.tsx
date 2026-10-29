import type { Metadata } from "next";
import Link from "next/link";
import { Markdown } from "@/components/markdown";
import { Photo } from "@/components/photo";
import { missing } from "@/lib/not-found";
import { parkstack } from "@/lib/parkstack";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const attraction = await parkstack.attraction((await params).slug);
  return attraction ? { title: attraction.seo.title ?? attraction.name, description: attraction.seo.description ?? attraction.summary ?? undefined } : {};
}

export default async function AttractionPage({ params }: Props) {
  const { slug } = await params;
  const attraction = await parkstack.attraction(slug);
  if (!attraction) return missing(`/explore/attractions/${slug}`);
  const [first, ...more] = attraction.photos;
  return (
    <article className="section">
      <div className="wrap">
        <p className="small">
          <Link href="/explore/attractions">Attractions</Link>
        </p>
        <h1>{attraction.name}</h1>
        {attraction.isNew ? <span className="badge new">New</span> : null}
        {attraction.status.code !== "operating" ? (
          <p>
            <span className="badge">{attraction.status.label}</span> {attraction.status.note}
          </p>
        ) : null}
        <Photo image={first ?? null} sizes="(min-width: 1150px) 1150px, 100vw" />
        <dl className="facts">
          <dt>Type</dt>
          <dd>{attraction.typeLabel}</dd>
          {attraction.height ? (
            <>
              <dt>Height</dt>
              <dd>{attraction.height.label}</dd>
            </>
          ) : null}
          {attraction.durationMinutes ? (
            <>
              <dt>Lasts about</dt>
              <dd>{attraction.durationMinutes} minutes</dd>
            </>
          ) : null}
          {attraction.wheelchairAccess ? (
            <>
              <dt>Wheelchair access</dt>
              <dd>{attraction.wheelchairAccess.label}</dd>
            </>
          ) : null}
        </dl>
        <Markdown text={attraction.description} />
        {more.length ? (
          <div className="gallery">
            {more.map((photo) => (
              <Photo key={photo.url} image={photo} />
            ))}
          </div>
        ) : null}
        {attraction.events.length ? (
          <>
            <h2>Events here</h2>
            <ul>
              {attraction.events.map((event) => (
                <li key={event.slug}>
                  <Link href={`/explore/events/${event.slug}`}>{event.name}</Link> <span className="muted">{event.when}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </article>
  );
}
