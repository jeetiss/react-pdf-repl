import { useAtom } from "jotai";

import { hoverAtom, hoverPathAtom, selectedAtom } from "../code/store";

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
      backgroundColor: active ? "#e2e2e2e2" : "transparent",
    }}
  >
    {children}
  </div>
);

const DebugLeaf = ({ node }) => {
  const [hover] = useAtom(hoverAtom);

  const props = {
    "data-id": node._id,
    box: node.box,
    active: node._id === hover,
  };

  if (node.type === "DOCUMENT") {
    return <DebugTree nodes={node.children} />;
  } else if (node.children && node.children.length > 0) {
    return (
      <Box {...props}>
        <DebugTree nodes={node.children} />
      </Box>
    );
  } else if (node.type === "TEXT_INSTANCE") {
    return null;
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
