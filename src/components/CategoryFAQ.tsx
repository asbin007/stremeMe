import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Helmet } from "react-helmet-async";

// A collapsible FAQ section + the matching schema.org FAQPage JSON-LD.
// Does two jobs at once:
//   - Google eligibility for FAQ-rich-result SERP cards (the inline Q&A
//     tiles under a page link).
//   - Fills category pages with genuine on-page copy so Googlebot stops
//     treating a bare grid as thin content.
//
// Keep answers short, concrete, and unique per page — Google demotes
// boilerplate repeated across the site.

export interface FAQ {
  q: string;
  a: string;
}

interface Props {
  title: string;
  intro: string;
  faqs: FAQ[];
}

const CategoryFAQ: React.FC<Props> = ({ title, intro, faqs }) => {
  const [open, setOpen] = useState<number | null>(0);

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section className="mt-16 border-t border-white/5 pt-10">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>
      <h2 className="mb-3 text-xl font-bold text-white md:text-2xl">{title}</h2>
      <p className="mb-8 max-w-3xl text-sm leading-relaxed text-gray-400 md:text-base">
        {intro}
      </p>
      <h3 className="mb-4 text-lg font-semibold text-white">Frequently asked questions</h3>
      <ul className="max-w-3xl space-y-2">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <li key={i} className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-medium text-white hover:bg-white/5 md:text-base"
              >
                <span>{f.q}</span>
                <ChevronDown
                  className={`size-4 shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-sm leading-relaxed text-gray-300">
                  {f.a}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default CategoryFAQ;
