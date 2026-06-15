type FaqItem = {
  question: string;
  answer: string;
};

type MarketingFaqAccordionProps = {
  items: readonly FaqItem[];
};

export function MarketingFaqAccordion({ items }: MarketingFaqAccordionProps) {
  return (
    <div className="faq-panel">
      {items.map((item, index) => (
        <details key={item.question} className="faq-item">
          <summary>
            <span className="faq-q">
              <span className="faq-num">{String(index + 1).padStart(2, "0")}</span>
              {item.question}
            </span>
            <span className="faq-toggle" aria-hidden>
              +
            </span>
          </summary>
          <p className="faq-a">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
