import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/photo";
import { parkstack } from "@/lib/parkstack";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const park = await parkstack.park();
  return { title: { default: park.name, template: `%s · ${park.name}` }, description: park.tagline ?? undefined };
}

/** Parkstack's own guest-site addresses, so links still work when a park moves to this site. */
const NAV = [
  ["/explore/attractions", "Attractions"],
  ["/explore/food-and-drink", "Food and drink"],
  ["/explore/events", "Events"],
  ["/plan-your-visit/opening-hours", "Opening hours"],
  ["/plan-your-visit/faq", "Questions"],
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const park = await parkstack.park();
  const year = new Date().getFullYear();
  return (
    <html lang="en-GB" style={{ "--main": park.colours.main, "--accent": park.colours.accent } as React.CSSProperties}>
      <body>
        {park.demo ? <p className="demo">This is a demonstration park: nothing is charged and its tickets are not valid.</p> : null}
        <header className="site-header">
          <div className="wrap header-row">
            <Link href="/" className="brand">
              {park.logo ? <Photo image={{ ...park.logo, alt: park.name }} className="logo" sizes="160px" /> : <span>{park.name}</span>}
            </Link>
            <nav aria-label="Main">
              {NAV.map(([href, label]) => (
                <Link key={href} href={href}>
                  {label}
                </Link>
              ))}
              {/* Only while tickets are on sale online. */}
              {park.tickets.onSaleOnline ? (
                <Link href="/tickets" className="button">
                  Tickets
                </Link>
              ) : null}
            </nav>
          </div>
        </header>
        <main id="main">{children}</main>
        <footer className="site-footer">
          <div className="wrap footer-grid">
            <div>
              <p className="footer-name">{park.name}</p>
              {park.address.lines ? (
                <p>
                  {park.address.lines}
                  {park.address.postcode ? `, ${park.address.postcode}` : ""}
                </p>
              ) : null}
              {park.address.mapUrl ? <a href={park.address.mapUrl}>Open in Google Maps</a> : null}
            </div>
            <div>
              {park.contact.phone ? <p>{park.contact.phone}</p> : null}
              {park.contact.email ? <a href={`mailto:${park.contact.email}`}>{park.contact.email}</a> : null}
              <p>
                <a href={`${park.parkstackUrl}/contact`}>Contact us</a>
              </p>
            </div>
            <div>
              <Link href="/about">About</Link>
              <br />
              <Link href="/privacy">Privacy</Link>
              <br />
              <Link href="/ticket-terms">Ticket terms</Link>
            </div>
          </div>
          <div className="wrap small">
            {/* Who guests buy from, as the API gives it: the park's seller details. */}
            {park.seller.companyDetails ? <p>{park.seller.companyDetails}</p> : null}
            <p>
              © {park.name} {year}
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
