import "ses";
import * as React from "react";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as tailwind from "react-pdf-tailwind";
import * as rpGlobals from "@react-pdf/renderer";
import { StaticModuleRecord } from "./better-static-module-record.mjs";
import preprocessJsx from "./process-jsx";

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
  const { jsx } = options;
  const exportKeys = Object.keys(exports);
  const hasDefault = exportKeys.some((_export) => _export === "default");
  const exportsList = exportKeys.filter((_export) => _export !== "default");
  const declarations = exportsList.map((_, index) => `__v$${index}$__`);
  const declarationString = declarations
    .map((id, index) => `${id} = ${exportsList[index]}`)
    .join(",");
  const exportString = declarations
    .map((id, index) => `${id} as ${exportsList[index]}`)
    .join(",");

  const moduleRecord = new StaticModuleRecord(
    [
      `const ${declarationString}`,
      `export { ${exportString} }`,
      hasDefault ? `export default __v_default__` : null,
    ]
      .filter(Boolean)
      .join(";"),

    name,
    { jsx }
  );

  let globals = exports;
  if (hasDefault) {
    const { default: __v_default__, ...rest } = exports;
    globals = { __v_default__, ...rest };
  }

  const compartment = new Compartment(
    globals,
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

const LayoutContext = React.createContext({
  createOnRender: (originalCallback) => (info) => {
    console.log(originalCallback, info);
  },
});

const createDocumentWithCallback = (ReactPDF) =>
  function DocumentWithCallback(props) {
    const context = React.useContext(LayoutContext);

    return React.createElement(ReactPDF.Document, {
      ...props,
      onRender: context.createOnRender(props.onRender),
    });
  };

const Provider = (props) => {
  const createOnRender = (originalCallback) => {
    if (!originalCallback) return props.fn;

    const handler = (info) => {
      const { layout, ...other } = info;
      props.fn({ layout });
      originalCallback(other);
    };

    handler._originalFunction = originalCallback;

    return handler;
  };
  return React.createElement(
    LayoutContext.Provider,
    { value: { createOnRender } },
    props.children
  );
};

const tailwindModule = createVirtualModuleFromVariable(
  "react-pdf-tailwind",
  tailwind
);
const reactModule = createVirtualModuleFromVariable("react", React);
const reactRuntimeModule = createVirtualModuleFromVariable(
  "react/jsx-runtime",
  {
    jsx,
    jsxs,
    Fragment,
  }
);

const reactPdfModule = createVirtualModuleFromVariable("@react-pdf/renderer", {
  ...rpGlobals,
  Document: createDocumentWithCallback(rpGlobals),
});

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

const fitInto = (string, size) => {
  if (string.length <= size) return string;
  const halfOfSize = Math.floor((size - 3) / 2);
  return [
    string.substring(0, halfOfSize),
    string.substring(string.length - halfOfSize, string.length),
  ].join("...");
};

const fnName = (fn) => fn.name ?? "anonymous function";

const serializeProps = (props) => {
  if (!props) return;

  return Object.fromEntries(
    Object.entries(props)
      .map(([key, value]) => {
        if (key === "onRender") {
          return value._originalFunction
            ? [key, fnName(value._originalFunction)]
            : false;
        }

        if (value === null) return [key, "null"];
        if (value === undefined) return [key, "undefined"];

        if (Array.isArray(value)) return [key, `[${value.join(", ")}]`];

        switch (typeof value) {
          case "number":
          case "boolean":
            return [key, value.toString()];
          case "string":
            return [key, fitInto(value.trim(), 100)];
          case "function":
            return [key, fnName(value)];
          default:
            return [key, typeof value];
        }
      })
      .filter(Boolean)
  );
};

const serializeLayout = (layout) => {
  const serializeNode = (node) => {
    const sNode = {
      box: node.box,
      style: node.style,
      type: node.type,
      props: serializeProps(node.props),
      lines: node?.lines?.map((line) => ({ string: line.string })),
      children: [],
    };

    if (node.children) {
      for (let child of node.children) {
        sNode.children.push(serializeNode(child));
      }
    }

    return sNode;
  };

  return layout && serializeNode(layout);
};

const evaluate = (code) =>
  new Promise(async (resolve, reject) => {
    try {
      const retrieve = makeStaticRetriever({
        "file://internal/code.js": code,
      });
      const importHook = makeImporter(locate, retrieve);

      const compartment = new Compartment(
        {
          console,
          fetch: (...a) => fetch(...a),
          Headers,
          Request,
          Response,
        },
        {
          react: reactModule,
          "react/jsx-runtime": reactRuntimeModule,
          "@react-pdf/renderer": reactPdfModule,
          "react-pdf-tailwind": tailwindModule,
        },
        {
          name: "repl",
          resolveHook,
          importHook,
        }
      );

      const { namespace } = await compartment.import("file://internal/code.js");

      if (!("default" in namespace)) {
        throw new Error("The default export is not a React PDF Component");
      }

      let layout = null;

      rpGlobals
        .pdf(
          React.createElement(
            Provider,
            { fn: (info) => (layout = info.layout) },
            React.createElement(namespace.default)
          )
        )
        .toBlob()
        .then((res) => URL.createObjectURL(res))
        .then(
          (result) =>
            resolve({
              url: result,
              layout: serializeLayout(layout),
            }),
          (error) => {
            reject(error);
          }
        );
    } catch (error) {
      reject(error);
    }
  });

const createRender = (callback) => (element) => {
  rpGlobals
    .pdf(element)
    .toBlob()
    .then((res) => URL.createObjectURL(res))
    .then(
      (result) => callback(null, result),
      (error) => callback(error)
    );
};

const legacyEvaluate = (code) =>
  new Promise((resolve, reject) => {
    if (!rpGlobals) {
      reject(Error("react-pdf not found"));
    }

    try {
      const executableCode = preprocessJsx(code);
      const c = new Compartment({
        ...rpGlobals,
        ...React,
        console,
        render: createRender((error, url) => {
          if (error) reject(error);
          else {
            resolve({ url });
          }
        }),
      });

      c.evaluate(executableCode);
    } catch (error) {
      reject(error);
    }
  });

const version = () => ({
  version: rpGlobals.version,
  isDebuggingSupported: true,
});

const init = () => true;

const methods = {
  init,
  evaluate: ({ code, options }) => {
    if (options.modules) {
      return evaluate(code);
    }

    return legacyEvaluate(code);
  },
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
