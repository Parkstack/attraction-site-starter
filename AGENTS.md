# Building a park's website on the Parkstack API

This website shows a visitor attraction's details and sells its tickets through the Parkstack API. The park edits everything in Parkstack; this site only reads it. Do not hard-code park content.

## Calling the API

- Base address: `https://api.parkstack.net/site/v1`
- Send the site key on every request: `Authorization: Bearer <key>`. Read it from an environment variable (for example `PARKSTACK_SITE_KEY`); never commit a park's key.
- While building, use the public demo key `pk_live_demoRiversideParkstackSiteApiKey`. It reads Riverside, a demonstration park whose checkout takes no payment.
- Call from the server (server components, route handlers, server actions) where possible.
- Answers are JSON. Refusals are `{ code, message }`; react to `code`, show `message` to guests.
- Cache for 60 seconds (Cache-Control says so). Each key may make 120 or more requests a minute.
- Full reference: https://parkstack.net/developers/reference (OpenAPI: https://parkstack.net/developers/openapi.json).
- A complete working example in Next.js: https://github.com/Parkstack/attraction-site-starter

## Addresses

- `GET /park`: Name, contact details, address, logo, colours, fonts, the cheapest ticket and who guests buy from. Start here: most pages need some of it.
- `GET /hours`: Opening times day by day, with special dates and the names of events on each day. Today when no dates are given; up to 62 days a request.
- `GET /attractions`: Every published attraction guests can see, in the park's order. Unlisted ones are left out.
- `GET /attractions/{slug}`: An attraction's full details, photos, accessibility and the events held there.
- `GET /food-and-drink`: Restaurants, cafés, kiosks and bars, with dietary options and price bands.
- `GET /food-and-drink/{slug}`: A food or drink place's full details and photos.
- `GET /shops-and-facilities`: Shops, toilets, first aid, lockers and the like. `isShop` separates shops from the rest.
- `GET /shops-and-facilities/{slug}`: A shop or facility's full details and photos.
- `GET /events`: Current and upcoming events first, then past ones newest first (`past: true`), with when they are on in words.
- `GET /events/{slug}`: An event's full details, every date it is on and its showtimes.
- `GET /faq`: The park's FAQ in its groups and order.
- `GET /pages/{slug}`: A page's words, photos and files: about, accessibility, privacy, ticket-terms and the park's own pages.
- `GET /closures`: Attractions unavailable today, and those closed for the season or for refurbishment.
- `GET /redirects`: Where an old address now goes, after the park renamed or removed something.
- `GET /tickets`: Tickets on sale online with their prices, VAT wording, days covered and re-entry.
- `GET /tickets/availability`: A month of days: which can be booked for each dated ticket, which are sold out, closed or too late, and when few places are left.
- `POST /checkout`: Checks the order exactly as Parkstack's own ticket page does, holds the places and answers with Stripe's payment page. Up to 20 tickets an order.
- `GET /orders/{orderNumber}`: An order after checkout, with a QR code per ticket once paid. Needs the link token the guest returned with.

## Rules (required)

- Show prices exactly as the API gives them (pence, as the total the guest pays). Never add VAT, fees or "from" prices of your own.
- Never collect card details. Checkout always sends the guest to Stripe's payment page through POST /checkout.
- Before a guest pays, link the park's Ticket terms and say who they are buying from (seller on GET /park).
- Show the park's Privacy and Ticket terms pages with every entry in their notices, after the park's own words.
- After payment, use Parkstack's confirmation page (the default), or read GET /orders/{orderNumber} and show every ticket's QR code.
- While tickets.onSaleOnline is false, show nothing to buy.
- Show refusal messages to guests as they are: they are written for them.
- Cache answers for a minute, as Cache-Control says. A published change appears within about a minute.
- Call the API from your server where you can. A key used from browsers must list only your own website addresses, so another site cannot borrow it.
- Use the same addresses as Parkstack's guest site (SITE_API_GUEST_PATHS), such as /explore/attractions/{slug}. When the park switches to its own website, Parkstack sends old links and search results to the same address on yours, and GET /redirects answers in these addresses.
- Do not invent content: show only what the park published, and leave out what is empty.

## Text and images

- Descriptions, answers and page text are Markdown with bold, links and bulleted lists only. Render it safely (no raw HTML).
- Images have `url`, `width`, `height`, `alt` and `srcset`. `alt: null` means decorative: use `alt=""`.
- Dates are `YYYY-MM-DD` and times `HH:mm` on the park's clock (`timezone` on `/park`).

## Page addresses

Use Parkstack's guest-site addresses, so links and search results keep working when the park moves to this site:

- `/`: Homepage
- `/explore/attractions`: Attractions (GET /attractions)
- `/explore/attractions/{slug}`: One attraction
- `/explore/food-and-drink`: Food and drink
- `/explore/food-and-drink/{slug}`: One food or drink place
- `/explore/events`: Events
- `/explore/events/{slug}`: One event
- `/plan-your-visit/opening-hours`: Opening hours
- `/plan-your-visit/shops-and-facilities`: Shops and facilities
- `/plan-your-visit/shops-and-facilities/{slug}`: One shop or facility
- `/plan-your-visit/attraction-availability`: Attraction closures
- `/plan-your-visit/faq`: Questions and answers
- `/{slug}`: A page, such as /about, /privacy and /ticket-terms
