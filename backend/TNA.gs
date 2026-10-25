/* BBLC TNA Engine v1.5, 25 Okt 2026. Perubahan: ValidatorNIK boleh lebih dari satu (dipisah koma, mis. dua NOH; siapa pun
 * boleh memvalidasi, sekali divalidasi selesai untuk semua); tnaHasil menyertakan centangan perilaku tiap penilai (bukti) dan
 * kalimat checklist-nya; tnaKonteks mengirim ringkasan tugas (todo) dan batas waktu.
 * BBLC TNA Engine v1.4, 25 Okt 2026. Perubahan: karyawan hanya melihat ITP & kalender training miliknya (gap & rekomendasi
 * hanya untuk penilai, validator Head unit, dan admin); tnaITPSaya menyertakan jadwal batch (tanggal, lokasi, metode).
 * BBLC TNA Engine v1.3, 24 Okt 2026. Perubahan: hasil live per orang (tnaHasil) langsung setelah penilai submit, validasi Head unit
 * (tnaValidasi: setujui / edit rekomendasi / kembalikan ke penilai), tab TNA_Validasi, kolom StatusValidasi di Gap/Rekomendasi/ITP,
 * mesin rekomendasi dipakai bersama (live = output), header tab ditulis ulang saat tab ditimpa.
 * BBLC TNA Engine v1.2, 24 Okt 2026. Perubahan: ModeAsesmen DIKECUALIKAN (C-level tidak dinilai, tetap bisa menilai tim),
 * Mandatory per orang (KodeJabatan "NIK:<nik>"), Riwayat juga melewati training Dianjurkan yang sudah lulus, parameter
 * KategoriDianjurkan (fokus 2027: Technical & Leadership), kelas tatap muka dibentuk per cabang (online digabung).
 * BBLC TNA Engine v1.1, 24 Okt 2026. Perubahan: tab TNA_Riwayat (training Wajib yang sudah lulus tidak dijadwalkan ulang),
 * rekomendasi 70 memprioritaskan task JD jabatan, lalu Intervensi, lalu teks umum.
 * BBLC TNA Engine v1.0, 24 Okt 2026. Modul TNA 2027 (PRD docs/PRD_TNA_Engine_2027.md).
 * File TERPISAH dari Kode.gs: semua tab memakai prefiks TNA_ sehingga fitur Simulator dan Studio
 * lama (MatriksKompetensi, AssessmentTool, IDP, dst) tidak tersentuh sama sekali.
 * Router: Kode.gs doPost meneruskan setiap action berawalan "tna" ke handleTNA(req).
 * Tidak ada secret di file ini. */
var TNA_VERSION = "1.5";

/* ============================================================
 * SKEMA TAB
 * ============================================================ */
var TNA_TAB = {
  Parameter: ["Key", "Value", "Keterangan"],
  Karyawan: ["NIK", "Nama", "Cabang", "Wilayah", "Lokasi", "Dept", "KodeJabatan", "JobTitle", "Jabatan", "Varian", "PJS",
    "TglMasuk", "PenilaiNIK", "Penilai2NIK", "ModeAsesmen", "KelompokID", "DelegasiBoleh", "Aktif", "ValidatorNIK"],
  MasterJabatan: ["KodeJabatan", "JobTitle", "Dept", "Lokasi", "JmlIncumbent", "ModeAsesmen", "FileJD", "LinkJD", "StatusJD",
    "StatusMatriks", "Versi", "DisetujuiOleh", "DisetujuiPada", "Catatan"],
  Kamus: ["KodeKompetensi", "Nama", "Kategori", "Definisi", "L1", "L2", "L3", "L4", "L5", "Status"],
  Checklist: ["KodeKompetensi", "C2", "C3", "C4", "C5"],
  Matriks: ["KodeJabatan", "KodeKompetensi", "RequiredLevel", "Bobot", "Sumber", "Flag"],
  Task: ["KodeJabatan", "NoTugas", "TugasUtama", "Task", "KodeKompetensi"],
  Intervensi: ["KodeKompetensi", "Tipe", "Deskripsi"],
  Katalog: ["KodeTraining", "Judul", "Kategori", "KodeKompetensi", "LevelTarget", "Metode", "DurasiJam", "SumberFile", "Link", "Status"],
  Mandatory: ["KodeJabatan", "KodeTraining", "Dasar"],
  Riwayat: ["NIK", "KodeTraining", "Tanggal", "Sumber"],
  Asesmen: ["Periode", "NIK", "KelompokID", "KodeKompetensi", "Rater", "RaterNIK", "Checks", "Level", "NA", "Alasan", "Status", "Timestamp"],
  Gap: ["Periode", "NIK", "Nama", "Cabang", "Dept", "KodeJabatan", "JobTitle", "KodeKompetensi", "Kompetensi", "Kategori",
    "Required", "Bobot", "SkorAtasan", "SkorSelf", "Actual", "Gap", "Prioritas", "KategoriGap", "Flag", "StatusValidasi"],
  Rekomendasi: ["NIK", "Nama", "KodeKompetensi", "Kompetensi", "Gap", "Prioritas", "R70_Penugasan", "R20_Sosial", "R10_Training", "DiubahValidator", "StatusValidasi"],
  ITP: ["NIK", "Nama", "Cabang", "Wilayah", "KodeJabatan", "JobTitle", "KodeTraining", "Judul", "Kategori", "KodeKompetensi",
    "Bulan", "BatchID", "Jam", "Status", "StatusValidasi"],
  Validasi: ["Periode", "Target", "Jenis", "Nama", "Jabatan", "Cabang", "PenilaiNIK", "ValidatorNIK", "Status", "Catatan", "Edit", "Ringkasan", "DiperbaruiOleh", "Timestamp"],
  Batch: ["BatchID", "KodeTraining", "Judul", "Kategori", "Metode", "Bulan", "Minggu", "TanggalMulai", "Lokasi", "JmlPeserta", "DurasiJam", "TotalJam"],
  Proyeksi: ["NIK", "Nama", "Cabang", "Dept", "KodeJabatan", "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    "TotalJam", "TargetJam", "PersenTarget", "StatusJam", "ReadinessSaatIni", "ReadinessProyeksi"],
  Log: ["Timestamp", "NIK", "Aksi", "Detail"]
};

var TNA_PARAM_DEFAULT = [
  ["Periode", "TNA2027", "Kode periode asesmen"],
  ["WindowBuka", "2026-10-27T00:00:00+08:00", "Mulai window asesmen (WITA)"],
  ["WindowTutup", "2026-11-03T23:59:59+08:00", "Akhir window asesmen (WITA)"],
  ["BobotAtasan", 0.7, "Bobot skor atasan pada skor Actual"],
  ["BobotSelf", 0.3, "Bobot self-rating pada skor Actual"],
  ["TahunITP", 2027, "Tahun rencana ITP"],
  ["TargetJamBulan", 3, "Target jam belajar per orang per bulan"],
  ["KapasitasKelas", 20, "Default peserta per batch kelas"],
  ["MaksDianjurkan", 4, "Maksimal training Dianjurkan per orang per tahun"],
  ["KategoriDianjurkan", "Technical,Leadership", "Kategori kompetensi yang gap-nya dijadwalkan training Dianjurkan (fokus 2027)"],
  ["DurasiDefaultJam", 4, "Durasi training bila katalog kosong"],
  ["KoefTraining", 0.5, "Kenaikan level proyeksi per training Dianjurkan"],
  ["KoefCoaching", 0.5, "Kenaikan level proyeksi dari coaching terstruktur"],
  ["KoefPenugasan", 0.5, "Kenaikan level proyeksi dari penugasan"],
  ["JamCoachingPerGap", 1, "Jam coaching terstruktur per kompetensi gap per tahun (dihitung jam belajar)"],
  ["OutputTerakhir", "", "Diisi sistem: waktu generate output terakhir"],
  ["OutputLinks", "", "Diisi sistem: link 5 dokumen output (JSON)"],
  ["Rekonsiliasi", "", "Diisi sistem: total jam Plan/ITP/Calendar"]
];

var TNA_BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

/* ============================================================
 * ROUTER
 * ============================================================ */
function handleTNA(req) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  switch (req.action) {
    case "tnaPing": return { ok: true, versi: TNA_VERSION };
    case "tnaKonteks": return tnaKonteks(ss, req);
    case "tnaForm": return tnaForm(ss, req);
    case "tnaSubmit": return tnaSubmit(ss, req);
    case "tnaApprove": return tnaApprove(ss, req);
    case "tnaProgres": return tnaProgres(ss, req);
    case "tnaMatriksJabatan": return tnaMatriksJabatan(ss, req);
    case "tnaApproveMatriks": return tnaApproveMatriks(ss, req);
    case "tnaSetParameter": return tnaSetParameter(ss, req);
    case "tnaGenerateOutput": return tnaGenerateOutputEndpoint(ss, req);
    case "tnaGetOutput": return tnaGetOutput(ss, req);
    case "tnaITPSaya": return tnaITPSaya(ss, req);
    case "tnaHasil": return tnaHasil(ss, req);
    case "tnaValidasi": return tnaValidasi(ss, req);
    case "tnaValidasiMassal": return tnaValidasiMassal(ss, req);
    default: return { ok: false, error: "Aksi TNA tidak dikenal." };
  }
}

/* ============================================================
 * UTILITAS SHEET
 * ============================================================ */
function tnaSheet(ss, nama) {
  var full = "TNA_" + nama;
  var sh = ss.getSheetByName(full);
  if (!sh) {
    sh = ss.insertSheet(full);
    var h = TNA_TAB[nama];
    sh.getRange(1, 1, 1, h.length).setValues([h]).setFontWeight("bold");
    sh.setFrozenRows(1);
  }
  return sh;
}

// Membaca tab sebagai array objek berdasarkan header baris 1.
function tnaBaca(ss, nama) {
  var sh = ss.getSheetByName("TNA_" + nama);
  if (!sh || sh.getLastRow() < 2) return [];
  var v = sh.getDataRange().getValues();
  var h = v[0];
  var out = [];
  for (var i = 1; i < v.length; i++) {
    if (v[i].join("") === "") continue;
    var o = {};
    for (var c = 0; c < h.length; c++) o[h[c]] = v[i][c];
    out.push(o);
  }
  return out;
}

// Menimpa seluruh isi tab (di bawah header) dalam satu setValues.
function tnaTulisUlang(ss, nama, rows) {
  var sh = tnaSheet(ss, nama);
  var h = TNA_TAB[nama];
  sh.getRange(1, 1, 1, h.length).setValues([h]);
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, Math.max(sh.getLastColumn(), h.length)).clearContent();
  if (!rows.length) return;
  var data = rows.map(function (o) { return h.map(function (k) { return o[k] === undefined || o[k] === null ? "" : o[k]; }); });
  sh.getRange(2, 1, data.length, h.length).setValues(data);
}

function tnaTambah(ss, nama, rows) {
  if (!rows.length) return;
  var sh = tnaSheet(ss, nama);
  var h = TNA_TAB[nama];
  var data = rows.map(function (o) { return h.map(function (k) { return o[k] === undefined || o[k] === null ? "" : o[k]; }); });
  sh.getRange(sh.getLastRow() + 1, 1, data.length, h.length).setValues(data);
}

function tnaParam(ss) {
  var p = {};
  TNA_PARAM_DEFAULT.forEach(function (r) { p[r[0]] = r[1]; });
  tnaBaca(ss, "Parameter").forEach(function (r) { if (r.Key) p[String(r.Key)] = r.Value; });
  return p;
}

function tnaLog(ss, nik, aksi, detail) {
  try { tnaTambah(ss, "Log", [{ Timestamp: new Date(), NIK: nik, Aksi: aksi, Detail: String(detail || "").substring(0, 500) }]); }
  catch (e) { Logger.log("Log gagal: " + e.message); }
}

