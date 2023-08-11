import { PanelResizeHandle } from "react-resizable-panels";
import * as styles from "./repl-layout.module.css";

const Buttons = ({ children }) => (
  <div className={styles.buttons}>{children}</div>
);

const Version = ({ time, value }) => (
  <div className={styles.selectWithInfo}>
    <div>version: {value ?? "--"}</div>
    <div className={styles.infoTime}>generation time: {time ?? "--"}</div>
  </div>
);

function ResizeHandle({ className = "" }) {
  return (
    <PanelResizeHandle
      className={[styles.resizeHandleOuter, className].join(" ")}
    >
      <div className={styles.resizeHandleHoverArea} />
      <div className={styles.resizeHandleInner} />
    </PanelResizeHandle>
  );
}

const ScrollBox = ({ children }) => (
  <div className={styles.scrollBox}>{children}</div>
);
const DebugFont = ({ children }) => (
  <div className={styles.debugFont}>{children}</div>
);
const EmptyDebugger = ({ children }) => (
  <div className={styles.emptyDebugger}>{children}</div>
);

const DebugInfo = ({ children }) => (
  <div className={styles.debugInfo}>{children}</div>
);
const Styles = ({ children }) => (
  <div className={styles.nodeStyles}>{children}</div>
);
const BoxInfo = ({ children }) => (
  <div className={styles.boxInfo}>{children}</div>
);

const PreviewPanel = ({ children }) => (
  <section className={styles.panelGrid}>{children}</section>
);
const HeaderControls = ({ children }) => (
  <div className={styles.headerControls}>{children}</div>
);
const FooterControls = ({ children }) => (
  <div className={styles.footerControls}>{children}</div>
);
const Preview = ({ children, style }) => (
  <div className={styles.preview} style={style}>
    {children}
  </div>
);

const errorRegexp = /underlying failures:(?<errors>.+)/;
const Error = ({ error, actions = [] }) => {
  const message =
    typeof error === "string"
      ? error
      : error.stack || error.message;
  const { groups } = errorRegexp.exec(message) ?? {
    groups: { errors: message },
  };

  const showActions = error?.fatal;

  return (
    <div className={styles.errorContainer}>
      <code className={styles.replError}>
        <pre>
          {groups.errors
            .trim()
            .split(",")
            .map((part) => part.trim())
            .join("\n")}
        </pre>
      </code>
      {showActions && (
        <div className={styles.errorActions}>
          {actions.map(([text, action]) => (
            <button key={text} onClick={action}>
              {text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const GithubButton = () => (
  <a
    target="_blank"
    href="https://github.com/jeetiss/react-pdf-repl"
    className={styles.githubLink}
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
