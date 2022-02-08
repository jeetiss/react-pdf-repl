import * as R from "ramda";
import * as P from "@react-pdf/primitives";
import { parseCssSelector as parse } from "@tokey/css-selector-parser";
import stylesheet from "@react-pdf/stylesheet";
import flattenStyles from "@react-pdf/stylesheet/lib/flatten";

const isLink = R.propEq("type", P.Link);

const trueFunc = () => true;
const falseFunc = () => false;

const toFunction = (ast) => {
  const first = ({ index }) => index === 1;

  const nth = (step, offset) => {
    if (offset <= 0 && step <= 0) return falseFunc;

    if (step === -1) return ({ index }) => index <= offset;
    if (step === 0) return ({ index }) => index === offset;
    if (step === 1)
      return offset <= 0 ? trueFunc : ({ index }) => index >= offset;

    const absA = Math.abs(step);
    const bMod = ((offset % absA) + absA) % absA;

    return step > 1
      ? ({ index }) => index >= offset && index % absA === bMod
      : ({ index }) => index <= offset && index % absA === bMod;
  };

  const not =
    (fn) =>
    ({ index }) =>
      !fn({ index });

  const OR =
    (...args) =>
    ({ index }) =>
      args.some((checker) => checker({ index }));

  const AND =
    (...args) =>
    ({ index }) =>
      args.every((checker) => checker({ index }));

  const nodesToFunction = (nodes) => {
    const functions = [];
    for (let node of nodes) {
      if (node.type !== "selector") throw Error("not a sleector");

      functions.push(selectorToFunction(node));
    }

    return OR(...functions);
  };

  const selectorToFunction = (selector) => {
    const functions = [];

    for (let index = 0; index < selector.nodes.length; index++) {
      const node = selector.nodes[index];

      switch (node.type) {
        case "nesting": {
          if (index !== 0) throw new Error("nesting");
          if (node.value !== "&") throw new Error("unsupported nesting");
          break;
        }

        case "pseudo_class": {
          if (node.value === "first-page") {
            functions.push(first);
          } else if (node.value === "nth-child") {
            const nthNode = node.nodes.find((node) => node.type == "nth");
            const step = nthNode.nodes.find((node) => node.type === "nth_step");
            const offset = nthNode.nodes.find(
              (node) => node.type === "nth_offset"
            );

            functions.push(
              nth(
                step
                  ? Number(step.value.substring(0, step.value.length - 1))
                  : 0,
                offset ? Number(offset.value) : 0
              )
            );
          } else if (node.value === "not") {
            functions.push(not(nodesToFunction(node.nodes)));
          }
          break;
        }

        default: {
          console.error("unsuported selector type", node.type);
        }
      }
    }

    return AND(...functions);
  };

  return nodesToFunction(ast);
};

const exec = (selector, options) => {
  if (selector.search(/nth-child/) !== -1) {
    throw new Error("unsuported selector 'nth-child'");
  }
  const ast = parse(selector.replaceAll("nth-page", "nth-child"));
  const executor = toFunction(ast);

  return executor(options);
};

const stylesheetWithPseudo = (container) => (style) => {
  let originalStyles = flattenStyles(style);

  if (Object.keys(originalStyles).some((key) => key.startsWith("&"))) {
    let compiledFor = null;
    let compiledStyles = null;
    const recompile = (container) => {
      if (compiledFor === container.pageNumber && compiledStyles)
        return compiledStyles;

      let styles = { ...originalStyles };
      for (let [key, value] of Object.entries(styles)) {
        if (key.startsWith("&")) {
          if (exec(key, { index: container.pageNumber ?? 1 })) {
            styles = { ...styles, ...value };
          }

          delete styles[key];
        }
      }

      compiledFor = container.pageNumber ?? 1;
      compiledStyles = stylesheet(container, styles);
      compiledStyles.___recompile = recompile;

      return compiledStyles;
    };

    return recompile(container);
  } else {
    return stylesheet(container, originalStyles);
  }
};

// let testStyle = stylesheetWithPseudo({})({
//   border: "1px solid red",
//   "&:not(:first)": {
//     border: "2px solid black",
//   },
// });

// console.log(testStyle);

// console.log(testStyle.___recompile({ page: 2 }));

const LINK_STYLES = {
  color: "blue",
  textDecoration: "underline",
};

/**
 * Resolves node styles
 *
 * @param {Object} container
 * @param {Object} document node
 * @returns {Object} node (and subnodes) with resolved styles
 */
const resolveNodeStyles = (container) => (node) =>
  R.o(
    R.when(isLink, R.evolve({ style: R.merge(LINK_STYLES) })),
    R.evolve({
      style: stylesheetWithPseudo(container),
      children: R.map(resolveNodeStyles(container)),
    })
  )(node);

/**
 * Resolves page styles
 *
 * @param {Object} document page
 * @returns {Object} document page with resolved styles
 */
const resolvePageStyles = (page) => {
  const box = R.prop("box", page);
  const style = R.prop("style", page);
  const container = R.isEmpty(box) ? style : box;

  return R.evolve({
    style: stylesheetWithPseudo(container),
    children: R.map(resolveNodeStyles(container)),
  })(page);
};

/**
 * Resolves document styles
 *
 * @param {Object} document root
 * @returns {Object} document root with resolved styles
 */
export default R.evolve({
  children: R.map(resolvePageStyles),
});
