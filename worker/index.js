class Wrapper {
  constructor(ctr) {
    this.index = 0;
    this.__ctr = ctr;
    this.start();
  }

  start() {
    if (this.worker) return;

    this.worker = this.__ctr();
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  __call(method, ...args) {
    if (!this.worker)
      return Promise.reject({ fatal: true, message: "Worker is destroyed" });
    const info = { method, args, key: `_${this.index++}_` };

    return new Promise((resolve, reject) => {
      const handler = ({ data }) => {
        if (data.key === info.key) {
          if (data.error) {
            reject({ message: data.error });
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
        setTimeout(
          () =>
            reject({
              fatal: true,
              message: `Worker is not responded in ${timeout}ms`,
            }),
          timeout
        )
      ),
    ]).catch((error) => {
      if (error?.fatal) {
        this.terminate();
      }

      return Promise.reject(error);
    });
  }
}

const CoreWorker = Wrapper.bind(
  Wrapper,
  () => new Worker(new URL("./executer.js", import.meta.url))
);

export { CoreWorker as Worker };
