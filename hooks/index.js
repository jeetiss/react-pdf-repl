import { useEffect, useLayoutEffect, useRef, useCallback, useState } from "react";
import useResizeObserver from "@react-hook/resize-observer";

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

const useUpdatedRef = (value) => {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
};

const useEventCallback = (callback) => {
  const ref = useUpdatedRef(callback);
  return useCallback((arg) => ref.current && ref.current(arg), [ref]);
};

const useAsyncEffect = (fn, deps) => {
  const cb = useEventCallback(fn);

  useEffect(() => {
    const controller = new AbortController();
    cb(controller.signal).catch((error) => {
      if (!error._isAborted) return Promise.reject(error);
    });
    return () => controller.abort();
  }, [cb, ...deps]);
};

const useSize = (target) => {
  const [size, setSize] = useState();

  useIsomorphicEffect(() => {
    setSize(target.current.getBoundingClientRect());
  }, [target]);

  // Where the magic happens
  useResizeObserver(target, (entry) => setSize(entry.contentRect));

  return size;
};

export { createSingleton, useAsyncEffect, useSize };
