type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="scroll flex-1 overflow-auto">
      <div className="mx-auto max-w-[1120px] px-5 pb-16 sm:px-8 lg:px-12 pt-[42px]">
        <h1 className="font-display text-[30px] font-semibold tracking-[-0.025em] text-ink">
          {title}
        </h1>
        <p className="mt-2 max-w-[560px] text-[14.5px] leading-relaxed text-muted">
          {description}
        </p>
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-white px-6 py-10 text-center text-[14px] text-muted">
          Coming in the next PR — shell and design system are ready.
        </div>
      </div>
    </div>
  );
}
