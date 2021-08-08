import BlobStream from "blob-stream";
import FontStore from "@react-pdf/font";
import renderPDF from "@react-pdf/render";
import PDFDocument from "@react-pdf/pdfkit";
import layoutDocument from "@react-pdf/layout";
import {
  createRenderer,
  G,
  Svg,
  View,
  Text,
  Link,
  Page,
  Note,
  Path,
  Rect,
  Line,
  Stop,
  Defs,
  Image,
  Tspan,
  Canvas,
  Circle,
  Ellipse,
  Polygon,
  Document,
  Polyline,
  ClipPath,
  TextInstance,
  LinearGradient,
  RadialGradient,
} from "@react-pdf/renderer";

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
    const stream = renderPDF(ctx, layout).pipe(BlobStream());

    const blob = await new Promise((resolve, reject) => {
      stream.on("finish", () => resolve(stream.toBlob("application/pdf")));
      stream.on("error", reject);
    });

    return {
      layout,
      pdf: blob,
    };
  };

  return {
    render,
    updateContainer,
  };
};

const Font = fontStore;

const StyleSheet = {
  create: (s) => s,
};

export {
  Font,
  StyleSheet,
  pdf,
  G,
  Svg,
  View,
  Text,
  Link,
  Page,
  Note,
  Path,
  Rect,
  Line,
  Stop,
  Defs,
  Image,
  Tspan,
  Canvas,
  Circle,
  Ellipse,
  Polygon,
  Document,
  Polyline,
  ClipPath,
  TextInstance,
  LinearGradient,
  RadialGradient,
};
