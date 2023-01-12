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
} from "../components/repl-layout";
import { loader } from "../components/viewer.module.css";
import {
  page as pageAtom,
  pagesCount as pagesCountAtom,
  canDecrease as canDecreaseAtom,
  canIncrease as canIncreaseAtom,
  increase as increaseAtom,
  decrease as decreaseAtom,
} from "../state/page";

import { layoutAtom, selectedAtom } from "../state/debugger";

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

const toggleMode = (state, key, { keys, forcedValue }) => {
  console.log({ state, key, keys, forcedValue });

  const newState = {};
  if (keys) {
    keys.forEach((key) => (newState[key] = false));
  }

  newState[key] = forcedValue ?? !state[key];
  return newState;
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
    isDebugOpened: true,
    isCodeOpened: true,
  }));

  const [isReady, setReady] = useState(false);
  const [code, setCode] = useState(() => urlParams.code ?? defCode);

  const [page] = useAtom(pageAtom);
  const [, setPagesCount] = useAtom(pagesCountAtom);
  const [canDecrease] = useAtom(canDecreaseAtom);
  const [, decrease] = useAtom(decreaseAtom);
  const [canIncrease] = useAtom(canIncreaseAtom);
  const [, increase] = useAtom(increaseAtom);

  const [layout, setLayout] = useAtom(layoutAtom);
  const [selectedNode] = useAtom(selectedAtom);

  const pdf = useWorker();

  const debuggerAPI = useRef();
  const editorAPI = useRef();
  const mobileBottomPanelAPI = useRef();

  useEffect(() => {
    if (options.version !== state.version) {
      setReady(false);
      pdf.call("init", options.version).then(() => setReady(true));
    }
  }, [pdf, update, state.version, options.version]);

  useEffect(() => {
    console.log(state);
  }, [state]);

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
          }
          update({ url, time: Date.now() - startTime, error: null });
        })
        .catch((error) => {
          if (error === "fatal_error") {
            log.error(error, { code: compress(code) });
          }
          update({ time: Date.now() - startTime, error });
        });
    }
  }, [pdf, code, update, isReady, options.modules, setLayout]);

  const editorPanel = (
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
        _monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: true,
        });
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
  );

  // const viewerPanel = ();

  const previewPanel = (
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

        {page && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <button disabled={!canDecrease} onClick={() => decrease()}>
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
              <div style={{ textAlign: "center", minWidth: 20 }}>{page}</div>
            </div>
            <button disabled={!canIncrease} onClick={() => increase()}>
              {">"}
            </button>
          </div>
        )}

        <Buttons>
          <button
            onClick={() => {
              const link = new URL(window.location);
              const params = `?modules=1&version=${
                options.version
              }&cp_code=${compress(code)}`;
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
      </HeaderControls>

      <Preview>
        <Viewer
          url={state.url}
          page={page}
          isDebugging={state.isDebugOpened}
          layout={layout}
          onParse={({ pagesCount }) => setPagesCount(pagesCount)}
        />
      </Preview>

      <FooterControls>
        <button
          onClick={() => {
            if (isMobile) {
              const panel = mobileBottomPanelAPI.current;
              if (!panel) return;

              if (state.isCodeOpened) {
                panel.collapse();
              } else if (state.isDebugOpened) {
                update(
                  toggleMode(state, "isCodeOpened", {
                    keys: ["isCodeOpened", "isDebugOpened"],
                  })
                );
              } else {
                update(
                  toggleMode(state, "isCodeOpened", {
                    keys: ["isCodeOpened", "isDebugOpened"],
                  })
                );
                panel.expand();
              }

              return;
            }

            const panel = editorAPI.current;
            if (!panel) return;

            if (state.isCodeOpened) {
              panel.collapse();
            } else {
              panel.expand();
            }
          }}
        >
          code
        </button>
        <button
          onClick={() => {
            if (isMobile) {
              const panel = mobileBottomPanelAPI.current;
              if (!panel) return;

              if (state.isDebugOpened) {
                panel.collapse();
              } else if (state.isCodeOpened) {
                update(
                  toggleMode(state, "isDebugOpened", {
                    keys: ["isCodeOpened", "isDebugOpened"],
                  })
                );
              } else {
                update(
                  toggleMode(state, "isDebugOpened", {
                    keys: ["isCodeOpened", "isDebugOpened"],
                  })
                );
                panel.expand();
              }
              return;
            }
          
            const panel = debuggerAPI.current;
            if (!panel) return;

            if (state.isDebugOpened) {
              panel.collapse();
            } else {
              panel.expand();
            }
          }}
        >
          debugger
        </button>
      </FooterControls>

      {state.error && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            zIndex: 10,
            minHeight: 100,
            width: "50%",
            padding: 5,
          }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              overflow: "scroll",
              backgroundColor: "#fec1c1",
              border: "3px solid red",
              padding: 15,
            }}
          >
            <pre style={{ margin: 0 }}>
              {typeof state.error === "string"
                ? state.error
                : state.error.stack || state.error.message}
            </pre>
          </div>
        </div>
      )}
    </PreviewPanel>
  );

  const debugPanel = state.isDebuggingSupported ? (
    <PanelGroup autoSaveId="react-pdf-repl-debug-info" direction="horizontal">
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
  );

  return (
    <ClientOnly>
      {isMobile ? (
        <PanelGroup
          key="mobile"
          autoSaveId="react-pdf-repl-mobile"
          direction="vertical"
        >
          <ResizablePanel minSize={20}>{previewPanel}</ResizablePanel>

          <ResizeHandle />
          <ResizablePanel
            minSize={20}
            collapsible
            onCollapse={(collapsed) =>
              update(
                toggleMode(
                  state,
                  state.isDebugOpened ? "isDebugOpened" : "isCodeOpened",
                  {
                    keys: ["isDebugOpened", "isCodeOpened"],
                    forcedValue: !collapsed,
                  }
                )
              )
            }
            ref={mobileBottomPanelAPI}
          >
            {state.isDebugOpened && debugPanel}

            {state.isCodeOpened && editorPanel}
          </ResizablePanel>
        </PanelGroup>
      ) : (
        <PanelGroup
          key="desktop"
          autoSaveId="react-pdf-repl"
          direction="horizontal"
        >
          <ResizablePanel
            ref={editorAPI}
            defaultSize={50}
            minSize={20}
            collapsible
            onCollapse={(collapsed) =>
              update(
                toggleMode(state, "isCodeOpened", {
                  forcedValue: !collapsed,
                })
              )
            }
          >
            {state.isCodeOpened && editorPanel}
          </ResizablePanel>

          <ResizeHandle />

          <ResizablePanel minSize={20}>
            <PanelGroup autoSaveId="react-pdf-repl-debug" direction="vertical">
              <ResizablePanel minSize={20}>{previewPanel}</ResizablePanel>

              <ResizeHandle />

              <ResizablePanel
                minSize={20}
                collapsible
                onCollapse={(collapsed) =>
                  update(
                    toggleMode(state, "isDebugOpened", {
                      forcedValue: !collapsed,
                    })
                  )
                }
                ref={debuggerAPI}
              >
                {state.isDebugOpened && debugPanel}
              </ResizablePanel>
            </PanelGroup>
          </ResizablePanel>
        </PanelGroup>
      )}
    </ClientOnly>
  );
};

export default Repl;
