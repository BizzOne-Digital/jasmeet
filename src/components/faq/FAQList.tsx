"use client";

import { Accordion } from "@/components/ui/Accordion";

export function FAQList({
  groups,
}: {
  groups: Record<string, Array<{ _id: string; question: string; answer: string }>>;
}) {
  const categories = Object.keys(groups);

  if (!categories.length) {
    return (
      <p className="py-12 text-center text-sm text-muted">
        FAQs will appear here soon.
      </p>
    );
  }

  return (
    <div className="space-y-14">
      {categories.map((category) => (
        <section key={category}>
          <h2 className="mb-6 font-heading text-3xl tracking-wide">{category}</h2>
          <Accordion
            allowMultiple
            items={groups[category].map((faq) => ({
              id: faq._id,
              title: faq.question,
              content: faq.answer,
            }))}
          />
        </section>
      ))}
    </div>
  );
}
