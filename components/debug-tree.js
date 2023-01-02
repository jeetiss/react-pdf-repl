import { useAtom } from "jotai/react";
import { useMemo } from "react";

import { hoverAtom, selectedAtom, layoutAtom } from "../state/debugger";
import { page as pageNumberAtom } from "../state/page";

const Box = ({ box, children, active, minPresenceAhead, ...props }) => (
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
    {minPresenceAhead && (
      <div
        style={{
          position: "absolute",
          bottom: -(minPresenceAhead + box.marginBottom),
          width: "100%",
          height: minPresenceAhead,
          borderBottom: active ? "1px solid red" : "none",
          pointerEvents: "none",
        }}
      ></div>
    )}
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
    minPresenceAhead: node.props?.minPresenceAhead,
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

const TreeCore = ({ nodes, size }) => {
  const [, select] = useAtom(selectedAtom);
  const [, hover] = useAtom(hoverAtom);
  const [page] = useAtom(pageNumberAtom);

  const { height, width } = nodes[0].children[page - 1].box;
  const scale = Math.min(size.height / height, size.width / width);

  return (
    <div
      onClick={(e) => select(e.target.dataset.id)}
      onMouseEnter={(e) => hover(e.target.dataset.id)}
      onMouseMove={(e) => hover(e.target.dataset.id)}
      onMouseLeave={() => hover(null)}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-${(width / 2) * scale}px, -${
          (height / 2) * scale
        }px) scale(${scale})`,
      }}
    >
      <DebugTree nodes={nodes}></DebugTree>
    </div>
  );
};

export { DebugTree, DebugLeaf, Box };
export default TreeCore;
