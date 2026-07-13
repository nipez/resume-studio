/** Route-level loading shell shown while server components fetch data. */
export function PageSkeleton({ wide = false }: { wide?: boolean }) {
  return (
    <div className="scroll flex-1 overflow-auto">
      <div
        className={`mx-auto ${wide ? "max-w-[1180px]" : "max-w-[1080px]"} animate-pulse px-5 pb-16 pt-[42px] sm:px-8 lg:px-12`}
      >
        <div className="h-8 w-56 rounded-lg bg-[#E8EAEE]" />
        <div className="mt-3 h-4 w-full max-w-[480px] rounded bg-[#EEF0F3]" />
        <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-2xl border border-[#EEF0F3] bg-white p-4"
            >
              <div className="h-4 w-2/3 rounded bg-[#EEF0F3]" />
              <div className="mt-3 h-3 w-full rounded bg-[#F2F3F5]" />
              <div className="mt-2 h-3 w-4/5 rounded bg-[#F2F3F5]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
