import init, { parse_stdf } from "../wasm/stdf_wasm.js";

let initialized = false;

self.onmessage = async (e: MessageEvent) => {
  const { type, data, filename } = e.data;

  if (type === "parse") {
    try {
      if (!initialized) {
        await init();
        initialized = true;
      }

      self.postMessage({ type: "status", message: "Parsing STDF file..." });

      const bytes = new Uint8Array(data);
      const result = parse_stdf(bytes, filename);

      self.postMessage({ type: "result", data: result });
    } catch (err) {
      self.postMessage({
        type: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }
};
