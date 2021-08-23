import { Parser } from "acorn";
import jsx from "acorn-jsx";
import { generate } from "astring";
import { buildJsx } from "estree-util-build-jsx";

const parser = Parser.extend(jsx());

const preprocessJsx = (code) => {
  const ast = parser.parse(code, {
    sourceType: "module",
    ecmaVersion: 2020,
  });

  buildJsx(ast, { pragma: "createElement", pragmaFrag: "Fragment" });

  return generate(ast);
};

export default preprocessJsx
