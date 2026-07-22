import Link from "next/link";

function SupportIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="none"
      className="h-[18px] w-[18px] shrink-0 text-muted"
    >
      <path
        d="M10 17.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M10 7.25v.75M10 10.5v3.25"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SupportInboxButton({ unreadCount }: { unreadCount: number }) {
  const label = "Help & support";

  return (
    <Link
      href="/messages"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-ink transition-colors hover:bg-soft"
      aria-label={
        unreadCount > 0 ? `${label}, ${unreadCount} unread replies` : label
      }
      title={label}
    >
      <SupportIcon />
      {unreadCount > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
