let messageIndex = 0;

const call = (worker, method, args) => {
  const signal = args.at(-1).signal;

  const serializableArgs =
    typeof signal !== "undefined" ? args.slice(0, args.length - 1) : args;

  const info = {
    method,
    args: serializableArgs,
    key: `_${method}__${messageIndex++}_`,
  };

  console.log(info);

  return new Promise((resolve, reject) => {
    const handler = ({ data }) => {
      if (data.key === info.key) {
        if (data.error) {
          reject(data.error);
        } else {
          resolve(data.result);
        }

        worker.removeEventListener("message", handler);
      }
    };

    worker.addEventListener("message", handler);
    worker.postMessage(info);
  });
};

const AsyncWrapper = (ctr) => (options) => {
  const worker = typeof window !== "undefined" ? ctr() : {};

  return call(worker, "__initialize", [options]).then((methods) => {
    return new Proxy(methods, {
      get: (methods, method, receiver) => {
        if (method === "then") return undefined;

        if (methods.includes(method)) {
          return (...args) => call(worker, method, args);
        }

        throw new Error(`Provided worker doen't support method: ${method}`);
      },
    });
  });
};

const ProxyWorker = AsyncWrapper(
  () => new Worker(new URL("./multi-source", import.meta.url))
);

export { ProxyWorker as createWorker };
