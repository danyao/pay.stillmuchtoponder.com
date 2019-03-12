/**
 * Minimalistic Payment Handler UI that uses Google Signin for authentication.
 */
const ERROR = 'error';
const INFO = 'info';

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
 * Represents the UI of this page.
 */
class UI {
  static setName(name) {
    document.querySelector('#name').innerText = name;
  }

  static setEmail(email) {
    document.querySelector('#email').innerText = email;
  }

  static setSignedIn(isSignedIn) {
    if (isSignedIn) {
      UI.hide('#gSignInWrapper');
      UI.show('#signout');
    } else {
      UI.show('#gSignInWrapper');
      UI.hide('#signout');
    }
  }

  static show(selector) {
    document.querySelector(selector).style.display = 'block';
  }

  static hide(selector) {
    document.querySelector(selector).style.display = 'none';
  }
}

/**
 * Main entry point
 */
function startApp() {
  let ux_mode = 'redirect';
  let params = new URLSearchParams(location.search.substr(1));
  if (params.get('ux') == 'popup') {
    ux_mode = 'popup';
  }

  gapi.load('auth2', () => {
    // Retrieve the singleton for the GoogleAuth library and set up the client.
    auth2 = gapi.auth2.init({
      client_id: '743479791773-n9cjoou983g4l4hf3061b6eidj3r1161.apps.googleusercontent.com',
      cookiepolicy: 'single_host_origin',
      // Use redirect UX instead of popup.
      ux_mode,
      // Request scopes in addition to 'profile' and 'email'
      //scope: 'additional_scope'
    });

    // Wait for GoogleAuth to finish initializing. Then update the UI accordingly.
    auth2.then(() => {
      updateUI();
    });
  });
}

/**
 * Updates UI. Must be called after auth2.then() resolves.
 */
function updateUI() {
  if (auth2.isSignedIn.get()) {
    // User is signed in.
    let profile = auth2.currentUser.get().getBasicProfile();
    UI.setName(`Signed in: ${profile.getName()}`);
    UI.setEmail(profile.getEmail());
    UI.setSignedIn(true);

    document.querySelector('#signout').addEventListener('click', () => {
      auth2.signOut().then(() => {
        updateUI();
      });
    });
    return;
  }

  // User not yet signed in.
  UI.setName('---');
  UI.setEmail('---');
  UI.setSignedIn(false);
  attachSignin(document.querySelector('#customBtn'));
}

function attachSignin(element) {
  console.log(element.id);
  auth2.attachClickHandler(element, {},
      googleUser => {
        updateUI(googleUser);
      },
      error => {
        log(ERROR, JSON.stringify(error, undefined, 2));
      });
}