import { Parser } from "acorn";
import { generate } from "astring";
import { walk } from "estree-walker";

const checkDefault = (value) => ("__default" === value ? "default" : value);

const createProgramBody = (body, staticImports, staticExports) => [
  {
    type: "ExpressionStatement",
    expression: {
      type: "ArrowFunctionExpression",
      id: null,
      expression: false,
      generator: false,
      async: false,
      params: [
        {
          type: "ObjectPattern",
          properties: [
            {
              type: "Property",
              key: {
                type: "Identifier",
                name: "imports",
              },
              value: {
                type: "Identifier",
                name: "__imports",
              },
              kind: "init",
            },
            {
              type: "Property",
              key: {
                type: "Identifier",
                name: "onceVar",
              },
              value: {
                type: "Identifier",
                name: "__once",
              },
              kind: "init",
            },
          ],
        },
      ],
      body: {
        type: "BlockStatement",
        body: [
          staticImports.length && {
            type: "VariableDeclaration",
            declarations: staticImports
              .flatMap(({ importMap }) => Object.values(importMap))
              .map((name) => ({
                type: "VariableDeclarator",
                id: { type: "Identifier", name },
              })),
            kind: "let",
          },
          {
            type: "ExpressionStatement",

            expression: {
              type: "CallExpression",

              callee: {
                type: "Identifier",

                name: "__imports",
              },
              arguments: [
                {
                  type: "ArrayExpression",
                  elements: staticImports.map(({ source, importMap }) => ({
                    type: "ArrayExpression",
                    elements: [
                      {
                        type: "Literal",
                        value: source,
                      },
                      {
                        type: "ArrayExpression",
                        elements: Object.entries(importMap).map(
                          ([imported, local]) => ({
                            type: "ArrayExpression",
                            elements: [
                              {
                                type: "Literal",
                                value: imported,
                              },
                              {
                                type: "ArrayExpression",
                                elements: [
                                  {
                                    type: "ArrowFunctionExpression",
                                    params: [
                                      {
                                        type: "Identifier",
                                        name: "__a",
                                      },
                                    ],
                                    body: {
                                      type: "AssignmentExpression",
                                      operator: "=",
                                      left: {
                                        type: "Identifier",
                                        name: local,
                                      },
                                      right: {
                                        type: "Identifier",
                                        name: "__a",
                                      },
                                    },
                                  },
                                ],
                              },
                            ],
                          })
                        ),
                      },
                    ],
                  })),
                },
              ],

              optional: false,
            },
          },
          ...body,
          ...(staticExports.length
            ? staticExports.map((staticExport) => ({
                type: "ExpressionStatement",
                expression: {
                  type: "CallExpression",
                  callee: {
                    type: "MemberExpression",
                    object: {
                      type: "Identifier",
                      name: "__once",
                    },
                    property: {
                      type: "Identifier",
                      name: checkDefault(Object.values(staticExport)[0]),
                    },
                    computed: false,
                    optional: false,
                  },
                  arguments: [
                    {
                      type: "Identifier",
                      name: Object.values(staticExport)[0],
                    },
                  ],
                  optional: false,
                },
              }))
            : []),
        ].filter(Boolean),
      },
    },
  },
];

const getImports = (node) => {
  const source = node.source.value;

  let importMap;
  switch (node.specifiers[0].type) {
    case "ImportDefaultSpecifier":
      importMap = {
        default: node.specifiers[0].local.name,
      };
      break;

    case "ImportSpecifier":
      importMap = Object.fromEntries(
        node.specifiers.map((specifier) => [
          specifier.imported.name,
          specifier.local.name,
        ])
      );
      break;

    case "ImportNamespaceSpecifier":
      importMap = {
        "*": node.specifiers[0].local.name,
      };
      break;

    default:
      throw ReferenceError("unknown import type");
  }

  return { source, importMap };
};

const exportDefaultReplacement = (value) => ({
  type: "VariableDeclaration",
  declarations: [
    {
      type: "VariableDeclarator",
      id: {
        type: "ObjectPattern",
        properties: [
          {
            type: "Property",
            key: {
              type: "Identifier",
              name: "default",
            },
            value: {
              type: "Identifier",
              name: "__default",
            },
            kind: "init",
          },
        ],
      },
      init: {
        type: "ObjectExpression",
        properties: [
          {
            type: "Property",
            key: {
              type: "Identifier",
              name: "default",
            },
            value,
            kind: "init",
          },
        ],
      },
    },
  ],
  kind: "const",
});

export class StaticModuleRecord {
  constructor(source, location) {
    this.source = source;
  }

  init() {
    const ast = Parser.parse(this.source, {
      sourceType: "module",
      ecmaVersion: 2020,
    });

    const staticImports = [];
    const staticExports = [];
    let flatStaticExports = [];

    walk(ast, {
      enter(node) {
        if (node.type === "ImportDeclaration") {
          staticImports.push(getImports(node));
          this.remove();
        } else if (node.type === "ExportNamedDeclaration") {
          if (!node.declaration) {
            staticExports.push(
              Object.fromEntries(
                node.specifiers.map((specifier) => [
                  specifier.exported.name,
                  specifier.local.name,
                ])
              )
            );

            this.remove();
          } else {
            switch (node.declaration.type) {
              case "ClassDeclaration":
              case "FunctionDeclaration": {
                const name = node.declaration.id.name;
                staticExports.push({ [name]: name });
                this.replace(node.declaration);
                break;
              }

              case "VariableDeclaration": {
                const exports = Object.fromEntries(
                  node.declaration.declarations.map((declarator) => [
                    declarator.id.name,
                    declarator.id.name,
                  ])
                );
                staticExports.push(exports);

                this.replace(node.declaration);
                break;
              }

              default:
                throw ReferenceError("unknown import type");
            }
          }
        } else if (node.type === "ExportDefaultDeclaration") {
          staticExports.push({ default: "__default" });

          this.replace(exportDefaultReplacement(node.declaration));
        } else if (node.type !== "Program") {
          this.skip();
        }
      },

      leave(node, parent, prop, index) {
        if (node.type === "Program") {
          flatStaticExports = staticExports.flatMap((staticExport) =>
            Object.entries(staticExport).map((pair) =>
              Object.fromEntries([pair])
            )
          );
          node.body = createProgramBody(
            node.body,
            staticImports,
            flatStaticExports
          );
        }
      },
    });

    this._imports = staticImports.map(({ source }) => source);
    this._exports = flatStaticExports.flatMap((map) => Object.keys(map));
    this._exportMap = Object.fromEntries(
      flatStaticExports.flatMap((singleExport) =>
        Object.entries(singleExport).map(([key, value]) => [
          key,
          [checkDefault(value)],
        ])
      )
    );

    this._syncProgram = generate(ast);
  }

  get imports() {
    if (!this._imports) this.init();

    return this._imports;
  }

  get exports() {
    if (!this._exports) this.init();

    return this._exports;
  }

  get __syncModuleProgram__() {
    if (!this._syncProgram) this.init();

    return this._syncProgram;
  }

  get __liveExportMap__() {
    return {};
  }

  get __fixedExportMap__() {
    if (!this._exportMap) this.init();

    return this._exportMap;
  }
}

// const source = `
// import * as pdf from 'module';

// const a = 1;
// const b = 1;

// export { a as b$4, b as a$4 };
// export const lil = 1;
// export default 12;
// `;

// const record = new StaticModuleRecord(source);

// console.log(record.__syncModuleProgram__);
// console.log(record.exports);
// console.log(record.imports);
// console.log(record.__fixedExportMap__);
