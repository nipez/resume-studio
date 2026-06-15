export type ResumeEditSectionId =
  | "header"
  | "summary"
  | "skills"
  | "experience"
  | "education"
  | "awards";

export type ResumeEditSection = {
  id: ResumeEditSectionId;
  index?: number;
};

export function sectionKey(section: ResumeEditSection): string {
  return section.index !== undefined
    ? `${section.id}:${section.index}`
    : section.id;
}

export function sectionLabel(section: ResumeEditSection): string {
  if (section.id === "header") return "Header";
  if (section.id === "summary") return "Summary";
  if (section.id === "skills") return "Skills";
  if (section.id === "experience") {
    return section.index !== undefined
      ? `Experience · Role ${section.index + 1}`
      : "Experience";
  }
  if (section.id === "education") return "Education";
  if (section.id === "awards") return "Honors & Awards";
  return "Section";
}
