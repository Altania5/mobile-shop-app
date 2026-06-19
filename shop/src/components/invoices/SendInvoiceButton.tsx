"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Send, ExternalLink } from "lucide-react";

interface Props {
  invoiceId: string;
  alreadySent: boolean;
  paymentUrl: string | null;
}

export function SendInvoiceButton({ invoiceId, alreadySent, paymentUrl }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState(paymentUrl);

  async function handleSend() {
    if (!confirm("Send this invoice to the customer via Square? They will receive an email with a payment link.")) return;
    setLoading(true);

    const res = await fetch(`/api/invoices/${invoiceId}/send`, { method: "POST" });
    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      const detail = data.detail ? `\n\n${JSON.stringify(data.detail, null, 2)}` : "";
      alert((data.error ?? "Failed to send invoice.") + detail);
      return;
    }

    setUrl(data.paymentUrl);
    router.refresh();
  }

  if (url) {
    return (
      <div className="flex items-center gap-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open Payment Link
        </a>
        <button
          onClick={() => { navigator.clipboard.writeText(url); alert("Link copied!"); }}
          className="text-xs text-gray-400 hover:text-gray-700 underline"
        >
          Copy link
        </button>
      </div>
    );
  }

  return (
    <Button onClick={handleSend} disabled={loading || alreadySent}>
      <Send className="h-4 w-4" />
      {loading ? "Sending…" : alreadySent ? "Already Sent" : "Send via Square"}
    </Button>
  );
}
