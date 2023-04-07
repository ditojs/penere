"use strict";

const { skipWhitespace } = require("../../common/util.js");
const { locStart, locEnd } = require("../loc.js");


const hasNextToken = (token, text, start, backwards) => {
  const index = skipWhitespace(text, start, { backwards });
  return index !== false ? text[index] === token : false;
};

function isParenthesized(node, options) {
  const text = options.originalText;
  return (
    node.extra?.parenthesized ||
    (hasNextToken("(", text, locStart(node) - 1, true) &&
      hasNextToken(")", text, locEnd(node), false))
  );
}

module.exports = isParenthesized;
