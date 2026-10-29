import type { Metadata } from "next";
import { Markdown } from "@/components/markdown";
import { parkstack } from "@/lib/parkstack";

export const metadata: Metadata = { title: "Questions and answers" };

export default async function FaqPage() {
  const { groups } = await parkstack.faq();
  return (
    <section className="section">
      <div className="wrap">
        <h1>Questions and answers</h1>
        {groups.map((group, index) => (
          <div key={group.heading ?? index}>
            {/* Questions with no group come first, with no heading. */}
            {group.heading ? <h2>{group.heading}</h2> : null}
            {group.questions.map((item) => (
              <div key={item.question}>
                <p className="faq-q">{item.question}</p>
                <Markdown text={item.answer} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
