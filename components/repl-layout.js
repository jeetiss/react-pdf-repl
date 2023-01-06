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
} from "./repl-layout.module.css";

const Buttons = ({ children }) => <div className={buttons}>{children}</div>;

const Select = ({ time, value, onChange, children }) => (
  <div className={selectWithInfo}>
    <div>
      version:{" "}
      <select value={value} onChange={onChange}>
        {children}
      </select>
    </div>
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
const EmptyDebugger = ({ children }) => <div className={emptyDebugger}>{children}</div>;

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

export {
  Buttons,
  Select,
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
};