function tnaWindow(p) {
  var now = new Date();
  var buka = new Date(p.WindowBuka), tutup = new Date(p.WindowTutup);
  if (now < buka) return { status: "BELUM_DIBUKA", buka: buka, tutup: tutup };
  if (now > tutup) return { status: "DITUTUP", buka: buka, tutup: tutup };
  return { status: "DIBUKA", buka: buka, tutup: tutup };
}

function tnaR2(x) { return Math.round(Number(x) * 100) / 100; }

/* ============================================================
 * OTENTIKASI & PERAN
 * Login tetap memakai NIK + PIN di tab Users (handleLogin Kode.gs). Setiap aksi TNA mengirim nik + pin
 * dan divalidasi ulang di sini, karena otorisasi wajib di backend.
 * ============================================================ */
function tnaAuth(ss, req) {
  var nik = String(req.nik || "").trim(), pin = String(req.pin || "").trim();
  if (!nik || !pin) return { ok: false, error: "Sesi berakhir, silakan login ulang." };
  var rows = ss.getSheetByName("Users").getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() !== nik) continue;
    if (String(rows[i][1]).trim() !== pin) return { ok: false, error: "PIN salah, silakan login ulang." };
    if (wajibGantiPinAktif(rows[i][8])) return { ok: false, error: "Ganti PIN dulu di Learning Simulator sebelum mengisi asesmen." };
    return { ok: true, nik: nik, nama: String(rows[i][2]), role: String(rows[i][5] || "user").toLowerCase() };
  }
  return { ok: false, error: "NIK tidak terdaftar." };
}

// Default: hanya karyawan yang dinilai. termasukDikecualikan=true juga memuat ModeAsesmen DIKECUALIKAN
// (mis. C-level: tidak dinilai & tidak masuk ITP, tetapi tetap menjadi penilai timnya).
function tnaPetaKaryawan(ss, termasukDikecualikan) {
  var map = {};
  tnaBaca(ss, "Karyawan").forEach(function (k) {
    k.NIK = String(k.NIK); k.PenilaiNIK = String(k.PenilaiNIK || ""); k.Penilai2NIK = String(k.Penilai2NIK || "");
    if (!termasukDikecualikan && k.ModeAsesmen === "DIKECUALIKAN") return;
    if (String(k.Aktif).toUpperCase() !== "N") map[k.NIK] = k;
  });
  return map;
}

// Peran pengguna terhadap seorang karyawan / kelompok: ATASAN, ATASAN2, DELEGASI, SELF, ADMIN, atau null.
function tnaPeranTerhadap(auth, karyawanMap, target) {
  if (target.NIK === auth.nik) return "SELF";
  if (target.PenilaiNIK === auth.nik) return "ATASAN";
  if (target.Penilai2NIK && target.Penilai2NIK === auth.nik) return "ATASAN2";
  var saya = karyawanMap[auth.nik];
  if (saya && target.DelegasiBoleh && saya.JobTitle === "LEADER MEKANIK" && saya.Cabang === target.Cabang) return "DELEGASI";
  if (auth.role === "admin") return "ADMIN";
  return null;
}

/* ============================================================
 * KONTEKS: siapa saja yang harus dinilai pengguna + progres
 * ============================================================ */
function tnaKonteks(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  var p = tnaParam(ss), win = tnaWindow(p);
  var km = tnaPetaKaryawan(ss);
  var ases = tnaBaca(ss, "Asesmen").filter(function (a) { return a.Periode === p.Periode; });
  var sudah = {}; // key target|rater -> status
  ases.forEach(function (a) {
    var key = (a.KelompokID ? "K:" + a.KelompokID : "N:" + a.NIK) + "|" + a.RaterNIK;
    if (!sudah[key] || a.Status === "FINAL") sudah[key] = a.Status;
  });

  var valMap = tnaPetaValidasi(ss, p);
  var tugas = [], kelompok = {}, delegasi = [];
  Object.keys(km).forEach(function (nik) {
    var k = km[nik];
    var peran = tnaPeranTerhadap(auth, km, k);
    if (!peran || peran === "SELF" || peran === "ADMIN") return;
    if (k.ModeAsesmen === "KELOMPOK") {
      if (peran !== "ATASAN") return;
      if (!kelompok[k.KelompokID]) kelompok[k.KelompokID] = { kelompokId: k.KelompokID, jobTitle: k.JobTitle, jabatan: k.Jabatan, cabang: k.Cabang, anggota: 0 };
      kelompok[k.KelompokID].anggota++;
      return;
    }
    var st = sudah["N:" + nik + "|" + auth.nik] || "";
    var vv = valMap[nik] || {};
    var item = { nik: nik, nama: k.Nama, jabatan: k.Jabatan, jobTitle: k.JobTitle, cabang: k.Cabang, peran: peran, status: st || "BELUM",
      validasi: vv.Status || "", catatanValidasi: vv.Status === "DIKEMBALIKAN" ? String(vv.Catatan || "") : "" };
    if (peran === "DELEGASI") delegasi.push(item); else tugas.push(item);
  });
  var kelompokList = Object.keys(kelompok).map(function (id) {
    var g = kelompok[id], vv = valMap["K:" + id] || {};
    g.status = sudah["K:" + id + "|" + auth.nik] || "BELUM"; g.validasi = vv.Status || "";
    g.catatanValidasi = vv.Status === "DIKEMBALIKAN" ? String(vv.Catatan || "") : ""; return g;
  });

  // Delegasi menunggu approval untuk penilai utama
  var menunggu = [];
  ases.forEach(function (a) {
    if (a.Status !== "MENUNGGU_APPROVAL" || a.Rater !== "DELEGASI") return;
    var t = km[String(a.NIK)];
    if (t && t.PenilaiNIK === auth.nik) {
      if (!menunggu.some(function (m) { return m.nik === t.NIK; })) {
        menunggu.push({ nik: t.NIK, nama: t.Nama, jabatan: t.Jabatan, olehNik: String(a.RaterNIK), olehNama: (km[String(a.RaterNIK)] || {}).Nama || "" });
      }
    }
  });

  var saya = tnaPetaKaryawan(ss, true)[auth.nik];
  var selfStatus = !saya ? "TIDAK_PERLU" : saya.ModeAsesmen === "DIKECUALIKAN" ? "DIKECUALIKAN" :
    saya.ModeAsesmen !== "KELOMPOK" ? (sudah["N:" + auth.nik + "|" + auth.nik] || "BELUM") : "TIDAK_PERLU";
  tugas.sort(function (a, b) { return a.nama.localeCompare(b.nama); });
  return {
    ok: true, nama: auth.nama, role: auth.role, window: win.status,
    windowBuka: win.buka, windowTutup: win.tutup, periode: p.Periode,
    terdaftar: !!saya, jabatan: saya ? saya.Jabatan : "", selfStatus: selfStatus,
    todo: {
      nilai: tugas.filter(function (t) { return t.status !== "FINAL" || t.validasi === "DIKEMBALIKAN"; }).length +
        kelompokList.filter(function (g) { return g.status !== "FINAL" || g.validasi === "DIKEMBALIKAN"; }).length,
      revisi: tugas.filter(function (t) { return t.validasi === "DIKEMBALIKAN"; }).length + kelompokList.filter(function (g) { return g.validasi === "DIKEMBALIKAN"; }).length,
      delegasi: delegasi.filter(function (t) { return t.status !== "FINAL" && t.status !== "MENUNGGU_APPROVAL"; }).length,
      approval: menunggu.length
    },
    tugas: tugas, kelompok: kelompokList, delegasi: delegasi, menungguApproval: menunggu,
    validasi: Object.keys(valMap).map(function (key) { return valMap[key]; }).filter(function (v) { return tnaAdalahValidator(auth.nik, v.ValidatorNIK); })
      .map(function (v) {
        var key = String(v.Target), kel = key.indexOf("K:") === 0;
        return { kunci: key, nik: kel ? "" : key, kelompokId: kel ? key.substring(2) : "", nama: v.Nama, jabatan: v.Jabatan, cabang: v.Cabang,
          penilai: (km[String(v.PenilaiNIK)] || {}).Nama || "", status: v.Status, ringkasan: tnaParseEdit(v.Ringkasan) };
      }).sort(function (a, b) { return (a.status === "MENUNGGU_VALIDASI" ? 0 : 1) - (b.status === "MENUNGGU_VALIDASI" ? 0 : 1) || String(a.nama).localeCompare(String(b.nama)); })
  };
}

/* ============================================================
 * FORM ASESMEN
 * Penilaian memakai checklist perilaku observable per level (L2..L5), bukan angka langsung,
 * meneruskan prinsip Studio v2 (mengurangi bias). Skor = 1 + jumlah level berturut-turut
 * yang tercentang dari bawah (skala Guttman); centang yang melompat diberi flag INKONSISTEN.
 * ============================================================ */
function tnaKompetensiJabatan(ss, kodeJabatan) {
  var kamus = {};
  tnaBaca(ss, "Kamus").forEach(function (k) { kamus[k.KodeKompetensi] = k; });
  var cek = {};
  tnaBaca(ss, "Checklist").forEach(function (c) { cek[c.KodeKompetensi] = [c.C2, c.C3, c.C4, c.C5].map(String); });
  return tnaBaca(ss, "Matriks").filter(function (m) { return m.KodeJabatan === kodeJabatan; }).map(function (m) {
    var k = kamus[m.KodeKompetensi] || {};
    return {
      kode: m.KodeKompetensi, nama: k.Nama || m.KodeKompetensi, kategori: k.Kategori || "", definisi: k.Definisi || "",
      levels: [k.L1, k.L2, k.L3, k.L4, k.L5].map(function (x) { return String(x || ""); }),
      checklist: cek[m.KodeKompetensi] || ["", "", "", ""], required: Number(m.RequiredLevel), bobot: Number(m.Bobot || 2)
    };
  });
}

function tnaForm(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  var p = tnaParam(ss), km = tnaPetaKaryawan(ss);
  var target, peran, kodeJabatan, judul;
  if (req.kelompokId) {
    var anggota = Object.keys(km).map(function (n) { return km[n]; }).filter(function (k) { return k.KelompokID === req.kelompokId; });
    if (!anggota.length) return { ok: false, error: "Kelompok tidak ditemukan." };
    if (anggota[0].PenilaiNIK !== auth.nik && auth.role !== "admin") return { ok: false, error: "Anda bukan penilai kelompok ini." };
    peran = "ATASAN"; kodeJabatan = anggota[0].KodeJabatan;
    judul = anggota[0].Jabatan + " di " + anggota[0].Cabang + " (" + anggota.length + " orang)";
    target = { kelompokId: req.kelompokId, anggota: anggota.map(function (a) { return a.Nama; }) };
  } else {
    var t = km[String(req.target || auth.nik)];
    if (!t) return { ok: false, error: tnaPetaKaryawan(ss, true)[String(req.target || auth.nik)] ? "Jabatan ini tidak termasuk asesmen TNA 2027." : "Karyawan tidak terdaftar di TNA 2027." };
    peran = tnaPeranTerhadap(auth, km, t);
    if (!peran || peran === "ADMIN") return { ok: false, error: "Anda tidak berwenang menilai karyawan ini." };
    if (peran === "SELF" && t.ModeAsesmen === "KELOMPOK") return { ok: false, error: "Jabatan Anda dinilai per kelompok oleh Kepala Cabang, tidak perlu self-rating." };
    kodeJabatan = t.KodeJabatan; judul = t.Nama + ", " + t.Jabatan;
    target = { nik: t.NIK, nama: t.Nama, jabatan: t.Jabatan, cabang: t.Cabang };
  }
  var mj = tnaBaca(ss, "MasterJabatan").filter(function (j) { return j.KodeJabatan === kodeJabatan; })[0];
  if (!mj || mj.StatusMatriks !== "APPROVED") return { ok: false, error: "Matriks kompetensi jabatan ini belum disetujui. Hubungi L&D." };
  var komp = tnaKompetensiJabatan(ss, kodeJabatan);

  // Jawaban sebelumnya (supaya bisa dilanjutkan / direvisi selama window dibuka)
  var prev = {};
  var lihatDelegasi = req.lihatDelegasi === true && !req.kelompokId;
  if (lihatDelegasi && peran !== "ATASAN" && auth.role !== "admin") return { ok: false, error: "Hanya penilai utama yang dapat meninjau isian delegasi." };
  tnaBaca(ss, "Asesmen").forEach(function (a) {
    if (a.Periode !== p.Periode) return;
    if (lihatDelegasi) { if (a.Rater !== "DELEGASI" || a.Status !== "MENUNGGU_APPROVAL") return; }
    else if (String(a.RaterNIK) !== auth.nik) return;
    if (req.kelompokId ? a.KelompokID !== req.kelompokId : String(a.NIK) !== target.nik) return;
    prev[a.KodeKompetensi] = { checks: tnaNormalChecks(a.Checks), na: a.NA === true || String(a.NA).toUpperCase() === "TRUE", alasan: a.Alasan };
  });
  return { ok: true, peran: peran, judul: judul, target: target, kompetensi: komp, jawaban: prev, window: tnaWindow(p).status };
}

