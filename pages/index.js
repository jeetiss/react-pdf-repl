/* eslint-disable react/display-name */
import { useEffect } from "react";
import { useAtom } from "jotai";
import { Mosaic, MosaicWindow } from "react-mosaic-component";

import doc from "../code/diff-content";
import { pdf } from "../exp-layout";

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
  pageCountAtom,
  pageNumberAtom,
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

  const [count, setCount] = useAtom(pageCountAtom);
  const [page, setPage] = useAtom(pageNumberAtom);

  return (
    <MosaicWindow
      path={path}
      renderToolbar={() => (
        <div>
          <button onClick={toggle}>debugger;</button>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            download="document.pdf"
          >
            Download
          </a>
        </div>
      )}
    >
      {layout && (
        <div className={styles.previewContainer}>
          <div className={styles.preview}>
            <Document
              file={url}
              onLoadSuccess={({ numPages }) => setCount(numPages)}
            >
              <Page
                pageNumber={page}
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

          <div>
            <button onClick={() => setPage(page - 1)}>{"<"}</button>
            {page} - {count}
            <button onClick={() => setPage(page + 1)}>{">"}</button>
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

  const [layout, setLayout] = useAtom(layoutAtom);
  const [, setUrl] = useAtom(urlAtom);

  useEffect(() => {
    const { component: Doc } = doc;
    const instance = pdf();

    instance.updateContainer(<Doc />);
    instance.toBlob().then((blob) => {
      setUrl(URL.createObjectURL(blob));
      setLayout(addId(blob.__SECRET_LAYOUT_DO_NOT_USE_OR_YOU_WILL_BE_FIRED));
    });
  }, [setLayout, setUrl]);

  useEffect(() => {
    console.log(layout);
  }, [layout]);

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
