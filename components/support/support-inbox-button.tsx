import Link from "next/link";

export function SupportInboxButton({ unreadCount }: { unreadCount: number }) {
  return (
    <Link
      href="/messages"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E4E7EC] bg-white text-[17px] shadow-[0_2px_10px_rgba(15,17,22,0.06)] transition-colors hover:border-[#C8CED6] hover:bg-[#FAFBFC]"
      aria-label={
        unreadCount > 0
          ? `Messages, ${unreadCount} unread`
          : "Messages"
      }
      title="Messages"
    >
      <span aria-hidden>✉</span>
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#B23B3B] px-1 text-[10px] font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
