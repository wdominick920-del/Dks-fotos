# DKs Photography

A responsive eight-page business website built with HTML, CSS and JavaScript. Original photography, prices, booking terms and the quote calculator are retained from the supplied website. No build step or external dependencies are required.

## Run locally

From this directory:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Pages: `index.html`, `portfolio.html`, `packages.html`, `quote.html`, `booking.html`, `contact.html`, `review.html`, and `privacy.html`. Deploy the entire directory to any static web host.

The contact form validates the enquiry and opens a prefilled email addressed to `dksphotography1@gmail.com`. The visitor must send it from their email app. It does not store enquiries or submit them to a server. Direct website delivery requires an email service or backend configuration.

Shared styling is in `assets/styles.css`, navigation and contact behavior in `assets/site.js`, and estimate logic in `assets/calculator.js`. Photographs are local assets extracted from the uploaded HTML.

## Feedback and configuration

The seventh page, `review.html`, collects private feedback with optional publication permission. Both forms default to email/WhatsApp drafts. See [form setup and moderation instructions](docs/FORM_SETUP.md) for optional Formspree activation and acknowledgement emails. No direct submission service is configured by default.

## Packages and enquiries

`packages.html` is the separate package catalogue. Each package links to `quote.html` with its service and package selected. The quote calculator uses rounded service choices, package cards and extras selectors. The enquiry form preserves the itemised estimate, and its edit link restores selections in the calculator. Current prices are maintained in `assets/calculator.js` and the catalogue markup.

## Photo privacy and travel

`privacy.html` provides the readable photo privacy notice, a separate optional promotional-use choice form and change/withdrawal drafts. Consent records are prepared for private email/WhatsApp delivery and client copy/download; no direct consent service is configured. See `docs/PRIVACY_IMPLEMENTATION.md` for source and operational limitations. The first 20 km of total return travel are included; only distance beyond 20 km is charged at R4/km, configured in `assets/config.js`.

## Enquiry references

Automatic DKS enquiry references are included in email and WhatsApp drafts. The optional photo-consent link is kept in a secondary enquiry-reference section. The privacy form accepts a known reference or event date in one step. See `docs/REFERENCE_WORKFLOW.md` for how references are retained and the distinction between a prepared request and a confirmed booking or verified consent.

## Usability draft — 12 November 2026

Main navigation is Home, Portfolio, Prices and Contact. The portfolio shows photographs before the personal introduction. Prices links prominently to the separate calculator; the calculator has one enquiry route to contact. Ordinary opening messages are concise; full itemised records remain expandable and copyable. Standard mailto links support the client’s email app, with optional Gmail and copy-address controls.

The travel input is **one-way kilometres**. Return travel is calculated at twice that distance, with the existing 20 km return allowance and R4/km rate unchanged. New selection URLs include `distanceMode=oneway`. Legacy URLs without that marker interpret `qdistance` as return kilometres and divide it by two for the new input. Do not remove this compatibility conversion.

Contact requires an email address or usable phone number. Entered details are retained in the browser history entry during quote editing, rather than written into URL parameters or public files. Only the public updated estimate passes temporarily through sessionStorage; consent records are never stored there. Browser storage restrictions may limit editing restoration; ordinary enquiry links and form entry still work.

Run the browser regression with `python3 tests/usability.py` (requires Python Playwright and Chromium at `/usr/bin/chromium`). Screenshots are written outside the public checkout under `/workspace/dks-review-artifacts/`. This usability update includes four additional supplied wedding/detail photographs; publishing status is recorded in the delivery report.
