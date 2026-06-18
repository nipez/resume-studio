"use client";

import { DisplayNameEditor } from "@/components/profile/display-name-editor";
import { Logo } from "@/components/brand/logo";
import { NavIcon, type NavIconName } from "@/components/icons/nav-icons";
import { SignOutButton } from "@/components/sign-out-button";
import { stopViewingAs } from "@/lib/admin/actions";
import { SITE_NAME } from "@/lib/marketing/content";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

type NavItem = { href: string; label: string; icon: NavIconName };

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
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

type AppShellProps = {
  children: React.ReactNode;
  userName: string;
  profileFullName: string | null;
  userEmail: string | null;
  positioning?: string | null;
  isAdmin?: boolean;
  impersonatingLabel?: string | null;
};

function ImpersonationBanner({ label }: { label: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-none items-center justify-between gap-3 bg-[#231a2e] px-5 py-2 text-[13px] text-[#fbe9e3]">
      <span>
        Viewing as <span className="font-semibold text-white">{label}</span> —
        this is a demo persona.
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await stopViewingAs();
            router.push("/admin");
            router.refresh();
          })
        }
        className="cursor-pointer rounded-lg bg-white/15 px-3 py-1 text-[12.5px] font-semibold text-white transition-colors hover:bg-white/25 disabled:opacity-60"
      >
        {pending ? "Returning…" : "Return to my account"}
      </button>
    </div>
  );
}

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/build") {
    return pathname === "/build" || pathname.startsWith("/build/");
  }
  if (href === "/library") {
    return (
      pathname === "/library" ||
      pathname.startsWith("/library/") ||
      pathname.startsWith("/editor/")
    );
  }
  if (href === "/applications") {
    return (
      pathname === "/applications" || pathname.startsWith("/applications/")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({
  children,
  userName,
  profileFullName,
  userEmail,
  positioning,
  isAdmin = false,
  impersonatingLabel = null,
}: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="appshell flex h-screen w-screen overflow-hidden bg-page text-ink">
      <aside className="flex w-[248px] flex-none flex-col border-r border-white/[0.06] bg-sidebar px-3 py-4 text-sidebar-muted">
        <div className="flex items-center gap-2.5 px-2 pb-4">
          <Logo
            size={34}
            className="shrink-0 shadow-[0_4px_14px_rgba(47,107,255,0.4)]"
          />
          <div className="min-w-0">
            <div className="truncate font-display text-[15px] font-semibold tracking-[-0.01em] text-white">
              {SITE_NAME}
            </div>
            <DisplayNameEditor
              displayName={userName}
              profileFullName={profileFullName}
              email={userEmail}
            />
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.label || "home"}>
              {group.label ? (
                <div className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-[0.08em] text-sidebar-footer">
                  {group.label}
                </div>
              ) : null}
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = isNavActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-left text-[13px] transition-[background,color] duration-150 ${
                        active
                          ? "bg-accent/18 font-semibold text-white"
                          : "font-medium text-sidebar-nav hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <span className="flex h-[17px] w-[17px] items-center justify-center opacity-90">
                        <NavIcon name={item.icon} />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          {isAdmin ? (
            <div>
              <div className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-[0.08em] text-sidebar-footer">
                Admin
              </div>
              <Link
                href="/admin"
                className={`flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-left text-[13px] transition-[background,color] duration-150 ${
                  isNavActive(pathname, "/admin")
                    ? "bg-accent/18 font-semibold text-white"
                    : "font-medium text-sidebar-nav hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <span className="flex h-[17px] w-[17px] items-center justify-center opacity-90">
                  <NavIcon name="chart" />
                </span>
                <span>Admin panel</span>
              </Link>
            </div>
          ) : null}
        </nav>

        <div className="mt-3 border-t border-white/[0.07] pt-3">
          {positioning?.trim() ? (
            <p className="mb-2.5 line-clamp-2 px-2 text-[10.5px] leading-[1.5] text-sidebar-footer">
              {positioning.trim()}
            </p>
          ) : null}
          <div className="px-1">
            <SignOutButton />
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        {impersonatingLabel ? (
          <ImpersonationBanner label={impersonatingLabel} />
        ) : null}
        {children}
      </main>
    </div>
  );
}