// Checks disimpan sebagai huruf Y/N (contoh "YYNN" untuk L2..L5) supaya Sheets tidak mengubahnya jadi angka.
function tnaNormalChecks(checks) {
  var s = String(checks || "").toUpperCase().replace(/1/g, "Y").replace(/0/g, "N").replace(/[^YN]/g, "");
  while (s.length < 4) s += "N";
  return s.substring(0, 4);
}

function tnaSkorDariChecks(checks) {
  var s = tnaNormalChecks(checks).replace(/Y/g, "1").replace(/N/g, "0");
  var lvl = 1, putus = false, inkonsisten = false;
  for (var i = 0; i < 4; i++) {
    var c = s.charAt(i) === "1";
    if (c && !putus) lvl++;
    else if (!c) putus = true;
    else if (c && putus) inkonsisten = true;
  }
  return { level: lvl, inkonsisten: inkonsisten };
}

function tnaSubmit(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  var p = tnaParam(ss);
  if (tnaWindow(p).status !== "DIBUKA" && auth.role !== "admin") return { ok: false, error: "Window asesmen sedang tidak dibuka." };
  var km = tnaPetaKaryawan(ss);
  var peran, nikTarget = "", kelompokId = "", kodeJabatan;
  if (req.kelompokId) {
    var ang = Object.keys(km).map(function (n) { return km[n]; }).filter(function (k) { return k.KelompokID === req.kelompokId; });
    if (!ang.length) return { ok: false, error: "Kelompok tidak ditemukan." };
    if (ang[0].PenilaiNIK !== auth.nik && auth.role !== "admin") return { ok: false, error: "Anda bukan penilai kelompok ini." };
    peran = "ATASAN"; kelompokId = req.kelompokId; kodeJabatan = ang[0].KodeJabatan;
  } else {
    var t = km[String(req.target || "")];
    if (!t) return { ok: false, error: "Karyawan tidak terdaftar di TNA 2027." };
    peran = tnaPeranTerhadap(auth, km, t);
    if (!peran || peran === "ADMIN") return { ok: false, error: "Anda tidak berwenang menilai karyawan ini." };
    nikTarget = t.NIK; kodeJabatan = t.KodeJabatan;
  }
  var komp = tnaKompetensiJabatan(ss, kodeJabatan);
  var wajib = {}; komp.forEach(function (k) { wajib[k.kode] = true; });
  var jawaban = req.jawaban || {};
  var baris = [], kurang = [];
  Object.keys(wajib).forEach(function (kode) {
    var j = jawaban[kode];
    if (!j) { kurang.push(kode); return; }
    var na = j.na === true;
    if (na && !String(j.alasan || "").trim()) { kurang.push(kode); return; }
    var sk = tnaSkorDariChecks(j.checks);
    baris.push({
      Periode: p.Periode, NIK: nikTarget, KelompokID: kelompokId, KodeKompetensi: kode, Rater: peran, RaterNIK: auth.nik,
      Checks: tnaNormalChecks(j.checks), Level: na ? "" : sk.level, NA: na, Alasan: String(j.alasan || ""),
      Status: peran === "DELEGASI" ? "MENUNGGU_APPROVAL" : "FINAL", Timestamp: new Date()
    });
  });
  if (kurang.length) return { ok: false, error: "Masih ada " + kurang.length + " kompetensi yang belum diisi (atau N/A tanpa alasan)." };

  var lock = LockService.getScriptLock();
  waitLockDenganRetry(lock, 15000, 3);
  try {
    // Hapus jawaban lama rater yang sama untuk target yang sama (revisi), lalu tulis baru.
    var sh = tnaSheet(ss, "Asesmen");
    var v = sh.getDataRange().getValues();
    var simpan = [v[0]];
    for (var i = 1; i < v.length; i++) {
      var sama = v[i][0] === p.Periode && String(v[i][5]) === auth.nik &&
        (kelompokId ? v[i][2] === kelompokId : String(v[i][1]) === nikTarget);
      if (!sama) simpan.push(v[i]);
    }
    if (simpan.length !== v.length) {
      sh.getRange(1, 1, v.length, v[0].length).clearContent();
      sh.getRange(1, 1, simpan.length, v[0].length).setValues(simpan);
    }
    tnaTambah(ss, "Asesmen", baris);
    // Validasi Head unit: rating atasan baru/revisi -> MENUNGGU_VALIDASI. Self-rating sesudah disetujui -> tinjau ulang.
    var kunciV = kelompokId ? "K:" + kelompokId : nikTarget;
    var vAda = tnaPetaValidasi(ss, p)[kunciV];
    if (peran === "ATASAN" || peran === "ATASAN2") tnaSimpanValidasi(ss, p, km, kunciV, { Status: "MENUNGGU_VALIDASI", Edit: "" }, auth.nik);
    else if (peran === "SELF" && vAda && vAda.Status === "DISETUJUI")
      tnaSimpanValidasi(ss, p, km, kunciV, { Status: "MENUNGGU_VALIDASI", Catatan: "Self-rating masuk setelah validasi, mohon tinjau ulang." }, auth.nik);
  } finally { lock.releaseLock(); }
  tnaLog(ss, auth.nik, "submit", (kelompokId || nikTarget) + " peran " + peran + " " + baris.length + " kompetensi");
  return { ok: true, peran: peran, jumlah: baris.length, status: peran === "DELEGASI" ? "MENUNGGU_APPROVAL" : "FINAL",
    lihatHasil: peran === "ATASAN" || peran === "ATASAN2" };
}

// Penilai utama menyetujui (atau menolak) isian delegasi Leader Mekanik.
function tnaApprove(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  var p = tnaParam(ss), km = tnaPetaKaryawan(ss);
  var t = km[String(req.target || "")];
  if (!t || (t.PenilaiNIK !== auth.nik && auth.role !== "admin")) return { ok: false, error: "Anda bukan penilai utama karyawan ini." };
  var setuju = req.setuju !== false;
  var lock = LockService.getScriptLock();
  waitLockDenganRetry(lock, 15000, 3);
  var n = 0;
  try {
    var sh = tnaSheet(ss, "Asesmen");
    var v = sh.getDataRange().getValues();
    var h = v[0], cSt = h.indexOf("Status"), cRater = h.indexOf("Rater"), cRN = h.indexOf("RaterNIK");
    var simpan = [h];
    for (var i = 1; i < v.length; i++) {
      var hit = v[i][0] === p.Periode && String(v[i][1]) === t.NIK && v[i][cRater] === "DELEGASI" && v[i][cSt] === "MENUNGGU_APPROVAL";
      if (hit) {
        n++;
        if (!setuju) continue;
        v[i][cSt] = "FINAL"; v[i][cRater] = "ATASAN"; v[i][cRN] = auth.nik;
        v[i][h.indexOf("Alasan")] = String(v[i][h.indexOf("Alasan")] || "") + " [diisi delegasi, disetujui " + auth.nama + "]";
      }
      simpan.push(v[i]);
    }
    sh.getRange(1, 1, v.length, h.length).clearContent();
    sh.getRange(1, 1, simpan.length, h.length).setValues(simpan);
    if (setuju && n) tnaSimpanValidasi(ss, p, km, t.NIK, { Status: "MENUNGGU_VALIDASI", Edit: "" }, auth.nik);
  } finally { lock.releaseLock(); }
  tnaLog(ss, auth.nik, setuju ? "approve" : "tolak", t.NIK + " " + n + " baris");
  return { ok: true, jumlah: n, setuju: setuju };
}

/* ============================================================
 * DASHBOARD PROGRES
 * ============================================================ */
function tnaProgres(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  var p = tnaParam(ss), km = tnaPetaKaryawan(ss);
  var lingkup = Object.keys(km).map(function (n) { return km[n]; });
  if (auth.role !== "admin") {
    // Non-admin: hanya bawahan langsung + tidak langsung (rantai penilai)
    var bawah = {}, ubah = true; bawah[auth.nik] = true;
    while (ubah) {
      ubah = false;
      lingkup.forEach(function (k) { if (!bawah[k.NIK] && (bawah[k.PenilaiNIK] || bawah[k.Penilai2NIK])) { bawah[k.NIK] = true; ubah = true; } });
    }
    delete bawah[auth.nik];
    lingkup = lingkup.filter(function (k) { return bawah[k.NIK]; });
  }
  var ases = tnaBaca(ss, "Asesmen").filter(function (a) { return a.Periode === p.Periode && a.Status === "FINAL"; });
  var dinilai = {}, self = {}, kel = {};
  ases.forEach(function (a) {
    if (a.KelompokID) kel[a.KelompokID] = true;
    else if (a.Rater === "SELF") self[String(a.NIK)] = true;
    else dinilai[String(a.NIK)] = true;
  });
  var agg = {}, belum = [];
  lingkup.forEach(function (k) {
    var key = k.Cabang;
    if (!agg[key]) agg[key] = { unit: key, total: 0, selesai: 0, self: 0, perluSelf: 0 };
    var a = agg[key]; a.total++;
    var ok = k.ModeAsesmen === "KELOMPOK" ? !!kel[k.KelompokID] : !!dinilai[k.NIK];
    if (ok) a.selesai++; else belum.push({ nik: k.NIK, nama: k.Nama, cabang: k.Cabang, jabatan: k.Jabatan, penilai: (km[k.PenilaiNIK] || {}).Nama || "" });
    if (k.ModeAsesmen !== "KELOMPOK") { a.perluSelf++; if (self[k.NIK]) a.self++; }
  });
  var units = Object.keys(agg).map(function (x) { var a = agg[x]; a.persen = a.total ? Math.round(a.selesai / a.total * 100) : 0; return a; })
    .sort(function (a, b) { return a.persen - b.persen; });
  var tot = units.reduce(function (s, u) { s.total += u.total; s.selesai += u.selesai; return s; }, { total: 0, selesai: 0 });
  // Rekap penilai yang belum selesai (untuk reminder)
  var perPenilai = {};
  belum.forEach(function (b) { perPenilai[b.penilai] = (perPenilai[b.penilai] || 0) + 1; });
  var valMapP = tnaPetaValidasi(ss, p), rekapVal = { DISETUJUI: 0, MENUNGGU_VALIDASI: 0, DIKEMBALIKAN: 0 }, sudahK = {};
  lingkup.forEach(function (k) {
    var key = tnaKunciValidasi(k); if (sudahK[key]) return; sudahK[key] = true;
    var v = valMapP[key]; if (v && rekapVal[v.Status] !== undefined) rekapVal[v.Status]++;
  });
  return { ok: true, total: tot.total, selesai: tot.selesai, persen: tot.total ? Math.round(tot.selesai / tot.total * 100) : 0, validasi: rekapVal,
    units: units, belum: belum.slice(0, 300), perPenilai: perPenilai, window: tnaWindow(p).status };
}

