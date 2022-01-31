import FontStore from "@react-pdf/font";
import renderPDF from "@react-pdf/render";
import PDFDocument from "@react-pdf/pdfkit";
import layoutDocument from "./layout";
import { createRenderer } from "@react-pdf/renderer";

const fontStore = new FontStore();

// We must keep a single renderer instance, otherwise React will complain
let renderer;

const pdf = (initialValue) => {
  const container = { type: "ROOT", document: null };
  renderer = renderer || createRenderer({});
  const mountNode = renderer.createContainer(container);

  const updateContainer = (doc) => {
    renderer.updateContainer(doc, mountNode, null);
  };

  if (initialValue) updateContainer(initialValue);

  const render = async (compress = true) => {
    const props = container.document.props || {};
    const { pdfVersion, language } = props;

    const ctx = new PDFDocument({
      compress,
      pdfVersion,
      lang: language,
      displayTitle: true,
      autoFirstPage: false,
    });

    const layout = await layoutDocument(container.document, fontStore);

    console.log(layout)

    return renderPDF(ctx, layout);
  };

  const toBlob = async () => {
    const stream = await render();
    const chunks = [];

    return new Promise((resolve, reject) => {
      try {
        stream.on("data", (chunk) => {
          if (!(chunk instanceof Uint8Array)) chunk = new Uint8Array(chunk);
          chunks.push(chunk);
        });

        stream.on("end", () => {
          resolve(
            new Blob(chunks, {
              type: "application/pdf",
            })
          );
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  return {
    container,
    toBlob,
    updateContainer,
  };
};

const Font = fontStore;

const StyleSheet = {
  create: (s) => s,
};

const version = '0.0.0-experimental'

export * from "@react-pdf/primitives";
export { version, Font, StyleSheet, pdf };
