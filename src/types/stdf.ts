export interface StdfAnalysis {
  file_info: FileInfo | null;
  lot_info: LotInfo | null;
  lot_finish: LotFinish | null;
  wafer_config: WaferConfig | null;
  site_descriptions: SiteDescription[];
  wafers: WaferInfo[];
  hard_bins: BinInfo[];
  soft_bins: BinInfo[];
  test_summaries: TestSummary[];
  parts: PartResult[];
  test_definitions: TestDefinition[];
  record_counts: Record<string, number>;
}

export interface FileInfo {
  cpu_type: number;
  stdf_ver: number;
}

export interface LotInfo {
  setup_t: number;
  start_t: number;
  stat_num: number;
  mode_cod: string;
  rtst_cod: string;
  prot_cod: string;
  burn_tim: number;
  cmod_cod: string;
  lot_id: string;
  part_typ: string;
  node_nam: string;
  tstr_typ: string;
  job_nam: string;
  job_rev: string;
  sblot_id: string;
  oper_nam: string;
  exec_typ: string;
  exec_ver: string;
  test_cod: string;
  tst_temp: string;
  user_txt: string;
  aux_file: string;
  pkg_typ: string;
  famly_id: string;
  date_cod: string;
  facil_id: string;
  floor_id: string;
  proc_id: string;
  oper_frq: string;
  spec_nam: string;
  spec_ver: string;
  flow_id: string;
  setup_id: string;
  dsgn_rev: string;
  eng_id: string;
  rom_cod: string;
  serl_num: string;
  supr_nam: string;
}

export interface LotFinish {
  finish_t: number;
  disp_cod: string;
  usr_desc: string;
  exc_desc: string;
}

export interface WaferConfig {
  wafr_siz: number;
  die_ht: number;
  die_wid: number;
  wf_units: number;
  wf_flat: string;
  center_x: number;
  center_y: number;
  pos_x: string;
  pos_y: string;
}

export interface SiteDescription {
  head_num: number;
  site_grp: number;
  site_cnt: number;
  site_nums: number[];
  hand_typ: string;
  hand_id: string;
  card_typ: string;
  card_id: string;
  load_typ: string;
  load_id: string;
  dib_typ: string;
  dib_id: string;
  cabl_typ: string;
  cabl_id: string;
  cont_typ: string;
  cont_id: string;
  lasr_typ: string;
  lasr_id: string;
  extr_typ: string;
  extr_id: string;
}

export interface WaferInfo {
  head_num: number;
  wafer_id: string;
  start_t: number;
  finish_t: number;
  part_cnt: number;
  rtst_cnt: number;
  abrt_cnt: number;
  good_cnt: number;
  func_cnt: number;
  fabwf_id: string;
  frame_id: string;
  mask_id: string;
  usr_desc: string;
  exc_desc: string;
}

export interface BinInfo {
  head_num: number;
  site_num: number;
  bin_num: number;
  bin_cnt: number;
  bin_pf: string;
  bin_nam: string;
  bin_type: string;
}

export interface TestSummary {
  head_num: number;
  site_num: number;
  test_typ: string;
  test_num: number;
  exec_cnt: number;
  fail_cnt: number;
  alrm_cnt: number;
  test_nam: string;
  seq_name: string;
  test_lbl: string;
  test_tim: number;
  test_min: number;
  test_max: number;
  tst_sums: number;
  tst_sqrs: number;
}

export interface PartResult {
  head_num: number;
  site_num: number;
  part_flg: number;
  num_test: number;
  hard_bin: number;
  soft_bin: number;
  x_coord: number;
  y_coord: number;
  test_t: number;
  part_id: string;
  part_txt: string;
  part_fix: number[];
  passed: boolean;
  wafer_index: number;
  part_index: number;
  tests: TestResult[];
}

export interface TestResult {
  test_num: number;
  head_num: number;
  site_num: number;
  result: number;
  test_flg: number;
  parm_flg: number;
  test_txt: string;
  alarm_id: string;
  passed: boolean;
  result_type: string;
  ftr_num_fail: number;
  mpr_results: number[];
}

export interface TestDefinition {
  test_num: number;
  test_txt: string;
  res_scal: number;
  llm_scal: number;
  hlm_scal: number;
  lo_limit: number;
  hi_limit: number;
  lo_spec: number;
  hi_spec: number;
  units: string;
  opt_flag: number;
  has_lo_limit: boolean;
  has_hi_limit: boolean;
  has_lo_spec: boolean;
  has_hi_spec: boolean;
  result_type: string;
}
