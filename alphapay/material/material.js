// This checkout flow may be triggered by more than one payment handler. For
// simplicity, this demo assumes there will ever only be one active payment
// handler communicating with this checkout page.
let paymentRequestClient = undefined;
let methodData = undefined;

/**
 * Receives communication from the paymenter handler.
 */
navigator.serviceWorker.addEventListener('message', e => {
  paymentRequestClient = e.source;
  methodData = e.data.methodData;
  console.log(JSON.stringify(e.data, undefined, 2));
});

/**
 * Class to manage the UI.
 */
class UI {
  static show(view) {
    const views = ['view-selection', 'view-thank-you'];
    views.forEach(name => {
      if (name != view) {
        document.querySelector(`#${name}`).style.display = 'none';
      }
    });
    document.querySelector(`#${view}`).style.display = 'block';
  }

  static setGivenName(name) {
    document.querySelector('#given-name').innerText = name;
  }
}

/**
 * Main Entry Point
 */
function startApp() {
  // Notifies ServiceWorker that this payment handler is ready.
  navigator.serviceWorker.controller.postMessage('payment_app_window_ready');

  // Initiate Google Signin.
  let ux_mode = 'redirect';
  gapi.load('auth2', () => {
    // Retrieve the singleton for the GoogleAuth library and set up the client.
    auth2 = gapi.auth2.init({
      client_id: '743479791773-n9cjoou983g4l4hf3061b6eidj3r1161.apps.googleusercontent.com',
      cookiepolicy: 'single_host_origin',
      // Use redirect UX instead of popup.
      ux_mode,
      // Redirect back to this page with an extra parameter.
      redirect_uri: `${location.origin}${location.pathname}?secondrun`,
    });

    // Wait for GoogleAuth to finish initializing. Then update the UI accordingly.
    auth2.then(() => {
      document.querySelector('#btn-done').addEventListener('click', () => {
        done();
      });
      document.querySelector('#btn-back').addEventListener('click', () => {
        window.close();
      });
      updateUI();
    });
  });
}

function updateUI() {
  if (location.search === '?secondrun' && auth2.isSignedIn.get()) {
    // User is signed in.
    let profile = auth2.currentUser.get().getBasicProfile();
    console.log(`Hello ${profile.getName()}`);
    UI.setGivenName(profile.getGivenName());
    UI.show('view-thank-you');
    return;
  }

  // User is not signed in.
  attachSignin(document.querySelector('#btn-signin'));
  UI.show('view-selection');
}

function attachSignin(element) {
  console.log(element.id);
  auth2.attachClickHandler(element, {},
      googleUser => {
        updateUI();
      },
      error => {
        log(ERROR, JSON.stringify(error, undefined, 2));
      });
}

/**
 * Notify ServiceWorker that this request is done.
 */
function done() {
  console.assert(paymentRequestClient);

  let paymentAppResponse = {
    methodName: methodData,
    details: {
      alpha_pay_token_id: 'ALPHAPAY1234',
      message: "Thank you for trying Material Demo!",
    }
  };
  paymentRequestClient.postMessage(paymentAppResponse);
  window.close();
}