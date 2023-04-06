import { printDanglingComments } from "../../main/comments/print.js";
import {
  line,
  softline,
  hardline,
  group,
  indent,
  ifBreak,
  fill,
} from "../../document/builders.js";
import hasNewline from "../../utils/has-newline.js";
import isNextLineEmptyAfterIndex from "../../utils/is-next-line-empty.js";
import skipInlineComment from "../../utils/skip-inline-comment.js";
import skipTrailingComment from "../../utils/skip-trailing-comment.js";
import hasNewlineInRange from "../../utils/has-newline-in-range.js";
import {
  shouldPrintComma,
  hasComment,
  CommentCheckFlags,
  isNumericLiteral,
  isStringLiteral,
  isSignedNumericLiteral,
  isArrayOrTupleExpression,
  isObjectOrRecordExpression,
} from "../utils/index.js";
import { locStart, locEnd } from "../loc.js";

import { printOptionalToken } from "./misc.js";
import { printTypeAnnotationProperty } from "./type-annotation.js";

/** @typedef {import("../../document/builders.js").Doc} Doc */

function printEmptyArrayElements(path, options, openBracket, closeBracket) {
  const { node } = path;
  if (!hasComment(node, CommentCheckFlags.Dangling)) {
    return [openBracket, closeBracket];
  }
  return group([
    openBracket,
    printDanglingComments(path, options, { indent: true }),
    softline,
    closeBracket,
  ]);
}

/*
- `ArrayExpression`
- `TupleExpression`
- `ArrayPattern`
- `TSTupleType`(TypeScript)
- `TupleTypeAnnotation`(Flow)
*/
function printArray(path, options, print) {
  const { node } = path;
  /** @type{Doc[]} */
  const parts = [];

  const openBracket = node.type === "TupleExpression" ? "#[" : "[";
  const closeBracket = "]";
  const elementsProperty =
    // TODO: Remove `types` when babel changes AST of `TupleTypeAnnotation`
    node.type === "TupleTypeAnnotation" && node.types
      ? "types"
      : node.type === "TSTupleType" || node.type === "TupleTypeAnnotation"
      ? "elementTypes"
      : "elements";
  const elements = node[elementsProperty];
  if (elements.length === 0) {
    parts.push(
      printEmptyArrayElements(path, options, openBracket, closeBracket)
    );
  } else {
    const lastElem = elements.at(-1);
    const canHaveTrailingComma = lastElem?.type !== "RestElement";

    // JavaScript allows you to have empty elements in an array which
    // changes its length based on the number of commas. The algorithm
    // is that if the last argument is null, we need to force insert
    // a comma to ensure JavaScript recognizes it.
    //   [,].length === 1
    //   [1,].length === 1
    //   [1,,].length === 2
    //
    // Note that getLast returns null if the array is empty, but
    // we already check for an empty array just above so we are safe
    const needsForcedTrailingComma = lastElem === null;

    const groupId = Symbol("array");

    // MOD: Respect the original line break before the first and between the
    // first and second element.
    const firstElement = node.elements?.[0];
    const secondElement = node.elements?.[1];
    const firstBreak =
      firstElement &&
      hasNewlineInRange(
        options.originalText,
        locStart(node),
        locStart(firstElement)
      );
    const secondBreak =
      secondElement &&
      hasNewlineInRange(
        options.originalText,
        locEnd(firstElement || node),
        locStart(secondElement)
      );

    const shouldBreak =
      !options.__inJestEach &&
      (firstBreak ||
        (elements.length > 1 &&
          // MOD: Don't break complex array items.
          (options.breakComplexArrayItems ?? false) &&
          elements.every((element, i, elements) => {
            const elementType = element?.type;
            if (
              !isArrayOrTupleExpression(element) &&
              !isObjectOrRecordExpression(element)
            ) {
              return false;
            }

            const nextElement = elements[i + 1];
            if (nextElement && elementType !== nextElement.type) {
              return false;
            }

            const itemsKey = isArrayOrTupleExpression(element)
              ? "elements"
              : "properties";

            return element[itemsKey] && element[itemsKey].length > 1;
          })));

    const shouldUseConciseFormatting = isConciselyPrintedArray(node, options);

    const trailingComma = !canHaveTrailingComma
      ? ""
      : needsForcedTrailingComma
      ? ","
      : !shouldPrintComma(options)
      ? ""
      : shouldUseConciseFormatting
      ? ifBreak(",", "", { groupId })
      : ifBreak(",");

    parts.push(
      group(
        [
          openBracket,
          indent([
            softline,
            shouldUseConciseFormatting
              ? printArrayElementsConcisely(
                  path,
                  options,
                  print,
                  trailingComma,
                  firstBreak, // shouldBreak
                  firstBreak && secondBreak // enforceBreak
                )
              : [
                  printArrayElements(
                    path,
                    options,
                    elementsProperty,
                    print,
                    firstBreak, // shouldBreak
                    firstBreak && secondBreak // enforceBreak
                  ),
                  trailingComma,
                ],
            printDanglingComments(path, options),
          ]),
          softline,
          closeBracket,
        ],
        { shouldBreak, id: groupId }
      )
    );
  }

  parts.push(
    printOptionalToken(path),
    printTypeAnnotationProperty(path, print)
  );

  return parts;
}

