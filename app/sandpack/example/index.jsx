import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PDFViewer } from "@react-pdf/renderer";

import MyDocument from "./Document";
import "./styles.css";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <PDFViewer className="Viewer" showToolbar={false}>
      <MyDocument />
    </PDFViewer>
  </StrictMode>
);