/* ============================================================
 * MATRIKS: review & approve per jabatan (Dept Head / Admin)
 * ============================================================ */
function tnaMatriksJabatan(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  var jab = tnaBaca(ss, "MasterJabatan");
  if (!req.kodeJabatan) {
    return { ok: true, jabatan: jab.map(function (j) {
      return { kode: j.KodeJabatan, jobTitle: j.JobTitle, dept: j.Dept, jml: j.JmlIncumbent, status: j.StatusMatriks, statusJD: j.StatusJD, link: j.LinkJD };
    }) };
  }
  var mj = jab.filter(function (j) { return j.KodeJabatan === req.kodeJabatan; })[0];
  if (!mj) return { ok: false, error: "Kode jabatan tidak ditemukan." };
  var task = tnaBaca(ss, "Task").filter(function (t) { return t.KodeJabatan === req.kodeJabatan; });
  var flags = {};
  tnaBaca(ss, "Matriks").forEach(function (m) { if (m.KodeJabatan === req.kodeJabatan) flags[m.KodeKompetensi] = { flag: m.Flag, sumber: m.Sumber }; });
  var komp = tnaKompetensiJabatan(ss, req.kodeJabatan).map(function (k) { k.flag = (flags[k.kode] || {}).flag || ""; k.sumber = (flags[k.kode] || {}).sumber || ""; return k; });
  return { ok: true, jabatan: mj, kompetensi: komp, task: task };
}

function tnaApproveMatriks(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  if (auth.role !== "admin") return { ok: false, error: "Hanya admin L&D yang dapat menyetujui matriks." };
  var kodeList = req.kodeList || (req.kodeJabatan ? [req.kodeJabatan] : []);
  var sh = tnaSheet(ss, "MasterJabatan");
  var v = sh.getDataRange().getValues(), h = v[0];
  var n = 0;
  for (var i = 1; i < v.length; i++) {
    if (kodeList.indexOf(v[i][0]) === -1) continue;
    v[i][h.indexOf("StatusMatriks")] = req.status || "APPROVED";
    v[i][h.indexOf("DisetujuiOleh")] = auth.nama;
    v[i][h.indexOf("DisetujuiPada")] = new Date();
    n++;
  }
  sh.getRange(1, 1, v.length, h.length).setValues(v);
  tnaLog(ss, auth.nik, "approveMatriks", kodeList.join(","));
  return { ok: true, jumlah: n };
}

function tnaSetParameter(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  if (auth.role !== "admin") return { ok: false, error: "Hanya admin." };
  var boleh = ["WindowBuka", "WindowTutup", "BobotAtasan", "BobotSelf", "TargetJamBulan", "KapasitasKelas", "MaksDianjurkan", "DurasiDefaultJam",
    "KategoriDianjurkan", "KoefTraining", "KoefCoaching", "KoefPenugasan", "JamCoachingPerGap"];
  var sh = tnaSheet(ss, "Parameter");
  var v = sh.getDataRange().getValues();
  var ubah = req.parameter || {};
  Object.keys(ubah).forEach(function (k) {
    if (boleh.indexOf(k) === -1) return;
    var found = false;
    for (var i = 1; i < v.length; i++) if (v[i][0] === k) { v[i][1] = ubah[k]; found = true; }
    if (!found) v.push([k, ubah[k], ""]);
  });
  sh.getRange(1, 1, v.length, 3).setValues(v);
  tnaLog(ss, auth.nik, "setParameter", JSON.stringify(ubah));
  return { ok: true, parameter: tnaParam(ss) };
}

/* ============================================================
 * MESIN OUTPUT: Gap -> Rekomendasi 70/20/10 -> ITP -> Batch/Kalender -> Proyeksi
 * Satu fungsi in-memory, ditulis per blok. 807 orang x ~15 kompetensi aman di bawah 6 menit.
 * ============================================================ */
function tnaHitungGap(ss, p, km) {
  var bA = Number(p.BobotAtasan), bS = Number(p.BobotSelf);
  var ases = tnaBaca(ss, "Asesmen").filter(function (a) { return a.Periode === p.Periode && a.Status === "FINAL" && !(a.NA === true || String(a.NA).toUpperCase() === "TRUE"); });
  // Kumpulkan skor per (nik, kompetensi)
  var kel = {}; // kelompokId -> {kode: [levels]}
  var atas = {}, self = {}, raterStat = {};
  ases.forEach(function (a) {
    var lv = Number(a.Level); if (!lv) return;
    var rk = String(a.RaterNIK);
    if (a.Rater !== "SELF") { (raterStat[rk] = raterStat[rk] || []).push(lv); }
    if (a.KelompokID) { ((kel[a.KelompokID] = kel[a.KelompokID] || {})[a.KodeKompetensi] = kel[a.KelompokID][a.KodeKompetensi] || []).push(lv); return; }
    var key = String(a.NIK) + "|" + a.KodeKompetensi;
    if (a.Rater === "SELF") self[key] = lv;
    else (atas[key] = atas[key] || []).push(lv);
  });
  // Flag rater: straight-lining & leniency
  var flagRater = {}, rerata = [];
  Object.keys(raterStat).forEach(function (r) {
    var arr = raterStat[r]; var m = arr.reduce(function (s, x) { return s + x; }, 0) / arr.length; rerata.push(m);
    if (arr.length >= 10) {
      var freq = {}; arr.forEach(function (x) { freq[x] = (freq[x] || 0) + 1; });
      var maks = Math.max.apply(null, Object.keys(freq).map(function (k) { return freq[k]; }));
      if (maks / arr.length >= 0.9) flagRater[r] = "STRAIGHT-LINING";
    }
    raterStat[r] = m;
  });
  if (rerata.length > 2) {
    var mu = rerata.reduce(function (s, x) { return s + x; }, 0) / rerata.length;
    var sd = Math.sqrt(rerata.reduce(function (s, x) { return s + (x - mu) * (x - mu); }, 0) / rerata.length);
    Object.keys(raterStat).forEach(function (r) { if (raterStat[r] > mu + sd) flagRater[r] = (flagRater[r] ? flagRater[r] + ", " : "") + "LENIENCY"; });
  }
  var kamus = {}; tnaBaca(ss, "Kamus").forEach(function (k) { kamus[k.KodeKompetensi] = k; });
  var matriks = {}; tnaBaca(ss, "Matriks").forEach(function (m) { (matriks[m.KodeJabatan] = matriks[m.KodeJabatan] || []).push(m); });

  var gapRows = [];
  Object.keys(km).forEach(function (nik) {
    var k = km[nik];
    (matriks[k.KodeJabatan] || []).forEach(function (m) {
      var key = nik + "|" + m.KodeKompetensi, flags = [];
      var la = k.ModeAsesmen === "KELOMPOK" ? ((kel[k.KelompokID] || {})[m.KodeKompetensi] || []) : (atas[key] || []);
      var sA = la.length ? la.reduce(function (s, x) { return s + x; }, 0) / la.length : null;
      var sS = k.ModeAsesmen === "KELOMPOK" ? null : (self[key] === undefined ? null : self[key]);
      if (k.Penilai2NIK && la.length === 1) flags.push("RATER TUNGGAL");
      if (sA !== null && sS !== null && Math.abs(sA - sS) >= 2) flags.push("KALIBRASI");
      var fr = flagRater[k.PenilaiNIK]; if (fr) flags.push(fr);
      var req = Number(m.RequiredLevel), bobot = Number(m.Bobot || 2);
      var actual = "", gap = "", prio = "", kat;
      if (sA === null) { kat = "BELUM DINILAI"; }
      else {
        actual = sS === null ? sA : bA * sA + bS * sS;
        actual = tnaR2(actual);
        gap = tnaR2(Math.max(0, req - actual));
        prio = tnaR2(gap * bobot);
        kat = gap === 0 ? "Kompeten" : (gap < 1 ? "Minor" : (gap < 2 ? "Moderate" : "Major"));
      }
      var kk = kamus[m.KodeKompetensi] || {};
      gapRows.push({ Periode: p.Periode, NIK: nik, Nama: k.Nama, Cabang: k.Cabang, Dept: k.Dept, KodeJabatan: k.KodeJabatan, JobTitle: k.JobTitle,
        KodeKompetensi: m.KodeKompetensi, Kompetensi: kk.Nama || m.KodeKompetensi, Kategori: kk.Kategori || "", Required: req, Bobot: bobot,
        SkorAtasan: sA === null ? "" : tnaR2(sA), SkorSelf: sS === null ? "" : sS, Actual: actual, Gap: gap, Prioritas: prio, KategoriGap: kat,
        Flag: flags.join(", ") });
    });
  });
  return gapRows;
}

/* ============================================================
 * REKOMENDASI PER ORANG (dipakai live setelah submit dan saat generate output)
 * ============================================================ */
function tnaSiapRekom(ss, p, km, gapRows) {
  var cx = { km: km, p: p };
  cx.katalog = tnaBaca(ss, "Katalog").filter(function (c) { return String(c.Status).toUpperCase() !== "NONAKTIF"; });
  cx.katByKode = {}; cx.katalog.forEach(function (c) { cx.katByKode[c.KodeTraining] = c; });
  cx.intervensi = {}; tnaBaca(ss, "Intervensi").forEach(function (i) { ((cx.intervensi[i.KodeKompetensi] = cx.intervensi[i.KodeKompetensi] || {})[String(i.Tipe)] = i.Deskripsi); });
  cx.taskMap = {}; tnaBaca(ss, "Task").forEach(function (t) { var key = t.KodeJabatan + "|" + t.KodeKompetensi; (cx.taskMap[key] = cx.taskMap[key] || []).push(t.Task); });
  cx.lulus = {}; tnaBaca(ss, "Riwayat").forEach(function (r) { cx.lulus[String(r.NIK) + "|" + r.KodeTraining] = true; });
  // Indeks calon mentor per kompetensi: actual tinggi
  cx.mentor = {};
  gapRows.forEach(function (g) { if (g.Actual !== "" && Number(g.Actual) >= 4) (cx.mentor[g.KodeKompetensi] = cx.mentor[g.KodeKompetensi] || []).push(g); });
  cx.maksD = Number(p.MaksDianjurkan);
  cx.katDianjurkan = String(p.KategoriDianjurkan || "Technical,Behavioral,Leadership").split(/[,;]\s*/);
  return cx;
}

// Opsi training katalog untuk satu gap (urut LevelTarget terendah yang masih di atas level sekarang).
function tnaOpsiTraining(cx, nik, g) {
  var lvlNow = Math.floor(Number(g.Actual));
  return cx.katalog.filter(function (c) {
    return String(c.Kategori) !== "Pengayaan" && String(c.KodeKompetensi).split(/[,;]\s*/).indexOf(g.KodeKompetensi) !== -1 &&
      Number(c.LevelTarget || 5) > lvlNow && !cx.lulus[nik + "|" + c.KodeTraining];
  }).sort(function (a, b) { return Number(a.LevelTarget) - Number(b.LevelTarget); });
}

