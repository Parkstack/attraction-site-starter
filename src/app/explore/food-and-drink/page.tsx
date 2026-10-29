import type { Metadata } from "next";
import { Cards } from "@/components/cards";
import { parkstack } from "@/lib/parkstack";

export const metadata: Metadata = { title: "Food and drink" };

export default async function FoodPage() {
  const { items } = await parkstack.food();
  return (
    <section className="section">
      <div className="wrap">
        <h1>Food and drink</h1>
        {items.length ? (
          <Cards
            items={items.map((item) => ({
              href: `/explore/food-and-drink/${item.slug}`,
              name: item.name,
              summary: item.summary,
              photo: item.photo,
              status: item.status,
              line: [item.typeLabel, item.priceBand ? "£".repeat(item.priceBand) : null, item.dietary.vegan ? "Vegan options" : item.dietary.vegetarian ? "Vegetarian options" : null]
                .filter(Boolean)
                .join(" · "),
            }))}
          />
        ) : (
          <p className="muted">Places to eat will appear here soon.</p>
        )}
      </div>
    </section>
  );
}
