import { repl, panel, controls, buttons } from "./repl-layout.module.css";

// const Layout = () => {
//   return (
//     <Section>
//       <Editor />

//       <Panel>
//         <Controls>
//           <Buttons></Buttons>
//         </Controls>
//         <Viwer />
//         <Errors />
//       </Panel>
//     </Section>
//   );
// };

const Main = ({ children }) => <main className={repl}>{children}</main>;
const Panel = ({ children }) => <section className={panel}>{children}</section>;
const Controls = ({ children }) => <div className={controls}>{children}</div>;
const Buttons = ({ children }) => <div className={buttons}>{children}</div>;

export { Main, Panel, Controls, Buttons };
