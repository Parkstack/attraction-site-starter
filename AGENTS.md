# Building a park's website or app on the Parkstack API

This website or app shows a visitor attraction's details and sells its tickets through the Parkstack API. The park edits everything in Parkstack; this site or app only reads it. Do not hard-code park content, and never make any up: every attraction, price, opening time and event comes from the API.

## Start here

1. You need the park's site key (it starts `pk_live_`). If you were not given one, ask for it; to look around first, use the demo key below.
2. Call `GET https://api.parkstack.net/site/v1/park` with `Authorization: Bearer <key>` and check `name` is the park you are building for. If you cannot reach the internet, stop and say so: never carry on with made-up data.
3. Read the rules below, then build each page or screen from its address in Addresses: opening hours from /hours, attractions from /attractions, and so on.
4. Sell tickets with GET /tickets, GET /tickets/availability and POST /checkout. Guests always pay on Stripe's page.
5. When something is refused, the answer's `code` says why and `message` says what to do. The full reference with real example answers is https://parkstack.net/developers/reference.

## Which park

- The key decides the park. Use the key you were given for the park you are building for, from an environment variable or the app's configuration.
- The public demo key `pk_live_demoRiversideParkstackSiteApiKey` always reads Riverside Adventure Park, a demonstration park. Use it only when you were given no key, or to try checkout without paying; never to build another park's site or app.
- Before writing any code, call `GET /park` with the key and check that `name` is the park you were asked to build for. If it is not, stop and say so.

## Calling the API

- Base address: `https://api.parkstack.net/site/v1`
- Send the site key on every request: `Authorization: Bearer <key>`. Read it from an environment variable (for example `PARKSTACK_SITE_KEY`); never commit a park's key.
- With no key yet, the demo key (above) lets you build against real answers; swap in the park's key before showing it to the park.
- On a website, call from the server (server components, route handlers, server actions) where possible. A phone app calls the API itself (see Building a phone app).
- Answers are JSON. Refusals are `{ code, message }`; react to `code`, show `message` to guests.
- Cache for 60 seconds (Cache-Control says so). Each key may make 120 or more requests a minute.
- Full reference with example answers: https://parkstack.net/developers/reference (OpenAPI: https://parkstack.net/developers/openapi.json). Guides: https://parkstack.net/developers/guides.
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
- Call the API from your server where you can. A key used from browsers must list only your own website addresses, so another site cannot borrow it. A phone app uses a key made for an app.
- Use the same addresses as Parkstack's guest site (SITE_API_GUEST_PATHS), such as /explore/attractions/{slug}. When the park switches to its own website, Parkstack sends old links and search results to the same address on yours, and GET /redirects answers in these addresses.
- Never invent park content, not even as sample data for previews or tests: no made-up attractions, prices, hours or events. Show only what the API returns, and leave out what is empty. For previews and tests use a real answer (the example answers in the reference are real Riverside answers). If the API cannot be reached, say so rather than filling the gap.

## Text and images

- Descriptions, answers and page text are Markdown with bold, links and bulleted lists only. Render it safely (no raw HTML).
- Images have `url`, `width`, `height`, `alt` and `srcset`. `alt: null` means decorative: use `alt=""`.
- Dates are `YYYY-MM-DD` and times `HH:mm` on the park's clock (`timezone` on `/park`).

## Building a phone app

- Ask the park's owner for a key made for a phone app (Park settings → Your own website → Make a key → A phone app). Its limit applies to each phone. It only reads what the park published, so it may be built into the app, but never commit a park's key to a public repository.
- The app reads the park's content from the API when it runs: nothing about the park is built into the app except its key. Keep the last answers on the phone and show them when there is no signal, with when they were last updated.
- Checkout: POST /checkout without `returnUrl` or `cancelUrl`. Keep the answer's `orderNumber` and `linkToken` on the phone (the iOS Keychain, or Android's encrypted storage). Open `url` in the system's in-app browser (SFSafariViewController or ASWebAuthenticationSession on iOS, Custom Tabs on Android), never an embedded web view, so Apple Pay and Google Pay work.
- When the guest closes the payment page or comes back to the app, read GET /orders/{orderNumber}?t={linkToken} every few seconds while `status` is PENDING. At PAID, show the tickets. If it is still PENDING after about two minutes, say the tickets will also arrive by email. Never offer to pay again for the same order.
- Tickets: draw each ticket's `qrPayload` as a large QR code on a white background, one per guest, and keep them on the phone so they open with no signal at the gate. A refunded ticket has no QR code.
- Guests pay on Stripe's page for tickets used at the park, so do not use in-app purchase for them.
- With the demo key, checkout answers with `demo: true` and no order: show its `url`, which explains that nothing was charged.

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
