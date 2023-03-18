import "ses";
import * as React from "react";
import * as rpGlobals from "@react-pdf/renderer";
import preprocessJsx from "./process-jsx";
import { toModule, LayoutProvider, serializeLayout } from "./to-module";

const evaluate = async (code) => {
  const { namespace } = await toModule(code);

  if (!("default" in namespace)) {
    throw new Error("The default export is not a React PDF Component");
  }

  let layout = null;

  const blobPDF = await rpGlobals
    .pdf(
      React.createElement(
        LayoutProvider,
        { fn: (info) => (layout = info._INTERNAL__LAYOUT__DATA_) },
        React.createElement(namespace.default)
      )
    )
    .toBlob();

  return {
    url: URL.createObjectURL(blobPDF),
    layout: serializeLayout(layout),
  };
};

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
