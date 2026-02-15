import { useState } from "react";
import { useStdfParser } from "./hooks/useStdfParser";
import { FileUploader } from "./components/FileUploader";
import { Summary } from "./components/Summary";
import { BinChart } from "./components/BinChart";
import { TestResults } from "./components/TestResults";
import { WaferMap } from "./components/WaferMap";

type Tab = "summary" | "bins" | "tests" | "wafer";

function App() {
  const { status, analysis, error, fileName, parseFile, reset } =
    useStdfParser();
  const [activeTab, setActiveTab] = useState<Tab>("summary");

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: "summary", label: "Summary", show: true },
    { id: "bins", label: "Bin Chart", show: true },
    { id: "tests", label: "Test Results", show: true },
    { id: "wafer", label: "Wafer Map", show: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">STDFo</h1>
            <span className="text-xs text-gray-400 hidden sm:inline">
              STDF Analyzer
            </span>
          </div>
          {analysis && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 hidden sm:inline">
                {fileName}
              </span>
              <button
                onClick={reset}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                New File
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Upload state */}
        {!analysis && status !== "loading" && (
          <div className="max-w-xl mx-auto mt-20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Analyze STDF Files
              </h2>
              <p className="text-gray-500">
                Parse and visualize semiconductor test data directly in your
                browser. No server needed.
              </p>
            </div>
            <FileUploader onFileSelect={parseFile} />
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Loading state */}
        {status === "loading" && (
          <div className="max-w-xl mx-auto mt-20">
            <FileUploader onFileSelect={parseFile} disabled />
          </div>
        )}

        {/* Results */}
        {analysis && (
          <>
            {/* Tab navigation */}
            <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
              {tabs
                .filter((t) => t.show)
                .map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-4 py-2 text-sm rounded-md transition ${
                      activeTab === t.id
                        ? "bg-white shadow-sm font-medium text-gray-900"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === "summary" && (
              <Summary data={analysis} fileName={fileName ?? ""} />
            )}
            {activeTab === "bins" && (
              <BinChart
                hardBins={analysis.hard_bins}
                softBins={analysis.soft_bins}
              />
            )}
            {activeTab === "tests" && <TestResults data={analysis} />}
            {activeTab === "wafer" && <WaferMap data={analysis} />}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
