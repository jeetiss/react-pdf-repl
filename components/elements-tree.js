import { useAtom } from "jotai";
import { useState } from "react";
import { useEffect } from "react";

import { selectedAtom, hoverAtom, hoverPathAtom } from "../code/store";

import styles from "../styles/elements-tree.module.css";

const cn = (...styles) => styles.filter((v) => v).join(" ");

const OpenTag = ({
  children,
  className,
  indent,
  expand,
  expanded,
  ...props
}) => (
  <div className={className} style={{ "--indent": indent }}>
    <span className={styles.expbutton} onClick={() => expand((v) => !v)}>
      {expanded ? "▼" : "▶"}
    </span>

    <span className={styles.tagName} {...props}>
      {children}
    </span>
  </div>
);

const Leaf = ({ node, indent }) => {
  const attrs = node.props
    ? Object.entries(node.props)
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ")
    : null;

  const tagWithAttrs = [node.type, attrs].filter(Boolean).join(" ");

  const [, select] = useAtom(selectedAtom);
  const [hover, setHover] = useAtom(hoverAtom);
  const [selected] = useAtom(selectedAtom);
  const [hoverPath] = useAtom(hoverPathAtom);

  const [expanded, expand] = useState(() => hoverPath.includes(node._id));

  useEffect(() => {
    if (hoverPath.includes(node._id)) {
      expand(true);
    }
  }, [hoverPath, node._id]);

  const getClassName = (node) =>
    cn(
      styles.line,
      hover === node._id && styles.hover,
      selected?._id === node._id && styles.selected
    );

  const props = {
    onMouseEnter: () => setHover({ id: node._id, pathable: false }),
    onMouseLeave: () => setHover(null),
    onClick: () => select(node),
  };

  if (node.type === "TEXT_INSTANCE") {
    return (
      <div
        className={getClassName(node.parent)}
        style={{ "--indent": indent, "--addition": "17px" }}
        onMouseEnter={() => setHover({ id: node.parent._id, pathable: false })}
        onMouseLeave={() => setHover(null)}
        onClick={() => select(node.parent)}
      >
        {node.value}
      </div>
    );
  } else if (node.children && node.children.length > 0 && !expanded) {
    return (
      <OpenTag
        className={getClassName(node)}
        expand={expand}
        expanded={expanded}
        indent={indent}
        hover={hover === node._id}
        {...props}
      >{`<${tagWithAttrs}>...</${node.type}>`}</OpenTag>
    );
  } else if (node.children && node.children.length > 0 && expanded) {
    return (
      <>
        <OpenTag
          className={getClassName(node)}
          expand={expand}
          expanded={expanded}
          indent={indent}
          hover={hover === node._id}
          {...props}
        >{`<${tagWithAttrs}>`}</OpenTag>
        <Tree nodes={node.children} indent={indent + 1} />
        <div
          {...props}
          className={getClassName(node)}
          style={{ "--indent": indent, "--addition": "17px" }}
        >{`</${node.type}>`}</div>
      </>
    );
  } else {
    return (
      <div
        className={getClassName(node)}
        style={{ "--indent": indent, "--addition": "17px" }}
        {...props}
      >{`<${tagWithAttrs} />`}</div>
    );
  }
};

const Tree = ({ nodes, indent = 0 }) =>
  nodes.map((child, index) => (
    <Leaf node={child} key={index} indent={indent} />
  ));

export default Tree;
export { Tree, Leaf };
