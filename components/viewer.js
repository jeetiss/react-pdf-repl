import * as pdfjs from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.js";
import { useEffect, useRef } from "react";
import useResizeObserver from "@react-hook/resize-observer";
import { createSingleton, useEventCallback, useSetState } from "../hooks";
import TreeCore from "./debug-tree";
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

  canvas.style.display = "block";

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

  return <div ref={ref} className={className} style={style}></div>;
};

const Viewer = ({ page: pageNumber, url, isDebugging, layout, onParse }) => {
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
    const getDocument = ({ signal }) =>
      Promise.resolve(signal.aborted)
        .then((aborted) => {
          if (aborted) throw Error("aborted");
          const task = pdfjs.getDocument({ url, worker });
          signal.addEventListener("abort", () => task.destroy());
          return task.promise;
        })
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

    if (url) {
      const controller = new AbortController();
      getDocument({ signal: controller.signal });

      return () => {
        controller.abort();
      };
    } else {
      set({ document: null });
    }
  }, [set, url, worker]);

  useEffect(() => {
    const getRenderedPage = ({ pageNumber, signal }) =>
      Promise.resolve(signal.aborted)
        .then((aborted) => {
          if (aborted) throw Error("aborted");
          return state.document.getPage(pageNumber);
        })
        .then((page) => {
          let viewport = page.getViewport({
            scale: 1 / window.devicePixelRatio,
          });
          const size = state.size;
          const scale = size.width / viewport.width;

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

      return () => {
        controller.abort();
      };
    }
  }, [pageNumber, set, state.document, state.size]);

  const blockRef = useRef();
  useResizeObserver(blockRef, (entry) => {
    const { width = 0, height = 0 } = entry.contentRect;
    // borders
    set({ size: { width: width - 2, height: height - 2 } });
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
        minHeight: 200,
        minWidth: 200,
      }}
    >
      {state.document && pageNumber && (
        <Canvas
          canvas={state.canvas}
          after={(canvas) => freeCanvas(canvas)}
          style={{
            position: "absolute",
            border: "1px solid rgba(0, 0, 0, 0.18)",
            transformOrigin: "0 0",
            transform: `scale(${
              1 / client(() => window.devicePixelRatio) ?? 1
            })`,
          }}
        ></Canvas>
      )}

      {isDebugging && layout && <TreeCore nodes={[layout]} size={state.size} />}

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
            width: "100%",
            height: "100%",
          }}
        />
      )}
    </div>
  );
};

export default Viewer;
