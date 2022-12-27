import { atom } from "jotai/vanilla";

const pagesCount = atom(0);
const page = atom(1);
const pageWithBorders = atom(
  (get) => {
    const _value = get(pagesCount) === 0 ? null : get(page);
    return _value;
  },
  (get, set, value) => {
    const min = 1;
    const max = get(pagesCount);
    const _value = Math.min(Math.max(min, value), max);
    set(page, _value);
  }
);

const canIncrease = atom(
  (get) =>
    get(pageWithBorders) != undefined && get(pageWithBorders) < get(pagesCount)
);
const increase = atom(null, (get, set) =>
  set(pageWithBorders, get(pageWithBorders) + 1)
);
const canDecrease = atom(
  (get) => get(pageWithBorders) != undefined && get(pageWithBorders) > 1
);
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
