use rust_stdf::stdf_file::StdfReader;
use rust_stdf::*;
use serde::Serialize;
use std::collections::HashMap;
use std::io::Cursor;
use wasm_bindgen::prelude::*;

// ── Helper: extract first byte from B1 ([u8; 1]) ──────────────────

fn b1(v: [u8; 1]) -> u8 {
    v[0]
}

fn char_to_string(c: char) -> String {
    if c == '\0' || c == ' ' {
        String::new()
    } else {
        c.to_string()
    }
}

// ── Serializable output types ──────────────────────────────────────

#[derive(Serialize, Default)]
pub struct StdfAnalysis {
    pub file_info: Option<FileInfo>,
    pub lot_info: Option<LotInfo>,
    pub lot_finish: Option<LotFinish>,
    pub wafer_config: Option<WaferConfig>,
    pub site_descriptions: Vec<SiteDescription>,
    pub wafers: Vec<WaferInfo>,
    pub hard_bins: Vec<BinInfo>,
    pub soft_bins: Vec<BinInfo>,
    pub test_summaries: Vec<TestSummary>,
    pub parts: Vec<PartResult>,
    pub test_definitions: Vec<TestDefinition>,
    pub record_counts: HashMap<String, u64>,
}

#[derive(Serialize, Default)]
pub struct FileInfo {
    pub cpu_type: u8,
    pub stdf_ver: u8,
}

#[derive(Serialize, Default)]
pub struct LotInfo {
    pub setup_t: u32,
    pub start_t: u32,
    pub stat_num: u8,
    pub mode_cod: String,
    pub rtst_cod: String,
    pub prot_cod: String,
    pub burn_tim: u16,
    pub cmod_cod: String,
    pub lot_id: String,
    pub part_typ: String,
    pub node_nam: String,
    pub tstr_typ: String,
    pub job_nam: String,
    pub job_rev: String,
    pub sblot_id: String,
    pub oper_nam: String,
    pub exec_typ: String,
    pub exec_ver: String,
    pub test_cod: String,
    pub tst_temp: String,
    pub user_txt: String,
    pub aux_file: String,
    pub pkg_typ: String,
    pub famly_id: String,
    pub date_cod: String,
    pub facil_id: String,
    pub floor_id: String,
    pub proc_id: String,
    pub oper_frq: String,
    pub spec_nam: String,
    pub spec_ver: String,
    pub flow_id: String,
    pub setup_id: String,
    pub dsgn_rev: String,
    pub eng_id: String,
    pub rom_cod: String,
    pub serl_num: String,
    pub supr_nam: String,
}

#[derive(Serialize, Default)]
pub struct LotFinish {
    pub finish_t: u32,
    pub disp_cod: String,
    pub usr_desc: String,
    pub exc_desc: String,
}

#[derive(Serialize, Default)]
pub struct WaferConfig {
    pub wafr_siz: f32,
    pub die_ht: f32,
    pub die_wid: f32,
    pub wf_units: u8,
    pub wf_flat: String,
    pub center_x: i16,
    pub center_y: i16,
    pub pos_x: String,
    pub pos_y: String,
}

#[derive(Serialize, Default)]
pub struct SiteDescription {
    pub head_num: u8,
    pub site_grp: u8,
    pub site_cnt: u8,
    pub site_nums: Vec<u8>,
    pub hand_typ: String,
    pub hand_id: String,
    pub card_typ: String,
    pub card_id: String,
    pub load_typ: String,
    pub load_id: String,
    pub dib_typ: String,
    pub dib_id: String,
    pub cabl_typ: String,
    pub cabl_id: String,
    pub cont_typ: String,
    pub cont_id: String,
    pub lasr_typ: String,
    pub lasr_id: String,
    pub extr_typ: String,
    pub extr_id: String,
}

#[derive(Serialize, Default)]
pub struct WaferInfo {
    pub head_num: u8,
    pub wafer_id: String,
    pub start_t: u32,
    pub finish_t: u32,
    pub part_cnt: u32,
    pub rtst_cnt: u32,
    pub abrt_cnt: u32,
    pub good_cnt: u32,
    pub func_cnt: u32,
    pub fabwf_id: String,
    pub frame_id: String,
    pub mask_id: String,
    pub usr_desc: String,
    pub exc_desc: String,
}

#[derive(Serialize, Default, Clone)]
pub struct BinInfo {
    pub head_num: u8,
    pub site_num: u8,
    pub bin_num: u16,
    pub bin_cnt: u32,
    pub bin_pf: String,
    pub bin_nam: String,
    pub bin_type: String,
}

