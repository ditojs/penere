import { printComments } from "../../main/comments/print.js";
import { DOC_TYPE_FILL, DOC_TYPE_GROUP } from "../../document/constants.js";
import {
  join,
  line,
  softline,
  group,
  indent,
  align,
  ifBreak,
  indentIfBreak,
} from "../../document/builders.js";
import { cleanDoc, getDocParts } from "../../document/utils.js";
import {
  hasLeadingOwnLineComment,
  isLiteral,
  isBinaryish,
  isJsxElement,
  shouldFlatten,
  hasComment,
  CommentCheckFlags,
  isCallExpression,
  isMemberExpression,
  isObjectProperty,
  isArrayOrTupleExpression,
  isObjectOrRecordExpression,
  isCallLikeExpression,
  getPrecedence,
} from "../utils/index.js";
import hasNewlineInRange from "../../utils/has-newline-in-range.js";
import needsParens from "../needs-parens.js";
import { locStart, locEnd } from "../loc.js";
import { isParenthesized } from "../utils/is-parenthesized.js";

/** @typedef {import("../../document/builders.js").Doc} Doc */

let uid = 0;
function printBinaryishExpression(path, options, print, args) {
  const { node, parent, grandparent, key } = path;
  const isInsideParenthesis =
    key !== "body" &&
    (parent.type === "IfStatement" ||
      parent.type === "WhileStatement" ||
      parent.type === "SwitchStatement" ||
      parent.type === "DoWhileStatement" ||
      // MOD: Respect breaks in assignments, variable declarations, returns and
      // calls.
      parent.type === "AssignmentExpression" ||
      parent.type === "VariableDeclarator" ||
      parent.type === "ReturnStatement" ||
      isCallExpression(parent));
  const isHackPipeline =
    node.operator === "|>" && path.root.extra?.__isUsingHackPipeline;

  const breakLevels = args?.breakLevels ?? {};
  const level = args?.level ?? 0;
  const prerun = args?.prerun ?? false;
  const isRoot = args?.level === undefined;
  const isFlattened =
    isRoot ||
    (isBinaryish(parent) &&
      !isParenthesized(node, options) &&
      shouldFlatten(parent.operator, node.operator));

  const callPrint = (prerun) =>
    printBinaryishExpressions(
      path,
      print,
      options,
      /* isNested */ false,
      isInsideParenthesis,
      isFlattened ? breakLevels : { ...breakLevels },
      isFlattened ? level : level + 1,
      prerun,
      args
    );

  if (isRoot) {
    // Call twice, once to set up all values of `breakLevels`, the second time
    // to actually print the document.
    callPrint(true);
  }
  const parts = callPrint(prerun);

  //   if (
  //     this.hasPlugin("dynamicImports") && this.lookahead().type === tt.parenLeft
  //   ) {
  //
  // looks super weird, we want to break the children if the parent breaks
  //
  //   if (
  //     this.hasPlugin("dynamicImports") &&
  //     this.lookahead().type === tt.parenLeft
  //   ) {
  if (isInsideParenthesis && !isCallExpression(parent)) {
    return parts;
  }

  if (isHackPipeline) {
    return group(parts);
  }

  // Break between the parens in
  // unaries or in a member or specific call expression, i.e.
  //
  //   (
  //     a &&
  //     b &&
  //     c
  //   ).call()
  if (
    (isCallExpression(parent) && parent.callee === node) ||
    parent.type === "UnaryExpression" ||
    (isMemberExpression(parent) && !parent.computed) ||
    // MOD: Break between parens of binaryish expressions as well unless they
    // are of the same type and precedence does not dictate otherwise. But if
    // the original code has parens, preserve those.
    (parent.type === "ConditionalExpression" && node === parent.test) ||
    (isBinaryish(parent) &&
      (parent.type !== node.type ||
        isParenthesized(node, options) ||
        getPrecedence(parent.operator) > getPrecedence(node.operator) ||
        (node.type === "BinaryExpression" &&
          getPrecedence(parent.operator) < getPrecedence(node.operator) &&
          shouldBreakBinaryish(node, options) &&
          !shouldBreakBinaryish(parent, options))))
  ) {
    // MOD: Enforce parens when going multiline, but do respect the result of
    // `needsParens` to prevent double-parens.
    const addParens =
      (isBinaryish(parent) || parent.type === "ConditionalExpression") &&
      !needsParens(path, options);
    const indented = [indent([softline, ...parts]), softline];
    return group(
      addParens //
        ? [ifBreak("("), ...indented, ifBreak(")")]
        : indented
    );
  }

  // Avoid indenting sub-expressions in some cases where the first sub-expression is already
  // indented accordingly. We should indent sub-expressions where the first case isn't indented.
  const shouldNotIndent =
    parent.type === "ReturnStatement" ||
    parent.type === "ThrowStatement" ||
    (parent.type === "JSXExpressionContainer" &&
      grandparent.type === "JSXAttribute") ||
    (node.operator !== "|" && parent.type === "JsExpressionRoot") ||
    (node.type !== "NGPipeExpression" &&
      ((parent.type === "NGRoot" && options.parser === "__ng_binding") ||
        (parent.type === "NGMicrosyntaxExpression" &&
          grandparent.type === "NGMicrosyntax" &&
          grandparent.body.length === 1))) ||
    (node === parent.body && parent.type === "ArrowFunctionExpression") ||
    (node !== parent.body && parent.type === "ForStatement") ||
    parent.type === "ConditionalExpression" ||
    // MOD: Never indent binaryish expressions inside conditional expressions.
    // &&
    // grandparent.type !== "ReturnStatement" &&
    // grandparent.type !== "ThrowStatement" &&
    //!isCallExpression(grandparent)
    parent.type === "TemplateLiteral";

  const shouldIndentIfInlining =
    parent.type === "AssignmentExpression" ||
    parent.type === "VariableDeclarator" ||
    parent.type === "ClassProperty" ||
    parent.type === "PropertyDefinition" ||
    parent.type === "TSAbstractPropertyDefinition" ||
    parent.type === "ClassPrivateProperty" ||
    isObjectProperty(parent);

  const samePrecedenceSubExpression =
    isBinaryish(node.left) && shouldFlatten(node.operator, node.left.operator);

  if (
    shouldNotIndent ||
    (shouldInlineLogicalExpression(node, parent, options) &&
      !samePrecedenceSubExpression) ||
    (!shouldInlineLogicalExpression(node, parent, options) &&
      shouldIndentIfInlining)
  ) {
    return group(parts);
  }

  if (parts.length === 0) {
    return "";
  }

  // If the right part is a JSX node, we include it in a separate group to
  // prevent it breaking the whole chain, so we can print the expression like:
  //
  //   foo && bar && (
  //     <Foo>
  //       <Bar />
  //     </Foo>
  //   )

  const hasJsx = isJsxElement(node.right);

  const firstGroupIndex = parts.findIndex(
    (part) =>
      typeof part !== "string" &&
      !Array.isArray(part) &&
      part.type === DOC_TYPE_GROUP,
  );

  // Separate the leftmost expression, possibly with its leading comments.
  const headParts = parts.slice(
    0,
    firstGroupIndex === -1 ? 1 : firstGroupIndex + 1,
  );

  const rest = parts.slice(headParts.length, hasJsx ? -1 : undefined);

  const groupId = Symbol("logicalChain-" + ++uid);

  const chain = group(
    // MOD: Don't indent if the parent is binaryish or a call expression, since
    // we now break between parens of logical expressions as well.
    isBinaryish(parent) || isCallLikeExpression(parent)
      ? parts
      : [
          // Don't include the initial expression in the indentation
          // level. The first item is guaranteed to be the first
          // left-most expression.
          ...headParts,
          indent(rest),
        ],
    { id: groupId }
  );

  if (!hasJsx) {
    return chain;
  }

  const jsxPart = parts.at(-1);
  return group([chain, indentIfBreak(jsxPart, { groupId })]);
}

