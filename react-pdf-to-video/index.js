const { Buffer } = require("buffer");
const Canvas = require("canvas");
const pdfjs = require("pdfjs-dist/legacy/build/pdf");
const { renderToStream } = require("@react-pdf/renderer-v1");

const NodeCanvasFactory = {
  create(width, height) {
    const canvas = Canvas.createCanvas(width, height);
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
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  },
};

async function getCanvas(pagePromise) {
  const page = await pagePromise;
  const viewport = page.getViewport({ scale: 2.0 });
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

  return canvas;
}

const composeCanvases = (canvases, gap = 20) => {
  const [maxWidth, maxHeight] = canvases.reduce(
    ([width, height], canvas) => [
      Math.max(width, canvas.width),
      Math.max(height, canvas.height),
    ],
    [0, 0]
  );

  const resultCanvas = Canvas.createCanvas(
    maxWidth + gap * 2,
    maxHeight * canvases.length + gap * (canvases.length + 1)
  );
  const resultContext = resultCanvas.getContext("2d");

  canvases.forEach((canvas, index) => {
    resultContext.drawImage(canvas, gap, maxHeight * index + gap * (index + 1));
  });

  return resultCanvas;
};

const range = (length) => Array.from({ length }, (_, index) => index);

async function renderToBuffer(element) {
  const stream = await renderToStream(element);
  return new Promise((resolve) => {
    const buffers = [];
    stream.on("data", (d) => {
      buffers.push(d);
    });
    stream.on("end", () => {
      resolve(Buffer.concat(buffers));
    });
  });
}

const renderComponent = async (element) => {
  const source = await renderToBuffer(element);

  const document = await pdfjs.getDocument({
    data: source.buffer,
    verbosity: 0,
  }).promise;

  const pages = range(document.numPages).map((pageIndex) =>
    document.getPage(pageIndex + 1)
  );

  const canvases = await Promise.all(pages.map((page) => getCanvas(page)));
  const pageSnapshots = composeCanvases(canvases);

  const bgCanvas = Canvas.createCanvas(320 * 2, 480 * 2);

  const ctx = bgCanvas.getContext("2d");
  ctx.fillStyle = "#7D7D7D";
  ctx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

  ctx.drawImage(pageSnapshots, 0, 0)

  return bgCanvas.toBuffer();
};

module.exports = renderComponent;
