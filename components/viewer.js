import * as pdfjs from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.js";
import { useReducer, useRef, useState } from "react";
import { useAsyncEffect, createSingleton, useSize } from "../hooks";

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
      if (error.name === "RenderingCancelledException") {
        error._isAborted = true;
      }

      return Promise.reject(error);
    })
);

const Viewer = ({ page: pageNumber, url }) => {
  const worker = useWorker();

  const blockRef = useRef();
  const canvas1Ref = useRef();
  const canvas2Ref = useRef();
  const [document, setDocument] = useState(null);
  const [phase, toggle] = useReducer((v) => !v, true);

  const size = useSize(blockRef);

  useAsyncEffect(
    async (signal) => {
      const doc = await wrapDoc(
        () => pdfjs.getDocument({ url, worker }),
        signal
      );

      setDocument(doc);
    },
    [pageNumber, url]
  );

  useAsyncEffect(
    async (signal) => {
      if (document) {
        const page = await document.getPage(pageNumber);

        let viewport = page.getViewport({ scale: 1 });

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
    [document, size]
  );

  return (
    <div ref={blockRef} style={{ height: "100%", width: "100%", padding: 10 }}>
      <div
        style={{
          position: "absolute",
          borderRadius: "3px",
          boxShadow: "0px 1px 5px rgba(0,0,0,0.2)",
        }}
      >
        <canvas ref={canvas1Ref} />
        <canvas
          ref={canvas2Ref}
          style={{
            position: "absolute",
            inset: 0,
            opacity: phase ? 1 : 0,
            transition: "opacity ease 0.1s",
          }}
        />
      </div>
    </div>
  );
};

export default Viewer;
