import { Suspense } from "react";
import SignupForm from "./signup-form";

function SignupFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbf6f2] px-6">
      <div className="text-sm font-medium text-[#5c5269]">Loading…</div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <SignupForm />
    </Suspense>
  );
}
