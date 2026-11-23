import { ToolGate } from "@/features/tools/tool-gate";

export default function MoneyLayout({ children }: { children: React.ReactNode }) {
  return <ToolGate toolId="money">{children}</ToolGate>;
}
