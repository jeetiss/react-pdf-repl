import "ses";
import { createCanvas, Image, Path2D } from "@napi-rs/canvas";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf";
import "pdfjs-dist/legacy/build/pdf.worker";
import { readFile } from "node:fs/promises";

import * as React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import {
  toModule,
  LayoutProvider,
  serializeLayout,
} from "../../worker/to-module";

import { decompress } from "../../code/lz";
import { code } from "../../code/default-example";

const templatePromise = readFile(
  new URL("../../public/g-template.png", import.meta.url)
);

const getTemplate = async () => {
  const template = new Image();
  template.src = await templatePromise;

  return template;
};

const evaluate = async (code) => {
  const { namespace } = await toModule(code);

  if (!("default" in namespace)) {
    throw new Error("The default export is not a React PDF Component");
  }

  let layout = null;

  const element = React.createElement(
    LayoutProvider,
    { fn: (info) => (layout = info._INTERNAL__LAYOUT__DATA_) },
    React.createElement(namespace.default)
  );
  const buffer = await renderToBuffer(element);

  return {
    buffer,
    layout: serializeLayout(layout),
  };
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
  const canvas = createCanvas(1600, 800);

  const { cp_code } = req.query;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 1600, 900);
  ctx.drawImage(await getTemplate(), 0, 0);

  try {
    const pdf = await evaluate(cp_code ? decompress(cp_code) : code);

    const document = await pdfjs.getDocument({
      data: pdf.buffer,
      verbosity: 0,
    }).promise;

    const { canvas: pdfCanvas, viewport } = await getCanvas(
      document.getPage(1),
      {
        width: 1400,
        height: 800 - 104,
      }
    );
    ctx.save();
    ctx.fillStyle = "#e2e2e2";
    ctx.shadowColor = "rgba(0, 0, 0, .15)";
    ctx.shadowBlur = 200;
    ctx.shadowOffsetY = 300;
    ctx.fillRect(100 - 1, 104 - 1, viewport.width + 2, viewport.height + 2);
    ctx.drawImage(pdfCanvas, 100, 104);
    ctx.restore();
  } catch (error) {
    console.log(error);
    // error state image
    ctx.save();
    ctx.fillStyle = "#F5D0D0";
    ctx.shadowColor = "rgba(0, 0, 0, .15)";
    ctx.shadowBlur = 200;
    ctx.shadowOffsetY = 300;
    ctx.fillRect(100, 104, 1400, 810);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
    ctx.lineWidth = 10;
    ctx.strokeRect(100 + 5, 104 + 5, 1400 - 10, 800);
    ctx.restore();

    ctx.save();
    ctx.translate(758, 469);
    const crossPath = new Path2D(
      "M76.2 83.6 0 7.3 7.3 0l76.3 76.2-7.4 7.4Zm-68.8 0L0 76 76.1 0l7.5 7.4L7.4 83.6Z"
    );
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.fill(crossPath);
    ctx.restore();
  }

  res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
  res.setHeader("content-type", "image/jpeg");
  return res.send(canvas.toBuffer("image/jpeg"));
}