// For binary expressions to be consistent, we need to group
// subsequent operators with the same precedence level under a single
// group. Otherwise they will be nested such that some of them break
// onto new lines but not all. Operators with the same precedence
// level should either all break or not. Because we group them by
// precedence level and the AST is structured based on precedence
// level, things are naturally broken up correctly, i.e. `&&` is
// broken before `+`.
function printBinaryishExpressions(
  path,
  print,
  options,
  isNested,
  isInsideParenthesis,
  breakLevels,
  level,
  prerun,
  args
) {
  const { node } = path;

  const shouldBreakNode =
    isBinaryish(node) && shouldBreakBinaryish(node, options);
  breakLevels[level] ||= shouldBreakNode;
  const enforceBreak = breakLevels[level];

  const wrapParts = (parts) => {
    if (!prerun && enforceBreak && parts.length > 0) {
      // Move the comment inside the parentheses.
      const printed = cleanDoc(printComments(path, parts, options));
      const printedParts =
        Array.isArray(printed) || printed.type === DOC_TYPE_FILL
          ? getDocParts(printed)
          : [printed];
      // eslint-disable-next-line prettier-internal-rules/no-node-comments
      delete node.comments;
      return [group(printedParts, { shouldBreak: true })];
    }
    return parts;
  };

  // Simply print the node normally.
  if (!isBinaryish(node)) {
    return wrapParts([group(print())]);
  }

  /** @type{Doc[]} */
  let parts = [];

  // We treat BinaryExpression and LogicalExpression nodes the same.

  // Put all operators with the same precedence level in the same
  // group. The reason we only need to do this with the `left`
  // expression is because given an expression like `1 + 2 - 3`, it
  // is always parsed like `((1 + 2) - 3)`, meaning the `left` side
  // is where the rest of the expression will exist. Binary
  // expressions on the right side mean they have a difference
  // precedence level and should be treated as a separate group, so
  // print them normally. (This doesn't hold for the `**` operator,
  // which is unique in that it is right-associative.)
  if (shouldFlatten(node.operator, node.left.operator)) {
    // Flatten them out by recursively calling this function.
    parts = path.call(
      (left) =>
        printBinaryishExpressions(
          left,
          print,
          options,
          /* isNested */ true,
          isInsideParenthesis,
          breakLevels,
          level,
          prerun,
          args
        ),
      "left",
    );
  } else {
    parts.push(
      wrapParts([
        group(
          print("left", {
            breakLevels,
            level,
            prerun,
          })
        ),
      ])
    );
  }

  const shouldInline =
    !enforceBreak && shouldInlineLogicalExpression(node, path.parent, options);
  const lineBeforeOperator =
    (node.operator === "|>" ||
      node.type === "NGPipeExpression" ||
      isVueFilterSequenceExpression(path, options)) &&
    !hasLeadingOwnLineComment(options.originalText, node.right);

  const operator = node.type === "NGPipeExpression" ? "|" : node.operator;
  const rightSuffix =
    node.type === "NGPipeExpression" && node.arguments.length > 0
      ? group(
          indent([
            softline,
            ": ",
            join(
              [line, ": "],
              path.map(() => align(2, group(print())), "arguments"),
            ),
          ]),
        )
      : "";

  /** @type {Doc} */
  let right;
  if (shouldInline) {
    const rightContent = print("right", {
      breakLevels,
      level,
      prerun,
    });
    right = [operator, " ", rightContent, rightSuffix];
  } else {
    const isHackPipeline =
      operator === "|>" && path.root.extra?.__isUsingHackPipeline;
    const rightContent = isHackPipeline
      ? path.call(
          (right) =>
            printBinaryishExpressions(
              right,
              print,
              options,
              /* isNested */ true,
              isInsideParenthesis,
              breakLevels,
              level,
              prerun,
              args
            ),
          "right",
        )
      : print("right", {
          breakLevels,
          level,
          prerun,
        });
    right = [
      lineBeforeOperator ? line : "",
      operator,
      lineBeforeOperator ? " " : line,
      rightContent,
      rightSuffix,
    ];
  }

  // If there's only a single binary expression, we want to create a group
  // in order to avoid having a small right part like -1 be on its own line.
  const { parent } = path;
  // MOD: Take `enforceBreak` into account when deciding whether to group.
  const shouldBreak =
    enforceBreak ||
    hasComment(node.left, CommentCheckFlags.Trailing | CommentCheckFlags.Line);
  const shouldGroup =
    shouldBreak ||
    (!(isInsideParenthesis && isBinaryish(node)) &&
      parent.type !== node.type &&
      node.left.type !== node.type &&
      node.right.type !== node.type);

  parts.push(
    lineBeforeOperator ? "" : " ",
    shouldGroup ? group(right, { shouldBreak }) : right,
  );

  // The root comments are already printed, but we need to manually print
  // the other ones since we don't call the normal print on BinaryExpression,
  // only for the left and right parts
  if (isNested && hasComment(node)) {
    const printed = cleanDoc(printComments(path, parts, options));
    /* c8 ignore next 3 */
    if (Array.isArray(printed) || printed.type === DOC_TYPE_FILL) {
      return getDocParts(printed);
    }

    return [printed];
  }

  return parts;
}

