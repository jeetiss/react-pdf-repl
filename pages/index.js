import { useEffect, useReducer, useState } from "react";
import Editor from "@monaco-editor/react";
import LZString from "lz-string";
import useConstant from "use-constant";
import { useAtom } from "jotai/react";

import { createSingleton, useSetState } from "../hooks";
import { Worker } from "../worker";
import Viewer from "../components/viewer";
import {
  Main,
  Panel,
  Controls,
  Buttons,
  Select,
} from "../components/repl-layout";
import { loader } from "../components/viewer.module.css";
import {
  page,
  pagesCount,
  canDecrease,
  canIncrease,
  increase,
  decrease,
} from "../state/page";

import { code as defCode } from "../code/default-example";

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

const useWorker = createSingleton(
  () => new Worker(),
  (worker) => worker.terminate()
);

const supportedVersions = [
  "3.0.2",
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

const checkRange = (version) => {
  if (version && supportedVersions.includes(version)) return version;

  return null;
};

const Loader = () => <div className={loader} />;

const Repl = () => {
  const [state, update] = useSetState({
    error: null,
    url: null,
    version: null,
    time: null,
  });

  const urlParams = useConstant(() => {
    if (typeof window === "undefined") return {};

    return Object.fromEntries(
      Array.from(new URLSearchParams(window.location.search).entries()).map(
        ([key, value]) => {
          if (key.startsWith("cp_")) {
            return [key.slice(3), decompress(value)];
          }

          return [key, value];
        }
      )
    );
  });

  const [options, updateOptions] = useSetState(() => ({
    version: checkRange(urlParams.version) ?? supportedVersions[0],
  }));

  const [isReady, setReady] = useState(false);
  const [code, setCode] = useState(() => urlParams.code ?? defCode);

  const [pageV] = useAtom(page);
  const [, setPagesCount] = useAtom(pagesCount);
  const [canDecreaseV] = useAtom(canDecrease);
  const [, decreaseS] = useAtom(decrease);
  const [canIncreaseV] = useAtom(canIncrease);
  const [, increaseS] = useAtom(increase);

  const pdf = useWorker();

  useEffect(() => {
    if (options.version !== state.version) {
      setReady(false);
      pdf.call("init", options.version).then(() => setReady(true));
    }
  }, [pdf, update, state.version, options.version]);

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
        .then((url) => {
          update({ url, time: Date.now() - startTime, error: null });
        })
        .catch((error) => update({ time: Date.now() - startTime, error }));
    }
  }, [pdf, code, update, isReady]);

  return (
    <Main>
      <Editor
        loading={<Loader />}
        language="javascript"
        value={code}
        onChange={(newCode) => {
          setCode(newCode ?? "");
        }}
        beforeMount={(_monaco) => {
          _monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            allowNonTsExtensions: true,
            checkJs: true,
            allowJs: true,
            noLib: true,
            jsx: "react",
          });
          _monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(
            { noSemanticValidation: true }
          );
        }}
        options={{
          wordWrap: "on",
          tabSize: 2,
          minimap: {
            enabled: false,
          },
          contextmenu: false,
        }}
      />
      <Panel>
        <Controls>
          <Select
            time={state.time}
            value={options.version}
            onChange={(e) => {
              update({ url: null });
              updateOptions({ version: e.target.value });
            }}
          >
            {supportedVersions.map((version) => (
              <option key={version}>{version}</option>
            ))}
          </Select>

          {pageV && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <button disabled={!canDecreaseV} onClick={() => decreaseS()}>
                {"<"}
              </button>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0px 0px 3px 5px",
                }}
              >
                page:
                <div style={{ textAlign: "center", minWidth: 20 }}>{pageV}</div>
              </div>
              <button disabled={!canIncreaseV} onClick={() => increaseS()}>
                {">"}
              </button>
            </div>
          )}

          <Buttons>
            <button
              onClick={() => {
                const link = new URL(window.location);
                const params = `?version=${options.version}&cp_code=${compress(
                  code
                )}`;
                link.search = params;
                navigator.clipboard.writeText(link.toString());
              }}
            >
              copy link
            </button>

            <button
              onClick={() => {
                window.open(state.url);
              }}
            >
              open pdf
            </button>
          </Buttons>
        </Controls>

        <Viewer
          url={state.url}
          page={pageV}
          onParse={({ pagesCount }) => setPagesCount(pagesCount)}
        />

        {state.error && (
          <div
            style={{
              position: "fixed",
              bottom: 0,
              minHeight: 100,
              width: "50%",
              padding: 5,
            }}
          >
            <div
              style={{
                display: "flex",
                width: "100%",
                backgroundColor: "#fec1c1",
                border: "3px solid red",
                padding: 15,
              }}
            >
              <pre style={{ margin: 0 }}>{state.error}</pre>
            </div>
          </div>
        )}
      </Panel>
    </Main>
  );
};

export default Repl;
