// URL of the payment handler service worker.
const kServiceWorkerURL = 'alphapay.js';

/**
 * Checks if AlphaPay payment handler is installed.
 */
function checkInstallStatus() {
  navigator.serviceWorker.getRegistration(kServiceWorkerURL)
    .then(registration => {
      if (registration) {
        // AlphaPay service worker is installed.
        if (registration.paymentManager) {
          // Always update payment handler.
          registration.update();
        } else {
          // Unexpected configuration: uninstall service worker.
          uninstallHandler();
        }
      }
      updateInstallStatus(!!registration);
    });
}

/**
 * Updates the UI based on |installStatus|.
 */
function updateInstallStatus(installed) {
  let installStatus = document.querySelector('#install-status');
  let installButton = document.querySelector('#install');
  let uninstallButton = document.querySelector('#uninstall');

  document.querySelector('#install-status').innerText = installed
      ? 'Payment handler is installed.'
      : 'Payment handler is not installed.';

  if (installed) {
    installStatus.innerText = 'Payment handler is installed';
    installButton.setAttribute('disabled', 'disabled');
    uninstallButton.removeAttribute('disabled');
  } else {
    installStatus.innerText = 'Payment handler is not installed';
    installButton.removeAttribute('disabled');
    uninstallButton.setAttribute('disabled', 'disabled');
  }
}

/**
 * Update error message.
 */
function showError(errorMessage) {
  document.querySelector('#error').innerText = errorMessage;
}

function showDetails(response) {
  let message = '';
  if (response.toJSON) {
    message = JSON.stringify(response, undefined, 2);
  }
  document.querySelector('#details').innerText = message;
}

/**
 * Installs the payment handler.
 */
function installHandler() {
  navigator.serviceWorker.register(kServiceWorkerURL).then(registration => {
    if (!registration.paymentManager) {
      // Payment app functionality is unavailable for some reason. Unregister
      // right away.
      registration.unregister().then(success => {});
      showError('Payment app capability not present.');
      return;
    }
    // FIXME: can addInstruments be implemented inside the payment handler?
    addInstruments(registration).then(() => {
      updateInstallStatus(true);
    }).catch(error => {
      showError(error);
    });;
  }).catch(error => {
    showError(error);
  });
}

/**
 * Uninstalls the payment handler.
 */
function uninstallHandler() {
  navigator.serviceWorker.getRegistration(kServiceWorkerURL)
    .then(registration => {
      registration.unregister().then(success => {
        updateInstallStatus(!success);
      });
    });
}

/**
 * Register default instruments for the payment handler.
 */
function addInstruments(registration) {
  registration.paymentManager.userHint = 'AlphaPay demo';
  return registration.paymentManager.instruments.set(
    'what-is-this-string?',
    {
      name: 'My AlphaPay Account',
      icons: [{
        src: '/payment/alphapay/images/alpha_32.png',
        size: '32x32',
        type: 'image/png',
      }],
      method: 'https://pay.stillmuchtoponder.com/alphapay',
    });
}

/**
 * Initiate buy flow.
 */
function buy() {
  if (!window.PaymentRequest) {
    showError('PaymentRequest is not supported.');
    return;
  }

  let methodData = [{
    supportedMethods: 'https://pay.stillmuchtoponder.com/alphapay'
  }];
  let details = {
    total: {
      label: 'Total',
      amount: {
        currency: 'USD',
        value: '0.10',
      },
    },
  };
  let request = new PaymentRequest(methodData, details);
  request.show().then(response => {
    response.complete('success').then(() => {
      showDetails(response);
    });
  });
}
