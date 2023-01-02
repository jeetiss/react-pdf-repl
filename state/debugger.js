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
  (get) => get(selected),
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

const atomWithLocalStorage = (key, initialValue) => {
  const baseAtom = atom(initialValue);
  baseAtom.onMount = (set) => {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        set(JSON.parse(item));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const derivedAtom = atom(
    (get) => get(baseAtom),
    (get, set, update) => {
      const nextValue =
        typeof update === "function" ? update(get(baseAtom)) : update;
      if (get(baseAtom) !== nextValue) {
        set(baseAtom, nextValue);
        typeof localStorage !== "undefined" &&
          localStorage.setItem(key, JSON.stringify(nextValue));
      }
    }
  );
  return derivedAtom;
};

const usedMosaic = atomWithLocalStorage("MOSAIC_DEBUG_DISABLED", true);
const mosaicPreview = atom("preview");

const mosaicDebug = atomWithLocalStorage("MOSAIC_DEBUG_LAYOUT", {
  direction: "row",
  first: "preview",
  second: "debugger",
  splitPercentage: 50,
});

const mosaic = atom(
  (get) => {
    const value = get(usedMosaic);

    if (value) {
      return get(mosaicPreview);
    } else {
      return get(mosaicDebug);
    }
  },
  (get, set, update) => {
    const value = get(usedMosaic);

    if (value) {
      set(mosaicPreview, update);
    } else {
      set(mosaicDebug, update);
    }
  }
);

const toggle = atom(
  (get) => get(usedMosaic),
  (get, set) => set(usedMosaic, !get(usedMosaic))
);

const pageCount = atom(0);
const pageNumber = atom(1);

const pageNumberDerived = atom(
  (get) => get(pageNumber),
  (get, set, update) => {
    const max = get(pageCount);
    set(pageNumber, ((update - 1 + max) % max) + 1);
  }
);

export {
  layout as layoutAtom,
  url as urlAtom,
  hoverPath as hoverPathAtom,
  hover as hoverAtom,
  protectSelected as selectedAtom,
  mosaic as mosaicAtom,
  toggle as toggleAtom,
  pageCount as pageCountAtom,
  pageNumberDerived as pageNumberAtom,
};
