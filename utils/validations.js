'use strict';

module.exports = {
  valMsg: valMsg,
  checkIfUserExists
};

/**
 * Returns full validation messages key for UI.
 *
 * @param {*} subkey key to search in validation messages
 */
function valMsg (subkey) {
  return 'validation_errors.' + subkey;
}

function checkIfUserExists (email) {

}
