import { SignOutButton } from "@/components/sign-out-button";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("full_name, positioning")
        .eq("id", user.id)
        .single()
    : { data: null };

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "there";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-page px-6">
      <div className="flex max-w-lg flex-col items-center text-center">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-[#7A53FF] font-display text-xl font-bold text-white shadow-accent">
          R
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          Welcome, {displayName}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          You&apos;re signed in. PR #2 auth is working — the full app UI lands in
          PR #3.
        </p>
        <p className="mt-2 text-sm text-muted">{user?.email}</p>
        <div className="mt-8 flex items-center gap-3">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
