import { atom } from "jotai/vanilla";

const findNode = (nodeTree, predicate) => {
  if (predicate(nodeTree)) return nodeTree;

  if (nodeTree.children) {
    for (let i = 0; i < nodeTree.children.length; ++i) {
      let result = findNode(nodeTree.children[i], predicate);
      if (result) return result;
    }
  }

  return null;
};

const layout = atom(null);
const url = atom(null);

const innerHover = atom({ id: null, pathable: false });
const hover = atom(
  (get) => get(innerHover).id,
  (get, set, update) => {
    const id = get(innerHover).id;

    if (update && update.id) {
      if (id !== update.id) {
        set(innerHover, update);
      }
    } else {
      if (id !== update) {
        set(innerHover, { id: update, pathable: true });
      }
    }
  }
);
const hoverPath = atom((get) => {
  const nodeTree = get(layout);
  const { id: activeId, pathable } = get(innerHover);
  const path = [];

  if (!activeId || !pathable) return path;

  const activeNode = findNode(nodeTree, (node) => node._id === activeId);

  let node = activeNode;
  path.unshift(node._id);
  while (node.parent) {
    node = node.parent;
    path.unshift(node._id);
  }

  return path;
});

const selected = atom(null);
const protectSelected = atom(
  (get) => {
    return get(selected);
  },
  (get, set, value) => {
    if (typeof value === "string") {
      if (value === get(selected)?._id) return;
      const nodeTree = get(layout);
      const activeNode = findNode(nodeTree, (node) => node._id === value);
      set(selected, activeNode);
    } else {
      set(selected, value);
    }
  }
);

const derivedLayout = atom(
  (get) => get(layout),
  (get, set, nodeTree) => {
    set(layout, nodeTree);

    // update selectedNode
    const selectedNode = get(selected);
    if (!selectedNode) {
      return set(selected, nodeTree);
    }

    const newSelectedNode = findNode(
      nodeTree,
      (node) => node._id === selectedNode._id
    );

    if (newSelectedNode) {
      set(selected, newSelectedNode);
    } else {
      set(selected, nodeTree);
    }
  }
);

export {
  derivedLayout as layoutAtom,
  url as urlAtom,
  hoverPath as hoverPathAtom,
  hover as hoverAtom,
  protectSelected as selectedAtom,
};
