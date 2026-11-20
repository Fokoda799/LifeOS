"use client";

import { createContext, useContext, useMemo, useState } from "react";

type Flow = {
  email: string;
  token: string | null;
  /** When the last code was requested (ms), for the resend cooldown. */
  sentAt: number | null;
  setEmail: (email: string) => void;
  setToken: (token: string | null) => void;
  setSentAt: (at: number | null) => void;
};

const FlowContext = createContext<Flow | null>(null);

export function RegisterFlowProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [sentAt, setSentAt] = useState<number | null>(null);
  const value = useMemo(
    () => ({ email, token, sentAt, setEmail, setToken, setSentAt }),
    [email, token, sentAt],
  );
  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useRegisterFlow() {
  const value = useContext(FlowContext);
  if (!value) throw new Error("useRegisterFlow must be used inside RegisterFlowProvider");
  return value;
}
