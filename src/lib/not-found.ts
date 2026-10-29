import "server-only";
import { notFound, permanentRedirect } from "next/navigation";
import { parkstack } from "./parkstack";

/**
 * Nothing published at this address: the park may have renamed or removed it,
 * so ask Parkstack where it went before showing the 404 page.
 */
export async function missing(path: string): Promise<never> {
  const redirect = await parkstack.redirect(path).catch(() => null);
  if (redirect?.to && redirect.to !== path) permanentRedirect(redirect.to);
  notFound();
}
