import { Fragment, type ReactNode } from "react";

/**
 * Park-written text: Markdown with bold, links and bulleted lists only. Drawn as
 * React elements, never as HTML, so nothing a park types can run on the page.
 */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index! > last) out.push(text.slice(last, match.index));
    if (match[1]) out.push(<strong key={match.index}>{match[1]}</strong>);
    else {
      const href = match[3]!;
      // Only web addresses, the site's own pages and email: anything else stays as words.
      const safe = /^(https?:\/\/|\/(?!\/)|mailto:)/i.test(href);
      out.push(safe ? <a key={match.index} href={href}>{match[2]}</a> : `${match[2]}`);
    }
    last = match.index! + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ text }: { text: string | null }) {
  if (!text) return null;
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/);
  return (
    <div className="prose">
      {blocks.map((block, index) => {
        const lines = block.split("\n").filter(Boolean);
        if (lines.length && lines.every((line) => /^[-*•] /.test(line))) {
          return (
            <ul key={index}>
              {lines.map((line, item) => (
                <li key={item}>{inline(line.replace(/^[-*•] /, ""))}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index}>
            {lines.map((line, item) => (
              <Fragment key={item}>
                {item ? <br /> : null}
                {inline(line)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
