import {
  repl,
  panel,
  controls,
  buttons,
  selectWithInfo,
  infoTime,
} from "./repl-layout.module.css";

const Main = ({ children }) => <main className={repl}>{children}</main>;
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

export { Main, Panel, Controls, Buttons, Select };
