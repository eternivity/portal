import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Invoice } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(amount);
}

export function invoiceTotal(invoice: Invoice) {
  return invoice.lineItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
}
