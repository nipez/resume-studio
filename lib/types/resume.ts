export type TemplateStyle = "classic" | "twocol" | "editorial";

export type ResumeExperience = {
  company: string;
  title: string;
  dates: string;
  blurb?: string;
  bullets: string[];
};

export type ResumeEducation = {
  school: string;
  degree: string;
  year: string;
};

export type ResumeData = {
  name: string;
  headline: string;
  phone: string;
  email: string;
  location: string;
  linkedin: string;
  summary: string;
  skills: string[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  /** Template accent color (hex). Defaults to coral when omitted. */
  accentColor?: string;
};

export type ResumeVersionInput = {
  templateStyle: TemplateStyle;
  data: ResumeData;
};
