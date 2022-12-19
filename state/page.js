import { atom } from "jotai/vanilla";

const pagesCount = atom(1);
const page = atom(1);
const pageWithBorders = atom(
  (get) => get(page),
  (get, set, value) => {
    const min = 1;
    const max = get(pagesCount);

    set(page, Math.min(Math.max(min, value), max));
  }
);

const canIncrease = atom((get) => get(pageWithBorders) < get(pagesCount));
const increase = atom(null, (get, set) =>
  set(pageWithBorders, get(pageWithBorders) + 1)
);
const canDecrease = atom((get) => get(pageWithBorders) > 1);
const decrease = atom(null, (get, set) =>
  set(pageWithBorders, get(pageWithBorders) - 1)
);

export {
  pagesCount,
  pageWithBorders as page,
  canIncrease,
  increase,
  canDecrease,
  decrease,
};
