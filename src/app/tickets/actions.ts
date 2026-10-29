"use server";

import { redirect } from "next/navigation";
import { ParkstackError, parkstack } from "@/lib/parkstack";

export type CheckoutState = { message: string | null };

/**
 * Starts the checkout on the server, so the site key stays here, then sends the
 * guest to Stripe's payment page. Parkstack checks everything its own ticket page
 * does (opening days, limits, codes) and answers refusals in words for the guest.
 */
export async function startCheckout(_previous: CheckoutState, form: FormData): Promise<CheckoutState> {
  const visitDate = String(form.get("visitDate") ?? "") || undefined;
  const dated = new Set(String(form.get("dated") ?? "").split(",").filter(Boolean));
  const lines = [...form.entries()]
    .filter(([name]) => name.startsWith("qty:"))
    .map(([name, value]) => ({ ticketId: name.slice(4), quantity: Number(value) }))
    .filter((line) => Number.isInteger(line.quantity) && line.quantity > 0)
    .map((line) => ({ ...line, ...(dated.has(line.ticketId) ? { visitDate } : {}) }));
  if (!lines.length) return { message: "Choose at least one ticket." };

  let url: string;
  try {
    ({ url } = await parkstack.checkout({
      email: String(form.get("email") ?? "").trim(),
      name: String(form.get("name") ?? "").trim() || undefined,
      lines,
    }));
  } catch (error) {
    return { message: error instanceof ParkstackError ? error.message : "Something went wrong. Try again shortly." };
  }
  // Card details are only ever typed on Stripe's page.
  redirect(url);
}
