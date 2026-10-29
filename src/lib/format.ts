/** Pence as the guest pays it: £22, or £22.50. Never adds VAT or fees: the API's price is the total. */
export function money(pence: number): string {
  const pounds = pence / 100;
  return `£${Number.isInteger(pounds) ? pounds.toLocaleString("en-GB") : pounds.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** "Saturday 14 November" from YYYY-MM-DD, read as a calendar date (no time zone can move it). */
export function longDate(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
}

/** Today's date on the park's clock, as YYYY-MM-DD. */
export function todayIn(timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export function hoursText(day: { status: string; opens: string | null; closes: string | null; lastEntry: string | null }): string | null {
  if (day.status === "closed") return "Closed";
  if (day.status !== "open" || !day.opens || !day.closes) return null;
  return `${day.opens} to ${day.closes}${day.lastEntry ? ` (last entry ${day.lastEntry})` : ""}`;
}

/** The month before YYYY-MM. */
export function previousMonth(month: string): string {
  const [year, number] = month.split("-").map(Number) as [number, number];
  return number === 1 ? `${year - 1}-12` : `${year}-${String(number - 1).padStart(2, "0")}`;
}

/** The month after YYYY-MM. */
export function nextMonth(month: string): string {
  const [year, number] = month.split("-").map(Number) as [number, number];
  return number === 12 ? `${year + 1}-01` : `${year}-${String(number + 1).padStart(2, "0")}`;
}
