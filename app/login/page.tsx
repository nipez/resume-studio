import { Suspense } from "react";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-page px-6">
          <div className="text-sm text-muted">Loading…</div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
