import type { Metadata } from "next";
import Link from "next/link";
import { Markdown } from "@/components/markdown";
import { Photo } from "@/components/photo";
import { missing } from "@/lib/not-found";
import { parkstack } from "@/lib/parkstack";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const place = await parkstack.foodPlace((await params).slug);
  return place ? { title: place.seo.title ?? place.name, description: place.seo.description ?? place.summary ?? undefined } : {};
}

export default async function FoodPlacePage({ params }: Props) {
  const { slug } = await params;
  const place = await parkstack.foodPlace(slug);
  if (!place) return missing(`/explore/food-and-drink/${slug}`);
  const dietary = [place.dietary.vegetarian && "Vegetarian", place.dietary.vegan && "Vegan", place.dietary.glutenFree && "Gluten-free"].filter(Boolean);
  return (
    <article className="section">
      <div className="wrap">
        <p className="small">
          <Link href="/explore/food-and-drink">Food and drink</Link>
        </p>
        <h1>{place.name}</h1>
        {place.status.code !== "operating" ? (
          <p>
            <span className="badge">{place.status.label}</span> {place.status.note}
          </p>
        ) : null}
        <Photo image={place.photos[0] ?? null} sizes="(min-width: 1150px) 1150px, 100vw" />
        <dl className="facts">
          <dt>Type</dt>
          <dd>{place.typeLabel}</dd>
          {place.location ? (
            <>
              <dt>Where</dt>
              <dd>{place.location}</dd>
            </>
          ) : null}
          {place.hoursNote ? (
            <>
              <dt>Open</dt>
              <dd>{place.hoursNote}</dd>
            </>
          ) : null}
          {dietary.length ? (
            <>
              <dt>Options</dt>
              <dd>{dietary.join(", ")}</dd>
            </>
          ) : null}
        </dl>
        <Markdown text={place.description} />
      </div>
    </article>
  );
}
