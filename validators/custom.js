'use strict';

function isEqual (paramName) {
  async function equal (value, { req }) {
    if (value !== req.body[paramName]) {
      throw new Error();
    }
  }
  return equal;
}

function isNumber (n) {
  return typeof n === 'number';
}

module.exports = {
  isEqual,
  isNumber
};
