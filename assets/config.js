'use strict';
// Public configuration only. Never put API keys or client feedback in this file.
window.DKS_CONFIG = Object.freeze({
  enquiryEndpoint: '', // Optional verified Formspree endpoint: https://formspree.io/f/FORM_ID
  reviewEndpoint: '',
  travel: Object.freeze({ freeReturnKm: 20, ratePerKm: 4 }),
  travelText: 'The first 20 km of return travel from our Stellenbosch base are included. Additional distance is charged at R4 per kilometre. Travel costs are confirmed in your quotation before booking.'
});