// gapList: baris Gap orang ini yang Gap > 0. edit: {KodeKompetensi: {r70, r20, r10}} dari validator,
// r10 = KodeTraining pilihan validator atau "TANPA". Hasil: baris Rekomendasi + training Dianjurkan.
function tnaRekomOrang(cx, nik, gapList, edit) {
  edit = edit || {};
  var k = cx.km[nik] || {}, rekom = [], dianjurkan = [], nD = 0, sudah = {};
  gapList.slice().sort(function (a, b) { return Number(b.Prioritas) - Number(a.Prioritas); }).forEach(function (g) {
    var e = edit[g.KodeKompetensi] || {};
    var tasks = cx.taskMap[g.KodeJabatan + "|" + g.KodeKompetensi] || [];
    var r70 = tasks.length ? "Penugasan terstruktur 3 bulan pada tugas: " + tasks.slice(0, 2).join("; ") + ", dipantau atasan." :
      ((cx.intervensi[g.KodeKompetensi] || {})["70"] || "Penugasan terstruktur pada tugas yang memakai kompetensi ini, dipantau atasan.");
    var cand = (cx.mentor[g.KodeKompetensi] || []).filter(function (m) { return m.NIK !== nik && Number(m.Actual) >= Math.min(5, Number(g.Required) + 1); })
      .sort(function (a, b) { return (a.Cabang === g.Cabang ? 0 : 1) - (b.Cabang === g.Cabang ? 0 : 1) || Number(b.Actual) - Number(a.Actual); });
    var r20 = "Coaching bulanan oleh " + ((cx.km[k.PenilaiNIK] || {}).Nama || "atasan langsung") +
      (cand.length ? "; mentoring/shadowing: " + cand.slice(0, 2).map(function (m) { return m.Nama + " (" + m.Cabang + ")"; }).join(", ") : "") +
      ((cx.intervensi[g.KodeKompetensi] || {})["20"] ? "; " + cx.intervensi[g.KodeKompetensi]["20"] : "");
    var r10, kodeR10 = "";
    if (e.r10 === "TANPA") r10 = "Tidak dijadwalkan training formal (keputusan validator).";
    else if (e.r10 && cx.katByKode[e.r10]) {
      kodeR10 = e.r10; r10 = e.r10 + " " + cx.katByKode[e.r10].Judul + " (dipilih validator)";
    } else if (cx.katDianjurkan.indexOf(String(g.Kategori)) === -1) {
      r10 = "Tidak dijadwalkan training formal (fokus 2027: " + cx.katDianjurkan.join(" & ") + "); dikembangkan lewat 70/20 dan program wajib.";
    } else {
      var opsi = tnaOpsiTraining(cx, nik, g);
      if (!opsi.length) r10 = "GAP KATALOG: belum ada modul untuk kompetensi ini";
      else if (nD >= cx.maksD) r10 = opsi[0].KodeTraining + " " + opsi[0].Judul + " (ditunda: melewati batas " + cx.maksD + " training/tahun)";
      else { kodeR10 = opsi[0].KodeTraining; r10 = opsi[0].KodeTraining + " " + opsi[0].Judul; }
    }
    if (kodeR10 && !sudah[kodeR10]) {
      sudah[kodeR10] = true; dianjurkan.push({ kode: kodeR10, kompetensi: g.KodeKompetensi, prioritas: Number(g.Prioritas) });
      if (!e.r10) nD++;
    }
    var diubah = [];
    if (e.r70) { r70 = String(e.r70); diubah.push("70"); }
    if (e.r20) { r20 = String(e.r20); diubah.push("20"); }
    if (e.r10) diubah.push("10");
    rekom.push({ NIK: nik, Nama: g.Nama, KodeKompetensi: g.KodeKompetensi, Kompetensi: g.Kompetensi, Gap: g.Gap, Prioritas: g.Prioritas,
      R70_Penugasan: r70, R20_Sosial: r20, R10_Training: r10, DiubahValidator: diubah.join(",") });
  });
  return { rekom: rekom, dianjurkan: dianjurkan };
}

/* ============================================================
 * VALIDASI HEAD UNIT
 * Penilai submit -> gap & rekomendasi langsung terlihat -> Head unit (ValidatorNIK) menyetujui,
 * mengedit rekomendasi, atau mengembalikan ke penilai. Satu baris TNA_Validasi per target
 * (NIK, atau K:<KelompokID> untuk penilaian kelompok sales).
 * ============================================================ */
function tnaKunciValidasi(k) { return !k ? "" : (k.ModeAsesmen === "KELOMPOK" ? "K:" + k.KelompokID : String(k.NIK)); }
function tnaParseEdit(x) { try { return x ? JSON.parse(String(x)) : {}; } catch (e) { return {}; } }
function tnaPetaValidasi(ss, p) {
  var m = {};
  tnaBaca(ss, "Validasi").forEach(function (v) { if (v.Periode === p.Periode) m[String(v.Target)] = v; });
  return m;
}
function tnaWakilTarget(km, kunci) {
  if (kunci.indexOf("K:") !== 0) return km[kunci] || null;
  var id = kunci.substring(2), hit = null;
  Object.keys(km).some(function (n) { if (km[n].KelompokID === id) { hit = km[n]; return true; } return false; });
  return hit;
}
// Upsert satu baris validasi. ubah: field yang diganti (Status, Catatan, Edit, ...).
function tnaSimpanValidasi(ss, p, km, kunci, ubah, olehNik) {
  var w = tnaWakilTarget(km, kunci); if (!w) return;
  var sh = tnaSheet(ss, "Validasi"), h = TNA_TAB.Validasi;
  var v = sh.getDataRange().getValues(), baris = -1;
  for (var i = 1; i < v.length; i++) if (v[i][0] === p.Periode && String(v[i][1]) === kunci) { baris = i; break; }
  var o = {};
  if (baris > 0) h.forEach(function (c, j) { o[c] = v[baris][j]; });
  else o = { Periode: p.Periode, Target: kunci, Jenis: kunci.indexOf("K:") === 0 ? "KELOMPOK" : "INDIVIDU", Catatan: "", Edit: "" };
  o.Nama = kunci.indexOf("K:") === 0 ? w.Jabatan + " " + w.Cabang : w.Nama;
  o.Jabatan = w.Jabatan; o.Cabang = w.Cabang; o.PenilaiNIK = w.PenilaiNIK; o.ValidatorNIK = String(w.ValidatorNIK || "");
  Object.keys(ubah).forEach(function (c) { o[c] = ubah[c]; });
  if (ubah.Status === "MENUNGGU_VALIDASI") o.Ringkasan = tnaRingkasHasil(ss, p, w);
  o.DiperbaruiOleh = olehNik; o.Timestamp = new Date();
  var row = h.map(function (c) { return o[c] === undefined || o[c] === null ? "" : o[c]; });
  if (baris > 0) sh.getRange(baris + 1, 1, 1, h.length).setValues([row]);
  else sh.getRange(sh.getLastRow() + 1, 1, 1, h.length).setValues([row]);
}
// Ringkasan untuk daftar validasi: jumlah gap per kategori + flag validitas (KALIBRASI, LENIENCY, dst).
function tnaRingkasHasil(ss, p, w) {
  var sub = {}; sub[w.NIK] = w;
  var g = tnaHitungGap(ss, p, sub), r = { major: 0, moderate: 0, minor: 0, kompeten: 0, flag: 0 };
  g.forEach(function (x) {
    var k = String(x.KategoriGap).toLowerCase(); if (r[k] !== undefined) r[k]++;
    if (x.Flag) r.flag++;
  });
  return JSON.stringify(r);
}
function tnaAdalahValidator(nik, daftar) { return String(daftar || "").split(/[,;]\s*/).indexOf(String(nik)) !== -1; }
function tnaBolehValidasi(auth, w) { return auth.role === "admin" || (!!w && tnaAdalahValidator(auth.nik, w.ValidatorNIK)); }

// Hasil live satu target: gap + rekomendasi 70/20/10 + training wajib + status validasi.
function tnaHasil(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  var p = tnaParam(ss), km = tnaPetaKaryawan(ss);
  var kunci = req.kelompokId ? "K:" + req.kelompokId : String(req.target || "");
  var w = tnaWakilTarget(km, kunci);
  if (!w) return { ok: false, error: "Karyawan/kelompok tidak ditemukan di TNA 2027." };
  var val = tnaPetaValidasi(ss, p)[kunci] || null;
  var peran = req.kelompokId ? (w.PenilaiNIK === auth.nik ? "ATASAN" : null) : tnaPeranTerhadap(auth, km, w);
  var validator = tnaBolehValidasi(auth, w);
  // Karyawan yang dinilai tidak melihat gap/rekomendasi; yang ia lihat hanya ITP & kalender training (tnaITPSaya).
  var bolehLihat = validator || peran === "ATASAN" || peran === "ATASAN2" || peran === "ADMIN";
  if (!bolehLihat) return { ok: false, error: peran === "SELF" ? "Yang dapat Anda lihat adalah ITP & kalender training, setelah output TNA terbit." : "Anda tidak berwenang melihat hasil ini." };
  var gapAll = tnaHitungGap(ss, p, km);
  var gapT = gapAll.filter(function (g) { return g.NIK === w.NIK; });
  var cx = tnaSiapRekom(ss, p, km, gapAll);
  var edit = tnaParseEdit(val && val.Edit);
  var hasil = tnaRekomOrang(cx, w.NIK, gapT.filter(function (g) { return Number(g.Gap) > 0; }), edit);
  var opsi = {};
  gapT.forEach(function (g) {
    if (Number(g.Gap) > 0) opsi[g.KodeKompetensi] = tnaOpsiTraining(cx, w.NIK, g).map(function (c) { return { kode: c.KodeTraining, judul: c.Judul, level: c.LevelTarget, jam: c.DurasiJam }; });
  });
  var wajib = [];
  tnaBaca(ss, "Mandatory").forEach(function (m) {
    if (m.KodeJabatan !== "*" && m.KodeJabatan !== w.KodeJabatan && m.KodeJabatan !== "NIK:" + w.NIK) return;
    var c = cx.katByKode[m.KodeTraining];
    if (c && !cx.lulus[w.NIK + "|" + m.KodeTraining]) wajib.push({ kode: c.KodeTraining, judul: c.Judul, jam: c.DurasiJam, dasar: m.Dasar });
  });
  var dinilai = gapT.some(function (g) { return g.SkorAtasan !== ""; });
  return {
    ok: true, kunci: kunci, nama: req.kelompokId ? w.Jabatan + " di " + w.Cabang : w.Nama, jabatan: w.Jabatan, cabang: w.Cabang,
    kelompok: !!req.kelompokId, dinilai: dinilai, gap: gapT, rekomendasi: hasil.rekom,
    dianjurkan: hasil.dianjurkan.map(function (d) { var c = cx.katByKode[d.kode] || {}; return { kode: d.kode, judul: c.Judul, jam: c.DurasiJam, kompetensi: d.kompetensi }; }),
    wajib: wajib, opsiTraining: opsi, edit: edit, window: tnaWindow(p).status,
    validasi: val ? { status: val.Status, catatan: val.Catatan, oleh: (km[String(val.DiperbaruiOleh)] || {}).Nama || String(val.DiperbaruiOleh || ""), waktu: val.Timestamp } : null,
    validatorNama: (function () {
      var semua = tnaPetaKaryawan(ss, true);
      var n = String(w.ValidatorNIK || "").split(/[,;]\s*/).map(function (x) { return (semua[x] || {}).Nama; }).filter(Boolean);
      return n.length ? n.join(" / ") : (String(w.ValidatorNIK || "") ? "Head unit" : "L&D (Admin)");
    })(),
    bukti: tnaBuktiPenilai(ss, p, km, w, !!req.kelompokId),
    bisaValidasi: validator && dinilai
  };
}

