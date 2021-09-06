import { useAtom } from "jotai";
import { useMemo } from "react";

import {
  hoverAtom,
  selectedAtom,
  layoutAtom,
  pageNumberAtom,
} from "../code/store";

const Box = ({ box, children, active, ...props }) => (
  <div
    {...props}
    style={{
      position: children ? "absolute" : "relative",
      top: box.top,
      left: box.left,
      right: box.right,
      bottom: box.bottom,
      width: box.width,
      height: box.height,
      backgroundColor: active ? "#80acff79" : "transparent",
    }}
  >
    {children}
  </div>
);

const DebugLeaf = ({ node }) => {
  const [hover] = useAtom(hoverAtom);

  const [layout] = useAtom(layoutAtom);
  const [page] = useAtom(pageNumberAtom);

  const skip = useMemo(() => {
    if (node.type === "PAGE") {
      return layout.children[page - 1] !== node;
    } else {
      return false;
    }
  }, [layout.children, node, page]);

  const props = {
    "data-id": node._id,
    box: node.box,
    active: node._id === hover,
  };

  if (skip || node.type === "TEXT_INSTANCE") {
    return null;
  } else if (node.type === "DOCUMENT") {
    return <DebugTree nodes={node.children} />;
  } else if (node.children && node.children.length > 0) {
    return (
      <Box {...props}>
        <DebugTree nodes={node.children} />
      </Box>
    );
  } else {
    return <Box {...props} />;
  }
};

const DebugTree = ({ nodes }) =>
  nodes.map((node, index) => <DebugLeaf node={node} key={index} />);

const TreeCore = ({ nodes }) => {
  const [, select] = useAtom(selectedAtom);
  const [, hover] = useAtom(hoverAtom);

  return (
    <div
      onClick={(e) => select(e.target.dataset.id)}
      onMouseEnter={(e) => hover(e.target.dataset.id)}
      onMouseMove={(e) => hover(e.target.dataset.id)}
      onMouseLeave={() => hover(null)}
    >
      <DebugTree nodes={nodes}></DebugTree>
    </div>
  );
};

export { DebugTree, DebugLeaf, Box };
export default TreeCore;
