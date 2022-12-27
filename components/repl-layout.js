import { PanelResizeHandle } from "react-resizable-panels";
import {
  panel,
  controls,
  buttons,
  selectWithInfo,
  infoTime,
  resizeHandleOuter,
  resizeHandleInner,
} from "./repl-layout.module.css";

const Panel = ({ children }) => <section className={panel}>{children}</section>;
const Controls = ({ children }) => <div className={controls}>{children}</div>;
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
      <div className={resizeHandleInner} />
    </PanelResizeHandle>
  );
}

export { Panel, Controls, Buttons, Select, ResizeHandle };
