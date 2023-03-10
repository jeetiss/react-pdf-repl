"use client";

import { Sandpack } from "@codesandbox/sandpack-react";

import appsource from "./example/Document.jsx?raw";
import indexsource from "./example/index.jsx?raw";
import vitesource from "./example/vite.config.js?raw";
import stylessource from "./example/styles.css?raw";
import htmlsource from "./example/index.html?raw";
import packagesource from "./example/package.json?raw";

function App() {
  return (
    <Sandpack
      files={{
        "/Document.jsx": appsource,
        "/package.json": packagesource,
        "/styles.css": stylessource,
        "/index.html": htmlsource,
        "/vite.config.js": vitesource,
        "/index.jsx": indexsource,
      }}
      options={{ visibleFiles: ["/Document.jsx"] }}
      customSetup={{ environment: "node" }}
    />
  );
}

export default App;
