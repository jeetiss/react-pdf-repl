import "ses";
import { createCanvas, Image } from "@napi-rs/canvas";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf";
import "pdfjs-dist/legacy/build/pdf.worker";
import { readFile } from "node:fs/promises";
import LZString from "lz-string";

import * as React from "react";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as tailwind from "react-pdf-tailwind";
import * as rpGlobals from "@react-pdf/renderer";

import { StaticModuleRecord } from "../../worker/better-static-module-record.mjs";
import { code } from "../../code/default-example";

const canvas = createCanvas(1600, 900);

const templatePromise = readFile(
  new URL("../../public/template.png", import.meta.url)
);

const defaultPromise = readFile(
  new URL("../../public/og.png", import.meta.url)
);

const decompress = (string) =>
  LZString.decompressFromBase64(
    string
      .replace(/-/g, "+") // Convert '-' to '+'
      .replace(/_/g, "/") // Convert '_' to '/'
  );

const getTemplate = async () => {
  const template = new Image();
  template.src = await templatePromise;

  return template;
};

const makeStaticRetriever = (sources) => {
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

const makeImporter = (locate, retrieve) => async (moduleSpecifier) => {
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

const evaluate = async (code) => {
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

    const element = React.createElement(
      Provider,
      { fn: (info) => (layout = info._INTERNAL__LAYOUT__DATA_) },
      React.createElement(namespace.default)
    );
    const buffer = await rpGlobals.renderToBuffer(element);

    return {
      buffer,
      layout: serializeLayout(layout),
    };
  } catch (error) {
    console.log(error);
  }
};

const NodeCanvasFactory = {
  create(width, height) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");
    return {
      canvas,
      context,
    };
  },

  reset(canvasAndContext, width, height) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  },

  destroy(canvasAndContext) {
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  },
};

async function getCanvas(pagePromise, { height, width }) {
  const page = await pagePromise;
  let viewport = page.getViewport({ scale: 1.0 });
  viewport = page.getViewport({
    scale: Math.max(height / viewport.height, width / viewport.width),
  });

  const canvasFactory = NodeCanvasFactory;
  const { canvas, context } = canvasFactory.create(
    viewport.width,
    viewport.height
  );
  const renderContext = {
    canvasContext: context,
    viewport,
    canvasFactory,
  };

  const renderTask = page.render(renderContext);
  await renderTask.promise;

  return { canvas, viewport };
}

export default async function GET(req, res) {
  const { cp_code } = req.query;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 1600, 900);
  ctx.drawImage(await getTemplate(), 0, 0);

  const pdf = await evaluate(cp_code ? decompress(cp_code) : code);

  const document = await pdfjs.getDocument({
    data: pdf.buffer,
    verbosity: 0,
  }).promise;

  const { canvas: pdfCanvas, viewport } = await getCanvas(document.getPage(1), {
    width: 700,
    height: 900,
  });
  ctx.save();
  ctx.fillStyle = "#e2e2e2";
  ctx.shadowColor = "rgba(0, 0, 0, .2)";
  ctx.shadowBlur = 200;
  ctx.shadowOffsetY = 300;
  ctx.fillRect(800 - 1, 100 - 1, viewport.width + 2, viewport.height + 2);
  ctx.drawImage(pdfCanvas, 800, 100);
  ctx.restore();

  res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
  res.setHeader("content-type", "image/jpeg");
  return res.send(canvas.toBuffer("image/jpeg"));
}