// Centangan perilaku per penilai (FINAL) untuk ditinjau validator: {KodeKompetensi: [{rater, peran, checks, level, na, alasan}]}
function tnaBuktiPenilai(ss, p, km, w, kelompok) {
  var semua = tnaPetaKaryawan(ss, true), out = {};
  tnaBaca(ss, "Asesmen").forEach(function (a) {
    if (a.Periode !== p.Periode || a.Status !== "FINAL") return;
    if (kelompok ? a.KelompokID !== w.KelompokID : (String(a.NIK) !== w.NIK || a.KelompokID)) return;
    (out[a.KodeKompetensi] = out[a.KodeKompetensi] || []).push({
      rater: (semua[String(a.RaterNIK)] || {}).Nama || String(a.RaterNIK), peran: a.Rater, checks: tnaNormalChecks(a.Checks),
      level: a.Level, na: a.NA === true || String(a.NA).toUpperCase() === "TRUE", alasan: String(a.Alasan || "") });
  });
  var cek = {}; tnaBaca(ss, "Checklist").forEach(function (c) { cek[c.KodeKompetensi] = [c.C2, c.C3, c.C4, c.C5].map(String); });
  Object.keys(out).forEach(function (k) { out[k] = { penilai: out[k], checklist: cek[k] || [] }; });
  return out;
}

function tnaValidasi(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  var p = tnaParam(ss), km = tnaPetaKaryawan(ss);
  var kunci = req.kelompokId ? "K:" + req.kelompokId : String(req.target || "");
  var w = tnaWakilTarget(km, kunci);
  if (!w) return { ok: false, error: "Karyawan/kelompok tidak ditemukan di TNA 2027." };
  if (!tnaBolehValidasi(auth, w)) return { ok: false, error: "Hanya Head unit (validator) yang dapat memvalidasi hasil ini." };
  var aksi = String(req.aksi || "").toUpperCase(), catatan = String(req.catatan || "").trim();
  if (["SETUJUI", "KEMBALIKAN"].indexOf(aksi) === -1) return { ok: false, error: "Aksi validasi tidak dikenal." };
  if (aksi === "KEMBALIKAN" && !catatan) return { ok: false, error: "Tulis catatan untuk penilai: bagian mana yang perlu direvisi." };
  if (aksi === "KEMBALIKAN" && tnaWindow(p).status !== "DIBUKA") return { ok: false, error: "Window asesmen sudah ditutup, penilai tidak bisa merevisi. Silakan edit rekomendasi lalu Setujui, atau hubungi L&D." };
  var lock = LockService.getScriptLock();
  waitLockDenganRetry(lock, 15000, 3);
  var n = 0;
  try {
    var ada = tnaPetaValidasi(ss, p)[kunci];
    if (!ada) return { ok: false, error: "Belum ada penilaian atasan untuk divalidasi." };
    if (aksi === "KEMBALIKAN") {
      var sh = tnaSheet(ss, "Asesmen"), v = sh.getDataRange().getValues(), h = v[0];
      var cSt = h.indexOf("Status"), cR = h.indexOf("Rater"), cK = h.indexOf("KelompokID");
      for (var i = 1; i < v.length; i++) {
        var kena = v[i][0] === p.Periode && v[i][cSt] === "FINAL" && (v[i][cR] === "ATASAN" || v[i][cR] === "ATASAN2") &&
          (req.kelompokId ? v[i][cK] === req.kelompokId : String(v[i][1]) === w.NIK);
        if (kena) { v[i][cSt] = "DIKEMBALIKAN"; n++; }
      }
      if (n) sh.getRange(1, 1, v.length, h.length).setValues(v);
      tnaSimpanValidasi(ss, p, km, kunci, { Status: "DIKEMBALIKAN", Catatan: catatan, Edit: "" }, auth.nik);
    } else {
      var edit = {};
      Object.keys(req.edit || {}).forEach(function (kk) {
        var e = req.edit[kk] || {}, o = {};
        ["r70", "r20", "r10"].forEach(function (f) { if (e[f] && String(e[f]).trim()) o[f] = String(e[f]).trim().substring(0, 500); });
        if (Object.keys(o).length) edit[kk] = o;
      });
      tnaSimpanValidasi(ss, p, km, kunci, { Status: "DISETUJUI", Catatan: catatan, Edit: Object.keys(edit).length ? JSON.stringify(edit) : "" }, auth.nik);
    }
  } finally { lock.releaseLock(); }
  tnaLog(ss, auth.nik, "validasi" + aksi, kunci + (n ? " " + n + " baris asesmen dikembalikan" : ""));
  return { ok: true, status: aksi === "SETUJUI" ? "DISETUJUI" : "DIKEMBALIKAN" };
}

// Setujui banyak hasil sekaligus (tanpa edit). Hanya baris MENUNGGU_VALIDASI milik validator ini.
function tnaValidasiMassal(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  var p = tnaParam(ss), km = tnaPetaKaryawan(ss);
  var minta = {}; (req.targets || []).forEach(function (t) { minta[String(t)] = true; });
  var lock = LockService.getScriptLock();
  waitLockDenganRetry(lock, 15000, 3);
  var n = 0, lewat = 0;
  try {
    var sh = tnaSheet(ss, "Validasi"), h = TNA_TAB.Validasi, v = sh.getDataRange().getValues();
    var cT = h.indexOf("Target"), cS = h.indexOf("Status"), cO = h.indexOf("DiperbaruiOleh"), cW = h.indexOf("Timestamp"), cC = h.indexOf("Catatan");
    for (var i = 1; i < v.length; i++) {
      var key = String(v[i][cT]);
      if (v[i][0] !== p.Periode || !minta[key]) continue;
      var w = tnaWakilTarget(km, key);
      if (!tnaBolehValidasi(auth, w) || v[i][cS] !== "MENUNGGU_VALIDASI") { lewat++; continue; }
      v[i][cS] = "DISETUJUI"; v[i][cO] = auth.nik; v[i][cW] = new Date(); v[i][cC] = String(req.catatan || "Disetujui massal");
      n++;
    }
    if (n) sh.getRange(1, 1, v.length, h.length).setValues(v);
  } finally { lock.releaseLock(); }
  tnaLog(ss, auth.nik, "validasiMassal", n + " disetujui, " + lewat + " dilewati");
  return { ok: true, disetujui: n, dilewati: lewat };
}

