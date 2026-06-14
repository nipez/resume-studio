import { Suspense } from "react";
import AuthCallbackClient from "./auth-callback-client";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-page px-6">
          <p className="text-sm text-muted">Signing you in…</p>
        </main>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  );
}
