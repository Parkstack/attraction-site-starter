import Link from "next/link";
import type { Image, Status } from "@/lib/parkstack";
import { Photo } from "./photo";

export type CardItem = { href: string; name: string; summary: string | null; photo: Image | null; line?: string | null; status?: Status; isNew?: boolean };

/** A grid of cards: attractions, food and drink, events. */
export function Cards({ items }: { items: CardItem[] }) {
  if (!items.length) return null;
  return (
    <ul className="cards">
      {items.map((item) => (
        <li key={item.href} className="card">
          <Link href={item.href}>
            <Photo image={item.photo} sizes="(min-width: 900px) 33vw, (min-width: 600px) 50vw, 100vw" />
            <div className="card-body">
              <h3>{item.name}</h3>
              {item.isNew ? <span className="badge new">New</span> : null}
              {item.status && item.status.code !== "operating" ? <span className="badge">{item.status.label}</span> : null}
              {item.line ? <p className="small">{item.line}</p> : null}
              {item.summary ? <p className="muted">{item.summary}</p> : null}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
