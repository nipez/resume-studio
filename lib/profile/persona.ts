export type UserPersona = "student" | "professional";

export type FirstRunPath = "student" | "professional" | "import";

export function resolveIsStudent(input: {
  persona?: string | null;
  isStudent?: boolean | null;
}): boolean {
  if (input.persona === "student") return true;
  if (input.persona === "professional") return false;
  return Boolean(input.isStudent);
}

export function buildHrefForPersona(isStudent: boolean): string {
  return isStudent ? "/build?mode=student" : "/build";
}
