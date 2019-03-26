/**
 * Demo for using Google One-Tap Sign-In inside a payment handler.
 * Adapted from https://developers.google.com/identity/one-tap/web/overview
 */

// OAuth client ID
const clientId = '743479791773-n9cjoou983g4l4hf3061b6eidj3r1161.apps.googleusercontent.com';

/**
 * Main entry point
 */
function init() {
  window.onGoogleYoloLoad = (googleyolo) => {
    tryAutoSignin(googleyolo);
  };
}

/**
 * Try to auto signin a user. Returns a Promise that resolves if auto-signin is successful.
 */
function tryAutoSignin(googleyolo) {
  const retrievePromise = googleyolo.hint({
    supportedAuthMethods: [
      'https://accounts.google.com',
      'googleyolo://id-and-password',
    ],
    supportedIdTokenProviders: [
      {
        uri: 'https://accounts.google.com',
        clientId: `${clientId}`
      },
    ],
  });

  return retrievePromise.then(credential => {
    log(INFO, `Retrieved credential: ${JSON.stringify(credential, undefined, 2)}`);
  }).catch(error => {
    log(ERROR, `Failed to retrieve credential: ${error.message}`);
  })
}