function tnaBangunOutput(ss) {
  var t0 = new Date();
  var p = tnaParam(ss), km = tnaPetaKaryawan(ss);
  var gapRows = tnaHitungGap(ss, p, km);

  var cx = tnaSiapRekom(ss, p, km, gapRows);
  var katalog = cx.katalog, katByKode = cx.katByKode, lulus = cx.lulus, maksD = cx.maksD;
  var durDefault = Number(p.DurasiDefaultJam);
  function jamTraining(c) { var d = Number(c && c.DurasiJam); return d > 0 ? d : durDefault; }
  var mandatory = tnaBaca(ss, "Mandatory");
  var val = tnaPetaValidasi(ss, p);
  function statusValidasi(k) {
    var v = val[tnaKunciValidasi(k)];
    if (!v) return "BELUM DINILAI";
    return v.Status === "DISETUJUI" ? "DISETUJUI" : (v.Status === "DIKEMBALIKAN" ? "DIKEMBALIKAN (belum direvisi)" : "BELUM VALIDASI");
  }

  // ---------- Rekomendasi 70/20/10 + daftar training per orang ----------
  var rekom = [], perOrang = {};
  function tambahTraining(nik, kode, kategori, kompetensi, prioritas) {
    var o = perOrang[nik] = perOrang[nik] || { list: [], ada: {} };
    if (o.ada[kode]) return;
    o.ada[kode] = true; o.list.push({ kode: kode, kategori: kategori, kompetensi: kompetensi, prioritas: prioritas || 0 });
  }
  Object.keys(km).forEach(function (nik) {
    var k = km[nik];
    mandatory.forEach(function (m) {
      if (m.KodeJabatan !== "*" && m.KodeJabatan !== k.KodeJabatan && m.KodeJabatan !== "NIK:" + nik) return;
      if (katByKode[m.KodeTraining] && !lulus[nik + "|" + m.KodeTraining]) tambahTraining(nik, m.KodeTraining, "Wajib", "", 99);
    });
  });
  var gapPerOrang = {};
  gapRows.forEach(function (g) {
    g.StatusValidasi = statusValidasi(km[g.NIK]);
    if (Number(g.Gap) > 0) (gapPerOrang[g.NIK] = gapPerOrang[g.NIK] || []).push(g);
  });
  Object.keys(gapPerOrang).forEach(function (nik) {
    var v = val[tnaKunciValidasi(km[nik])] || {};
    var hasil = tnaRekomOrang(cx, nik, gapPerOrang[nik], tnaParseEdit(v.Edit));
    hasil.rekom.forEach(function (r) { r.StatusValidasi = statusValidasi(km[nik]); rekom.push(r); });
    hasil.dianjurkan.forEach(function (d) { tambahTraining(nik, d.kode, "Dianjurkan", d.kompetensi, d.prioritas); });
  });

  // ---------- Penjadwalan bulan (Wajib di depan, beban jam per orang dirata-ratakan) ----------
  var target = Number(p.TargetJamBulan), jamCoach = Number(p.JamCoachingPerGap);
  var pengayaan = katalog.filter(function (c) { return String(c.Kategori) === "Pengayaan"; });
  var orgLoad = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var itp = [], beban = {};
  function jendela(kategori, kode) {
    if (kategori === "Wajib") return /^W-(AFA|AIDW)$/.test(kode) ? [0, 1, 2] : [0, 1, 2, 3, 4, 5];
    if (kategori === "Dianjurkan") return [2, 3, 4, 5, 6, 7, 8, 9, 10];
    return [3, 4, 5, 6, 7, 8, 9, 10];
  }
  function pilihBulan(nik, win, jam) {
    var b = beban[nik];
    var best = win[0], skor = Infinity;
    win.forEach(function (m) { var s = b[m] * 1000 + orgLoad[m]; if (s < skor) { skor = s; best = m; } });
    b[best] += jam; orgLoad[best] += jam; return best;
  }
  Object.keys(km).forEach(function (nik) {
    var k = km[nik]; beban[nik] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    // coaching terstruktur dihitung sebagai jam belajar, disebar rata Mar-Nov
    var nGap = (gapPerOrang[nik] || []).length;
    if (nGap && jamCoach > 0) { var tot = nGap * jamCoach; for (var m = 2; m <= 10; m++) beban[nik][m] += tot / 9; }
    var list = (perOrang[nik] || { list: [] }).list.sort(function (a, b) {
      var urut = { Wajib: 0, Dianjurkan: 1, Pengayaan: 2 }; return urut[a.kategori] - urut[b.kategori] || b.prioritas - a.prioritas;
    });
    list.forEach(function (x) {
      var c = katByKode[x.kode], jam = jamTraining(c);
      var bln = pilihBulan(nik, jendela(x.kategori, x.kode), jam);
      itp.push({ NIK: nik, Nama: k.Nama, Cabang: k.Cabang, Wilayah: k.Wilayah, KodeJabatan: k.KodeJabatan, JobTitle: k.JobTitle, KodeTraining: x.kode,
        Judul: c.Judul, Kategori: x.kategori, KodeKompetensi: x.kompetensi, Bulan: bln, BatchID: "", Jam: jam, Status: "PLANNED", StatusValidasi: statusValidasi(k) });
    });
    // Pengayaan: isi kekurangan jam sampai target tahunan, status OPSIONAL
    var total = beban[nik].reduce(function (s, x) { return s + x; }, 0);
    var sudah = (perOrang[nik] || { ada: {} }).ada;
    for (var e = 0; e < pengayaan.length && total < target * 12; e++) {
      var c2 = pengayaan[e]; if (sudah[c2.KodeTraining]) continue;
      var jam2 = jamTraining(c2), bln2 = pilihBulan(nik, jendela("Pengayaan", c2.KodeTraining), jam2);
      itp.push({ NIK: nik, Nama: k.Nama, Cabang: k.Cabang, Wilayah: k.Wilayah, KodeJabatan: k.KodeJabatan, JobTitle: k.JobTitle, KodeTraining: c2.KodeTraining,
        Judul: c2.Judul, Kategori: "Pengayaan", KodeKompetensi: c2.KodeKompetensi, Bulan: bln2, BatchID: "", Jam: jam2, Status: "OPSIONAL", StatusValidasi: statusValidasi(k) });
      total += jam2;
    }
  });

  // ---------- Batch & kalender ----------
  var kap = Number(p.KapasitasKelas), tahun = Number(p.TahunITP);
  // Konsolidasi kelas tatap muka: peserta satu training di satu cabang dikumpulkan ke sesedikit mungkin
  // bulan (ceil(n / kapasitas)) di dalam jendela kategorinya, supaya kalender tidak pecah jadi kelas kecil.
  var kelas = {};
  itp.forEach(function (r, idx) {
    var c = katByKode[r.KodeTraining] || {};
    if (/e-?learning|online|daring/i.test(String(c.Metode || ""))) return;
    var kk = r.KodeTraining + "|" + r.Cabang; (kelas[kk] = kelas[kk] || []).push(idx);
  });
  Object.keys(kelas).forEach(function (kk) {
    var idxs = kelas[kk];
    var adaWajib = idxs.some(function (i) { return itp[i].Kategori === "Wajib"; });
    var win = jendela(adaWajib ? "Wajib" : itp[idxs[0]].Kategori, itp[idxs[0]].KodeTraining);
    var hit = {}; idxs.forEach(function (i) { hit[itp[i].Bulan] = (hit[itp[i].Bulan] || 0) + 1; });
    var bulan = win.slice().sort(function (a, b) { return (hit[b] || 0) - (hit[a] || 0) || orgLoad[a] - orgLoad[b] || a - b; })
      .slice(0, Math.ceil(idxs.length / kap));
    var isi = {}; bulan.forEach(function (m) { isi[m] = 0; });
    var sisa = [];
    idxs.forEach(function (i) { var m = itp[i].Bulan; if (isi[m] !== undefined && isi[m] < kap) isi[m]++; else sisa.push(i); });
    sisa.forEach(function (i) {
      var m = bulan.filter(function (x) { return isi[x] < kap; }).sort(function (a, b) { return isi[a] - isi[b]; })[0];
      isi[m]++; itp[i].Bulan = m;
    });
  });
  var grup = {};
  itp.forEach(function (r, idx) {
    var c = katByKode[r.KodeTraining] || {};
    var online = /e-?learning|online|daring/i.test(String(c.Metode || ""));
    var key = r.KodeTraining + "|" + r.Bulan + "|" + (online ? "ONLINE" : r.Cabang);
    (grup[key] = grup[key] || []).push(idx);
  });
  var batchRows = [], perBulanBatch = {};
  Object.keys(grup).sort().forEach(function (key) {
    var parts = key.split("|"), kode = parts[0], bln = Number(parts[1]), wil = parts[2];
    var c = katByKode[kode] || {}, idxs = grup[key];
    var cap = wil === "ONLINE" ? 1000 : kap;
    for (var s = 0; s < idxs.length; s += cap) {
      var anggota = idxs.slice(s, s + cap);
      perBulanBatch[bln] = (perBulanBatch[bln] || 0) + 1;
      var minggu = ((perBulanBatch[bln] - 1) % 4) + 1;
      var tgl = new Date(tahun, bln, 1); while (tgl.getDay() !== 2) tgl.setDate(tgl.getDate() + 1); // Selasa pertama
      tgl.setDate(tgl.getDate() + (minggu - 1) * 7);
      var id = "B" + tahun + "-" + ("0" + (bln + 1)).slice(-2) + "-" + kode + "-" + wil.replace(/[^A-Z0-9]/gi, "").substring(0, 12) + "-" + (Math.floor(s / cap) + 1);
      var jam = jamTraining(c);
      anggota.forEach(function (i) { itp[i].BatchID = id; });
      var kat = itp[anggota[0]].Kategori;
      batchRows.push({ BatchID: id, KodeTraining: kode, Judul: c.Judul || kode, Kategori: kat, Metode: c.Metode || "", Bulan: TNA_BULAN[bln], Minggu: minggu,
        TanggalMulai: tgl, Lokasi: wil, JmlPeserta: anggota.length, DurasiJam: jam, TotalJam: jam * anggota.length });
    }
  });
  itp.forEach(function (r) { r.Bulan = TNA_BULAN[r.Bulan]; });

  // ---------- Proyeksi jam & readiness ----------
  var kT = Number(p.KoefTraining), kC = Number(p.KoefCoaching), kP = Number(p.KoefPenugasan);
  var dianjurkanPer = {}; itp.forEach(function (r) { if (r.Kategori === "Dianjurkan") dianjurkanPer[r.NIK + "|" + r.KodeKompetensi] = true; });
  var ready = {};
  gapRows.forEach(function (g) {
    var o = ready[g.NIK] = ready[g.NIK] || { n: 0, now: 0, proj: 0, dinilai: false };
    o.n++;
    if (g.Actual === "") return;
    o.dinilai = true;
    var a = Number(g.Actual), req = Number(g.Required);
    if (a >= req) { o.now++; o.proj++; return; }
    var naik = kC + kP + (dianjurkanPer[g.NIK + "|" + g.KodeKompetensi] ? kT : 0);
    if (Math.min(a + naik, req + 1) >= req) o.proj++;
  });
  var jamBulan = {};
  itp.forEach(function (r) { if (r.Status === "OPSIONAL") return; var b = jamBulan[r.NIK] = jamBulan[r.NIK] || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; b[TNA_BULAN.indexOf(r.Bulan)] += Number(r.Jam); });
  itp.forEach(function (r) { if (r.Status !== "OPSIONAL") return; var b = jamBulan[r.NIK] = jamBulan[r.NIK] || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; b[TNA_BULAN.indexOf(r.Bulan)] += Number(r.Jam); });
  var proyeksi = Object.keys(km).map(function (nik) {
    var k = km[nik], b = (jamBulan[nik] || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]).slice();
    var nGap = (gapPerOrang[nik] || []).length;
    if (nGap && jamCoach > 0) for (var m = 2; m <= 10; m++) b[m] += nGap * jamCoach / 9;
    var tot = tnaR2(b.reduce(function (s, x) { return s + x; }, 0)), tgt = target * 12;
    var persen = Math.round(tot / tgt * 100);
    var rd = ready[nik] || { n: 0, now: 0, proj: 0, dinilai: false };
    var row = { NIK: nik, Nama: k.Nama, Cabang: k.Cabang, Dept: k.Dept, KodeJabatan: k.KodeJabatan, TotalJam: tot, TargetJam: tgt, PersenTarget: persen,
      StatusJam: persen < 80 ? "UNDER" : (persen > 150 ? "OVER" : "ON TARGET"),
      ReadinessSaatIni: rd.dinilai && rd.n ? Math.round(rd.now / rd.n * 100) : "",
      ReadinessProyeksi: rd.dinilai && rd.n ? Math.round(rd.proj / rd.n * 100) : "" };
    TNA_BULAN.forEach(function (bl, i) { row[bl] = tnaR2(b[i]); });
    return row;
  });

  // ---------- Rekonsiliasi jam (Plan = ITP = Calendar) ----------
  var jamITP = itp.reduce(function (s, r) { return s + Number(r.Jam); }, 0);
  var jamBatch = batchRows.reduce(function (s, r) { return s + Number(r.TotalJam); }, 0);
  var rekon = { jamITP: tnaR2(jamITP), jamCalendar: tnaR2(jamBatch), selisih: tnaR2(jamITP - jamBatch) };

  tnaTulisUlang(ss, "Gap", gapRows);
  tnaTulisUlang(ss, "Rekomendasi", rekom);
  tnaTulisUlang(ss, "ITP", itp);
  tnaTulisUlang(ss, "Batch", batchRows);
  tnaTulisUlang(ss, "Proyeksi", proyeksi);
  tnaSetParamInternal(ss, "Rekonsiliasi", JSON.stringify(rekon));
  return { gap: gapRows.length, rekomendasi: rekom.length, itp: itp.length, batch: batchRows.length, rekon: rekon,
    belumDinilai: gapRows.filter(function (g) { return g.KategoriGap === "BELUM DINILAI"; }).length, detik: Math.round((new Date() - t0) / 1000) };
}

function tnaSetParamInternal(ss, key, value) {
  var sh = tnaSheet(ss, "Parameter");
  var v = sh.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) if (v[i][0] === key) { sh.getRange(i + 1, 2).setValue(value); return; }
  sh.appendRow([key, value, ""]);
}

function tnaGenerateOutputEndpoint(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  if (auth.role !== "admin") return { ok: false, error: "Hanya admin L&D yang dapat generate output." };
  var hasil = tnaBangunOutput(ss);
  if (hasil.rekon.selisih !== 0) return { ok: false, error: "Rekonsiliasi jam gagal (selisih " + hasil.rekon.selisih + "). Output tidak diterbitkan.", hasil: hasil };
  var links = tnaEksporDokumen(ss);
  tnaSetParamInternal(ss, "OutputTerakhir", new Date());
  tnaSetParamInternal(ss, "OutputLinks", JSON.stringify(links));
  tnaLog(ss, auth.nik, "generateOutput", JSON.stringify(hasil));
  return { ok: true, hasil: hasil, links: links };
}

function tnaGetOutput(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  if (auth.role !== "admin") return { ok: false, error: "Hanya admin." };
  var p = tnaParam(ss);
  var links = {}; try { links = JSON.parse(p.OutputLinks || "{}"); } catch (e) { links = {}; }
  var rekon = {}; try { rekon = JSON.parse(p.Rekonsiliasi || "{}"); } catch (e2) { rekon = {}; }
  return { ok: true, terakhir: p.OutputTerakhir, links: links, rekon: rekon, parameter: p };
}

// ITP milik sendiri (karyawan) atau bawahan langsung (atasan) setelah output terbit.
function tnaITPSaya(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  var km = tnaPetaKaryawan(ss);
  var target = String(req.target || auth.nik);
  var t = km[target];
  if (!t) return { ok: false, error: "Karyawan tidak terdaftar." };
  if (target !== auth.nik && t.PenilaiNIK !== auth.nik && t.Penilai2NIK !== auth.nik && !tnaAdalahValidator(auth.nik, t.ValidatorNIK) && auth.role !== "admin") return { ok: false, error: "Tidak berwenang." };
  var batch = {}; tnaBaca(ss, "Batch").forEach(function (b) { batch[b.BatchID] = b; });
  var itp = tnaBaca(ss, "ITP").filter(function (r) { return String(r.NIK) === target; }).map(function (r) {
    var b = batch[r.BatchID] || {};
    return { Bulan: r.Bulan, KodeTraining: r.KodeTraining, Judul: r.Judul, Kategori: r.Kategori, Jam: r.Jam, Status: r.Status,
      BatchID: r.BatchID, TanggalMulai: b.TanggalMulai || "", Lokasi: b.Lokasi || "", Metode: b.Metode || "" };
  });
  // Karyawan sendiri hanya ITP & kalender; gap & rekomendasi untuk penilai, validator, admin.
  if (target === auth.nik && auth.role !== "admin") return { ok: true, nama: t.Nama, jabatan: t.Jabatan, itp: itp, gap: [], rekomendasi: [], hanyaITP: true };
  var gap = tnaBaca(ss, "Gap").filter(function (r) { return String(r.NIK) === target; });
  var rek = tnaBaca(ss, "Rekomendasi").filter(function (r) { return String(r.NIK) === target; });
  return { ok: true, nama: t.Nama, jabatan: t.Jabatan, itp: itp, gap: gap, rekomendasi: rek };
}

/* ============================================================
 * EKSPOR 5 DOKUMEN (Google Sheets baru di Drive pemilik script)
 * ============================================================ */
