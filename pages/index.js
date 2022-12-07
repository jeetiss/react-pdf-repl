import { useEffect, useReducer, useState } from "react";
import LZString from "lz-string";

import { createSingleton } from "../hooks";
import { Worker } from "../worker";

import dynamic from "next/dynamic";
import { code as defCode } from "../code/text-bug";

import { Document, Page, pdfjs } from "react-pdf";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.js";
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

const compress = (string) =>
  LZString.compressToBase64(string)
    .replace(/\+/g, "-") // Convert '+' to '-'
    .replace(/\//g, "_") // Convert '/' to '_'
    .replace(/=+$/, ""); // Remove ending '='

const decompress = (string) =>
  LZString.decompressFromBase64(
    string
      .replace(/-/g, "+") // Convert '-' to '+'
      .replace(/_/g, "/") // Convert '_' to '/'
  );

const MonacoEditor = dynamic(import("react-monaco-editor"), { ssr: false });

const useWorker = createSingleton(
  () => new Worker(),
  (worker) => worker.terminate()
);

const supportedVersions = [
  "3.0.1",
  "3.0.0",
  "2.3.0",
  "2.2.0",
  "2.1.2",
  "2.1.1",
  "2.1.0",
  "2.0.21",
  "1.6.17",
];

const useMergeState = (initial) =>
  useReducer((s, a) => ({ ...s, ...a }), initial);

const Repl = () => {
  const [state, update] = useMergeState({
    url: null,
    version: null,
    time: null,
  });

  const [page, setPage] = useState(1);
  const [pickedVersion, pickVersion] = useState(supportedVersions[0]);
  const [isReady, setReady] = useState(false);
  const [code, setCode] = useState(() => {
    if (typeof window === "undefined") return;

    const query = new URLSearchParams(window.location.search);
    if (query.has("code")) {
      return decompress(query.get("code"));
    }

    return defCode;
  });

  const pdf = useWorker();

  useEffect(() => {
    if (pickedVersion !== state.version) {
      console.log(`load @react-pdf v${pickedVersion}`);
      setReady(false);
      pdf
        .call("init", pickedVersion)
        .then(() => setReady(true))
        .catch(console.log);
    }
  }, [pickedVersion, pdf, update, state.version]);

  useEffect(() => {
    if (isReady) {
      pdf.call("version").then((version) => update({ version }));
    }
  }, [pdf, update, isReady]);

  useEffect(() => {
    if (isReady) {
      const startTime = Date.now();
      pdf
        .call("evaluate", code)
        .then((url) => update({ url, time: Date.now() - startTime }));
    }
  }, [pdf, code, update, isReady]);

  return (
    <div style={{ display: "flex" }}>
      <MonacoEditor
        width="50%"
        height="100vh"
        value={code}
        onChange={setCode}
        language="javascript"
        editorWillMount={(monaco) => {
          monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            jsx: monaco.languages.typescript.JsxEmit.React,
            lib: [],
          });

          // const fakeDefs = [
          //   "declare const render: (arg: any) => void;",
          //   "declare const React: object;",
          // ].join("\n");

          // const fakeUri = "ts:filename/a.d.ts";

          // monaco.languages.typescript.typescriptDefaults.addExtraLib(
          //   fakeDefs,
          //   fakeUri
          // );

          // monaco.editor.createModel(
          //   fakeDefs,
          //   "typescript",
          //   monaco.Uri.parse(fakeUri)
          // );

          let model = monaco.editor.createModel(
            code,
            "javascript",
            monaco.Uri.file("foo.jsx")
          );
          return { model };
        }}
        editorDidMount={(editor, monaco) => {
          // console.log(editor, monaco);
          // monaco.editor.onDidChangeMarkers((uris) => {
          //   const editorUri = editor.getModel().uri;
          //   if (editorUri) {
          //     const currentEditorHasMarkerChanges = uris.find(
          //       (uri) => uri.path === editorUri.path
          //     );
          //     if (currentEditorHasMarkerChanges) {
          //       const markers = monaco.editor.getModelMarkers({
          //         resource: editorUri,
          //       });
          //       console.log(markers);
          //     }
          //   }
          // });
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-around",
          }}
        >
          <select
            value={pickedVersion}
            onChange={(e) => {
              pickVersion(e.target.value);
            }}
          >
            {supportedVersions.map((version) => (
              <option key={version}>{version}</option>
            ))}
          </select>

          <div style={{ textAlign: "right" }}>
            <div>react-pdf v{state.version}</div>
            <div>time:{state.time}</div>
          </div>
        </div>

        {state.url && (
          <Document file={state.url}>
            <Page
              scale={0.85}
              pageNumber={page}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        )}

        <div>
          <button onClick={() => setPage((page) => page - 1)}>prev</button>
          {page}
          <button onClick={() => setPage((page) => page + 1)}>next</button>
        </div>

        <div>
          <button
            onClick={() => {
              const link = new URL(window.location);
              link.search = `?code=${compress(code)}`;
              navigator.clipboard.writeText(link.toString());
            }}
          >
            copy link
          </button>
        </div>
      </div>
    </div>
  );
};

export default Repl;
