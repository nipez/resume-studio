import type { NavIconName } from "@/components/icons/nav-icons";

export type NavItem = { href: string; label: string; icon: NavIconName };

export type NavGroup = { label: string; items: NavItem[] };

const PROFESSIONAL_NAV: NavGroup[] = [
  {
    label: "",
    items: [
      { href: "/dashboard", label: "Home", icon: "home" },
      { href: "/build", label: "Build resume", icon: "library" },
    ],
  },
  {
    label: "Prepare",
    items: [
      { href: "/discover", label: "Job discovery", icon: "search" },
      { href: "/library", label: "Resume library", icon: "library" },
      { href: "/tailor?new=1", label: "Tailor to a job", icon: "target" },
      { href: "/cover", label: "Cover letter", icon: "mail" },
      { href: "/questions", label: "Application Q&A", icon: "chat" },
    ],
  },
  {
    label: "Track",
    items: [
      { href: "/applications", label: "Applications", icon: "briefcase" },
      { href: "/insights", label: "Insights", icon: "chart" },
    ],
  },
];

/** Fewer, clearer links for student persona — grows slightly once they have a resume. */
export function buildStudentNavGroups(hasResume: boolean): NavGroup[] {
  if (!hasResume) {
    return [
      {
        label: "",
        items: [
          { href: "/dashboard", label: "Home", icon: "home" },
          { href: "/build?mode=student", label: "Build resume", icon: "library" },
        ],
      },
    ];
  }

  return [
    {
      label: "",
      items: [
        { href: "/dashboard", label: "Home", icon: "home" },
        { href: "/tailor", label: "Apply to a job", icon: "target" },
      ],
    },
    {
      label: "Your stuff",
      items: [
        { href: "/library", label: "My resume", icon: "library" },
        { href: "/applications", label: "Applications", icon: "briefcase" },
      ],
    },
    {
      label: "More",
      items: [
        { href: "/discover", label: "Job discovery", icon: "search" },
        { href: "/build?mode=student", label: "Edit in builder", icon: "library" },
        { href: "/cover", label: "Cover letter", icon: "mail" },
        { href: "/questions", label: "Application Q&A", icon: "chat" },
        { href: "/insights", label: "Insights", icon: "chart" },
      ],
    },
  ];
}

export function buildNavGroups(input: {
  isStudent: boolean;
  hasResume: boolean;
}): NavGroup[] {
  if (input.isStudent) {
    return buildStudentNavGroups(input.hasResume);
  }
  return PROFESSIONAL_NAV;
}

export function isNavItemActive(pathname: string, href: string): boolean {
  const path = href.split("?")[0];

  if (path === "/build") {
    return pathname === "/build" || pathname.startsWith("/build/");
  }
  if (path === "/library") {
    return (
      pathname === "/library" ||
      pathname.startsWith("/library/") ||
      pathname.startsWith("/editor/")
    );
  }
  if (path === "/tailor") {
    return pathname === "/tailor" || pathname.startsWith("/tailor/");
  }
  if (path === "/applications") {
    return (
      pathname === "/applications" || pathname.startsWith("/applications/")
    );
  }
  if (path === "/cover") {
    return pathname === "/cover" || pathname.startsWith("/cover/");
  }
  if (path === "/questions") {
    return pathname === "/questions" || pathname.startsWith("/questions/");
  }
  if (path === "/discover") {
    return pathname === "/discover" || pathname.startsWith("/discover/");
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}
