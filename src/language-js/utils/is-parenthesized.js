import { skipWhitespace } from "../../utils/skip.js";
import { locStart, locEnd } from "../loc.js";

const hasNextToken = (token, text, start, backwards) => {
  const index = skipWhitespace(text, start, { backwards });
  return index !== false ? text[index] === token : false;
};

export function isParenthesized(node, options) {
  const text = options.originalText;
  return (
    node.extra?.parenthesized ||
    (hasNextToken("(", text, locStart(node) - 1, true) &&
      hasNextToken(")", text, locEnd(node), false))
  );
}
