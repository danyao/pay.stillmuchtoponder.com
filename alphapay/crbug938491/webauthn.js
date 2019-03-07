/*
 * Minimalistic WebAuthn implementation.
 */

const ERROR='error';
const INFO='info';

/**
 * Helper function to append a log message to screen.
 */
function log(type, message) {
  let output = document.querySelector('#webauthn-logs');
  if (!output) {
    document.body.insertAdjacentHTML('beforeend', '<div id="webauthn-logs"></div>');
    output = document.querySelector('#webauthn-logs');
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

/**
 * Create a new public key credential.
 */
function registerCredential() {
  if (!navigator || !navigator.credentials) {
    log(ERROR, 'WebAuthn not supported.');
    return;
  }

  console.log('registerCredential');

  let challenge = randomChallenge(32);
  log(INFO, `Client challenge: ${challenge.join()}`);

  let publicKey = {
    challenge,

    rp: {
      name: "AlphaPay Demo"
    },

    user: {
      id: Uint8Array.from('RANDOMUSERID', c => c.charCodeAt(0)),
      name: 'test user',
      displayName: 'Test User',
    },

    pubKeyCredParams: [
      { alg: -7, type: 'public-key' },
    ],

    authenticatorSelection: {
      authenticatorAttachment: 'cross-platform',
    },

    timeout: 60000,
    attestation: 'direct'
  };

  navigator.credentials.create({ publicKey }).then(credential => {
    console.log(credential);
    log(INFO, `Created credential with ID ${credential.id}`);
  }).catch(error => {
    log(ERROR, `Failed to create credential: ${error}`);
  });
}