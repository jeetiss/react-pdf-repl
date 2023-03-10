"use client";

import { Sandpack } from "@codesandbox/sandpack-react";

function App() {
  return (
    <Sandpack
      template="vite-react"
      files={{
        "/App.jsx": `import { Text, Page, View, Document } from "@react-pdf/renderer";

export default () => (
  <Document>
    <Page size={[100, 100]}>
      <View
        style={{
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>new</Text>
      </View>
    </Page>
  </Document>
);
        `,

        "/package.json": JSON.stringify({
          scripts: {
            dev: "vite",
            build: "vite build",
            preview: "vite preview",
          },
          dependencies: {
            "@react-pdf/renderer": "^3.1.7",
            react: "^18.2.0",
            "react-dom": "^18.2.0",
          },
          devDependencies: {
            "@vitejs/plugin-react": "^3.1.0",
            vite: "^4.0.0",
            "esbuild-wasm": "^0.17.11",
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

import MyDocument from "./App";
import "./styles.css";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <h1>Hello react-pdf</h1>
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

export default App;
