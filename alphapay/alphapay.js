/*
 * AlphaPay
 *
 * This is a minimalistic reference implementation of a Payment Handler.
 */

/**
 * Helper class that encapsulates a new promise and its resolve and reject
 * handlers.
 */
class PromiseResolver {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

console.log("AlphaPay payment handler demo. This is the Service Worker.");

// This must be in the "supported_origins" list in payment-manifest.json.
const origin = "https://pay.stillmuchtoponder.com";

// This points to the location of payment-manifest.json.
const methodName = `${origin}/alphapay`;

// These are global because they are initialized in the 'paymentrequest' event
// handler and used later to resolve the payment request.
let paymentRequestEvent = undefined;
let paymentRequestResolver = undefined;

// Register a listener to handle "paymentrequest" event. This event is triggered
// when user selects AlphaPay in the browser payment sheet to handler the active
// Payment Request. This is the main entry point for the payment handler.
self.addEventListener("paymentrequest", e => {
  paymentRequestEvent = e;
  console.log("Received PaymentRequest: ", paymentRequestEvent);

  paymentRequestResolver = new PromiseResolver();
  e.respondWith(paymentRequestResolver.promise);

  // A payment handler app can be associated with more than one payment method
  // if it is listed in the 'default_applications' list of multiple payment
  // manifests. Use PaymentRequestEvent.methodData[] to check which method is
  // requested and handle appropriately.
  //
  // PaymentRequestEvent.methodData[] is the set intersection of payment methods
  // supported by this payment handler and the payment methods requested by the
  // merchant website. See
  // https://w3c.github.io/payment-handler/#dfn-methoddata-population-algorithm
  //
  // For simplicity, this example assumes there is only one matching method.
  if (e.methodData.length != 1) {
    paymentRequestResolver.reject(
      'Unexpected number of matched payment methods: ' +
      e.methodData.methodData.length);
    return;
  }

  if (e.methodData[0].supportedMethods != methodName) {
    paymentRequestResolver.reject('Invalid payment method: ' +
      e.methodData[0].supportedMethods);
    return;
  }

  const additionalPaymentMethodData = Object.freeze({
    ...{
      ui: 'default',
    },
    ...e.methodData[0].data,
  });

  let uiURL = `${origin}/alphapay/default/ui.html`;
  
  // Reproduction example for crbug.com/938491
  console.log(`Using UI variation: ${additionalPaymentMethodData.ui}`);
  switch (additionalPaymentMethodData.ui) {
    case 'crbug938491':
      uiURL = `${origin}/alphapay/crbug938491/ui.html`;
      break;
    case 'oauth':
      uiURL = `${origin}/alphapay/oauth/ui.html`;
      break;
    case 'webauthn':
      uiURL = `${origin}/alphapay/webauthn/ui.html`;
      break;
    default:
      break;
  }
      
  e.openWindow(uiURL)
      .then(windowClient => {
        if (!windowClient) {
          paymentRequestResolver.reject('Failed to open window');
        }
      })
      .catch(err => {
        paymentRequestResolver.reject(err);
      });
});

/**
 * Handles incoming communication from payment app UI.
 */
self.addEventListener('message', e => {
  // ui.html sends this message when it finishes loading.
  if (e.data == 'payment_app_window_ready') {
    sendPaymentRequest();
    return;
  };

  // ui.html sends these messages when it finishes processing payment.
  if (e.data.methodName) {
    paymentRequestResolver.resolve({
      ...e.data,
      ...{ methodName }
    });
  } else {
    paymentRequestResolver.reject(e.data);
  }
});

/**
 * Sends the payment request to ui.html
 */
function sendPaymentRequest() {
  // TODO: The returned |windowClient| from .openWindow() is not used because
  // the window may have changed if the page is refreshed. Add more bookkeeping
  // to make sure message is only sent to the correct window.
  let options = {
    includeUncontrolled: false,
    type: 'window',
  };

  if (!paymentRequestEvent) {
    console.log('No active payment request');
    return;
  }

  clients.matchAll(options).then(clientList => {
    clientList.forEach(client => {
      client.postMessage({
        total: paymentRequestEvent.total,
        methodData: paymentRequestEvent.methodData,
      });
    });
  });
}

