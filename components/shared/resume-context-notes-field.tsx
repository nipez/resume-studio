"use client";

type ResumeContextNotesFieldProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
  hint?: string;
};

export function ResumeContextNotesField({
  value,
  onChange,
  className = "",
  label = "Extra context for your resume",
  hint = "Anything you want emphasized — pivot story, projects to highlight, keywords, referral, or experience the job description underplays.",
}: ResumeContextNotesFieldProps) {
  return (
    <label className={`flex flex-col gap-1.5 text-[12.5px] font-semibold text-[#5A6573] ${className}`}>
      {label}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder="e.g. Emphasize my board work at the food bank, I’m pivoting from sales to marketing, mention Salesforce admin cert…"
        className="resize-y rounded-[10px] border border-[#DFE3E8] px-3 py-2.5 text-[13px] font-normal leading-[1.55] text-ink focus:border-accent focus:outline-none"
      />
      <span className="text-[11.5px] font-normal leading-[1.45] text-[#8A92A0]">{hint}</span>
    </label>
  );
}
