import { RegisterFlowProvider } from "@/features/auth/register-flow";

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <RegisterFlowProvider>{children}</RegisterFlowProvider>;
}
