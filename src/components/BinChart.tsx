import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { useState } from "react";
import type { BinInfo } from "../types/stdf";

interface Props {
  hardBins: BinInfo[];
  softBins: BinInfo[];
}

interface AggregatedBin {
  bin_num: number;
  bin_nam: string;
  bin_cnt: number;
  bin_pf: string;
}

function aggregateBins(bins: BinInfo[]): AggregatedBin[] {
  const map = new Map<number, AggregatedBin>();
  for (const b of bins) {
    // Only use head_num=255 (summary) or aggregate ourselves
    const existing = map.get(b.bin_num);
    if (existing) {
      // If this is the summary record (head=255), prefer it
      if (b.head_num === 255) {
        existing.bin_cnt = b.bin_cnt;
        if (b.bin_nam) existing.bin_nam = b.bin_nam;
        if (b.bin_pf) existing.bin_pf = b.bin_pf;
      }
    } else {
      map.set(b.bin_num, {
        bin_num: b.bin_num,
        bin_nam: b.bin_nam || `Bin ${b.bin_num}`,
        bin_cnt: b.bin_cnt,
        bin_pf: b.bin_pf,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.bin_num - b.bin_num);
}

const PASS_COLOR = "#22c55e";
const FAIL_COLOR = "#ef4444";
const UNKNOWN_COLOR = "#94a3b8";

function getColor(pf: string): string {
  if (pf === "P") return PASS_COLOR;
  if (pf === "F") return FAIL_COLOR;
  return UNKNOWN_COLOR;
}

export function BinChart({ hardBins, softBins }: Props) {
  const [binType, setBinType] = useState<"hard" | "soft">("hard");

  const bins = binType === "hard" ? hardBins : softBins;
  const aggregated = aggregateBins(bins);

  if (aggregated.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center text-gray-500">
        No bin data available
      </div>
    );
  }

  const chartData = aggregated.map((b) => ({
    name: b.bin_nam || `Bin ${b.bin_num}`,
    count: b.bin_cnt,
    pf: b.bin_pf,
    bin_num: b.bin_num,
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Bin Distribution</h3>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setBinType("hard")}
            className={`px-3 py-1 text-sm rounded-md transition ${
              binType === "hard"
                ? "bg-white shadow-sm font-medium"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Hard Bin
          </button>
          <button
            onClick={() => setBinType("soft")}
            className={`px-3 py-1 text-sm rounded-md transition ${
              binType === "soft"
                ? "bg-white shadow-sm font-medium"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Soft Bin
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 11 }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number, _name: string, props: { payload?: { bin_num: number; pf: string } }) => [
              `${value.toLocaleString()} (Bin #${props.payload?.bin_num ?? ""})`,
              props.payload?.pf === "P" ? "Pass" : props.payload?.pf === "F" ? "Fail" : "Unknown",
            ]}
          />
          <Legend
            payload={[
              { value: "Pass", type: "square", color: PASS_COLOR },
              { value: "Fail", type: "square", color: FAIL_COLOR },
              { value: "Unknown", type: "square", color: UNKNOWN_COLOR },
            ]}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={getColor(entry.pf)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
