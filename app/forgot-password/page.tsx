import { Suspense } from "react";
import ForgotPasswordForm from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fbf6f2] px-6">
          <div className="text-sm font-medium text-[#5c5269]">Loading…</div>
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
