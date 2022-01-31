// import { useEffect, useReducer, useState } from "react";
// import LZString from "lz-string";

// import { createSingleton } from "../hooks";
// // import { WorkerV2 } from "../worker";

// import dynamic from "next/dynamic";
// import { code as defCode } from "../code/nth-page";

// // import definitions from "../types/builded.d.ts";

// const compress = (string) =>
//   LZString.compressToBase64(string)
//     .replace(/\+/g, "-") // Convert '+' to '-'
//     .replace(/\//g, "_") // Convert '/' to '_'
//     .replace(/=+$/, ""); // Remove ending '='

// const decompress = (string) =>
//   LZString.decompressFromBase64(
//     string
//       .replace(/-/g, "+") // Convert '-' to '+'
//       .replace(/_/g, "/") // Convert '_' to '/'
//   );

// import { Document, Page, pdfjs } from "react-pdf";
// import workerSrc from "pdfjs-dist/build/pdf.worker.min.js";
// pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

// const MonacoEditor = dynamic(import("react-monaco-editor"), { ssr: false });

// const useWorkerV2 = createSingleton(
//   () => new WorkerV2(),
//   (worker) => worker.terminate()
// );

// const useMergeState = (initial) =>
//   useReducer((s, a) => ({ ...s, ...a }), initial);

// const Repl = () => {
//   const [state2, update2] = useMergeState({
//     url: null,
//     version: null,
//     time: null,
//   });

//   const [page, setPage] = useState(1);
//   const [code, setCode] = useState(() => {
//     if (typeof window === "undefined") return;

//     const query = new URLSearchParams(window.location.search);
//     if (query.has("code")) {
//       return decompress(query.get("code"));
//     }

//     return defCode;
//   });

//   const pdfV2 = useWorkerV2();

//   useEffect(() => {
//     pdfV2.call("version").then((version) => update2({ version }));
//   }, [pdfV2, update2]);

//   useEffect(() => {
//     const startTime = Date.now();
//     pdfV2
//       .call("evaluate", code)
//       .then((url) => update2({ url, time: Date.now() - startTime }));
//   }, [pdfV2, code, update2]);

//   return (
//     <div style={{ display: "flex" }}>
//       <MonacoEditor
//         width="50%"
//         height="100vh"
//         value={code}
//         onChange={setCode}
//         language="javascript"
//         editorWillMount={(monaco) => {
//           monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
//             jsx: monaco.languages.typescript.JsxEmit.React,
//             lib: [],
//           });

//           // const fakeDefs = [
//           //   "declare const render: (arg: any) => void;",
//           //   "declare const React: object;",
//           // ].join("\n");

//           // const fakeUri = "ts:filename/a.d.ts";

//           // monaco.languages.typescript.typescriptDefaults.addExtraLib(
//           //   fakeDefs,
//           //   fakeUri
//           // );

//           // monaco.editor.createModel(
//           //   fakeDefs,
//           //   "typescript",
//           //   monaco.Uri.parse(fakeUri)
//           // );

//           let model = monaco.editor.createModel(
//             code,
//             "javascript",
//             monaco.Uri.file("foo.jsx")
//           );
//           return { model };
//         }}
//         editorDidMount={(editor, monaco) => {
//           // console.log(editor, monaco);
//           // monaco.editor.onDidChangeMarkers((uris) => {
//           //   const editorUri = editor.getModel().uri;
//           //   if (editorUri) {
//           //     const currentEditorHasMarkerChanges = uris.find(
//           //       (uri) => uri.path === editorUri.path
//           //     );
//           //     if (currentEditorHasMarkerChanges) {
//           //       const markers = monaco.editor.getModelMarkers({
//           //         resource: editorUri,
//           //       });
//           //       console.log(markers);
//           //     }
//           //   }
//           // });
//         }}
//       />
//       <div
//         style={{
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             flexDirection: "row",
//             width: "100%",
//             justifyContent: "space-around",
//           }}
//         >
//           <div style={{ textAlign: "right" }}>
//             <div>react-pdf v{state2.version}</div>
//             <div>time:{state2.time}</div>
//           </div>
//         </div>

//         {state2.url && (
//           <Document file={state2.url}>
//             <Page
//               scale={0.85}
//               pageNumber={page}
//               renderTextLayer={false}
//               renderAnnotationLayer={false}
//             />
//           </Document>
//         )}

//         <div>
//           <button onClick={() => setPage((page) => page - 1)}>prev</button>
//           {page}
//           <button onClick={() => setPage((page) => page + 1)}>next</button>
//         </div>

//         <div>
//           <button
//             onClick={() => {
//               const link = new URL(window.location);
//               link.search = `?code=${compress(code)}`;
//               navigator.clipboard.writeText(link.toString());
//             }}
//           >
//             copy link
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Repl;

const Repl = () => "nope";

export default Repl;
