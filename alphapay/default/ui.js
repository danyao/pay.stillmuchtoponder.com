// This checkout flow may be triggered by more than one payment handler. For
// simplicity, this demo assumes there will ever only be one active payment
// handler communicating with this checkout page.
let paymentRequestClient = undefined;

/**
 * Receives communication from the paymenter handler.
 */
navigator.serviceWorker.addEventListener('message', e => {
  paymentRequestClient = e.source;
  methodData = e.data.methodData;
  document.querySelector('#details').innerText = JSON.stringify(
    e.data, undefined, 2);
});

/**
 * Notifies the payment handler that the checkout window is ready.
 */
function onPageReady() {
  navigator.serviceWorker.controller.postMessage('payment_app_window_ready');
}

/**
 * Completes the payment and updates payment handler.
 */
function pay() {
  if (!paymentRequestClient) {
    updateStatus('Unable to pay. Missing paymentRequestClient.');
    return;
  }

  let paymentAppResponse = {
    methodName: 'Dummy value',
    details: {
      alpha_pay_token_id: "ALPHAPAY1234",
      message: "Thank you for using AlphaPay!",
    }
  };
  paymentRequestClient.postMessage(paymentAppResponse);
  window.close();
}

/**
 * Writes a status message to screen.
 */
function updateStatus(message) {
  document.querySelector('#status').innerText = message;
}
