import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="wrap">
        <h1>Page not found</h1>
        <p className="muted">That page isn’t on this website.</p>
        <p>
          <Link href="/">Back to the homepage</Link>
        </p>
      </div>
    </section>
  );
}
