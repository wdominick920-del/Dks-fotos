# Validation of website improvements

Executed with installed Chromium through Python Playwright against an HTTP server mounted under `/Dks-fotos/`, matching GitHub Pages path behavior. No real enquiry, review or email was sent.

- Rendered all seven pages at 360, 390, 430, 768 and 1366 pixels: 35 page/width combinations. Checked no horizontal overflow, one main heading, loaded page photographs, mobile-menu open/Escape-close states and form text at least 16px. Captured 35 screenshots; inspected representative review, contact, portfolio and calculator screenshots. Keyboard focus styling is visible. These are browser viewport checks, not physical-device or screen-reader certification.
- Photo viewer: opening, next via arrow key, modal keyboard focus containment, Escape closing and focus restoration passed.
- Travel calculator: 0/10 km = R0; 11 km = R44; 20 km = R80; blank/negative/invalid values produce zero travel. Wedding + two extra hours + 20 km = R4080, R1224 booking fee, R2856 balance. Portrait time and photo add-ons, category switching and reset passed.
- All 28 individual packages have enquiry links; package selection reaches the contact message. Itemised quote data reaches encoded draft links.
- Enquiries: required-field behavior, long text and special-character encoding, retained input, exact draft message and simulated service success/failure passed.
- Reviews: required-field behavior, native radio keyboard rating, no-publication default, optional permission/display-name payload, exact draft message and simulated confirmed-service success message passed. Publication is never automatic.
- Floating shortcut hides when forms, footer or quote summary intersect the viewport. At widths under 1280px it uses document flow to avoid covering content. Verified hidden while a review form is visible.
- All local page links and anchors resolve; IDs are unique. JavaScript syntax checks and Git whitespace checks passed. Responsive WebP image variants generated; originals remain unchanged.

Not verified: real Formspree delivery, automatic acknowledgement delivery, email-app handoff, WhatsApp-app delivery, physical phones and screen readers. No submission endpoint or acknowledgement automation is enabled. See FORM_SETUP.md.

Screenshots are retained outside the public checkout at `/workspace/dks-review-artifacts/`. Test inputs and intercepted service responses were temporary synthetic data, not client feedback, and were not added to the repository.

## Final photo upload

The uploaded ZIP contained eight images. Six new photographs were added; two were byte-identical to existing portfolio assets. The portfolio now shows eleven photographs, without duplicate entries. New originals are preserved with responsive 640/1280px and 1920px viewer WebP copies. Personal Instagram @dominick.w09 is linked from Behind the lens. Final checks repeated against all seven pages and five viewport widths after image integration.

## Merged Packages & Quote workflow

Tested all 28 package-to-enquiry-to-edit round trips, service matching, exclusive keyboard-accessible package selection, and full estimate preservation in email and WhatsApp drafts. A Signature Wedding with two extra hours, 20 km return travel and priority delivery totals R8230 (R2469 booking fee; R5761 balance). Selections survive the edit-package link. Checked six main pages for overflow and heading count at 360, 390, 430, 768 and 1366 pixels, captured merged-page screenshots, and inspected desktop and mobile captures. Tested old quote URL redirection with selections, portrait add-ons and reset. No real enquiry was submitted.

## Separate rounded Packages and Quote Calculator

Packages and the calculator are separate again. Tested all 28 catalogue → calculator → enquiry → edit flows. Verified native radio selection cards for all services and extras, keyboard arrow navigation, accurate wedding and portrait extras, 30%/70% calculations, itemised WhatsApp handoff, restored selections and reset. Both pages rendered without overflow at 360, 390, 430, 768 and 1366 pixels; menu open/Escape-close and separate navigation links passed. Confirmed the calculator exposes custom choice groups rather than visible select dropdowns. Inspected mobile calculator and desktop catalogue screenshots. Prices remain unchanged.

## Themed contact calendar and release checks

Added a custom black-and-gold contact date picker with a dark native date-input fallback when JavaScript is unavailable. Rendered all seven pages at 360, 390, 430, 768 and 1366 pixels, checked no horizontal overflow and mobile menu behavior. Tested choosing/clearing dates, Escape cancellation, focus restoration and Tab containment; arrow-key, Home/End and month navigation; leap-day transition from 31 January 2032 to 29 February 2032; and date preservation in enquiry email drafts. Rechecked review validation, keyboard ratings, optional publication permission, gallery arrow navigation and Escape/focus restoration. Repeated all 28 package/calculator/enquiry/edit flows and quote calculations. Screenshots captured for the calendar at all five widths; mobile and desktop captures inspected. These are Chromium viewport/keyboard checks, not physical-phone or screen-reader certification. No real enquiry or review was sent.
