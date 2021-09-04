/* eslint-disable react/display-name */
import { createElement, useEffect, useContext } from "react";
import { useAtom } from "jotai";
import { Mosaic, MosaicWindow } from "react-mosaic-component";

import Doc from "../code/example";
import { pdf } from "../code/pdf";

import styles from "../styles/layout.module.css";

import ElementsTree from "../components/elements-tree";
import DebugTree from "../components/debug-tree";
import BoxSizing from "../components/box-sizing";

import {
  layoutAtom,
  urlAtom,
  selectedAtom,
  mosaicAtom,
  toggleAtom,
} from "../code/store";

import { Document, Page, pdfjs } from "react-pdf";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.js";
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

const addId = (node, parent, prefix, postfix) => {
  if (parent) node.parent = parent;
  node._id = [prefix, node.type, postfix].filter((v) => v).join("__");

  if (node.children)
    node.children.forEach((child, index) => {
      addId(child, node, node._id, index + 1);
    });

  return node;
};

const Preview = ({ path }) => {
  const [debuggerDisabled, toggle] = useAtom(toggleAtom);
  const [layout] = useAtom(layoutAtom);
  const [url] = useAtom(urlAtom);

  return (
    <MosaicWindow
      path={path}
      renderToolbar={() => (
        <div>
          <button onClick={toggle}>debugger;</button>
        </div>
      )}
    >
      {layout && (
        <div className={styles.previewContainer}>
          <div className={styles.preview}>
            <Document file={url}>
              <Page
                pageNumber={1}
                renderAnnotationLayer={false}
                renderTextLayer={false}
              />
            </Document>

            {debuggerDisabled || (
              <div className={styles.debug}>
                <DebugTree nodes={[layout]}></DebugTree>
              </div>
            )}
          </div>
        </div>
      )}
    </MosaicWindow>
  );
};

const Debugger = ({ path }) => {
  const [selected] = useAtom(selectedAtom);
  const [, toggle] = useAtom(toggleAtom);
  const [layout] = useAtom(layoutAtom);

  return (
    <MosaicWindow
      path={path}
      toolbarControls={[
        <button key="1" onClick={toggle}>
          Close
        </button>,
      ]}
    >
      <div>
        <div className={styles.code}>
          {layout && <ElementsTree nodes={[layout]} />}
        </div>

        <div className={styles.details}>
          <div>computed</div>

          <div>
            {selected &&
              Object.entries(selected.style).map(([style, value]) => (
                <div key={style}>
                  {style}: {value}
                </div>
              ))}
          </div>

          <BoxSizing box={selected ? selected.box : {}} />
        </div>
      </div>
    </MosaicWindow>
  );
};

const ELEMENT_MAP = {
  preview: Preview,
  debugger: Debugger,
};

export default function Home() {
  const [currentNode, setNode] = useAtom(mosaicAtom);

  const [, setLayout] = useAtom(layoutAtom);
  const [, setUrl] = useAtom(urlAtom);

  useEffect(() => {
    const instance = pdf();

    instance.updateContainer(createElement(Doc));
    instance.render().then(({ layout, pdf }) => {
      setLayout(addId(layout));
      setUrl(URL.createObjectURL(pdf));
    });
  }, [setLayout, setUrl]);

  return (
    <div className={styles.container}>
      <Mosaic
        renderTile={(id, path) => {
          const Component = ELEMENT_MAP[id];
          return <Component path={path} />;
        }}
        value={currentNode}
        onChange={setNode}
        className=""
      />
    </div>
  );
}
