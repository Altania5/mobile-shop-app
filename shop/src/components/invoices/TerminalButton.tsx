"use client";

import { useState } from "react";
import { Wifi } from "lucide-react";

interface Props {
  invoiceId: string;
}

export function TerminalButton({ invoiceId }: Props) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSend() {
    if (!confirm("Send payment request to your Square Terminal?")) return;
    setState("sending");

    const res  = await fetch(`/api/invoices/${invoiceId}/terminal-checkout`, { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setErrorMsg(data.error ?? "Failed to reach Terminal");
      setState("error");
      return;
    }

    setState("sent");
  }

  if (state === "sent") {
    return (
      <div className="flex items-center gap-1.5 rounded-md bg-green-50 border border-green-200 px-3 py-1.5 text-sm font-medium text-green-700">
        <Wifi className="h-4 w-4" />
        Waiting for payment…
      </div>
    );
  }

  if (state === "error") {
    return (
      <button
        onClick={() => setState("idle")}
        className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
        title={errorMsg}
      >
        Terminal error — retry
      </button>
    );
  }

  return (
    <button
      onClick={handleSend}
      disabled={state === "sending"}
      className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
    >
      <Wifi className="h-4 w-4" />
      {state === "sending" ? "Sending…" : "Send to Terminal"}
    </button>
  );
}
