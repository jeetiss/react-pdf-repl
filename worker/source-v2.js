import { createElement, Fragment } from "react";
import {
  pdf,
  Text,
  View,
  Document,
  Page,
  Link,
  Font,
  Note,
  Image,
  Canvas,
  StyleSheet,
  version as reactPdfVersion
} from "@react-pdf/renderer";

import preprocessJsx from "./process-jsx";

import "ses";

const createRender = (callback) => (element) => {
  pdf(element)
    .toBlob()
    .then((res) => URL.createObjectURL(res))
    .then(callback);
};

const evaluate = (code) =>
  new Promise((resolve, reject) => {
    const executableCode = preprocessJsx(code);
    const c = new Compartment({
      render: createRender((url) => resolve(url)),
      createElement,
      Fragment,
      Text,
      View,
      Document,
      Page,
      Link,
      Font,
      Note,
      Image,
      Canvas,
      StyleSheet,
    });

    c.evaluate(executableCode);
  });

const version = () => reactPdfVersion

const methods = {
  evaluate,
  version,
};

self.addEventListener("message", (e) => {
  const { method, args, key } = e.data || e;

  const kk = methods[method] || ((v) => v);

  Promise.resolve()
    .then(() => kk(...args))
    .then((result) => postMessage({ result, key }));
});