function tnaEksporDokumen(ss) {
  var p = tnaParam(ss);
  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd-HHmm");
  var links = {};
  function buat(judul, sheets) {
    var doc = SpreadsheetApp.create(judul + " " + stamp);
    var first = true;
    sheets.forEach(function (s) {
      var sh = first ? doc.getSheets()[0] : doc.insertSheet();
      first = false;
      sh.setName(s.nama);
      var data = [s.header].concat(s.rows);
      sh.getRange(1, 1, data.length, s.header.length).setValues(data);
      sh.getRange(1, 1, 1, s.header.length).setFontWeight("bold").setBackground(PALET.navy).setFontColor("#FFFFFF");
      sh.setFrozenRows(1);
      if (s.rows.length) sh.getRange(1, 1, data.length, s.header.length).createFilter();
    });
    return doc.getUrl();
  }
  function tab(nama) { var h = TNA_TAB[nama]; return { header: h, rows: tnaBaca(ss, nama).map(function (o) { return h.map(function (k) { return o[k]; }); }) }; }

  // 1. Gap Competency
  var g = tab("Gap");
  var ringkas = {};
  tnaBaca(ss, "Gap").forEach(function (r) {
    var key = r.Dept + "|" + r.JobTitle + "|" + r.Kompetensi;
    var o = ringkas[key] = ringkas[key] || { dept: r.Dept, job: r.JobTitle, komp: r.Kompetensi, req: r.Required, n: 0, nilai: 0, sumGap: 0, major: 0 };
    o.n++; if (r.Actual !== "") { o.nilai++; o.sumGap += Number(r.Gap); if (r.KategoriGap === "Major") o.major++; }
  });
  var ringkasRows = Object.keys(ringkas).map(function (k) { var o = ringkas[k]; return [o.dept, o.job, o.komp, o.req, o.n, o.nilai, o.nilai ? tnaR2(o.sumGap / o.nilai) : "", o.major]; });
  links.gap = buat("TNA2027 - Gap Competency", [
    { nama: "Detail Gap", header: g.header, rows: g.rows },
    { nama: "Ringkasan Jabatan", header: ["Dept", "JobTitle", "Kompetensi", "Required", "JmlIncumbent", "JmlDinilai", "RataGap", "JmlMajor"], rows: ringkasRows },
    { nama: "Rekomendasi 70-20-10", header: TNA_TAB.Rekomendasi, rows: tab("Rekomendasi").rows }
  ]);

  // 2. Training Matrix: jabatan x training
  var itpAll = tnaBaca(ss, "ITP");
  var jt = {}, kolom = {};
  itpAll.forEach(function (r) {
    var key = r.KodeJabatan + "|" + r.JobTitle; kolom[r.KodeTraining + " " + r.Judul] = true;
    var o = jt[key] = jt[key] || {}; var c = r.KodeTraining + " " + r.Judul;
    var kode = r.Kategori === "Wajib" ? "W" : (r.Kategori === "Dianjurkan" ? "D" : "P");
    o[c] = o[c] || {}; o[c][kode] = (o[c][kode] || 0) + 1;
  });
  var kolList = Object.keys(kolom).sort();
  var tmRows = Object.keys(jt).sort().map(function (key) {
    var parts = key.split("|");
    return [parts[0], parts[1]].concat(kolList.map(function (c) { var o = jt[key][c]; if (!o) return ""; return Object.keys(o).map(function (k) { return k + ":" + o[k]; }).join(" "); }));
  });
  links.matrix = buat("TNA2027 - Training Matrix", [
    { nama: "Jabatan x Training", header: ["KodeJabatan", "JobTitle"].concat(kolList), rows: tmRows },
    { nama: "Orang x Training", header: ["NIK", "Nama", "Cabang", "JobTitle", "KodeTraining", "Judul", "Kategori"],
      rows: itpAll.map(function (r) { return [r.NIK, r.Nama, r.Cabang, r.JobTitle, r.KodeTraining, r.Judul, r.Kategori]; }) }
  ]);

  // 3. Training Plan
  var plan = {};
  itpAll.forEach(function (r) {
    var o = plan[r.KodeTraining] = plan[r.KodeTraining] || { kode: r.KodeTraining, judul: r.Judul, kat: r.Kategori, peserta: 0, jam: 0, bulan: {}, batch: {} };
    o.peserta++; o.jam += Number(r.Jam); o.bulan[r.Bulan] = (o.bulan[r.Bulan] || 0) + 1; o.batch[r.BatchID] = true;
  });
  var planRows = Object.keys(plan).sort().map(function (k) {
    var o = plan[k]; return [o.kode, o.judul, o.kat, o.peserta, Object.keys(o.batch).length, tnaR2(o.jam)].concat(TNA_BULAN.map(function (b) { return o.bulan[b] || ""; }));
  });
  var proy = tab("Proyeksi");
  var bulanOrg = TNA_BULAN.map(function (b) { return tnaR2(tnaBaca(ss, "Proyeksi").reduce(function (s, r) { return s + Number(r[b] || 0); }, 0)); });
  var nOrang = Object.keys(tnaPetaKaryawan(ss)).length;
  links.plan = buat("TNA2027 - Training Plan", [
    { nama: "Rencana per Training", header: ["KodeTraining", "Judul", "Kategori", "JmlPeserta", "JmlBatch", "TotalJam"].concat(TNA_BULAN), rows: planRows },
    { nama: "Proyeksi Jam Organisasi", header: ["Indikator"].concat(TNA_BULAN).concat(["Total"]), rows: [
      ["Total jam belajar"].concat(bulanOrg).concat([tnaR2(bulanOrg.reduce(function (s, x) { return s + x; }, 0))]),
      ["Jam per orang"].concat(bulanOrg.map(function (x) { return tnaR2(x / nOrang); })).concat([tnaR2(bulanOrg.reduce(function (s, x) { return s + x; }, 0) / nOrang)]),
      ["Target per orang"].concat(TNA_BULAN.map(function () { return Number(p.TargetJamBulan); })).concat([Number(p.TargetJamBulan) * 12])
    ] },
    { nama: "Proyeksi per Orang", header: proy.header, rows: proy.rows }
  ]);

  // 4. Training Calendar
  var bt = tab("Batch");
  links.calendar = buat("TNA2027 - Training Calendar", [{ nama: "Kalender Batch", header: bt.header, rows: bt.rows }]);

  // 5. ITP
  links.itp = buat("TNA2027 - Individual Training Plan", [{ nama: "ITP Semua Karyawan", header: TNA_TAB.ITP, rows: tab("ITP").rows }]);
  return links;
}

/* ============================================================
 * SETUP & IMPORT (dijalankan manual dari editor oleh admin)
 * ============================================================ */
function tnaSetup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(TNA_TAB).forEach(function (n) { tnaSheet(ss, n); });
  var sh = tnaSheet(ss, "Parameter");
  if (sh.getLastRow() < 2) sh.getRange(2, 1, TNA_PARAM_DEFAULT.length, 3).setValues(TNA_PARAM_DEFAULT);
  Logger.log("TNA setup selesai: " + Object.keys(TNA_TAB).length + " tab TNA_ siap.");
}

// Import paket data dari Google Sheet "TNA2027_Import" (disiapkan L&D/Claude). Isi tab sumber harus
// memakai header yang sama dengan TNA_TAB. Tab yang tidak ada di file import dilewati.
// Users: NIK baru ditambahkan (PIN acak, wajib ganti PIN), kolom Atasan NIK (G) diisi dari PenilaiNIK
// hanya bila masih kosong. Tidak ada baris Users yang dihapus.
// Jalankan dari editor (tombol Run tidak bisa mengirim argumen): isi ID Google Sheet import di baris berikut.
// ID ada di URL: docs.google.com/spreadsheets/d/<ID>/edit. ID tidak di-commit ke repo.
function tnaImportPaket() {
  var ID_FILE_IMPORT = "ISI_ID_FILE_IMPORT";
  if (ID_FILE_IMPORT === "ISI_ID_FILE_IMPORT") throw new Error("Isi dulu ID_FILE_IMPORT di fungsi tnaImportPaket.");
  return tnaImport(ID_FILE_IMPORT);
}

function tnaImport(fileIdImport) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  tnaSetup();
  var src = SpreadsheetApp.openById(fileIdImport);
  var lapor = [];
  ["Karyawan", "MasterJabatan", "Kamus", "Checklist", "Matriks", "Task", "Intervensi", "Katalog", "Mandatory", "Riwayat"].forEach(function (nama) {
    var s = src.getSheetByName(nama);
    if (!s) { lapor.push(nama + ": dilewati (tidak ada)"); return; }
    var v = s.getDataRange().getValues(), h = v[0].map(String);
    var rows = [];
    for (var i = 1; i < v.length; i++) {
      if (v[i].join("") === "") continue;
      var o = {}; h.forEach(function (k, c) { o[k] = v[i][c]; }); rows.push(o);
    }
    var opsional = { Karyawan: ["ValidatorNIK"] }[nama] || [];
    var hilang = TNA_TAB[nama].filter(function (k) { return h.indexOf(k) === -1 && opsional.indexOf(k) === -1; });
    if (hilang.length) throw new Error("Tab " + nama + " kekurangan kolom: " + hilang.join(", "));
    tnaTulisUlang(ss, nama, rows);
    lapor.push(nama + ": " + rows.length + " baris");
  });
  lapor.push(tnaSinkronUsers(ss));
  Logger.log(lapor.join("\n"));
  return lapor;
}

function tnaSinkronUsers(ss) {
  var km = tnaPetaKaryawan(ss, true);
  var sh = ss.getSheetByName("Users");
  var v = sh.getDataRange().getValues();
  var ada = {}, isiAtasan = 0;
  for (var i = 1; i < v.length; i++) {
    var nik = String(v[i][0]).trim(); ada[nik] = true;
    var k = km[nik];
    if (k && !String(v[i][6] || "").trim() && k.PenilaiNIK) { v[i][6] = k.PenilaiNIK; isiAtasan++; }
  }
  sh.getRange(1, 1, v.length, v[0].length).setValues(v);
  var baru = [];
  Object.keys(km).forEach(function (nik) {
    if (ada[nik]) return;
    var k = km[nik];
    var pin = String(1000 + Math.floor(Math.random() * 9000));
    var row = [nik, pin, k.Nama, k.Cabang, k.Jabatan, "User", k.PenilaiNIK, "", true];
    while (row.length < v[0].length) row.push("");
    baru.push(row.slice(0, v[0].length));
  });
  if (baru.length) sh.getRange(sh.getLastRow() + 1, 1, baru.length, baru[0].length).setValues(baru);
  return "Users: " + isiAtasan + " Atasan NIK diisi, " + baru.length + " user baru (PIN acak, wajib ganti PIN)";
}

// Trigger otomatis: jalankan sekali dari editor untuk menjadwalkan generate output setelah window tutup.
function tnaJadwalkanOutput() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var p = tnaParam(ss);
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === "tnaOutputTerjadwal") ScriptApp.deleteTrigger(t); });
  var waktu = new Date(new Date(p.WindowTutup).getTime() + 5 * 60 * 1000);
  ScriptApp.newTrigger("tnaOutputTerjadwal").timeBased().at(waktu).create();
  Logger.log("Output dijadwalkan pada " + waktu);
}

function tnaOutputTerjadwal() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hasil = tnaBangunOutput(ss);
  if (hasil.rekon.selisih !== 0) { tnaLog(ss, "SYSTEM", "outputGagal", JSON.stringify(hasil)); return; }
  var links = tnaEksporDokumen(ss);
  tnaSetParamInternal(ss, "OutputTerakhir", new Date());
  tnaSetParamInternal(ss, "OutputLinks", JSON.stringify(links));
  tnaLog(ss, "SYSTEM", "outputTerjadwal", JSON.stringify(hasil));
}
