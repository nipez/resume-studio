import "@/components/marketing/shared/marketing-fonts.css";

export default function SetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="login-shell min-h-screen bg-[#fbf6f2] font-[family-name:var(--font-marketing)] text-[#231a2e] antialiased">
      {children}
    </div>
  );
}
