/*
 * Minimalistic OAuth + OpenIDConnect implementation.
 */

const ERROR='error';
const INFO='info';

/**
 * Helper function to append a log message to screen.
 */
function log(type, message) {
  let output = document.querySelector('#logs');
  if (!output) {
    document.body.insertAdjacentHTML('beforeend', '<div id="logs"></div>');
    output = document.querySelector('#logs');
  }
  output.insertAdjacentHTML('beforeend', `<pre class="${type}">${message}</pre>`);
}

/**
 * Generate a nonce to be used in OAuth flow.
 */
function getNonce() {
  let buffer = new Uint16Array(8);
  window.crypto.getRandomValues(buffer);
  return btoa(buffer);
}

let _googleSigninURL = undefined;

/**
 * Construct a redirect URL to signin with Google and saves it in _googleSigninURL.
 */
function buildGoogleSigninURL() {
  // Normally this nonce should be generated on the server side for this session
  // and used to validate the returned access token.
  let nonce = getNonce();
  log(INFO, `Using nonce ${nonce}.`);

  let googleAuthEndpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
  // Credential API client ID configured on Google Cloud Platform Dashboard.
  let clientID = '743479791773-n9cjoou983g4l4hf3061b6eidj3r1161.apps.googleusercontent.com';
  let redirectURL = 'https://pay.stillmuchtoponder.com/alphapay/oauth/ui.html';

  let url = [
    `${googleAuthEndpoint}?client_id=${clientID}`,
    `redirect_uri=${encodeURI(redirectURL)}`,
    `scope=openid`,
    `response_type=id_token`,
    `response_mode=query`,
    `nonce=${nonce}`
  ].join('&');
  log(INFO, `Built request: ${url}`);

  _googleSigninURL = url;
}

/**
 * Redirect to signin with Google
 */
function googleSignIn() {
  console.assert(_googleSigninURL.length, 'Must call buildGoogleSigninURL() first.');
  window.location = _googleSigninURL;
}

/**
 * Processes OpenIDConnect token from Google.
 */
function processGoogleResponse(params) {
  let idToken = params.get('id_token');
  log(INFO, `Received JWT: ${idToken}`);
  document.querySelector('#google-signin').setAttribute('disabled', 'disabled');
}

/**
 * Main entry point. Called when the page finished loading and parsing.
 */
function init() {
  // Check if this is the redirect path of OAuth.
  let hash = window.location.hash.substr(1);
  if (hash) {
    let params = new URLSearchParams(hash);
    if (params.has('id_token')) {
      processGoogleResponse(params);
      return;
    }
  }
  
  buildGoogleSigninURL();
  let googleSigninButton = document.querySelector('#google-signin');
  googleSigninButton.removeAttribute('disabled');
  googleSigninButton.addEventListener('click', () => { googleSignIn(); });
}