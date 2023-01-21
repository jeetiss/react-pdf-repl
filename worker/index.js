class Wrapper {
  constructor(ctr) {
    this.index = 0;
    if (typeof document !== "undefined") {
      this.worker = ctr();
    } else {
      this.worker = {};
    }
  }

  terminate() {
    return this.worker.terminate();
  }

  __call(method, ...args) {
    if (this.workerIsDead) return Promise.reject("worker is dead, reload the page");
    const info = { method, args, key: `_${this.index++}_` };

    return new Promise((resolve, reject) => {
      const handler = ({ data }) => {
        if (data.key === info.key) {
          if (data.error) {
            reject(data.error);
          } else {
            resolve(data.result);
          }

          this.worker.removeEventListener("message", handler);
        }
      };

      this.worker.addEventListener("message", handler);
      this.worker.postMessage(info);
    });
  }

  call(...args) {
    const timeout = args.at(-1)?.timeout ?? false;
    if (!timeout) {
      return this.__call(...args);
    }

    return Promise.race([
      this.__call(...args),

      new Promise((resolve, reject) =>
        setTimeout(() => reject("fatal_error"), timeout)
      ),
    ]).catch((error) => {
      if (error === "fatal_error") {
        this.terminate();
        this.workerIsDead = true;
      }

      return Promise.reject(error);
    });
  }
}

const CoreWorker = Wrapper.bind(
  Wrapper,
  () => new Worker(new URL("./multi-source", import.meta.url))
);

export { CoreWorker as Worker };
