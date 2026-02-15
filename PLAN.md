# STDFo - STDF WASM Analyzer 專案規劃

## 專案概述
純前端 STDF 分析工具，使用 `rust-stdf` 編譯成 WebAssembly，讓使用者直接在瀏覽器上傳並分析半導體測試資料（STDF 檔案）。部署於 Vercel。

---

## 架構設計

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
│                                                  │
│  ┌──────────────┐    ┌────────────────────────┐ │
│  │  React App   │    │   WASM Module          │ │
│  │  (Vite+TS)   │◄──►│   (rust-stdf wrapper)  │ │
│  │              │    │                        │ │
│  │  - 檔案上傳   │    │  - parse STDF bytes    │ │
│  │  - 資料表格   │    │  - 回傳 JSON records   │ │
│  │  - 圖表視覺化 │    │  - 支援 gz/bz2        │ │
│  └──────────────┘    └────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## 技術棧

| 層級 | 技術 | 說明 |
|------|------|------|
| WASM | Rust + wasm-pack + wasm-bindgen | 包裝 rust-stdf，編譯為 WASM |
| 前端框架 | React 18 + TypeScript | 主要 UI 框架 |
| 建構工具 | Vite | 快速開發，原生支援 WASM |
| UI 元件 | Tailwind CSS + shadcn/ui | 快速建構 UI |
| 圖表 | Recharts 或 Plotly.js | 測試資料視覺化 |
| 表格 | TanStack Table | 高效能虛擬化表格（STDF 資料量大） |
| 部署 | Vercel | 靜態站點部署 |

---

## 專案結構

```
STDFo/
├── crates/
│   └── stdf-wasm/              # Rust WASM wrapper
│       ├── Cargo.toml
│       └── src/
│           └── lib.rs          # wasm-bindgen 介面
├── src/                        # React 前端
│   ├── components/
│   │   ├── FileUploader.tsx    # 拖拽上傳 STDF 檔案
│   │   ├── Summary.tsx         # MIR/MRR 摘要資訊
│   │   ├── TestResults.tsx     # PTR/FTR/MPR 測試結果表格
│   │   ├── BinChart.tsx        # HBR/SBR Bin 分布圖
│   │   ├── WaferMap.tsx        # PRR 晶圓圖（若有座標）
│   │   └── RecordExplorer.tsx  # 原始 Record 瀏覽器
│   ├── workers/
│   │   └── stdf-worker.ts     # Web Worker（避免阻塞 UI）
│   ├── hooks/
│   │   └── useStdfParser.ts   # WASM 呼叫封裝
│   ├── types/
│   │   └── stdf.ts            # TypeScript 型別定義
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── vercel.json
└── README.md
```

---

## 實作步驟

### Phase 1: WASM 核心模組

**Step 1.1 - Rust WASM wrapper (`crates/stdf-wasm/`)**

- 建立 Cargo.toml，依賴 `rust-stdf`（啟用 gzip、bzip features）+ `wasm-bindgen` + `serde` + `serde-wasm-bindgen`
- 實作核心函式：
  ```rust
  #[wasm_bindgen]
  pub fn parse_stdf(data: &[u8]) -> JsValue {
      // 使用 Cursor<Vec<u8>> + StdfReader::from()
      // 遍歷所有 records，轉成 JSON-friendly 結構
      // 透過 serde_wasm_bindgen 回傳給 JS
  }
  ```
- 回傳結構化資料：
  - `file_info`: FAR (byte order, STDF version)
  - `lot_info`: MIR/MRR (lot ID, start/finish time, tester type 等)
  - `part_results`: PIR/PRR 配對（每顆 part 的 pass/fail、bin、座標）
  - `test_data`: PTR/MPR/FTR（每個測試的結果、limits、單位）
  - `bin_definitions`: HBR/SBR（bin 名稱、pass/fail、計數）
  - `wafer_info`: WIR/WRR/WCR
  - `site_info`: SDR

**Step 1.2 - 編譯與整合**

