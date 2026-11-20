import { RegisterFlowProvider } from "@/features/auth/register-flow";

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <RegisterFlowProvider>{children}</RegisterFlowProvider>;
}
