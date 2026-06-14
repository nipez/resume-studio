type ResumePreviewProps = {
  html: string;
  title?: string;
  className?: string;
};

export function ResumePreview({
  html,
  title = "Resume preview",
  className = "",
}: ResumePreviewProps) {
  return (
    <iframe
      srcDoc={html}
      title={title}
      className={`block h-full w-full border-none bg-white ${className}`}
    />
  );
}

type ScaledResumePreviewProps = {
  html: string;
  title?: string;
};

export function ScaledResumePreview({ html, title }: ScaledResumePreviewProps) {
  return (
    <div className="h-[466px] w-[360px] overflow-hidden rounded-xl border border-border bg-white shadow-[0_8px_26px_rgba(15,17,22,0.07)]">
      <iframe
        srcDoc={html}
        scrolling="no"
        title={title ?? "Resume preview"}
        className="block h-[1056px] w-[816px] origin-top-left scale-[0.441] border-none bg-white"
      />
    </div>
  );
}
