# DKs Photography

A responsive six-page business website built with HTML, CSS and JavaScript. Original photography, prices, booking terms and the quote calculator are retained from the supplied website. No build step or external dependencies are required.

## Run locally

From this directory:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Pages: `index.html`, `portfolio.html`, `packages.html`, `quote.html`, `booking.html`, and `contact.html`. Deploy the entire directory to any static web host.

The contact form validates the enquiry and opens a prefilled email addressed to `dksphotography1@gmail.com`. The visitor must send it from their email app. It does not store enquiries or submit them to a server. Direct website delivery requires an email service or backend configuration.

Shared styling is in `assets/styles.css`, navigation and contact behavior in `assets/site.js`, and estimate logic in `assets/calculator.js`. Photographs are local assets extracted from the uploaded HTML.

## Feedback and configuration

The seventh page, `review.html`, collects private feedback with optional publication permission. Both forms default to email/WhatsApp drafts. See [form setup and moderation instructions](docs/FORM_SETUP.md) for optional Formspree activation and acknowledgement emails. No direct submission service is configured by default.

## Packages and enquiries

`packages.html` is the separate package catalogue. Each package links to `quote.html` with its service and package selected. The quote calculator uses rounded service choices, package cards and extras selectors. The enquiry form preserves the itemised estimate, and its edit link restores selections in the calculator. Current prices are maintained in `assets/calculator.js` and the catalogue markup.

## Photo privacy and travel

`privacy.html` provides the readable photo privacy notice, a separate optional promotional-use choice form and change/withdrawal drafts. Consent records are prepared for private email/WhatsApp delivery and client copy/download; no direct consent service is configured. See `docs/PRIVACY_IMPLEMENTATION.md` for source and operational limitations. The first 20 km of total return travel are included; only distance beyond 20 km is charged at R4/km, configured in `assets/config.js`.

## Enquiry references

Automatic DKS enquiry references are included in Gmail and WhatsApp drafts, with a reference-prefilled optional photo-consent link. The privacy page also accepts an existing reference. See `docs/REFERENCE_WORKFLOW.md` for how references are retained and the distinction between a prepared request and a confirmed booking or verified consent.
