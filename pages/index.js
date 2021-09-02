import { createElement, useEffect } from "react";
import { useAtom } from "jotai";

import Doc from "../code/example";
import { pdf } from "../code/pdf";

import styles from "../styles/layout.module.css";

import ElementsTree from "../components/elements-tree";
import DebugTree from "../components/debug-tree";
import BoxSizing from "../components/box-sizing";

import { layoutAtom, urlAtom, selectedAtom } from "../code/store";

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

export default function Home() {
  const [layout, setLayout] = useAtom(layoutAtom);
  const [url, setUrl] = useAtom(urlAtom);

  const [selected] = useAtom(selectedAtom);

  useEffect(() => {
    const instance = pdf();

    instance.updateContainer(createElement(Doc));
    instance.render().then(({ layout, pdf }) => {
      setLayout(addId(layout));
      setUrl(URL.createObjectURL(pdf));
    });
  }, [setLayout, setUrl]);

  useEffect(() => console.log(layout), [layout]);

  return layout ? (
    <div className={styles.container}>
      <div>
        <Document file={url}>
          <Page pageNumber={1} />
        </Document>

        <div className={styles.debug}>
          <DebugTree nodes={[layout]}></DebugTree>
        </div>
      </div>

      <div className={styles.code}>
        <ElementsTree nodes={[layout]} />
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
  ) : null;
}
