import { useEffect, useReducer, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import LZString from "lz-string";
import useConstant from "use-constant";
import { useAtom } from "jotai/react";
import { log } from "next-axiom/dist/logger";

import { Panel as ResizablePanel, PanelGroup } from "react-resizable-panels";

import { createSingleton, useSetState } from "../hooks";
import { Worker } from "../worker";
import Viewer from "../components/viewer";
import Tree from "../components/elements-tree";
import BoxSizing from "../components/box-sizing";
import {
  Buttons,
  Select,
  ResizeHandle,
  ScrollBox,
  DebugFont,
  DebugInfo,
  Styles,
  BoxInfo,
  PreviewPanel,
  HeaderControls,
  FooterControls,
  EmptyDebugger,
  Preview,
  Error,
  GithubButton,
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

import { layoutAtom, selectedAtom } from "../state/debugger";

import { code as defCode } from "../code/default-example";
import { tryFormat } from "../worker/format-code";

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
  "3.0.3",
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

function useMediaQuery(query) {
  const getMatches = (query) => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState(() => getMatches(query));

  useEffect(() => {
    function handleChange() {
      setMatches(getMatches(query));
    }

    const matchMedia = window.matchMedia(query);

    // Triggered at the first client-side load and if query changes
    handleChange();

    matchMedia.addEventListener("change", handleChange);

    return () => {
      matchMedia.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}

const ClientOnly = ({ children }) => {
  const [isClient, set] = useState(false);

  useEffect(() => set(true), []);

  return isClient ? children : null;
};

const Loader = () => <div className={loader} />;

const addId = (node, parent, prefix, postfix) => {
  if (parent) node.parent = parent;
  node._id = [prefix, node.type, postfix].filter((v) => v).join("__");

  if (node.children)
    node.children.forEach((child, index) => {
      addId(child, node, node._id, index + 1);
    });

  return node;
};

const createLink = (options) => {
  const link = new URL(window.location);

  link.searchParams.set("cp_code", compress(options.code));

  if (options.modules) {
    link.searchParams.set("modules", options.modules);
  }

  if (options.version !== supportedVersions[0]) {
    link.searchParams.set("version", options.version);
  }

  return link.toString();
};

const Repl = () => {
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

  const isMobile = useMediaQuery("(max-width: 600px)");

  const [options, updateOptions] = useSetState(() => ({
    version: checkRange(urlParams.version) ?? supportedVersions[0],
    modules: urlParams.code ? Boolean(urlParams.modules) : true,
  }));

  const [state, update] = useSetState(() => ({
    url: null,
    version: null,
    time: null,
    error: null,
    isDebuggingSupported: options.modules,
    isDebugging:
      typeof window !== "undefined" &&
      (() => {
        // HARD COOODEEEE
        try {
          const sizes = window.localStorage.getItem(
            "PanelGroup:sizes:react-pdf-repl-debug"
          );
          if (!sizes) return true;
          return !!JSON.parse(sizes)["20,20"].at(-1);
        } catch (error) {
          return true;
        }
      })(),
  }));

  const [isReady, setReady] = useState(false);
  const [code, setCode] = useState(() => urlParams.code ?? defCode);

  const [pageV] = useAtom(page);
  const [, setPagesCount] = useAtom(pagesCount);
  const [canDecreaseV] = useAtom(canDecrease);
  const [, decreaseS] = useAtom(decrease);
  const [canIncreaseV] = useAtom(canIncrease);
  const [, increaseS] = useAtom(increase);

  const [layout, setLayout] = useAtom(layoutAtom);
  const [selectedNode] = useAtom(selectedAtom);

  const pdf = useWorker();

  const debuggerAPI = useRef();

  useEffect(() => {
    if (options.version !== state.version) {
      setReady(false);
      pdf.call("init", options.version).then(() => setReady(true));
    }
  }, [pdf, update, state.version, options.version]);

  useEffect(() => {
    if (isReady) {
      pdf
        .call("version")
        .then(({ version, isDebuggingSupported }) =>
          update({ version, isDebuggingSupported })
        );
    }
  }, [pdf, update, isReady]);

  useEffect(() => {
    if (isReady) {
      const startTime = Date.now();
      pdf
        .call("evaluate", {
          code,
          options: { modules: options.modules },
          timeout: 20_000,
        })
        .then(({ url, layout }) => {
          if (layout) {
            setLayout(addId(layout));
          } else {
            setLayout(null);
          }
          update({ url, time: Date.now() - startTime, error: null });
        })
        .catch((error) => {
          if (error === "fatal_error") {
            log.error(error, { link: createLink({ code, ...options }) });
          }
          update({ time: Date.now() - startTime, error });
        });
    }
  }, [pdf, code, update, isReady, options.modules, setLayout, options]);

  const editorPanel = (
    <ResizablePanel defaultSize={50} minSize={20}>
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
    </ResizablePanel>
  );

  const viewerPanel = (
    <ResizablePanel minSize={20}>
      <PanelGroup autoSaveId="react-pdf-repl-debug" direction="vertical">
        <ResizablePanel minSize={20}>
          <PreviewPanel>
            <HeaderControls>
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
                    <div style={{ textAlign: "center", minWidth: 20 }}>
                      {pageV}
                    </div>
                  </div>
                  <button disabled={!canIncreaseV} onClick={() => increaseS()}>
                    {">"}
                  </button>
                </div>
              )}

              <Buttons>
                <button
                  onClick={() =>
                    tryFormat(code, (formattedCode) => setCode(formattedCode))
                  }
                >
                  format
                </button>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      createLink({ code, ...options })
                    )
                  }
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

                <GithubButton />
              </Buttons>
            </HeaderControls>

            <Preview>
              <Viewer
                url={state.url}
                page={pageV}
                isDebugging={state.isDebugging}
                layout={layout}
                onParse={({ pagesCount }) => setPagesCount(pagesCount)}
              />

              {state.error && (
                <Error
                  message={
                    typeof state.error === "string"
                      ? state.error
                      : state.error.stack || state.error.message
                  }
                />
              )}
            </Preview>

            <FooterControls>
              <button
                onClick={() => {
                  const panel = debuggerAPI.current;
                  if (panel) {
                    if (state.isDebugging) {
                      panel.collapse();
                    } else {
                      panel.expand();
                    }
                  }
                }}
              >
                debugger
              </button>
            </FooterControls>
          </PreviewPanel>
        </ResizablePanel>

        <ResizeHandle />

        <ResizablePanel
          minSize={20}
          collapsible
          onCollapse={(collapsed) => update({ isDebugging: !collapsed })}
          ref={debuggerAPI}
        >
          {state.isDebuggingSupported ? (
            <PanelGroup
              autoSaveId="react-pdf-repl-debug-info"
              direction="horizontal"
            >
              <ResizablePanel>
                {layout && (
                  <ScrollBox>
                    <DebugFont>
                      <Tree nodes={[layout]} />
                    </DebugFont>
                  </ScrollBox>
                )}
              </ResizablePanel>
              <ResizeHandle />
              <ResizablePanel>
                <ScrollBox>
                  <DebugInfo>
                    {selectedNode && selectedNode.style && (
                      <Styles>
                        <pre>
                          {Object.entries(selectedNode.style)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join("\n")}
                        </pre>
                      </Styles>
                    )}

                    {selectedNode && (
                      <BoxInfo>
                        <BoxSizing box={selectedNode.box} />
                      </BoxInfo>
                    )}
                  </DebugInfo>
                </ScrollBox>
              </ResizablePanel>
            </PanelGroup>
          ) : (
            <EmptyDebugger>{`Debugger doesn't supported by this @react-pdf/renderer version`}</EmptyDebugger>
          )}
        </ResizablePanel>
      </PanelGroup>
    </ResizablePanel>
  );

  return (
    <ClientOnly>
      {isMobile ? (
        <PanelGroup autoSaveId="react-pdf-repl-mobile" direction="vertical">
          {viewerPanel}
          <ResizeHandle />
          {editorPanel}
        </PanelGroup>
      ) : (
        <PanelGroup autoSaveId="react-pdf-repl" direction="horizontal">
          {editorPanel}
          <ResizeHandle />
          {viewerPanel}
        </PanelGroup>
      )}
    </ClientOnly>
  );
};

export default Repl;