// MOD: Preserve breaks in binaryish expressions:
// - Logical Expressions: If the expression is parenthesized, then preserve the
//   break between the '(' and the left expression. If that's not the case, and
//   also for Binary Expressions:
// - Preserve breaks between the left and right expressions.
function shouldBreakBinaryish(node, options) {
  return (
    // Exclude the empty literal nodes that are pulled back up in the printer.
    !isEmptyLiteralNode(node.right) &&
    hasNewlineInRange(
      options.originalText,
      locEnd(node.left),
      locStart(node.right)
    )
  );
}

function isLiteralNode(node) {
  return isLiteral(node) || node.type === "TemplateLiteral";
}

function isEmptyLiteralNode(node) {
  return (
    (isLiteralNode(node) && node.value === "") ||
    (node.type === "ObjectExpression" && node.properties.length === 0) ||
    (node.type === "ArrayExpression" && node.elements.length === 0)
  );
}

function shouldInlineLogicalExpression(node, parent, options) {
  if (
    node.type !== "LogicalExpression" &&
    !(
      node.type === "BinaryExpression" &&
      parent.type !== "ConditionalExpression"
    )
  ) {
    return false;
  }

  // MOD: Don't inline arrays and objects in binary expressions that will break.
  if (shouldBreakBinaryish(node, options)) {
    return false;
  }

  // MOD: Inline literals.
  if (isLiteralNode(node.right)) {
    return true;
  }

  if (
    isObjectOrRecordExpression(node.right)
    // MOD: Allow inlining of empty objects.
    // && node.right.properties.length > 0
  ) {
    return true;
  }

  if (
    isArrayOrTupleExpression(node.right)
    // MOD: Allow inlining of empty arrays.
    // && node.right.elements.length > 0
  ) {
    return true;
  }

  // MOD: Allow inlining of object and array member expressions with simple
  // identifiers.
  if (
    node.right.type === "MemberExpression" &&
    node.right.property.type === "Identifier" &&
    ["ObjectExpression", "ArrayExpression"].includes(node.right.object.type)
  ) {
    return true;
  }

  if (isJsxElement(node.right)) {
    return true;
  }

  return false;
}

const isBitwiseOrExpression = (node) =>
  node.type === "BinaryExpression" && node.operator === "|";

function isVueFilterSequenceExpression(path, options) {
  return (
    (options.parser === "__vue_expression" ||
      options.parser === "__vue_ts_expression") &&
    isBitwiseOrExpression(path.node) &&
    !path.hasAncestor(
      (node) =>
        !isBitwiseOrExpression(node) && node.type !== "JsExpressionRoot",
    )
  );
}

export { printBinaryishExpression, shouldInlineLogicalExpression };
