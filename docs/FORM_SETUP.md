# Enquiries and private client feedback

The default site prepares email or WhatsApp drafts. Visitors must press Send in their app. Draft preparation does not confirm receipt, and neither enquiries nor reviews are written to browser storage or public files. Entered details stay in the form if handoff or a network request fails. Review permission is optional and separate from feedback; nothing publishes automatically.

## Optional direct submission (Formspree)

1. Create separate enquiry and review forms at Formspree, verify the owner's email, and check the current free-plan quota and privacy terms.
2. Add the real HTTPS endpoints to `enquiryEndpoint` and `reviewEndpoint` in `assets/config.js`. These form identifiers are public; never add API keys. Blank endpoints retain draft-only behavior. Restrict accepted origins to the deployed GitHub Pages site in the service settings if supported.
3. Test an owner-controlled submission on the deployed site, check delivery in the private dashboard and inbox, and check spam handling. The website requires both a successful HTTP response and JSON `ok: true` before displaying the confirmed-submission message. Errors and unconfirmed responses preserve input and show draft alternatives. Never connect a review form to automatic website publication.
4. Keep feedback and client contact details in the private service/inbox. Only manually add a genuine review to the public site after verifying explicit permission and its chosen display name. Do not commit form exports, test submissions or private feedback. Publication permission must not be a condition for receiving feedback.

## Optional acknowledgement email

No acknowledgement is currently enabled. Availability may depend on the service plan. If the verified provider account supports automatic replies, configure it on the enquiry form only, set recipient from the validated `email` field, verify sender settings and test delivery before enabling. Do not configure a review autoresponder because the review form does not request an email address. Acknowledgement must not confirm booking or availability.

Subject: Thank you for your DKs Photography enquiry

Thank you for your enquiry! I appreciate you considering DKs Photography to capture your story. I’ll review your details and get back to you to discuss availability and the next steps. Your booking is confirmed only after the quotation and booking requirements have been agreed.

## Travel policy

The first 20 km of return travel from our Stellenbosch base are included. Additional distance is charged at R4 per kilometre. Travel costs are confirmed in your quotation before booking.

Formula: max(0, return km - 20) × R4. Examples: 0/20 km = R0; 21 km = R4; 30 km = R40; 40 km = R80; 60 km = R160.

## Images and introductions

Dominick's supplied first-person copy is displayed without a portrait. No person in event photographs is identified as Dominick. The uploaded ZIP supplied six new photographs, now included alongside the five existing portfolio photographs. Two ZIP images were duplicates of existing photos and are not displayed twice. All eleven photos were visually checked and captioned. There are no invented reviews or aggregate ratings.
