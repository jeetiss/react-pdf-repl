import "ses";
import * as React from "react";
import { StaticModuleRecord } from "./better-static-module-record.mjs";
import * as jsx from "react/jsx-runtime";

// q, to quote strings in error messages.
const q = JSON.stringify;

// makeStaticRetriever mocks the behavior of a real retriever, like HTTP fetch
// or a file system fetch function, using an in memory map of sources to file
// text.
export const makeStaticRetriever = (sources) => {
  return async (moduleLocation) => {
    const string = sources[moduleLocation];
    if (string === undefined) {
      throw new ReferenceError(
        `Cannot retrieve module at location ${q(moduleLocation)}.`
      );
    }
    return string;
  };
};

// makeImporter combines a locator and retriever to make an importHook suitable
// for a Compartment.
export const makeImporter = (locate, retrieve) => async (moduleSpecifier) => {
  const moduleLocation = locate(moduleSpecifier);
  const string = await retrieve(moduleLocation);
  return new StaticModuleRecord(string, moduleLocation, {
    jsx: true,
  });
};

const createVirtualModuleFromVariable = (name, exports, options = {}) => {
  const { ignoreDefault, jsx } = options;

  const exportsList = Object.keys(exports).filter(
    (exp) => !ignoreDefault || exp !== "default"
  );

  const declarations = exportsList.map(
    (singleExport, index) => `__v$$${index}$$__`
  );
  const declarationString = declarations
    .map((id, index) => `${id} = ${exportsList[index]}`)
    .join(",");
  const exportString = declarations
    .map((id, index) => `${id} as ${exportsList[index]}`)
    .join(",");

  const moduleRecord = new StaticModuleRecord(
    `const ${declarationString};export { ${exportString} }`,
    name,
    { jsx }
  );

  const compartment = new Compartment(
    exports,
    {},
    {
      name,
      resolveHook: (spec) => spec,
      importHook: (moduleSpecifier) => {
        if (moduleSpecifier !== name) {
          throw new ReferenceError(
            `Cannot retrieve module at location ${q(moduleSpecifier)}.`
          );
        }
        return moduleRecord;
      },
    }
  );

  return compartment.module(name);
};

let rpGlobals = null;
let reactPdfModule = null;
const wrap = (factory) => () =>
  factory().then((moduleExports) => {
    rpGlobals = moduleExports;
    reactPdfModule = createVirtualModuleFromVariable(
      "@react-pdf/renderer",
      moduleExports,
      { ignoreDefault: true }
    );
  });

const reactModule = createVirtualModuleFromVariable("react", React);
const reactRuntimeModule = createVirtualModuleFromVariable(
  "react/jsx-runtime",
  jsx
);

const versions = {
  "1.6.17": wrap(() => import("rpr1.6.17")),
  "2.0.21": wrap(() => import("rpr2.0.21")),
  "2.1.0": wrap(() => import("rpr2.1.0")),
  "2.1.1": wrap(() => import("rpr2.1.1")),
  "2.1.2": wrap(() => import("rpr2.1.2")),
  "2.2.0": wrap(() => import("rpr2.2.0")),
  "2.3.0": wrap(() => import("rpr2.3.0")),
  "3.0.0": wrap(() => import("rpr3.0.0")),
  "3.0.1": wrap(() => import("rpr3.0.1")),
  "3.0.2": wrap(() => import("@react-pdf/renderer")),
};

const isRelative = (spec) =>
  spec.startsWith("./") ||
  spec.startsWith("../") ||
  spec === "." ||
  spec === "..";

const locate = (moduleSpecifier) => moduleSpecifier;
const resolveHook = (spec, referrer) => {
  if (isRelative(spec)) {
    return new URL(spec, referrer).toString();
  }

  return spec;
};

const evaluate = (code) =>
  new Promise(async (resolve, reject) => {
    if (!reactPdfModule) {
      reject(Error("react-pdf not found"));
    }

    try {
      const retrieve = makeStaticRetriever({
        "file://internal/user-code.js": code,
      });
      const importHook = makeImporter(locate, retrieve);

      const compartment = new Compartment(
        {
          console,
        },
        {
          react: reactModule,
          "react/jsx-runtime": reactRuntimeModule,
          "@react-pdf/renderer": reactPdfModule,
        },
        {
          name: "repl",
          resolveHook,
          importHook,
        }
      );

      const { namespace } = await compartment.import(
        "file://internal/user-code.js"
      );

      rpGlobals
        .pdf(React.createElement(namespace.default))
        .toBlob()
        .then((res) => URL.createObjectURL(res))
        .then(
          (result) => resolve(result),
          (error) => {
            console.error(error.stack);
            reject(error);
          }
        );
    } catch (error) {
      console.error(error.stack);
      reject(error);
    }
  });

const version = () => rpGlobals.version;

const init = (version) => {
  const initiator = versions[version];

  if (!initiator) console.log(version, versions);

  return initiator().then(() => true);
};

const methods = {
  init,
  evaluate,
  version,
};

self.addEventListener("message", (e) => {
  const { method, args, key } = e.data || e;

  const kk = methods[method] || ((v) => v);

  Promise.resolve()
    .then(() => kk(...args))
    .then(
      (result) => ({ result, key }),
      (error) => ({ error: error.message, key })
    )
    .then((data) => postMessage(data));
});
