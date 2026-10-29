import type { Metadata } from "next";
import { Cards } from "@/components/cards";
import { parkstack } from "@/lib/parkstack";

export const metadata: Metadata = { title: "Attractions" };

export default async function AttractionsPage() {
  const { items } = await parkstack.attractions();
  return (
    <section className="section">
      <div className="wrap">
        <h1>Attractions</h1>
        {items.length ? (
          <Cards
            items={items.map((item) => ({
              href: `/explore/attractions/${item.slug}`,
              name: item.name,
              summary: item.summary,
              photo: item.photo,
              status: item.status,
              isNew: item.isNew,
              line: [item.typeLabel, item.height?.label].filter(Boolean).join(" · "),
            }))}
          />
        ) : (
          <p className="muted">Attractions will appear here soon.</p>
        )}
      </div>
    </section>
  );
}
