import { PanelResizeHandle } from "react-resizable-panels";
import {
  buttons,
  selectWithInfo,
  infoTime,
  resizeHandleOuter,
  resizeHandleHoverArea,
  resizeHandleInner,
  scrollBox,
  debugFont,
  emptyDebugger,
  debugInfo,
  nodeStyles,
  boxInfo,
  panelGrid,
  footerControls,
  headerControls,
  preview,
  replError,
  githubLink,
} from "./repl-layout.module.css";

const Buttons = ({ children }) => <div className={buttons}>{children}</div>;

const Version = ({ time, value }) => (
  <div className={selectWithInfo}>
    <div>version: {value ?? "--"}</div>
    <div className={infoTime}>generation time: {time ?? "--"}</div>
  </div>
);

function ResizeHandle({ className = "" }) {
  return (
    <PanelResizeHandle className={[resizeHandleOuter, className].join(" ")}>
      <div className={resizeHandleHoverArea} />
      <div className={resizeHandleInner} />
    </PanelResizeHandle>
  );
}

const ScrollBox = ({ children }) => <div className={scrollBox}>{children}</div>;
const DebugFont = ({ children }) => <div className={debugFont}>{children}</div>;
const EmptyDebugger = ({ children }) => (
  <div className={emptyDebugger}>{children}</div>
);

const DebugInfo = ({ children }) => <div className={debugInfo}>{children}</div>;
const Styles = ({ children }) => <div className={nodeStyles}>{children}</div>;
const BoxInfo = ({ children }) => <div className={boxInfo}>{children}</div>;

const PreviewPanel = ({ children }) => (
  <section className={panelGrid}>{children}</section>
);
const HeaderControls = ({ children }) => (
  <div className={headerControls}>{children}</div>
);
const FooterControls = ({ children }) => (
  <div className={footerControls}>{children}</div>
);
const Preview = ({ children }) => <div className={preview}>{children}</div>;

const errorRegexp = /underlying failures:(?<errors>.+)/;
const Error = ({ message }) => {
  const { groups } = errorRegexp.exec(message) ?? {
    groups: { errors: message },
  };

  return (
    <code className={replError}>
      <pre>
        {groups.errors
          .trim()
          .split(",")
          .map((part) => part.trim())
          .join("\n")}
      </pre>
    </code>
  );
};

const GithubButton = () => (
  <a
    target="_blank"
    rel="noopener noreferrer"
    href="https://github.com/jeetiss/react-pdf-repl"
    className={githubLink}
  >
    <svg height={20} viewBox="0 0 16 16" width={20}>
      <path
        fillRule="evenodd"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
      />
    </svg>
  </a>
);

export {
  Buttons,
  Version,
  ResizeHandle,
  ScrollBox,
  DebugFont,
  EmptyDebugger,
  DebugInfo,
  Styles,
  BoxInfo,
  PreviewPanel,
  HeaderControls,
  FooterControls,
  Preview,
  Error,
  GithubButton,
};
