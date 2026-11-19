import { AuthGate } from "@/features/auth/auth-gate";
import { AppShell } from "@/features/shell/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <AppShell>{children}</AppShell>
    </AuthGate>
  );
}
