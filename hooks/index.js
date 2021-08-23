import { useEffect, useLayoutEffect } from "react";

const isDOM = typeof document !== "undefined";

const useIsomorphicEffect = isDOM ? useLayoutEffect : useEffect;

const createSingleton = (constructor, destructor) => {
  const ref = {};
  return () => {
    if (!ref.instance) {
      ref.instance = constructor();
    }

    useIsomorphicEffect(() => {
      if (ref.timeout) {
        clearTimeout(ref.timeout);
        delete ref.timeout;
      } else {
        ref.usageCount = (ref.usageCount || 0) + 1;
      }

      return () => {
        ref.timeout = setTimeout(() => {
          ref.usageCount = ref.usageCount - 1;

          if (ref.usageCount === 0) {
            destructor && destructor(ref.instance);
            delete ref.instance;
            delete ref.timeout;
          }
        });
      };
    }, []);

    return ref.instance;
  };
};

const useAsyncEffect = (fn, deps) => {
  useEffect(() => {
    const controller = new AbortController();
    const dest = fn(controller);

    return () => {
      controller.abort();
      dest && dest();
    };
  }, deps);
};

export { createSingleton, useAsyncEffect };
