"use strict";

const { printDanglingComments } = require("../../main/comments.js");
const {
  builders: { line, softline, hardline, group, indent, ifBreak, fill },
} = require("../../document/index.js");
const {
  getLast,
  hasNewline,
  hasNewlineInRange,
} = require("../../common/util.js");
const {
  shouldPrintComma,
  hasComment,
  CommentCheckFlags,
  isNextLineEmpty,
  isNumericLiteral,
  isStringLiteral,
  isSignedNumericLiteral,
} = require("../utils/index.js");
const { locStart, locEnd } = require("../loc.js");

const { printOptionalToken, printTypeAnnotation } = require("./misc.js");

/** @typedef {import("../../document").Doc} Doc */

function printArray(path, options, print) {
  const node = path.getValue();
  /** @type{Doc[]} */
  const parts = [];

  const openBracket = node.type === "TupleExpression" ? "#[" : "[";
  const closeBracket = "]";
  if (node.elements.length === 0) {
    if (!hasComment(node, CommentCheckFlags.Dangling)) {
      parts.push(openBracket, closeBracket);
    } else {
      parts.push(
        group([
          openBracket,
          printDanglingComments(path, options),
          softline,
          closeBracket,
        ])
      );
    }
  } else {
    const lastElem = getLast(node.elements);
    const canHaveTrailingComma = !(lastElem && lastElem.type === "RestElement");

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
        (node.elements.length > 1 &&
          // MOD: Don't break complex array items.
          (options.breakComplexArrayItems ?? false) &&
          node.elements.every((element, i, elements) => {
            const elementType = element && element.type;
            if (
              elementType !== "ArrayExpression" &&
              elementType !== "ObjectExpression"
            ) {
              return false;
            }

            const nextElement = elements[i + 1];
            if (nextElement && elementType !== nextElement.type) {
              return false;
            }

            const itemsKey =
              elementType === "ArrayExpression" ? "elements" : "properties";

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
              ? printArrayItemsConcisely(
                  path,
                  options,
                  print,
                  trailingComma,
                  firstBreak, // shouldBreak
                  firstBreak && secondBreak // enforceBreak
                )
              : [
                  printArrayItems(
                    path,
                    options,
                    "elements",
                    print,
                    firstBreak, // shouldBreak
                    firstBreak && secondBreak // enforceBreak
                  ),
                  trailingComma,
                ],
            printDanglingComments(path, options, /* sameIndent */ true),
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
    printTypeAnnotation(path, options, print)
  );

  return parts;
}

function isConciselyPrintedArray(node, options) {
  return (
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

function printArrayItems(
  path,
  options,
  printPath,
  print,
  shouldBreak,
  enforceBreak
) {
  const printedElements = [];
  let separatorParts = [];

  path.each((childPath, i, elements) => {
    printedElements.push(separatorParts, group(print()));

    // MOD: Respect the original line break between elements.
    const node = childPath.getValue();
    const next = elements[i + 1];
    const breakAfter =
      enforceBreak ||
      (shouldBreak &&
        node &&
        next &&
        hasNewlineInRange(options.originalText, locEnd(node), locStart(next)));

    separatorParts = [",", breakAfter ? hardline : line];
    if (
      childPath.getValue() &&
      isNextLineEmpty(childPath.getValue(), options)
    ) {
      separatorParts.push(softline);
    }
  }, printPath);

  return printedElements;
}

function printArrayItemsConcisely(
  path,
  options,
  print,
  trailingComma,
  shouldBreak,
  enforceBreak
) {
  const parts = [];

  path.each((childPath, i, elements) => {
    const isLast = i === elements.length - 1;

    parts.push([print(), isLast ? trailingComma : ","]);

    if (!isLast) {
      // MOD: Respect the original line break between elements.
      const node = childPath.getValue();
      const next = elements[i + 1];
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
        isNextLineEmpty(childPath.getValue(), options)
          ? [hardline, hardline]
          : breakAfter ||
            hasComment(
              elements[i + 1],
              CommentCheckFlags.Leading | CommentCheckFlags.Line
            )
          ? hardline
          : line
      );
    }
  }, "elements");

  return fill(parts);
}

module.exports = { printArray, printArrayItems, isConciselyPrintedArray };
