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

  call(method, ...args) {
    const info = { method, args, key: `_${this.index++}_` };

    return new Promise((resolve, reject) => {
      const handler = ({ data }) => {
        if (data.key === info.key) {
          if (data.result) resolve(data.result);
          else reject(data.error);

          this.worker.removeEventListener("message", handler);
        }
      };

      this.worker.addEventListener("message", handler);
      this.worker.postMessage(info);
    });
  }
}

const WorkerV2 = Wrapper.bind(
  Wrapper,
  () => new Worker(new URL("./source-v2", import.meta.url))
);

export { WorkerV2 };
