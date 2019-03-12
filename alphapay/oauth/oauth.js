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

/**
 * Redirect URL to signin with Google OAuth.
 */
function oAuthWithGoogle() {
  // Normally this nonce should be generated on the server side for this session
  // and used to validate the returned access token.
  nonce = getNonce();

  let googleAuthEndpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
  // Credential API client ID configured on Google Cloud Platform Dashboard.
  let clientID = '743479791773-n9cjoou983g4l4hf3061b6eidj3r1161.apps.googleusercontent.com';
  let redirectURL = 'https://pay.stillmuchtoponder.com/alphapay/oauth/ui.html';

  let url = [
    `${googleAuthEndpoint}?client_id=${clientID}`,
    `redirect_uri=${encodeURI(redirectURL)}`,
    `scope=${encodeURI('email profile openid')}`,
    `response_type=id_token`,
    `response_mode=query`,
    `nonce=${nonce}`
  ].join('&');
  log(INFO, `Built request: ${url}`);

  window.location = url;
}

/**
 * Processes OpenIDConnect token from Google.
 */
function processGoogleResponse(params) {
  let idToken = params.get('id_token');
  log(INFO, `Received JWT: ${idToken}`);

  const userData = parseJWT(idToken);
  if (userData) {
    log(INFO, `JWT Payload:
    ${JSON.stringify(userData, undefined, 2)}`);
    document.querySelector('#google-signin').setAttribute('disabled', 'disabled');
  }
}

/**
 * Attempts to parse a JSON Web Token. Return null if parsing fails.
 */
function parseJWT(token) {
  let parts = token.split('.');
  if (parts.length != 3) {
    log(ERROR, 'Token is not a JWT.');
    return null;
  }

  const [header, payload, signature] = parts;
  try {
    return JSON.parse(atob(payload));
  } catch (e) {
    log(ERROR, `Failed to parse JWT payload: ${e.message}`);
  }
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
  
  let googleSigninButton = document.querySelector('#google-signin');
  googleSigninButton.removeAttribute('disabled');
  googleSigninButton.addEventListener('click', () => { oAuthWithGoogle(); });
}