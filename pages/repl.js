import { useEffect, useState } from "react";

import { ReactCompareSlider } from "react-compare-slider";

import { createSingleton } from "../hooks";
import { WorkerV1, WorkerV2 } from "../worker";

import dynamic from "next/dynamic";
import { code as defCode } from "../code/default-example";

// import definitions from "../types/builded.d.ts";

import { Document, Page, pdfjs } from "react-pdf";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.js";
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

const MonacoEditor = dynamic(import("react-monaco-editor"), { ssr: false });

const useWorkerV1 = createSingleton(
  () => new WorkerV1(),
  (worker) => worker.terminate()
);

const useWorkerV2 = createSingleton(
  () => new WorkerV2(),
  (worker) => worker.terminate()
);

const Repl = () => {
  const [urlv1, setUrlv1] = useState();
  const [urlv2, setUrlv2] = useState();
  const [page, setPage] = useState(1);
  const [code, setCode] = useState(() => defCode);

  const pdfv1 = useWorkerV1();
  const pdfv2 = useWorkerV2();

  useEffect(() => {
    pdfv1.call("evaluate", code).then(setUrlv1);
    pdfv2.call("evaluate", code).then(setUrlv2);
  }, [pdfv2, code, pdfv1]);

  return (
    <div style={{ display: "flex" }}>
      <MonacoEditor
        width="50%"
        height="100vh"
        value={code}
        onChange={setCode}
        language="typescript"
        editorWillMount={(monaco) => {
          monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            jsx: monaco.languages.typescript.JsxEmit.React,
            lib: [],
          });

          const fakeDefs = [
            "declare const render: (arg: any) => void;",
            "declare const React: object;",
          ].join("\n");

          const fakeUri = "ts:filename/a.d.ts";

          monaco.languages.typescript.typescriptDefaults.addExtraLib(
            fakeDefs,
            fakeUri
          );

          monaco.editor.createModel(
            fakeDefs,
            "typescript",
            monaco.Uri.parse(fakeUri)
          );

          let model = monaco.editor.createModel(
            code,
            "typescript",
            monaco.Uri.file("foo.tsx")
          );
          return { model };
        }}
        editorDidMount={(editor, monaco) => {
          console.log(editor, monaco);
          monaco.editor.onDidChangeMarkers((uris) => {
            const editorUri = editor.getModel().uri;
            if (editorUri) {
              const currentEditorHasMarkerChanges = uris.find(
                (uri) => uri.path === editorUri.path
              );
              if (currentEditorHasMarkerChanges) {
                const markers = monaco.editor.getModelMarkers({
                  resource: editorUri,
                });
                console.log(markers);
              }
            }
          });
        }}
      />
      <div>
        <ReactCompareSlider
          itemOne={
            urlv1 && (
              <Document file={urlv1}>
                <Page
                  scale={0.9}
                  pageNumber={page}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            )
          }
          itemTwo={
            urlv2 && (
              <Document file={urlv2}>
                <Page
                  scale={0.9}
                  pageNumber={page}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            )
          }
        ></ReactCompareSlider>

        <button onClick={() => setPage((page) => page - 1)}>prev</button>
        {page}
        <button onClick={() => setPage((page) => page + 1)}>next</button>
      </div>
    </div>
  );
};

export default Repl;
