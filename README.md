# Attraction site starter

A visitor attraction's website built on the [Parkstack API](https://parkstack.net/developers): homepage, attractions, food and drink, events, opening hours, questions and answers, the park's pages (About, Privacy, Ticket terms) and ticket buying. The park keeps editing everything in Parkstack; this site shows it within about a minute.

It is plain Next.js with no other framework or styling library, so it is easy to restyle and to read.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no key set it uses Parkstack's public demo key, which reads **Riverside Adventure Park**, a demonstration park whose checkout takes no payment. Try buying tickets: you land on a demo tickets page and nothing is charged.

## Use a park's own key

1. The park's owner makes a key in Parkstack: **Park settings → Your own website → Make a key**. This site reads everything on its server, so the key needs no website addresses.
2. Copy `.env.example` to `.env.local` and set `PARKSTACK_SITE_KEY`.
3. Deploy anywhere that runs Next.js (Vercel, Cloudflare with OpenNext, a Node server), with the same variable set.

When the site is live, the park chooses **Our own website** in the same place. Parkstack then sends visitors from its pages to the same page here, which is why this site uses Parkstack's addresses (`/explore/attractions/…`, `/plan-your-visit/opening-hours` and so on).

## What it does for you, and what you must keep

- **Prices** are shown exactly as the API gives them: the total the guest pays, with "inc. VAT" only when the API says so.
- **Checkout** runs on the server (`src/app/tickets/actions.ts`) and sends the guest to Stripe's payment page. Card details never reach this site.
- **Before paying**, the ticket page names who the guest buys from and links the Ticket terms.
- **Privacy and Ticket terms** show the parts Parkstack adds (`notices`) after the park's own words.
- **Renamed pages**: an address that no longer exists asks Parkstack where it went (`src/lib/not-found.ts`) before showing the 404 page.
- **Contact** and group enquiries stay on Parkstack: the footer links there.

`AGENTS.md` has the same rules for AI coding tools. The full reference is at https://parkstack.net/developers/reference.

## Questions

Ask at https://parkstack.net/contact. Parkstack is made by PARKSTACK LTD. This starter is MIT licensed: use it for any park's website, change anything.
