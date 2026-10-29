import "server-only";

/**
 * The Parkstack API, called from the server only, so the site key never reaches
 * visitors' browsers. Reference: https://parkstack.net/developers/reference
 */

const API = process.env.PARKSTACK_API_URL ?? "https://api.parkstack.net/site/v1";
// Parkstack's public demo key: Riverside, a demonstration park whose checkout takes no payment.
const DEMO_KEY = "pk_live_demoRiversideParkstackSiteApiKey";
const KEY = process.env.PARKSTACK_SITE_KEY || DEMO_KEY;

export class ParkstackError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

async function call<T>(path: string, init?: RequestInit & { cache?: RequestCache }): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${KEY}`, Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}) },
    // Answers are fresh for a minute: a change the park publishes shows within about a minute.
    ...(init?.method === "POST" || init?.cache ? {} : { next: { revalidate: 60 } }),
  });
  const body = (await response.json().catch(() => null)) as (T & { code?: string; message?: string }) | null;
  if (!response.ok || !body) {
    throw new ParkstackError(response.status, body?.code ?? "UNKNOWN", body?.message ?? "Parkstack could not be reached. Try again shortly.");
  }
  return body;
}

/** NOT_FOUND as null, so a page can look for a redirect and then show its 404. */
async function maybe<T>(path: string): Promise<T | null> {
  try {
    return await call<T>(path);
  } catch (error) {
    if (error instanceof ParkstackError && error.code === "NOT_FOUND") return null;
    throw error;
  }
}

export type Image = { url: string; width: number | null; height: number | null; alt: string | null; srcset: string | null };
export type Status = { code: string; label: string; note: string | null };
export type Seo = { title: string | null; description: string | null };

export type Park = {
  name: string;
  tagline: string | null;
  timezone: string;
  contact: { email: string | null; phone: string | null };
  address: { lines: string | null; postcode: string | null; parking: string | null; mapUrl: string | null };
  social: { label: string; url: string }[];
  logo: Image | null;
  colours: { main: string; accent: string };
  tickets: { onSaleOnline: boolean; fromPence: number | null; fromIncludesVat: boolean | null; shopUrl: string };
  seller: { name: string | null; address: string | null; email: string | null; phone: string | null; vatNumber: string | null; companyDetails: string | null };
  parkstackUrl: string;
  demo: boolean;
};

export type HoursDay = { date: string; status: "open" | "closed" | "not_set"; opens: string | null; closes: string | null; lastEntry: string | null; label: string | null };

export type AttractionSummary = {
  slug: string;
  name: string;
  summary: string | null;
  typeLabel: string;
  status: Status;
  isNew: boolean;
  height: { label: string } | null;
  photo: Image | null;
};
export type Attraction = AttractionSummary & {
  description: string | null;
  photos: Image[];
  durationMinutes: number | null;
  wheelchairAccess: { label: string } | null;
  events: { slug: string; name: string; when: string }[];
  seo: Seo;
};

export type FoodSummary = {
  slug: string;
  name: string;
  summary: string | null;
  typeLabel: string;
  status: Status;
  location: string | null;
  priceBand: number | null;
  hoursNote: string | null;
  dietary: { vegetarian: boolean; vegan: boolean; glutenFree: boolean };
  photo: Image | null;
};
export type Food = FoodSummary & { description: string | null; photos: Image[]; seo: Seo };

export type EventSummary = { slug: string; name: string; summary: string | null; when: string; past: boolean; location: string | null; photo: Image | null };
export type ParkEvent = EventSummary & { description: string | null; photos: Image[]; showtimes: string[]; attraction: { slug: string; name: string } | null; seo: Seo };

export type Faq = { groups: { heading: string | null; questions: { question: string; answer: string }[] }[] };
export type Page = { slug: string; title: string; text: string; photos: Image[]; files: { url: string; name: string }[]; notices: { heading: string; paragraphs: string[] }[]; seo: Seo };

export type Ticket = {
  id: string;
  name: string;
  description: string | null;
  pricePence: number;
  priceOnTheDayPence: number | null;
  includesVat: boolean;
  dated: boolean;
  daysLine: string | null;
  reentryLine: string | null;
};
export type Tickets = { onSaleOnline: boolean; maxPerOrder: number; items: Ticket[] };
export type Availability = {
  from: string;
  to: string;
  todayCutOff: string | null;
  days: { date: string; status: "available" | "sold_out" | "closed" | "too_late"; label: string | null; tickets: { id: string; available: boolean; fewLeft: number | null }[] }[];
};

export const parkstack = {
  park: () => call<Park>("/park"),
  hours: (from?: string, to?: string) => call<{ days: HoursDay[] }>(`/hours${from ? `?from=${from}&to=${to ?? from}` : ""}`),
  attractions: () => call<{ items: AttractionSummary[] }>("/attractions"),
  attraction: (slug: string) => maybe<Attraction>(`/attractions/${encodeURIComponent(slug)}`),
  food: () => call<{ items: FoodSummary[] }>("/food-and-drink"),
  foodPlace: (slug: string) => maybe<Food>(`/food-and-drink/${encodeURIComponent(slug)}`),
  events: () => call<{ items: EventSummary[] }>("/events"),
  event: (slug: string) => maybe<ParkEvent>(`/events/${encodeURIComponent(slug)}`),
  faq: () => call<Faq>("/faq"),
  page: (slug: string) => maybe<Page>(`/pages/${encodeURIComponent(slug)}`),
  redirect: (path: string) => maybe<{ to: string }>(`/redirects?path=${encodeURIComponent(path)}`),
  tickets: () => call<Tickets>("/tickets"),
  availability: (month?: string) => call<Availability>(`/tickets/availability${month ? `?month=${month}` : ""}`),
  checkout: (input: { email: string; name?: string; lines: { ticketId: string; quantity: number; visitDate?: string }[] }) =>
    call<{ url: string; demo: boolean }>("/checkout", { method: "POST", body: JSON.stringify(input) }),
};
