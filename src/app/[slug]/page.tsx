import type { Metadata } from "next";
import { Markdown } from "@/components/markdown";
import { Photo } from "@/components/photo";
import { missing } from "@/lib/not-found";
import { parkstack } from "@/lib/parkstack";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await parkstack.page((await params).slug);
  return page ? { title: page.seo.title ?? page.title, description: page.seo.description ?? undefined } : {};
}

/** The park's pages: About, Accessibility, Privacy, Ticket terms and its own. */
export default async function Page({ params }: Props) {
  const { slug } = await params;
  const page = await parkstack.page(slug);
  if (!page) return missing(`/${slug}`);
  return (
    <article className="section">
      <div className="wrap">
        <h1>{page.title}</h1>
        {page.photos.length ? (
          <div className="gallery">
            {page.photos.map((photo) => (
              <Photo key={photo.url} image={photo} />
            ))}
          </div>
        ) : null}
        <Markdown text={page.text} />
        {page.files.length ? (
          <>
            <h2>Downloads</h2>
            <ul>
              {page.files.map((file) => (
                <li key={file.url}>
                  <a href={file.url}>{file.name}</a>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {/* Privacy and Ticket terms carry parts Parkstack adds, which must follow the park's own words. */}
        {page.notices.map((notice) => (
          <section key={notice.heading} className="notice">
            <h2>{notice.heading}</h2>
            {notice.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
