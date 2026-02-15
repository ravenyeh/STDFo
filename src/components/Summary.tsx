import type { StdfAnalysis } from "../types/stdf";

interface Props {
  data: StdfAnalysis;
  fileName: string;
}

function formatTimestamp(ts: number): string {
  if (!ts) return "N/A";
  return new Date(ts * 1000).toLocaleString();
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-gray-900 text-sm font-medium">{String(value)}</span>
    </div>
  );
}

export function Summary({ data, fileName }: Props) {
  const lot = data.lot_info;
  const finish = data.lot_finish;
  const totalParts = data.parts.length;
  const passParts = data.parts.filter((p) => p.passed).length;
  const failParts = totalParts - passParts;
  const yieldPct = totalParts > 0 ? ((passParts / totalParts) * 100).toFixed(2) : "N/A";

  const totalRecords = Object.values(data.record_counts).reduce((a, b) => a + b, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Yield overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:col-span-2 lg:col-span-3">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <StatCard label="Total Parts" value={totalParts} />
          <StatCard label="Pass" value={passParts} className="text-green-600" />
          <StatCard label="Fail" value={failParts} className="text-red-600" />
          <StatCard label="Yield" value={`${yieldPct}%`} className="text-blue-600" />
          <StatCard label="Tests" value={data.test_definitions.length} />
        </div>
      </div>

      {/* File info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">File Info</h3>
        <InfoRow label="File Name" value={fileName} />
        <InfoRow label="STDF Version" value={data.file_info?.stdf_ver ?? "N/A"} />
        <InfoRow label="CPU Type" value={data.file_info?.cpu_type === 2 ? "Little Endian" : "Big Endian"} />
        <InfoRow label="Total Records" value={totalRecords} />
      </div>

      {/* Lot info */}
      {lot && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Lot Info</h3>
          <InfoRow label="Lot ID" value={lot.lot_id} />
          <InfoRow label="Part Type" value={lot.part_typ} />
          <InfoRow label="Job Name" value={lot.job_nam} />
          <InfoRow label="Sublot ID" value={lot.sblot_id} />
          <InfoRow label="Test Code" value={lot.test_cod} />
          <InfoRow label="Temperature" value={lot.tst_temp} />
          <InfoRow label="Start Time" value={formatTimestamp(lot.start_t)} />
          {finish && <InfoRow label="Finish Time" value={formatTimestamp(finish.finish_t)} />}
        </div>
      )}

      {/* Equipment info */}
      {lot && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Equipment</h3>
          <InfoRow label="Node Name" value={lot.node_nam} />
          <InfoRow label="Tester Type" value={lot.tstr_typ} />
          <InfoRow label="Exec Type" value={lot.exec_typ} />
          <InfoRow label="Exec Ver" value={lot.exec_ver} />
          <InfoRow label="Facility" value={lot.facil_id} />
          <InfoRow label="Floor" value={lot.floor_id} />
          <InfoRow label="Operator" value={lot.oper_nam} />
          <InfoRow label="Mode" value={lot.mode_cod} />
        </div>
      )}

      {/* Record counts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Record Counts</h3>
        {Object.entries(data.record_counts)
          .sort(([, a], [, b]) => b - a)
          .map(([name, count]) => (
            <InfoRow key={name} label={name} value={count} />
          ))}
      </div>

      {/* Wafer info */}
      {data.wafers.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Wafers ({data.wafers.length})</h3>
          {data.wafers.map((w, i) => (
            <div key={i} className="mb-2 pb-2 border-b border-gray-100 last:border-0">
              <InfoRow label="Wafer ID" value={w.wafer_id} />
              <InfoRow label="Parts" value={w.part_cnt} />
              <InfoRow label="Good" value={w.good_cnt} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div>
      <div className={`text-2xl font-bold ${className}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

// Re-export for use in App
export { formatFileSize };
