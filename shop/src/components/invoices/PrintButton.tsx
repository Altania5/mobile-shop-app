"use client";

export function PrintButton({ invoiceId }: { invoiceId: string }) {
  return (
    <div className="no-print fixed top-4 right-4 flex gap-2 z-50">
      <button
        onClick={() => window.print()}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-gray-700"
      >
        Print / Save as PDF
      </button>
      <a
        href={`/invoices/${invoiceId}`}
        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-50"
      >
        Back
      </a>
    </div>
  );
}
