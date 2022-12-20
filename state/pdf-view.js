import { atom } from "jotai/vanilla";
import { useAtom } from "jotai/react";
import * as pdfjs from "pdfjs-dist";

const abortify = (destroyer, errorHandler) => async (fn, signal) => {
  if (signal.aborted) {
    return aborter();
  }

  const task = fn();
  const aborter = () => destroyer(task);

  signal.addEventListener("abort", aborter, { once: true });

  const result = await errorHandler(task.promise);
  signal.removeEventListener("abort", aborter);

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

const urlAtom = atom(null);
const pageNumberAtom = atom(1);
const workerAtom = atom(null);
const documentAtom = atom(async (get, { signal }) => {
  const url = get(urlAtom);
  if (url) {
    const worker = get(workerAtom);
    return await wrapDoc(() => pdfjs.getDocument({ url, worker }), signal);
  }
});

const viewportSizeAtom = atom({ width: 0, height: 0 });

const pageViewAtom = atom(async (get, { signal }) => {
  const doc = await get(documentAtom);
  if (doc) {
    const pageNumber = get(pageNumberAtom);
    const size = get(viewportSizeAtom);

    const page = await doc.getPage(pageNumber);

    let viewport = page.getViewport({ scale: 1 / window.devicePixelRatio });

    const scale = Math.min(
      size.height / viewport.height,
      size.width / viewport.width
    );

    viewport = page.getViewport({ scale });
    const canvas = getCanvas(viewport);
    const context = canvas.getContext("2d");

    await wrapPage(
      () => page.render({ canvasContext: context, viewport }),
      signal
    );

    return canvas;
  }
});

const useViewerMegaState = () => {
  const [url, setUrl] = useAtom(urlAtom);
  const [size, setSize] = useAtom(viewportSizeAtom);
  const [, setPage] = useAtom(pageNumberAtom);
  const [, setWorker] = useAtom(workerAtom);
  const [document] = useAtom(documentAtom);
  const [pageCanvas] = useAtom(pageViewAtom);

  return {
    url,
    size,
    document,
    setUrl,
    setSize,
    setPage,
    setWorker,
    pageCanvas,
    freeCanvas,
  };
};

export { useViewerMegaState };
