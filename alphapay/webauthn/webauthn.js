/*
 * Minimalistic WebAuthn implementation.
 * Adapted from https://fidoalliance.org/webauthn-tutorial/
 */

const ERROR='error';
const INFO='status';

/**
 * Helper function to append a log message to screen.
 */
function log(type, message) {
  let output = document.querySelector('#log');
  if (!output) {
    document.body.insertAdjacentHTML('beforeend', '<div id="log"></div>');
    output = document.querySelector('#log');
  }
  output.insertAdjacentHTML('beforeend', `<pre class="${type}">${message}</pre>`);
}

/**
 * Returns a random 32-byte challenge.
 */
function randomChallenge(size) {
  let randomChallengeBuffer = new Uint8Array(size);
  window.crypto.getRandomValues(randomChallengeBuffer);
  return randomChallengeBuffer;
}

function registerCredential() {
  if (!navigator || !navigator.credentials) {
    log(ERROR, 'WebAuthn not supported.');
    return;
  }

  let challenge = randomChallenge(32);
  log(INFO, `Client challenge: ${challenge.join()}`);

  let publicKey = {
    challenge,

    rp: {
      name: "AlphaPay Demo"
    },

    user: {
      id: Uint8Array.from('UZSL85T9AFC', c => c.charCodeAt(0)),
      name: 'test@alphapay.stillmuchtoponder.com',
      displayName: 'Danyao',
    },

    pubKeyCredParams: [
      { alg: -7, type: 'public-key' },
    ],

    authenticatorSelection: {
      // Use built-in authenticator.
      authenticatorAttachment: 'platform',
    },

    timeout: 60000,

    // Avoid user consent window by not requesting an attestation statement form the security key.
    attestation: 'none',
  };

  navigator.credentials.create({ publicKey }).then(credential => {
    simulateServerSideValidateCredential(credential);
    console.log(credential);
  }).catch(error => {
    log(ERROR, `Failed to create credential: ${error}`);
  });
}

/**
 * Simulates credential validation steps that would normally be done on
 * the server side.
 * Returns the validated ID that would be stored on server side, or
 * null if validation fails.
 */
function simulateServerSideValidateCredential(credential) {
  // Verify that credeitnail contains the same data this client presented
  // to generate the credential.
  const utf8Decoder = new TextDecoder('utf-8');
  const decodedClientData = utf8Decoder.decode(
    credential.response.clientDataJSON);
  const clientDataObj = JSON.parse(decodedClientData);

  if (clientDataObj.type != 'webauthn.create') {
    return null;
  }
  // TODO: add other checks

  log(INFO, `Received credential.id: ${credential.id}`);
  log(INFO, `Received clientData: ${JSON.stringify(clientDataObj, undefined, 2)}`);
}

/**
 * Authenticates the user using the public key ID from #webauthn-cred.
 */
function authenticate() {
  if (!navigator || !navigator.credentials) {
    showError('WebAuthn not supported.');
    return;
  }

  const credentialId = document.querySelector('#webauthn-cred').value;
  const publicKey = {
    challenge: randomChallenge(32),
    allowCredentials: [{
      id: Uint8Array.from(credentialId, c => c.charCodeAt(0)),
      type: 'public-key',
      transports: ['usb', 'ble', 'nfc'],
    }],
    timeout: 60000
  };

  navigator.credentials.get({publicKey}).then(assertion => {
    console.log(assertion);
  }).catch(error => {
    console.log(error);
  });
}
