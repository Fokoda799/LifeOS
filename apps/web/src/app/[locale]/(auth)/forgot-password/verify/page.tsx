import { Suspense } from "react";
import { ForgotVerifyForm } from "@/features/auth/forgot-verify-form";

export default function ForgotPasswordVerifyPage() {
  return (
    <Suspense>
      <ForgotVerifyForm />
    </Suspense>
  );
}
