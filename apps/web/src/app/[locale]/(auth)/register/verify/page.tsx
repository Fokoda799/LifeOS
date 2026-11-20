import { Suspense } from "react";
import { RegisterVerifyForm } from "@/features/auth/register-verify-form";

export default function RegisterVerifyPage() {
  return (
    <Suspense>
      <RegisterVerifyForm />
    </Suspense>
  );
}
