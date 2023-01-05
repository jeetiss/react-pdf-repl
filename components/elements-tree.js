import { useAtom } from "jotai/react";
import {
  forwardRef,
  useCallback,
  useMemo,
  useEffect,
  useState,
  useRef,
} from "react";

import {
  selectedAtom,
  hoverAtom,
  hoverPathAtom,
  layoutAtom,
} from "../state/debugger";
import { page as pageNumberAtom } from "../state/page";

import styles from "../styles/elements-tree.module.css";

const cn = (...styles) => styles.filter((v) => v).join(" ");

const OpenTag = forwardRef(function OpenTag(
  { children, className, indent, expand, expanded, ...props },
  ref
) {
  return (
    <div ref={ref} className={className} style={{ "--indent": indent }}>
      <span className={styles.expbutton} onClick={() => expand((v) => !v)}>
        {expanded ? "▼" : "▶"}
      </span>

      <span className={styles.tagName} {...props}>
        {children}
      </span>
    </div>
  );
});

const Leaf = ({ node, indent }) => {
  const attrs = node.props
    ? Object.entries(node.props)
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ")
    : null;

  const tagWithAttrs = [node.type, attrs].filter(Boolean).join(" ");

  const elementRef = useRef();
  const [, select] = useAtom(selectedAtom);
  const [hover, setHover] = useAtom(hoverAtom);
  const [selected] = useAtom(selectedAtom);
  const [hoverPath] = useAtom(hoverPathAtom);
  const [layout] = useAtom(layoutAtom);
  const [page, setPage] = useAtom(pageNumberAtom);

  const [iexpanded, iexpand] = useState(() => hoverPath.includes(node._id));

  const expanded = useMemo(() => {
    if (node.type === "PAGE") {
      return layout.children[page - 1] === node && iexpanded;
    } else {
      return iexpanded;
    }
  }, [iexpanded, layout.children, node, page]);

  const expand = useCallback(
    (value) => {
      if (node.type === "PAGE") {
        const index = layout.children.indexOf(node);
        setPage(index + 1);
        return iexpand(index + 1 !== page ? true : value);
      } else {
        return iexpand(value);
      }
    },
    [layout.children, node, page, setPage]
  );

  useEffect(() => {
    if (hoverPath.includes(node._id)) {
      expand(true);
    }
  }, [expand, hoverPath, node._id]);

  useEffect(() => {
    if (selected?._id === node._id && elementRef.current) {
      elementRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [node._id, selected?._id]);

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

  if (node.type === "TEXT_INSTANCE" && node.parent && node.parent.lines) {
    return node.parent.lines.map((line, index) => (
      <div
        ref={elementRef}
        key={index}
        className={getClassName(node.parent)}
        style={{ "--indent": indent, "--addition": "17px" }}
        onMouseEnter={() => setHover({ id: node.parent._id, pathable: false })}
        onMouseLeave={() => setHover(null)}
        onClick={() => select(node.parent)}
      >
        {line.string}
      </div>
    ));
  } else if (node.children && node.children.length > 0 && !expanded) {
    return (
      <OpenTag
        ref={elementRef}
        className={getClassName(node)}
        expand={expand}
        expanded={expanded}
        indent={indent}
        hover={hover === node._id ? "true" : undefined}
        {...props}
      >{`<${tagWithAttrs}>...</${node.type}>`}</OpenTag>
    );
  } else if (node.children && node.children.length > 0 && expanded) {
    return (
      <>
        <OpenTag
          ref={elementRef}
          className={getClassName(node)}
          expand={expand}
          expanded={expanded}
          indent={indent}
          hover={hover === node._id ? "true" : undefined}
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
        ref={elementRef}
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
