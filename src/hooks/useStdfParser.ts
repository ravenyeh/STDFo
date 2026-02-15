import { useState, useCallback, useRef } from "react";
import type { StdfAnalysis } from "../types/stdf";

type ParseStatus = "idle" | "loading" | "done" | "error";

export function useStdfParser() {
  const [status, setStatus] = useState<ParseStatus>("idle");
  const [analysis, setAnalysis] = useState<StdfAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const parseFile = useCallback((file: File) => {
    setStatus("loading");
    setError(null);
    setAnalysis(null);
    setFileName(file.name);

    if (workerRef.current) {
      workerRef.current.terminate();
    }

    const worker = new Worker(
      new URL("../workers/stdf-worker.ts", import.meta.url),
      { type: "module" }
    );
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent) => {
      const { type, data, message } = e.data;
      if (type === "result") {
        setAnalysis(data as StdfAnalysis);
        setStatus("done");
        worker.terminate();
      } else if (type === "error") {
        setError(message);
        setStatus("error");
        worker.terminate();
      }
    };

    worker.onerror = (e) => {
      setError(e.message || "Worker error");
      setStatus("error");
      worker.terminate();
    };

    const reader = new FileReader();
    reader.onload = () => {
      worker.postMessage({
        type: "parse",
        data: reader.result,
        filename: file.name,
      });
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const reset = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }
    setStatus("idle");
    setAnalysis(null);
    setError(null);
    setFileName(null);
  }, []);

  return { status, analysis, error, fileName, parseFile, reset };
}
