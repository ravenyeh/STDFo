import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import type { StdfAnalysis, TestDefinition } from "../types/stdf";

interface Props {
  data: StdfAnalysis;
}

interface TestRow {
  test_num: number;
  test_txt: string;
  result_type: string;
  units: string;
  lo_limit: number | null;
  hi_limit: number | null;
  exec_cnt: number;
  fail_cnt: number;
  pass_pct: number;
  min: number;
  max: number;
  mean: number;
  stddev: number;
}

function computeTestRows(data: StdfAnalysis): TestRow[] {
  const { test_definitions, parts } = data;

  // Build a map of test_num -> results
  const resultsByTest = new Map<number, number[]>();
  const failsByTest = new Map<number, number>();

  for (const part of parts) {
    for (const t of part.tests) {
      if (t.result_type !== "ptr") continue;
      const arr = resultsByTest.get(t.test_num) ?? [];
      arr.push(t.result);
      resultsByTest.set(t.test_num, arr);
      if (!t.passed) {
        failsByTest.set(t.test_num, (failsByTest.get(t.test_num) ?? 0) + 1);
      }
    }
  }

  return test_definitions.map((def: TestDefinition) => {
    const results = resultsByTest.get(def.test_num) ?? [];
    const cnt = results.length;
    const fails = failsByTest.get(def.test_num) ?? 0;
    const sum = results.reduce((a, b) => a + b, 0);
    const mean = cnt > 0 ? sum / cnt : 0;
    const variance =
      cnt > 1
        ? results.reduce((a, v) => a + (v - mean) ** 2, 0) / (cnt - 1)
        : 0;

    return {
      test_num: def.test_num,
      test_txt: def.test_txt,
      result_type: def.result_type,
      units: def.units,
      lo_limit: def.has_lo_limit ? def.lo_limit : null,
      hi_limit: def.has_hi_limit ? def.hi_limit : null,
      exec_cnt: cnt || (data.test_summaries.find(s => s.test_num === def.test_num)?.exec_cnt ?? 0),
      fail_cnt: fails || (data.test_summaries.find(s => s.test_num === def.test_num)?.fail_cnt ?? 0),
      pass_pct: cnt > 0 ? ((cnt - fails) / cnt) * 100 : 0,
      min: cnt > 0 ? Math.min(...results) : 0,
      max: cnt > 0 ? Math.max(...results) : 0,
      mean,
      stddev: Math.sqrt(variance),
    };
  });
}

function fmtNum(v: number | null, digits = 4): string {
  if (v === null || v === undefined) return "-";
  if (Math.abs(v) < 0.001 && v !== 0) return v.toExponential(2);
  return Number(v.toFixed(digits)).toString();
}

export function TestResults({ data }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const rows = useMemo(() => computeTestRows(data), [data]);

  const columns = useMemo<ColumnDef<TestRow>[]>(
    () => [
      {
        accessorKey: "test_num",
        header: "#",
        size: 70,
      },
      {
        accessorKey: "test_txt",
        header: "Test Name",
        size: 250,
      },
      {
        accessorKey: "result_type",
        header: "Type",
        size: 60,
        cell: ({ getValue }) => (
          <span className="uppercase text-xs font-mono">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "units",
        header: "Units",
        size: 70,
      },
      {
        accessorKey: "lo_limit",
        header: "Lo Limit",
        size: 90,
        cell: ({ getValue }) => fmtNum(getValue<number | null>()),
      },
      {
        accessorKey: "hi_limit",
        header: "Hi Limit",
        size: 90,
        cell: ({ getValue }) => fmtNum(getValue<number | null>()),
      },
      {
        accessorKey: "exec_cnt",
        header: "Exec",
        size: 70,
      },
      {
        accessorKey: "fail_cnt",
        header: "Fail",
        size: 70,
        cell: ({ getValue }) => {
          const v = getValue<number>();
          return (
            <span className={v > 0 ? "text-red-600 font-medium" : ""}>
              {v}
            </span>
          );
        },
      },
      {
        accessorKey: "pass_pct",
        header: "Yield %",
        size: 80,
        cell: ({ getValue }) => {
          const v = getValue<number>();
          return (
            <span className={v < 100 ? "text-amber-600" : "text-green-600"}>
              {v.toFixed(1)}%
            </span>
          );
        },
      },
      {
        accessorKey: "min",
        header: "Min",
        size: 90,
        cell: ({ getValue }) => fmtNum(getValue<number>()),
      },
      {
        accessorKey: "max",
        header: "Max",
        size: 90,
        cell: ({ getValue }) => fmtNum(getValue<number>()),
      },
      {
        accessorKey: "mean",
        header: "Mean",
        size: 90,
        cell: ({ getValue }) => fmtNum(getValue<number>()),
      },
      {
        accessorKey: "stddev",
        header: "Std Dev",
        size: 90,
        cell: ({ getValue }) => fmtNum(getValue<number>()),
      },
    ],
    []
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center text-gray-500">
        No test data available
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">
          Test Results ({rows.length} tests)
        </h3>
        <input
          type="text"
          placeholder="Search tests..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    onClick={h.column.getToggleSortingHandler()}
                    className="text-left px-2 py-2 bg-gray-50 border-b border-gray-200 cursor-pointer select-none whitespace-nowrap text-xs font-medium text-gray-600 uppercase tracking-wider"
                    style={{ width: h.getSize() }}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {{ asc: " \u2191", desc: " \u2193" }[
                      h.column.getIsSorted() as string
                    ] ?? ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50 border-b border-gray-100"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-2 py-1.5 whitespace-nowrap font-mono text-xs"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