function isConciselyPrintedArray(node, options) {
  return (
    isArrayOrTupleExpression(node) &&
    node.elements.length > 1 &&
    node.elements.every(
      (element) =>
        element &&
        // MOD: Treat string and numeric literals the same away.
        (isNumericLiteral(element) ||
          isStringLiteral(element) ||
          (isSignedNumericLiteral(element) && !hasComment(element.argument))) &&
        !hasComment(
          element,
          CommentCheckFlags.Trailing | CommentCheckFlags.Line,
          (comment) =>
            !hasNewline(options.originalText, locStart(comment), {
              backwards: true,
            })
        )
    )
  );
}

function isLineAfterElementEmpty({ node }, { originalText: text }) {
  const skipComment = (idx) =>
    skipInlineComment(text, skipTrailingComment(text, idx));

  const skipToComma = (currentIdx) =>
    text[currentIdx] === ","
      ? currentIdx
      : skipToComma(skipComment(currentIdx + 1));

  return isNextLineEmptyAfterIndex(text, skipToComma(locEnd(node)));
}

function printArrayElements(
  path,
  options,
  elementsProperty,
  print,
  shouldBreak,
  enforceBreak
) {
  const parts = [];

  path.each(({ node, isLast, next }) => {
    parts.push(node ? group(print()) : "");

    if (!isLast) {
      // MOD: Respect the original line break between elements.
      const breakAfter =
        enforceBreak ||
        (shouldBreak &&
          node &&
          next &&
          hasNewlineInRange(
            options.originalText,
            locEnd(node),
            locStart(next)
          ));
      parts.push([
        ",",
        breakAfter ? hardline : line,
        node && isLineAfterElementEmpty(path, options) ? softline : "",
      ]);
    }
  }, elementsProperty);

  return parts;
}

function printArrayElementsConcisely(
  path,
  options,
  print,
  trailingComma,
  shouldBreak,
  enforceBreak
) {
  const parts = [];

  path.each(({ node, isLast, next }) => {
    parts.push([print(), isLast ? trailingComma : ","]);

    if (!isLast) {
      // MOD: Respect the original line break between elements.
      const breakAfter =
        enforceBreak ||
        (shouldBreak &&
          node &&
          next &&
          hasNewlineInRange(
            options.originalText,
            locEnd(node),
            locStart(next)
          ));
      parts.push(
        isLineAfterElementEmpty(path, options)
          ? [hardline, hardline]
          : breakAfter ||
            hasComment(next, CommentCheckFlags.Leading | CommentCheckFlags.Line)
          ? hardline
          : line
      );
    }
  }, "elements");

  return fill(parts);
}

export { printArray, isConciselyPrintedArray };
