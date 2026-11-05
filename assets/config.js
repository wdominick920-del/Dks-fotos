'use strict';
// Public configuration only. Never put API keys or client feedback in this file.
window.DKS_CONFIG = Object.freeze({
  enquiryEndpoint: '', // Optional verified Formspree endpoint: https://formspree.io/f/FORM_ID
  reviewEndpoint: '',
  travel: Object.freeze({ freeReturnKm: 10, ratePerKm: 4 }),
  travelText: 'Enter the total RETURN distance. Up to and including 10 km return is free. Above 10 km return, the entire return distance is charged at R4/km (20 km return = R80).'
});
