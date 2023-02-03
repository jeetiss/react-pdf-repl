let formatter = null;

export const tryFormat = (code, cb) => {
  if (!formatter) {
    formatter = new Worker(new URL("./prettier", import.meta.url));
  }

  formatter.onmessage = (event) => cb(event.data.code);
  formatter.postMessage({ code });
};
