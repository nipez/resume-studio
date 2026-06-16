import { Suspense } from "react";
import LoginForm from "./login-form";

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbf6f2] px-6">
      <div className="text-sm font-medium text-[#5c5269]">Loading…</div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
