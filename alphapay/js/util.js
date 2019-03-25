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