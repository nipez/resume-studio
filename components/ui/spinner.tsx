export function Spinner({ className = "h-[15px] w-[15px]" }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-white/40 border-t-white ${className}`}
      aria-hidden
    />
  );
}