#[derive(Serialize, Default)]
pub struct TestSummary {
    pub head_num: u8,
    pub site_num: u8,
    pub test_typ: String,
    pub test_num: u32,
    pub exec_cnt: u32,
    pub fail_cnt: u32,
    pub alrm_cnt: u32,
    pub test_nam: String,
    pub seq_name: String,
    pub test_lbl: String,
    pub test_tim: f32,
    pub test_min: f32,
    pub test_max: f32,
    pub tst_sums: f32,
    pub tst_sqrs: f32,
}

#[derive(Serialize, Default, Clone)]
pub struct PartResult {
    pub head_num: u8,
    pub site_num: u8,
    pub part_flg: u8,
    pub num_test: u16,
    pub hard_bin: u16,
    pub soft_bin: u16,
    pub x_coord: i16,
    pub y_coord: i16,
    pub test_t: u32,
    pub part_id: String,
    pub part_txt: String,
    pub part_fix: Vec<u8>,
    pub passed: bool,
    pub wafer_index: i32,
    pub part_index: u64,
    pub tests: Vec<TestResult>,
}

#[derive(Serialize, Default, Clone)]
pub struct TestResult {
    pub test_num: u32,
    pub head_num: u8,
    pub site_num: u8,
    pub result: f64,
    pub test_flg: u8,
    pub parm_flg: u8,
    pub test_txt: String,
    pub alarm_id: String,
    pub passed: bool,
    pub result_type: String,
    pub ftr_num_fail: u32,
    pub mpr_results: Vec<f32>,
}

#[derive(Serialize, Default)]
pub struct TestDefinition {
    pub test_num: u32,
    pub test_txt: String,
    pub res_scal: i8,
    pub llm_scal: i8,
    pub hlm_scal: i8,
    pub lo_limit: f32,
    pub hi_limit: f32,
    pub lo_spec: f32,
    pub hi_spec: f32,
    pub units: String,
    pub opt_flag: u8,
    pub has_lo_limit: bool,
    pub has_hi_limit: bool,
    pub has_lo_spec: bool,
    pub has_hi_spec: bool,
    pub result_type: String,
}

// ── Helper to extract opt_flag info from PTR/MPR ───────────────────

fn build_test_def_from_ptr(r: &rust_stdf::PTR) -> TestDefinition {
    let opt = r.opt_flag.map(|v| b1(v)).unwrap_or(0xFF);
    TestDefinition {
        test_num: r.test_num,
        test_txt: r.test_txt.clone(),
        res_scal: r.res_scal.unwrap_or(0),
        llm_scal: r.llm_scal.unwrap_or(0),
        hlm_scal: r.hlm_scal.unwrap_or(0),
        lo_limit: r.lo_limit.unwrap_or(0.0),
        hi_limit: r.hi_limit.unwrap_or(0.0),
        lo_spec: r.lo_spec.unwrap_or(0.0),
        hi_spec: r.hi_spec.unwrap_or(0.0),
        units: r.units.clone().unwrap_or_default(),
        opt_flag: opt,
        has_lo_limit: (opt & 0x50) == 0,
        has_hi_limit: (opt & 0xA0) == 0,
        has_lo_spec: (opt & 0x04) == 0,
        has_hi_spec: (opt & 0x08) == 0,
        result_type: "ptr".into(),
    }
}

fn build_test_def_from_mpr(r: &rust_stdf::MPR) -> TestDefinition {
    let opt = r.opt_flag.map(|v| b1(v)).unwrap_or(0xFF);
    TestDefinition {
        test_num: r.test_num,
        test_txt: r.test_txt.clone(),
        res_scal: r.res_scal.unwrap_or(0),
        llm_scal: r.llm_scal.unwrap_or(0),
        hlm_scal: r.hlm_scal.unwrap_or(0),
        lo_limit: r.lo_limit.unwrap_or(0.0),
        hi_limit: r.hi_limit.unwrap_or(0.0),
        lo_spec: r.lo_spec.unwrap_or(0.0),
        hi_spec: r.hi_spec.unwrap_or(0.0),
        units: r.units.clone().unwrap_or_default(),
        opt_flag: opt,
        has_lo_limit: (opt & 0x50) == 0,
        has_hi_limit: (opt & 0xA0) == 0,
        has_lo_spec: (opt & 0x04) == 0,
        has_hi_spec: (opt & 0x08) == 0,
        result_type: "mpr".into(),
    }
}

// ── Main parse function ────────────────────────────────────────────

