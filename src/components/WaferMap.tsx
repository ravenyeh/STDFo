import { useMemo, useState, useRef, useCallback } from "react";
import type { StdfAnalysis, PartResult } from "../types/stdf";

interface Props {
  data: StdfAnalysis;
}

interface DieInfo {
  x: number;
  y: number;
  part: PartResult;
}

const BIN_COLORS = [
  "#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
  "#06b6d4", "#d946ef", "#0ea5e9", "#a855f7", "#10b981",
];

function getColorForBin(binNum: number, pass: boolean): string {
  if (binNum === 1 && pass) return "#22c55e";
  return BIN_COLORS[binNum % BIN_COLORS.length];
}

export function WaferMap({ data }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredDie, setHoveredDie] = useState<DieInfo | null>(null);
  const [colorBy, setColorBy] = useState<"passfail" | "hardbin" | "softbin">("passfail");
  const [selectedWafer, setSelectedWafer] = useState(0);

  const waferParts = useMemo(() => {
    if (data.wafers.length === 0) {
      // No wafer records, check if parts have valid coordinates
      const hasCoords = data.parts.some(
        (p) => p.x_coord !== -32768 && p.y_coord !== -32768
      );
      if (hasCoords) return data.parts;
      return [];
    }
    return data.parts.filter((p) => p.wafer_index === selectedWafer);
  }, [data, selectedWafer]);

  const dies = useMemo<DieInfo[]>(() => {
    return waferParts
      .filter((p) => p.x_coord !== -32768 && p.y_coord !== -32768)
      .map((p) => ({ x: p.x_coord, y: p.y_coord, part: p }));
  }, [waferParts]);

  const bounds = useMemo(() => {
    if (dies.length === 0) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const d of dies) {
      if (d.x < minX) minX = d.x;
      if (d.x > maxX) maxX = d.x;
      if (d.y < minY) minY = d.y;
      if (d.y > maxY) maxY = d.y;
    }
    return { minX, maxX, minY, maxY };
  }, [dies]);

  const SIZE = 500;
  const PADDING = 20;

  const dieSize = useMemo(() => {
    const rangeX = bounds.maxX - bounds.minX + 1;
    const rangeY = bounds.maxY - bounds.minY + 1;
    const maxRange = Math.max(rangeX, rangeY, 1);
    return Math.max(2, Math.floor((SIZE - PADDING * 2) / maxRange));
  }, [bounds]);

  const dieMap = useMemo(() => {
    const map = new Map<string, DieInfo>();
    for (const d of dies) map.set(`${d.x},${d.y}`, d);
    return map;
  }, [dies]);

  const getDieColor = useCallback(
    (d: DieInfo): string => {
      if (colorBy === "passfail") return d.part.passed ? "#22c55e" : "#ef4444";
      if (colorBy === "hardbin") return getColorForBin(d.part.hard_bin, d.part.passed);
      return getColorForBin(d.part.soft_bin, d.part.passed);
    },
    [colorBy]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const rangeX = bounds.maxX - bounds.minX + 1;
      const rangeY = bounds.maxY - bounds.minY + 1;
      const maxRange = Math.max(rangeX, rangeY, 1);
      const offsetX = PADDING + ((maxRange - rangeX) * dieSize) / 2;
      const offsetY = PADDING + ((maxRange - rangeY) * dieSize) / 2;

      const gx = Math.floor((mx - offsetX) / dieSize) + bounds.minX;
      const gy = Math.floor((my - offsetY) / dieSize) + bounds.minY;

      const die = dieMap.get(`${gx},${gy}`);
      setHoveredDie(die ?? null);
    },
    [bounds, dieSize, dieMap]
  );

  // Draw on canvas
  useMemo(() => {
    const canvas = canvasRef.current;
    if (!canvas || dies.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = SIZE;
    canvas.height = SIZE;

    ctx.clearRect(0, 0, SIZE, SIZE);

    const rangeX = bounds.maxX - bounds.minX + 1;
    const rangeY = bounds.maxY - bounds.minY + 1;
    const maxRange = Math.max(rangeX, rangeY, 1);
    const offsetX = PADDING + ((maxRange - rangeX) * dieSize) / 2;
    const offsetY = PADDING + ((maxRange - rangeY) * dieSize) / 2;

    for (const d of dies) {
      const px = offsetX + (d.x - bounds.minX) * dieSize;
      const py = offsetY + (d.y - bounds.minY) * dieSize;
      ctx.fillStyle = getDieColor(d);
      ctx.fillRect(px, py, dieSize - 1, dieSize - 1);
    }

    // Highlight hovered
    if (hoveredDie) {
      const px = offsetX + (hoveredDie.x - bounds.minX) * dieSize;
      const py = offsetY + (hoveredDie.y - bounds.minY) * dieSize;
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.strokeRect(px - 1, py - 1, dieSize + 1, dieSize + 1);
    }
  // eslint-disable-next-line
  }, [dies, bounds, dieSize, getDieColor, hoveredDie]);

  if (dies.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center text-gray-500">
        No wafer coordinate data available
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-semibold text-gray-900">
          Wafer Map ({dies.length} dies)
        </h3>
        <div className="flex gap-2 items-center">
          {data.wafers.length > 1 && (
            <select
              value={selectedWafer}
              onChange={(e) => setSelectedWafer(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 rounded-lg"
            >
              {data.wafers.map((w, i) => (
                <option key={i} value={i}>
                  {w.wafer_id || `Wafer ${i + 1}`}
                </option>
              ))}
            </select>
          )}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(["passfail", "hardbin", "softbin"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setColorBy(mode)}
                className={`px-3 py-1 text-xs rounded-md transition ${
                  colorBy === mode
                    ? "bg-white shadow-sm font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {mode === "passfail" ? "Pass/Fail" : mode === "hardbin" ? "HBin" : "SBin"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4 items-start">
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredDie(null)}
          className="border border-gray-200 rounded-lg cursor-crosshair"
          style={{ width: SIZE, height: SIZE }}
        />

        {hoveredDie && (
          <div className="text-xs space-y-1 min-w-[140px]">
            <div className="font-semibold text-gray-900">
              ({hoveredDie.x}, {hoveredDie.y})
            </div>
            <div>
              <span className="text-gray-500">Part ID:</span>{" "}
              {hoveredDie.part.part_id || "-"}
            </div>
            <div>
              <span className="text-gray-500">Result:</span>{" "}
              <span
                className={
                  hoveredDie.part.passed ? "text-green-600" : "text-red-600"
                }
              >
                {hoveredDie.part.passed ? "PASS" : "FAIL"}
              </span>
            </div>
            <div>
              <span className="text-gray-500">HBin:</span>{" "}
              {hoveredDie.part.hard_bin}
            </div>
            <div>
              <span className="text-gray-500">SBin:</span>{" "}
              {hoveredDie.part.soft_bin}
            </div>
            <div>
              <span className="text-gray-500">Tests:</span>{" "}
              {hoveredDie.part.num_test}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
