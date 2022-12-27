import * as pdfjs from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.js";
import { useEffect, useRef } from "react";
import useResizeObserver from "@react-hook/resize-observer";
import { createSingleton, useEventCallback, useSetState } from "../hooks";
import { loader } from "./viewer.module.css";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

const useWorker = createSingleton(
  () => new pdfjs.PDFWorker({ name: "pdfjs-worker" }),
  (worker) => worker.destroy()
);

const WIDTH = 210;
const HEIGHT = 297;

const client = (fn) => typeof window !== "undefined" && fn();

let canvases = [];
const getCanvas = (viewport) => {
  const canvas = canvases.length
    ? canvases.pop()
    : document.createElement("canvas");

  if (viewport.width !== canvas.width) {
    canvas.width = viewport.width;
  }

  if (viewport.height !== canvas.height) {
    canvas.height = viewport.height;
  }

  return canvas;
};

const freeCanvas = (canvas) => {
  canvases.push(canvas);
};

const Canvas = ({ className, style, canvas, before, after }) => {
  const ref = useRef();
  const beforeCallback = useEventCallback(before);
  const afterCallback = useEventCallback(after);

  useEffect(() => {
    if (canvas) {
      ref.current.append(canvas);
      beforeCallback(canvas);
      return () => {
        canvas.remove();
        afterCallback(canvas);
      };
    }
  }, [canvas, ref, beforeCallback, afterCallback]);

  return <div ref={ref} className={className} style={style} />;
};

const Viewer = ({ page: pageNumber, url, onParse }) => {
  const worker = useWorker();

  const [state, set] = useSetState({
    document: null,
    size: null,
    canvas: null,
  });

  const onParseCallback = useEventCallback(onParse);
  useEffect(() => {
    if (state.document) {
      onParseCallback({ pagesCount: state.document.numPages });
    }
  }, [state.document, onParseCallback]);

  useEffect(() => {
    const getDocument = ({ signal }) => {
      const task = pdfjs.getDocument({ url, worker });
      signal.addEventListener("abort", () => task.destroy());
      return task.promise
        .then((document) => {
          if (!signal.aborted) {
            set({ document });
          }
        })
        .catch((error) => {
          if (!signal.aborted) {
            throw error;
          }
        });
    };

    if (url) {
      const controller = new AbortController();
      getDocument({ signal: controller.signal });

      return () => controller.abort();
    }
  }, [set, url, worker]);

  useEffect(() => {
    const getRenderedPage = ({ pageNumber, signal }) =>
      state.document
        .getPage(pageNumber)
        .then((page) => {
          let viewport = page.getViewport({
            scale: 1 / window.devicePixelRatio,
          });
          const size = state.size;
          const scale = Math.min(
            size.height / viewport.height,
            size.width / viewport.width
          );

          viewport = page.getViewport({ scale });

          const canvas = getCanvas(viewport);
          const context = canvas.getContext("2d");

          const task = page.render({ canvasContext: context, viewport });

          return task.promise.then(() => canvas);
        })
        .then((canvas) => {
          if (!signal.aborted) {
            set({ canvas });
          }
        })
        .catch((error) => {
          if (!signal.aborted) {
            throw error;
          }
        });

    if (
      state.document &&
      state.size &&
      pageNumber &&
      state.document.numPages >= pageNumber
    ) {
      const controller = new AbortController();
      getRenderedPage({ pageNumber, signal: controller.signal });

      return () => controller.abort();
    }
  }, [pageNumber, set, state.document, state.size]);

  const blockRef = useRef();
  useResizeObserver(blockRef, (entry) => {
    set({ size: entry.contentRect });
  });

  const ratio = state.size
    ? state.size.height / HEIGHT < state.size.width / WIDTH
    : 0;

  return (
    <div
      ref={blockRef}
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
      }}
    >
      {state.document && pageNumber && (
        <Canvas
          canvas={state.canvas}
          after={(canvas) => freeCanvas(canvas)}
          style={{
            position: "absolute",
            border: "1px solid rgba(0, 0, 0, 0.18)",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${
              1 / client(() => window.devicePixelRatio) ?? 1
            })`,
          }}
        />
      )}

      {state.document && !pageNumber && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          Blank PDF Document
        </div>
      )}

      {state.size && !state.document && (
        <div
          className={loader}
          style={{
            width: ratio ? "unset" : state.size.width,
            height: ratio ? state.size.height : "unset",
            aspectRatio: `${WIDTH} / ${HEIGHT}`,
          }}
        />
      )}
    </div>
  );
};

export default Viewer;
