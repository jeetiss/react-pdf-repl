import * as pdfjs from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.js";
import { forwardRef, useEffect, useRef } from "react";
import useResizeObserver from "@react-hook/resize-observer";
import { createSingleton, useEventCallback } from "../hooks";
import { useViewerMegaState } from "../state/pdf-view";
import { loader } from "./viewer.module.css";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

const useWorker = createSingleton(
  () => new pdfjs.PDFWorker({ name: "pdfjs-worker" }),
  (worker) => worker.destroy()
);

const WIDTH = 210;
const HEIGHT = 297;

const client = (fn) => typeof window !== "undefined" && fn();

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
  const {
    document,
    size,
    setUrl,
    setSize,
    setPage,
    setWorker,
    pageCanvas,
    freeCanvas,
  } = useViewerMegaState();

  const onParseCallback = useEventCallback(onParse);

  const blockRef = useRef();

  useEffect(() => {
    setUrl(url);
  }, [setUrl, url]);

  useEffect(() => {
    setPage(pageNumber);
  }, [setPage, pageNumber]);

  useEffect(() => {
    setWorker(worker);
  }, [setWorker, worker]);

  useResizeObserver(blockRef, (entry) => {
    setSize(entry.contentRect);
  });

  useEffect(() => {
    if (document) {
      onParseCallback({ pagesCount: document.numPages });
    }
  }, [document, onParseCallback]);

  const ratio = size ? size.height / HEIGHT < size.width / WIDTH : 0;

  return (
    <div
      ref={blockRef}
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
      }}
    >
      {document && (
        <Canvas
          canvas={pageCanvas}
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

      {size && !document && (
        <div
          className={loader}
          style={{
            width: ratio ? "unset" : size.width,
            height: ratio ? size.height : "unset",
            aspectRatio: `${WIDTH} / ${HEIGHT}`,
          }}
        />
      )}
    </div>
  );
};

export default Viewer;
