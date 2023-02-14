import { useAtom } from "jotai/react";
import { useEffect, useMemo, useRef } from "react";

import { hoverAtom, selectedAtom, layoutAtom } from "../state/debugger";
import { page as pageNumberAtom } from "../state/page";

const scale = (box, dpr) =>
  dpr > 1
    ? Object.fromEntries(
        Object.entries(box).map(([key, value]) => [key, value * dpr])
      )
    : box;

const trimNegative = (value) => (value < 0 ? 0 : value);
const getNegative = (value) => (value > 0 ? 0 : value);

const BoxOnCanvas = ({ box }) => {
  const ref = useRef();

  useEffect(() => {
    const ctx = ref.current.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    const {
      borderBottomWidth,
      borderLeftWidth,
      borderRightWidth,
      borderTopWidth,

      marginBottom,
      marginLeft,
      marginRight,
      marginTop,

      paddingBottom,
      paddingLeft,
      paddingRight,
      paddingTop,

      right,
      top,
      bottom,
      left,

      width,
      height,
    } = scale(box, dpr);

    const canvasWidth =
      width + trimNegative(marginLeft) + trimNegative(marginRight);
    const canvasHeight =
      height + trimNegative(marginBottom) + trimNegative(marginTop);

    ctx.canvas.width = canvasWidth;
    ctx.canvas.height = canvasHeight;

    // margin
    if (
      marginBottom !== 0 ||
      marginLeft !== 0 ||
      marginRight !== 0 ||
      marginTop !== 0
    ) {
      ctx.fillStyle = "rgb(248 204 158)";
      ctx.fillRect(
        -getNegative(marginLeft),
        -getNegative(marginTop),
        width + marginLeft + marginRight,
        height + marginBottom + marginTop
      );
    }

    if (
      borderBottomWidth !== 0 ||
      borderLeftWidth !== 0 ||
      borderRightWidth !== 0 ||
      borderTopWidth !== 0
    ) {
      // border
      ctx.fillStyle = "rgb(250 220 160)";
      ctx.fillRect(
        trimNegative(marginLeft),
        trimNegative(marginTop),
        width,
        height
      );
    }

    if (
      paddingBottom !== 0 ||
      paddingLeft !== 0 ||
      paddingRight !== 0 ||
      paddingTop !== 0
    ) {
      // padding
      ctx.fillStyle = "rgb(196 207 140)";
      ctx.fillRect(
        trimNegative(marginLeft) + borderLeftWidth,
        trimNegative(marginTop) + borderTopWidth,
        width - borderLeftWidth - borderRightWidth,
        height - borderTopWidth - borderBottomWidth
      );
    }

    // body
    ctx.fillStyle = "rgb(172 201 255)";
    ctx.fillRect(
      trimNegative(marginLeft) + paddingLeft + borderLeftWidth,
      trimNegative(marginTop) + paddingTop + borderTopWidth,
      width - paddingLeft - paddingRight - borderLeftWidth - borderRightWidth,
      height - paddingBottom - paddingTop - borderTopWidth - borderBottomWidth
    );

    if (dpr > 1) {
      ctx.canvas.style.transformOrigin = "0 0";
      ctx.canvas.style.transform = `scale(${1 / dpr})`;
    }
    ctx.canvas.style.opacity = 0.75;
    ctx.canvas.style.position = "absolute";
    ctx.canvas.style.top = `${-trimNegative(box.marginTop)}px`;
    ctx.canvas.style.left = `${-trimNegative(box.marginLeft)}px`;
    ctx.canvas.style.pointerEvents = "none";
  }, [box]);

  return <canvas ref={ref} />;
};

const Box = ({ box, children, active, minPresenceAhead, ...props }) => (
  <div
    {...props}
    style={{
      position: "absolute",
      top: box.top,
      left: box.left,
      right: box.right,
      bottom: box.bottom,
      width: box.width,
      height: box.height,
    }}
  >
    {active && <BoxOnCanvas box={box} />}
    {minPresenceAhead && active && (
      <div
        style={{
          position: "absolute",
          bottom: -(minPresenceAhead + box.marginBottom),
          width: "100%",
          height: minPresenceAhead,
          borderBottom: "1px dashed red",
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
    minPresenceAhead: node.props?.minPresenceAhead
      ? Number.parseFloat(node.props?.minPresenceAhead)
      : null,
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

  if (
    !nodes[0].children.length ||
    !page ||
    !nodes[0].children[page - 1] ||
    !size
  )
    return null;

  const { width } = nodes[0].children[page - 1].box;
  const scale = size.width / width;

  return (
    <div
      onClick={(e) => select(e.target.dataset.id)}
      onMouseEnter={(e) => hover(e.target.dataset.id)}
      onMouseMove={(e) => hover(e.target.dataset.id)}
      onMouseLeave={() => hover(null)}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        transform: `scale(${scale})`,
      }}
    >
      <DebugTree nodes={nodes}></DebugTree>
    </div>
  );
};

export { DebugTree, DebugLeaf, Box };
export default TreeCore;
