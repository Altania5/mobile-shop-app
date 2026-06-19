import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents);
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

/** Generate a sequential number string like WO-202506-0001 */
export function generateNumber(prefix: string, sequence: number): string {
  const now = new Date();
  const ym =
    now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, "0");
  return `${prefix}-${ym}-${sequence.toString().padStart(4, "0")}`;
}