#[wasm_bindgen]
pub fn parse_stdf(data: &[u8], filename: &str) -> Result<JsValue, JsValue> {
    let name = filename.to_lowercase();
    let compress_type = if name.ends_with(".gz") {
        CompressType::GzipCompressed
    } else {
        CompressType::Uncompressed
    };

    let cursor = Cursor::new(data.to_vec());
    let mut reader = StdfReader::from(cursor, &compress_type)
        .map_err(|e| JsValue::from_str(&format!("Failed to open STDF: {:?}", e)))?;

    let mut analysis = StdfAnalysis::default();
    let mut record_counts: HashMap<String, u64> = HashMap::new();
    let mut active_parts: HashMap<(u8, u8), PartResult> = HashMap::new();
    let mut part_index: u64 = 0;
    let mut wafer_index: i32 = -1;
    let mut test_defs: HashMap<u32, TestDefinition> = HashMap::new();

    for rec_result in reader.get_record_iter() {
        let rec = rec_result
            .map_err(|e| JsValue::from_str(&format!("Record parse error: {:?}", e)))?;

        match rec {
            StdfRecord::FAR(r) => {
                *record_counts.entry("FAR".into()).or_insert(0) += 1;
                analysis.file_info = Some(FileInfo {
                    cpu_type: r.cpu_type,
                    stdf_ver: r.stdf_ver,
                });
            }
            StdfRecord::MIR(r) => {
                *record_counts.entry("MIR".into()).or_insert(0) += 1;
                analysis.lot_info = Some(LotInfo {
                    setup_t: r.setup_t,
                    start_t: r.start_t,
                    stat_num: r.stat_num,
                    mode_cod: char_to_string(r.mode_cod),
                    rtst_cod: char_to_string(r.rtst_cod),
                    prot_cod: char_to_string(r.prot_cod),
                    burn_tim: r.burn_tim,
                    cmod_cod: char_to_string(r.cmod_cod),
                    lot_id: r.lot_id,
                    part_typ: r.part_typ,
                    node_nam: r.node_nam,
                    tstr_typ: r.tstr_typ,
                    job_nam: r.job_nam,
                    job_rev: r.job_rev,
                    sblot_id: r.sblot_id,
                    oper_nam: r.oper_nam,
                    exec_typ: r.exec_typ,
                    exec_ver: r.exec_ver,
                    test_cod: r.test_cod,
                    tst_temp: r.tst_temp,
                    user_txt: r.user_txt,
                    aux_file: r.aux_file,
                    pkg_typ: r.pkg_typ,
                    famly_id: r.famly_id,
                    date_cod: r.date_cod,
                    facil_id: r.facil_id,
                    floor_id: r.floor_id,
                    proc_id: r.proc_id,
                    oper_frq: r.oper_frq,
                    spec_nam: r.spec_nam,
                    spec_ver: r.spec_ver,
                    flow_id: r.flow_id,
                    setup_id: r.setup_id,
                    dsgn_rev: r.dsgn_rev,
                    eng_id: r.eng_id,
                    rom_cod: r.rom_cod,
                    serl_num: r.serl_num,
                    supr_nam: r.supr_nam,
                });
            }
            StdfRecord::MRR(r) => {
                *record_counts.entry("MRR".into()).or_insert(0) += 1;
                analysis.lot_finish = Some(LotFinish {
                    finish_t: r.finish_t,
                    disp_cod: char_to_string(r.disp_cod),
                    usr_desc: r.usr_desc,
                    exc_desc: r.exc_desc,
                });
            }
            StdfRecord::WCR(r) => {
                *record_counts.entry("WCR".into()).or_insert(0) += 1;
                analysis.wafer_config = Some(WaferConfig {
                    wafr_siz: r.wafr_siz,
                    die_ht: r.die_ht,
                    die_wid: r.die_wid,
                    wf_units: r.wf_units,
                    wf_flat: char_to_string(r.wf_flat),
                    center_x: r.center_x,
                    center_y: r.center_y,
                    pos_x: char_to_string(r.pos_x),
                    pos_y: char_to_string(r.pos_y),
                });
            }
            StdfRecord::SDR(r) => {
                *record_counts.entry("SDR".into()).or_insert(0) += 1;
                analysis.site_descriptions.push(SiteDescription {
                    head_num: r.head_num,
                    site_grp: r.site_grp,
                    site_cnt: r.site_cnt,
                    site_nums: r.site_num,
                    hand_typ: r.hand_typ,
                    hand_id: r.hand_id,
                    card_typ: r.card_typ,
                    card_id: r.card_id,
                    load_typ: r.load_typ,
                    load_id: r.load_id,
                    dib_typ: r.dib_typ,
                    dib_id: r.dib_id,
                    cabl_typ: r.cabl_typ,
                    cabl_id: r.cabl_id,
                    cont_typ: r.cont_typ,
                    cont_id: r.cont_id,
                    lasr_typ: r.lasr_typ,
                    lasr_id: r.lasr_id,
                    extr_typ: r.extr_typ,
                    extr_id: r.extr_id,
                });
            }
            StdfRecord::WIR(r) => {
                *record_counts.entry("WIR".into()).or_insert(0) += 1;
                wafer_index += 1;
                analysis.wafers.push(WaferInfo {
                    head_num: r.head_num,
                    wafer_id: r.wafer_id,
                    start_t: r.start_t,
                    ..Default::default()
                });
            }
            StdfRecord::WRR(r) => {
                *record_counts.entry("WRR".into()).or_insert(0) += 1;
                if let Some(wafer) = analysis.wafers.last_mut() {
                    wafer.finish_t = r.finish_t;
                    wafer.part_cnt = r.part_cnt;
                    wafer.rtst_cnt = r.rtst_cnt;
                    wafer.abrt_cnt = r.abrt_cnt;
                    wafer.good_cnt = r.good_cnt;
                    wafer.func_cnt = r.func_cnt;
                    wafer.fabwf_id = r.fabwf_id;
                    wafer.frame_id = r.frame_id;
                    wafer.mask_id = r.mask_id;
                    wafer.usr_desc = r.usr_desc;
                    wafer.exc_desc = r.exc_desc;
                }
            }
            StdfRecord::HBR(r) => {
                *record_counts.entry("HBR".into()).or_insert(0) += 1;
                analysis.hard_bins.push(BinInfo {
                    head_num: r.head_num,
                    site_num: r.site_num,
                    bin_num: r.hbin_num,
                    bin_cnt: r.hbin_cnt,
                    bin_pf: char_to_string(r.hbin_pf),
                    bin_nam: r.hbin_nam,
                    bin_type: "hard".into(),
                });
            }
            StdfRecord::SBR(r) => {
                *record_counts.entry("SBR".into()).or_insert(0) += 1;
                analysis.soft_bins.push(BinInfo {
                    head_num: r.head_num,
                    site_num: r.site_num,
                    bin_num: r.sbin_num,
                    bin_cnt: r.sbin_cnt,
                    bin_pf: char_to_string(r.sbin_pf),
                    bin_nam: r.sbin_nam,
                    bin_type: "soft".into(),
                });
            }
            StdfRecord::TSR(r) => {
                *record_counts.entry("TSR".into()).or_insert(0) += 1;
                analysis.test_summaries.push(TestSummary {
                    head_num: r.head_num,
                    site_num: r.site_num,
                    test_typ: char_to_string(r.test_typ),
                    test_num: r.test_num,
                    exec_cnt: r.exec_cnt,
                    fail_cnt: r.fail_cnt,
                    alrm_cnt: r.alrm_cnt,
                    test_nam: r.test_nam,
                    seq_name: r.seq_name,
                    test_lbl: r.test_lbl,
                    test_tim: r.test_tim,
                    test_min: r.test_min,
                    test_max: r.test_max,
                    tst_sums: r.tst_sums,
                    tst_sqrs: r.tst_sqrs,
                });
            }
            StdfRecord::PIR(r) => {
                *record_counts.entry("PIR".into()).or_insert(0) += 1;
                let key = (r.head_num, r.site_num);
                let mut part = PartResult::default();
                part.head_num = r.head_num;
                part.site_num = r.site_num;
                part.wafer_index = wafer_index;
                part.part_index = part_index;
                part_index += 1;
                active_parts.insert(key, part);
            }
            StdfRecord::PRR(r) => {
                *record_counts.entry("PRR".into()).or_insert(0) += 1;
                let key = (r.head_num, r.site_num);
                if let Some(mut part) = active_parts.remove(&key) {
                    let flg = b1(r.part_flg);
                    part.part_flg = flg;
                    part.num_test = r.num_test;
                    part.hard_bin = r.hard_bin;
                    part.soft_bin = r.soft_bin;
                    part.x_coord = r.x_coord;
                    part.y_coord = r.y_coord;
                    part.test_t = r.test_t;
                    part.part_id = r.part_id;
                    part.part_txt = r.part_txt;
                    part.part_fix = r.part_fix;
                    // bit 3: 1 = no pass/fail, bit 4: 1 = fail
                    part.passed = (flg & 0x18) == 0;
                    analysis.parts.push(part);
                }
            }
            StdfRecord::PTR(r) => {
                *record_counts.entry("PTR".into()).or_insert(0) += 1;
                let key = (r.head_num, r.site_num);
                let flg = b1(r.test_flg);
                let passed = (flg & 0xC0) == 0;

                if let Some(part) = active_parts.get_mut(&key) {
                    part.tests.push(TestResult {
                        test_num: r.test_num,
                        head_num: r.head_num,
                        site_num: r.site_num,
                        result: r.result as f64,
                        test_flg: flg,
                        parm_flg: b1(r.parm_flg),
                        test_txt: r.test_txt.clone(),
                        alarm_id: r.alarm_id.clone(),
                        passed,
                        result_type: "ptr".into(),
                        ..Default::default()
                    });
                }

                if !test_defs.contains_key(&r.test_num) {
                    test_defs.insert(r.test_num, build_test_def_from_ptr(&r));
                }
            }
            StdfRecord::MPR(r) => {
                *record_counts.entry("MPR".into()).or_insert(0) += 1;
                let key = (r.head_num, r.site_num);
                let flg = b1(r.test_flg);
                let passed = (flg & 0xC0) == 0;

                if let Some(part) = active_parts.get_mut(&key) {
                    part.tests.push(TestResult {
                        test_num: r.test_num,
                        head_num: r.head_num,
                        site_num: r.site_num,
                        result: 0.0,
                        test_flg: flg,
                        parm_flg: b1(r.parm_flg),
                        test_txt: r.test_txt.clone(),
                        alarm_id: r.alarm_id.clone(),
                        passed,
                        result_type: "mpr".into(),
                        mpr_results: r.rtn_rslt.clone(),
                        ..Default::default()
                    });
                }

                if !test_defs.contains_key(&r.test_num) {
                    test_defs.insert(r.test_num, build_test_def_from_mpr(&r));
                }
            }
            StdfRecord::FTR(r) => {
                *record_counts.entry("FTR".into()).or_insert(0) += 1;
                let key = (r.head_num, r.site_num);
                let flg = b1(r.test_flg);
                let passed = (flg & 0xC0) == 0;

                if let Some(part) = active_parts.get_mut(&key) {
                    part.tests.push(TestResult {
                        test_num: r.test_num,
                        head_num: r.head_num,
                        site_num: r.site_num,
                        result: 0.0,
                        test_flg: flg,
                        parm_flg: 0,
                        test_txt: r.test_txt.clone(),
                        alarm_id: r.alarm_id.clone(),
                        passed,
                        result_type: "ftr".into(),
                        ftr_num_fail: r.num_fail,
                        ..Default::default()
                    });
                }

                if !test_defs.contains_key(&r.test_num) {
                    test_defs.insert(r.test_num, TestDefinition {
                        test_num: r.test_num,
                        test_txt: r.test_txt,
                        result_type: "ftr".into(),
                        ..Default::default()
                    });
                }
            }
            StdfRecord::PCR(_) => {
                *record_counts.entry("PCR".into()).or_insert(0) += 1;
            }
            other => {
                let name = match other {
                    StdfRecord::ATR(_) => "ATR",
                    StdfRecord::VUR(_) => "VUR",
                    StdfRecord::PMR(_) => "PMR",
                    StdfRecord::PGR(_) => "PGR",
                    StdfRecord::PLR(_) => "PLR",
                    StdfRecord::RDR(_) => "RDR",
                    StdfRecord::PSR(_) => "PSR",
                    StdfRecord::NMR(_) => "NMR",
                    StdfRecord::CNR(_) => "CNR",
                    StdfRecord::SSR(_) => "SSR",
                    StdfRecord::CDR(_) => "CDR",
                    StdfRecord::STR(_) => "STR",
                    StdfRecord::BPS(_) => "BPS",
                    StdfRecord::EPS(_) => "EPS",
                    StdfRecord::GDR(_) => "GDR",
                    StdfRecord::DTR(_) => "DTR",
                    StdfRecord::ReservedRec(_) => "Reserved",
                    StdfRecord::InvalidRec(_) => "Invalid",
                    _ => "Unknown",
                };
                *record_counts.entry(name.into()).or_insert(0) += 1;
            }
        }
    }

    let mut defs: Vec<TestDefinition> = test_defs.into_values().collect();
    defs.sort_by_key(|d| d.test_num);
    analysis.test_definitions = defs;
    analysis.record_counts = record_counts;

    serde_wasm_bindgen::to_value(&analysis)
        .map_err(|e| JsValue::from_str(&format!("Serialization error: {:?}", e)))
}
