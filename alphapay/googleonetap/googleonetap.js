/**
 * Demo for using Google One-Tap Sign-In inside a payment handler.
 * Adapted from https://developers.google.com/identity/one-tap/web/overview
 */

/**
 * Main entry point
 */
function init() {
  window.onGoogleYoloLoad = (googleyolo) => {
    tryAutoSignin(googleyolo);
    
    // Attach event handlers
    document.querySelector('#button-signout').addEventListener('click', event => {
      googleyolo.disableAutoSignIn().then(() => {
        console.log('Auto signin disabled.');
      });
    }, false);
  };
}

/**
 * Try to auto signin a user. Returns a Promise that resolves if auto-signin is successful.
 */
function tryAutoSignin(googleyolo) {
  const retrievePromise = googleyolo.retrieve({
    supportedAuthMethods: [
      'https://accounts.google.com',
      'googleyolo://id-and-password',
    ],
    supportedIdTokenProviders: [
      {
        uri: 'https://accounts.google.com',
        clientId: '743479791773-n9cjoou983g4l4hf3061b6eidj3r1161.apps.googleusercontent.com',
      },
    ],
  });

  return retrievePromise.then(credential => {
    if (credential.password) {
      console.log(credential);
    } else {
      // A Google Account ID Token is retrieved.
      console.log('Got ID token: ', credential);
    }
  }).catch(error => {
    console.log('Error: ', error);
  });
}