- 使用 `wasm-pack build --target web` 編譯
- 在 Vite 中設定 WASM 載入（vite-plugin-wasm）

### Phase 2: 前端基礎建設

**Step 2.1 - 專案初始化**
- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui
- 設定 WASM 載入

**Step 2.2 - Web Worker 整合**
- 在 Web Worker 中載入 WASM 模組
- 避免大檔案解析時阻塞主執行緒
- Worker 與主執行緒透過 postMessage 溝通
- 支援解析進度回報

**Step 2.3 - 檔案上傳元件**
- 拖拽 + 點擊上傳
- 支援 `.stdf`、`.std`、`.stdf.gz`、`.stdf.bz2`
- 檔案大小顯示
- 多檔案支援（可選）

### Phase 3: 資料展示

**Step 3.1 - 摘要頁面 (Summary)**
- 顯示 MIR 資訊：Lot ID、Part Type、Node Name、Tester Type、Start Time
- 顯示 MRR 資訊：Finish Time
- 總 Part 數、Pass/Fail 率
- Site 數量
- Test 數量

**Step 3.2 - Bin 分布圖 (BinChart)**
- Hard Bin / Soft Bin 長條圖
- Pass/Fail 顏色區分
- 顯示 bin name 與 count

**Step 3.3 - 測試結果表格 (TestResults)**
- 使用 TanStack Table 虛擬化捲動
- 每列一個 test，顯示 test number、name、limits、統計（min/max/mean/Cp/Cpk）
- 點擊展開看各 part 的詳細結果
- 欄位排序與篩選

**Step 3.4 - Wafer Map（若資料含座標）**
- Canvas/SVG 繪製晶圓圖
- 依 bin 或 pass/fail 上色
- 滑鼠 hover 顯示 part 資訊

### Phase 4: 部署

**Step 4.1 - Vercel 設定**
- `vercel.json` 設定
- WASM MIME type 處理（`application/wasm`）
- Build command: 先 `wasm-pack build`，再 `vite build`
- 可透過 Vercel 的 `installCommand` 和 `buildCommand` 自訂

---

## 關鍵技術決策

### 1. 為何使用 Web Worker？
STDF 檔案可能非常大（數百 MB），解析可能耗時數秒到數十秒。在 Web Worker 中執行 WASM 解析可以避免 UI 凍結。

### 2. 記憶體管理
- 大檔案考量：WASM 預設記憶體限制需調整
- 考慮分批解析（streaming）而非一次載入全部
- 解析完成後釋放 WASM 記憶體中的原始資料

### 3. rust-stdf WASM 相容性
- `StdfReader::from()` 接受 `BufRead + Seek`，可用 `Cursor<Vec<u8>>`
- 需停用 `zipfile` feature（含 unsafe code，可能不相容 WASM）
- gzip/bzip 壓縮透過 Rust 端處理（flate2/bzip2 支援 WASM）

### 4. Vercel 部署注意事項
- WASM 檔案需正確的 Content-Type header
- 可在 `vercel.json` 中設定 headers
- Build 流程需安裝 Rust toolchain + wasm-pack

---

## Vercel 部署設定

```json
// vercel.json
{
  "buildCommand": "cd crates/stdf-wasm && wasm-pack build --target web --out-dir ../../src/wasm && cd ../.. && npm run build",
  "outputDirectory": "dist",
  "installCommand": "curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh && npm install",
  "headers": [
    {
      "source": "/(.*).wasm",
      "headers": [
        { "key": "Content-Type", "value": "application/wasm" }
      ]
    }
  ]
}
```

---

## 開發順序建議

1. **先做 WASM 模組** — 確認 rust-stdf 能在 WASM 環境正常運作
2. **再做最小前端** — 檔案上傳 + 呼叫 WASM + 顯示原始 JSON
3. **逐步加上視覺化** — Summary → Bin Chart → Test Table → Wafer Map
4. **最後處理部署** — Vercel 設定與優化
