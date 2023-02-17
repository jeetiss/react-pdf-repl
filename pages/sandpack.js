import { Sandpack } from "@codesandbox/sandpack-react";

export default function App() {
  return (
    <Sandpack
      template="vite-react"
      files={{
        "/App.jsx": `import { Text, Page, View, Document } from "@react-pdf/renderer";

export default () => (
  <Document>
    <Page size="A6">
      <View
        style={{
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>new document</Text>
      </View>
    </Page>
  </Document>
);`,

        "/package.json": JSON.stringify({
          scripts: {
            dev: "vite",
            build: "vite build",
            preview: "vite preview",
          },
          dependencies: {
            "@react-pdf/renderer": "^3.1.4",
            events: "^3.3.0",
            react: "^18.2.0",
            "react-dom": "^18.2.0",
          },
          devDependencies: {
            "@vitejs/plugin-react": "3.1.0",
            vite: "4.0.0",
            "esbuild-wasm": "0.15.12",
          },
        }),
        "/vite.config.js": `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
`,
        "/index.jsx": `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PDFViewer } from "@react-pdf/renderer";
import "./styles.css";
import MyDocument from "./App";
const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <PDFViewer>
      <MyDocument />
    </PDFViewer>
  </StrictMode>
);`,
      }}
      options={{ visibleFiles: ["/App.jsx"] }}
    />
  );
}
