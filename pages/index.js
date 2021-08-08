import { createElement, useEffect, useState } from "react";
import Doc from "../src/example";
import { pdf } from "../src/pdf";

import styles from "../styles/layout.module.css";
import st from "../styles/box-sizing.module.css";

import { Document, Page, pdfjs } from "react-pdf";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.js";
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

const Leaf = ({ node, select, hover, indent }) => {
  const attrs = node.props
    ? Object.entries(node.props)
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ")
    : null;

  const tagWithAttrs = [node.type, attrs].filter(Boolean).join(" ");

  const hoverHandler = () => hover(node);
  const selectHandler = () => select(node);
  const blurHandler = () => hover(null);

  return node.children && node.children.length > 0 ? (
    <>
      <div
        className={styles.line}
        style={{ "--indent": indent }}
        onMouseEnter={hoverHandler}
        onMouseOut={blurHandler}
        onClick={selectHandler}
      >{`<${tagWithAttrs}>`}</div>
      <Tree
        nodes={node.children}
        select={select}
        hover={hover}
        indent={indent + 1}
      />
      <div
        className={styles.line}
        style={{ "--indent": indent }}
        onMouseEnter={hoverHandler}
        onMouseOut={blurHandler}
        onClick={selectHandler}
      >{`</${node.type}>`}</div>
    </>
  ) : node.type === "TEXT_INSTANCE" ? (
    <div className={styles.line} style={{ "--indent": indent }}>
      {node.value}
    </div>
  ) : (
    <div
      className={styles.line}
      style={{ "--indent": indent }}
      onMouseEnter={hoverHandler}
      onMouseOut={blurHandler}
      onClick={selectHandler}
    >{`<${tagWithAttrs} />`}</div>
  );
};

const Tree = ({ nodes, select, hover, indent = 0 }) =>
  nodes.map((child, index) => (
    <Leaf
      node={child}
      key={index}
      indent={indent}
      select={select}
      hover={hover}
    />
  ));

const addParent = (node, parent) => {
  if (parent) node.parent = parent;

  if (node.children)
    node.children.forEach((child) => {
      addParent(child, node);
    });

  return node;
};

const calcSize = (node) => {
  let top = node.box.top;
  let left = node.box.left;

  while (node.parent) {
    node = node.parent;

    top += node.box.top || 0;
    left += node.box.left || 0;
  }

  return { top, left };
};

export default function Home() {
  const [layout, setLayout] = useState();
  const [url, setUrl] = useState();

  const [selected, select] = useState();
  const [hovered, hover] = useState();

  useEffect(() => {
    const instance = pdf();

    instance.updateContainer(createElement(Doc));
    instance.render().then(({ layout, pdf }) => {
      setLayout(addParent(layout));
      setUrl(URL.createObjectURL(pdf));
    });
  }, []);

  useEffect(() => console.log(layout), [layout]);
  // useEffect(() => console.log(hovered), [hovered]);

  return layout ? (
    <div className={styles.container}>
      <div>
        <Document file={url}>
          <Page pageNumber={1} />
        </Document>

        {hovered && (
          <div
            className={styles.debug}
            style={{
              width: hovered.box.width,
              height: hovered.box.height,
              ...calcSize(hovered),
            }}
          ></div>
        )}
      </div>

      <div className={styles.code}>
        <Tree nodes={[layout]} select={select} hover={hover} />
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

const BoxSizing = ({ box }) => {
  return (
    <div className={st.container}>
      <SizingWrapper
        className={st.margin}
        numbers={[
          box.marginBottom,
          box.marginLeft,
          box.marginRight,
          box.marginTop,
        ]}
      >
        <SizingWrapper
          className={st.padding}
          numbers={[
            box.paddingBottom,
            box.paddingLeft,
            box.paddingRight,
            box.paddingTop,
          ]}
        >
          <div className={st.size}>
            {box.width ? box.width.toFixed(2) : "-"} x{" "}
            {box.height ? box.height.toFixed(2) : "-"}
          </div>
        </SizingWrapper>
      </SizingWrapper>
    </div>
  );
};

const SizingWrapper = ({ className, numbers = [], children }) => (
  <div
    className={className}
    style={{
      display: "grid",
      gridTemplate: "repeat(3, min-content) / repeat(3, max-content)",
      justifyItems: "center",
      alignItems: "center",
      gap: "5px",
    }}
  >
    <div style={{ gridRow: "1", gridColumn: "2" }}>{numbers[0] || "-"}</div>
    <div style={{ gridRow: "2", gridColumn: "1" }}>{numbers[1] || "-"}</div>

    <div style={{ gridRow: "2", gridColumn: "2" }}>{children}</div>

    <div style={{ gridRow: "2", gridColumn: "3" }}>{numbers[2] || "-"}</div>
    <div style={{ gridRow: "3", gridColumn: "2" }}>{numbers[3] || "-"}</div>
  </div>
);
