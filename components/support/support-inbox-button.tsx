import Link from "next/link";

function SupportIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="none"
      className="h-[18px] w-[18px] shrink-0 text-[#2456D6]"
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
      className="relative inline-flex items-center gap-2 rounded-[11px] border border-[#E4E7EC] bg-white px-3.5 py-2.5 text-[13.5px] font-semibold text-ink shadow-[0_2px_10px_rgba(15,17,22,0.06)] transition-colors hover:border-[#C8CED6] hover:bg-[#FAFBFC]"
      aria-label={
        unreadCount > 0 ? `${label}, ${unreadCount} unread replies` : label
      }
      title={label}
    >
      <SupportIcon />
      <span>{label}</span>
      {unreadCount > 0 ? (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#B23B3B] px-1 text-[10.5px] font-bold text-white ring-2 ring-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
