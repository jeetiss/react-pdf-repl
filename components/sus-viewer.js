import * as pdfjs from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.js";
import {
  Suspense,
  useLayoutEffect,
  useReducer,
  useRef,
} from "react";
import { createFetchStore as createAsyncStore } from "react-suspense-fetch";
import { useAsyncEffect, createSingleton, useSize } from "../hooks";

// import { loader } from "./viewer.module.css";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

const useWorker = createSingleton(
  () => new pdfjs.PDFWorker({ name: "pdfjs-worker" }),
  (worker) => worker.destroy()
);

const abortify = (destroyer, errorHandler) => async (fn, signal) => {
  const task = fn();
  const aborter = () => destroyer(task);

  if (signal.aborted) {
    return aborter();
  }

  signal.addEventListener("abort", aborter, { once: true });

  const result = await errorHandler(task.promise);
  signal.removeEventListener("abort", aborter, { once: true });

  return result;
};

const wrapDoc = abortify(
  (task) => task.destroy(),
  (promise) => promise.catch((error) => console.error(error))
);

const wrapPage = abortify(
  (task) => task.cancel(),
  (promise) =>
    promise.catch((error) => {
      if (error.name !== "RenderingCancelledException") {
        return Promise.reject(error);
      }
    })
);

const documentStore = createAsyncStore(
  async ({ worker, url }, { signal }) => {
    if (url) {
      return wrapDoc(() => pdfjs.getDocument({ url, worker }), signal);
    }
  },
  {
    type: "Map",
    areEqual: ({ url: urlA }, { url: urlB }) => urlA === urlB,
  }
);

const WIDTH = 210;
const HEIGHT = 297;

const Viewer = ({ page: pageNumber, url, size }) => {
  const dpr = useRef();
  const worker = useWorker();

  const canvas1Ref = useRef();
  const canvas2Ref = useRef();
  const document = documentStore.get({ worker, url }, { forcePrefetch: true });
  const [phase, toggle] = useReducer((v) => !v, true);

  useLayoutEffect(() => {
    dpr.current = Number.parseInt(window.devicePixelRatio || 1, 10);
  }, []);

  useAsyncEffect(
    async (signal) => {
      if (document) {
        const page = await document.getPage(pageNumber);

        let viewport = page.getViewport({ scale: 1 / dpr.current });

        const scale = Math.min(
          size.height / viewport.height,
          size.width / viewport.width
        );

        viewport = page.getViewport({ scale });

        const canvas = phase ? canvas1Ref.current : canvas2Ref.current;

        if (viewport.width !== canvas.width) {
          canvas.width = viewport.width;
        }

        if (viewport.height !== canvas.height) {
          canvas.height = viewport.height;
        }

        const context = canvas.getContext("2d");

        await wrapPage(
          () => page.render({ canvasContext: context, viewport }),
          signal
        );

        toggle();
      }
    },
    [document, size, pageNumber]
  );

  return (
    <div
      style={{
        position: "absolute",
        border: "1px solid rgba(0, 0, 0, 0.18)",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) scale(${1 / dpr.current})`,
      }}
    >
      <canvas ref={canvas1Ref} style={{ display: "block" }} />
      <canvas
        ref={canvas2Ref}
        style={{
          display: "block",
          position: "absolute",
          inset: 0,
          opacity: phase ? 1 : 0,
          transition: "opacity ease 0.1s",
        }}
      />
    </div>
  );
};

const SusViewer = ({ url, page }) => {
  const blockRef = useRef();
  // const size = useSize(blockRef);

  return (
    <div
      ref={blockRef}
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        padding: 20,
      }}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <Viewer url={url} page={page} size={{ width: 300, height: 300 }} />
      </Suspense>
    </div>
  );
};

export default SusViewer;
