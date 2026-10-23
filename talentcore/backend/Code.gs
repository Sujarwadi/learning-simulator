/**
 * BBM TalentCore — Backend (Google Apps Script)
 *
 * Setup sekali saat pertama pasang:
 * 1. Buat Google Sheet baru, kosong, beri nama "TalentCore DB".
 * 2. Buka Extensions > Apps Script dari Sheet itu, hapus isi default, tempel seluruh file ini.
 * 3. Project Settings > Script Properties, tambah key "CLAUDE_API_KEY" isi API key Anthropic.
 * 4. Jalankan fungsi setupTabTalentCore() sekali lewat menu Run (pilih fungsinya dulu di dropdown atas).
 *    (Kalau sheet sudah ada dari versi sebelumnya, aman dijalankan ulang — cuma nambah sheet "Sessions"
 *    yang belum ada, tidak menghapus data lama.)
 * 5. Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone.
 * 6. Salin URL yang diberikan, tempel ke window.BACKEND_URL di frontend talentcore/index.html.
 * 7. Setiap ubah kode di sini, ULANGI Deploy > Manage deployments > pensil > Version: New version > Deploy,
 *    atau Web App akan tetap pakai kode versi lama.
 *
 * Catatan keamanan (audit 2026-10-08): login sekarang mengeluarkan session token (tabel "Sessions"),
 * dan setiap action selain "login" WAJIB membawa token itu. Server menentukan identitas & role dari
 * token tersimpan, BUKAN dari field nik/role yang dikirim klien — supaya klien tidak bisa mengaku-aku
 * jadi admin atau menilai NIK siapa pun seenaknya. PIN di-hash SHA-256 begitu login pertama kali
 * (baris lama yang masih plaintext otomatis di-upgrade saat user itu login).
 */

var SHEET_USERS = 'Users';
var SHEET_JABATAN = 'Jabatan';
var SHEET_KOMPETENSI = 'Kompetensi';
var SHEET_LEVEL = 'Level';
var SHEET_TASKBREAKDOWN = 'TaskBreakdown';
var SHEET_ASSESSMENT = 'Assessment';
var SHEET_TRAININGMODULE = 'TrainingModule';
var SHEET_SESSIONS = 'Sessions';
var SHEET_PERFORMANCE = 'Performance';
var SHEET_ITP = 'ITP';
var SHEET_KOMPETENSI_WAJIB = 'KompetensiWajib';
var SHEET_LEVEL_WAJIB = 'LevelWajib';

var SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 jam

var LEVEL_HEAD_TECHNICAL = [
  'Sekedar tahu akan pengetahuan dan keterampilan yang diperlukan di pekerjaannya',
  'Memiliki kemampuan yang dimaksud dalam lingkup sederhana/terbatas',
  'Menguasai kemampuan/keterampilan yang dimaksud',
  'Mahir dalam menjalankan kompetensi teknis di bidang pekerjaan yang mengacu pada standar kompetensi',
  'Mampu menginisiasi pengembangan/modifikasi pemanfaatan keterampilan secara lebih luas'
];
var LEVEL_HEAD_MANAGERIAL = [
  'Memahami dan menerapkan kompetensi bagi diri sendiri dalam memimpin tugas dasar',
  'Menerapkan kompetensi secara efektif bagi diri sendiri dan tim kerja langsung',
  'Mengevaluasi kelebihan dan kekurangan serta melakukan penyesuaian untuk kinerja unit kerja yang lebih baik',
  'Mengevaluasi kelebihan dan kekurangan di level departemen/multi-unit serta mendukung tujuan perusahaan',
  'Memastikan implementasi kompetensi menjadi acuan tindakan di semua level yang berdampak pada rencana strategis perusahaan'
];

/* ================= SETUP ================= */

function setupTabTalentCore() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  createTabIfMissing_(ss, SHEET_USERS, ['NIK', 'Nama', 'PIN', 'Role', 'Cabang', 'Jabatan', 'AtasanNIK']);
  createTabIfMissing_(ss, SHEET_JABATAN, ['JabatanID', 'NamaJabatan', 'Tier', 'Divisi', 'Departemen', 'StatusReview', 'DibuatPada']);
  createTabIfMissing_(ss, SHEET_KOMPETENSI, ['KompID', 'JabatanID', 'NamaKompetensi', 'Tipe', 'Definisi', 'SumberTugas', 'LevelTarget', 'StatusReview']);
  createTabIfMissing_(ss, SHEET_LEVEL, ['KompID', 'Level', 'DeskripsiLevel', 'PerilakuKunci']);
  createTabIfMissing_(ss, SHEET_TASKBREAKDOWN, ['JabatanID', 'TugasUtama', 'SubAktivitas', 'SubSubAktivitas']);
  createTabIfMissing_(ss, SHEET_ASSESSMENT, ['AssessmentID', 'NIK', 'JabatanID', 'KompID', 'LevelAktual', 'LevelSelfRating', 'AsesorNIK', 'Siklus', 'Tanggal']);
  createTabIfMissing_(ss, SHEET_TRAININGMODULE, ['NamaKompetensi', 'StatusModul', 'CatatanSumber']);
  createTabIfMissing_(ss, SHEET_SESSIONS, ['Token', 'NIK', 'Role', 'ExpiresAt']);
  createTabIfMissing_(ss, SHEET_PERFORMANCE, ['NIK', 'Periode', 'RatingKinerja', 'Catatan', 'DiinputOleh', 'Tanggal']);
  createTabIfMissing_(ss, SHEET_ITP, ['ItpID', 'NIK', 'KompID', 'NamaKompetensi', 'Tindakan', 'PIC', 'TargetTanggal', 'Status', 'CatatanProgress', 'Siklus', 'DibuatPada']);
  createTabIfMissing_(ss, SHEET_KOMPETENSI_WAJIB, ['KompID', 'Nama', 'Definisi', 'LevelTargetStaff', 'LevelTargetSupervisor', 'LevelTargetManager', 'LevelTargetDivisionHead', 'EfektifMulai']);
  createTabIfMissing_(ss, SHEET_LEVEL_WAJIB, ['KompID', 'Level', 'DeskripsiLevel', 'PerilakuKunci']);
  SpreadsheetApp.getUi().alert('Setup selesai. 12 sheet sudah siap. Jangan lupa jalankan seedKompetensiWajib() sekali.');
}

function createTabIfMissing_(ss, name, headers) {
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
  }
}

/* ================= WEB APP ENTRY ================= */

function doPost(e) {
  var out;
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    var payload = body.payload || {};

    if (action === 'login') {
      return jsonResponse_({ ok: true, data: actionLogin_(payload) });
    }

    var session = requireSession_(payload);
    switch (action) {
      case 'generateMatriks': out = actionGenerateMatriks_(payload, session); break;
      case 'simpanMatrix': out = actionSimpanMatrix_(payload, session); break;
      case 'getJabatanList': out = actionGetJabatanList_(payload, session); break;
      case 'getKompetensiByJabatan': out = actionGetKompetensiByJabatan_(payload, session); break;
      case 'submitAssessment': out = actionSubmitAssessment_(payload, session); break;
      case 'getTrainingMatrix': out = actionGetTrainingMatrix_(payload, session); break;
      case 'careerPath': out = actionCareerPath_(payload, session); break;
      case 'getUsersList': out = actionGetUsersList_(payload, session); break;
      case 'getProfile': out = actionGetProfile_(payload, session); break;
      case 'getBenchStrength': out = actionGetBenchStrength_(payload, session); break;
      case 'savePerformance': out = actionSavePerformance_(payload, session); break;
      case 'getNineBox': out = actionGetNineBox_(payload, session); break;
      case 'getTalentCard': out = actionGetTalentCard_(payload, session); break;
      case 'getItpList': out = actionGetItpList_(payload, session); break;
      case 'updateItp': out = actionUpdateItp_(payload, session); break;
      case 'getItpMonitoring': out = actionGetItpMonitoring_(payload, session); break;
      default: throw new Error('Action tidak dikenal: ' + action);
    }
    return jsonResponse_({ ok: true, data: out });
  } catch (err) {
    return jsonResponse_({ ok: false, error: err.message });
  }
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ================= AUTH & SESSION ================= */

function hashPin_(pin) {
  var raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(pin), Utilities.Charset.UTF_8);
  return raw.map(function (b) {
    var v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}

function actionLogin_(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_USERS);
  var values = sh.getDataRange().getValues();
  var headers = values[0];
  var nikIdx = headers.indexOf('NIK'), pinIdx = headers.indexOf('PIN');

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][nikIdx]) !== String(payload.nik)) continue;
    var stored = String(values[i][pinIdx]);
    var inputHash = hashPin_(payload.pin);
    var isHashed = /^[0-9a-f]{64}$/.test(stored);
    var matched = isHashed ? (stored === inputHash) : (stored === String(payload.pin));
    if (!matched) throw new Error('NIK atau PIN salah.');
    if (!isHashed) sh.getRange(i + 1, pinIdx + 1).setValue(inputHash); // upgrade PIN lama ke hash otomatis

    var obj = {};
    headers.forEach(function (h, idx) { obj[h] = values[i][idx]; });
    var token = createSession_(obj.NIK, obj.Role);
    return { token: token, nik: obj.NIK, nama: obj.Nama, role: obj.Role, cabang: obj.Cabang, jabatan: obj.Jabatan, atasanNik: obj.AtasanNIK };
  }
  throw new Error('NIK atau PIN salah.');
}

function createSession_(nik, role) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_SESSIONS);
  var token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  sh.appendRow([token, nik, role, new Date(Date.now() + SESSION_TTL_MS)]);
  return token;
}

function requireSession_(payload) {
  var token = payload && payload.token;
  if (!token) throw new Error('Sesi tidak valid, silakan login ulang.');
  var rows = sheetRows_(SHEET_SESSIONS);
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].Token) !== String(token)) continue;
    if (new Date(rows[i].ExpiresAt).getTime() < Date.now()) throw new Error('Sesi kedaluwarsa, silakan login ulang.');
    return { nik: rows[i].NIK, role: rows[i].Role };
  }
  throw new Error('Sesi tidak valid, silakan login ulang.');
}

function requireRole_(session, roles) {
  if (roles.indexOf(session.role) === -1) throw new Error('Role Anda tidak punya akses untuk aksi ini.');
}

/* ================= GENERATE MATRIKS (AI) ================= */

function actionGenerateMatriks_(payload, session) {
  requireRole_(session, ['admin', 'ld']);
  var jdText = payload.jdText;
  if (!jdText || jdText.length < 30) throw new Error('Teks JD terlalu pendek atau kosong.');
  var prompt = buildGeneratePrompt_(jdText);
  var aiResult = callClaude_(prompt);
  var parsed = extractJson_(aiResult);
  parsed.levelHeadTechnical = LEVEL_HEAD_TECHNICAL;
  parsed.levelHeadManagerial = LEVEL_HEAD_MANAGERIAL;
  return parsed;
}

function buildGeneratePrompt_(jdText) {
  return [
    'Anda adalah Chief of Organizational Development, ahli job analysis dan competency modeling (Spencer & Spencer, Hierarchical Task Analysis Annett & Duncan).',
    'Dari teks Deskripsi Jabatan (JD) di bawah, lakukan DUA hal secara berurutan:',
    '',
    '1. BREAKDOWN AKTIVITAS: pecah tiap "Tugas Utama" di JD menjadi sub-aktivitas, lalu tiap sub-aktivitas dipecah lagi menjadi sub-sub-aktivitas (tindakan konkret paling kecil). Ini metode Hierarchical Task Analysis.',
    '',
    '2. KOMPETENSI: dari breakdown itu, turunkan kompetensi JENIS TECHNICAL (job-specific/craft, bukan generic office-skill seperti "Microsoft Office") dan, HANYA JIKA JD punya field "Bawahan Langsung" terisi, kompetensi JENIS MANAGERIAL (people-leadership, levelnya disesuaikan jumlah & jenis bawahan). JANGAN generate kompetensi Behavioral sama sekali, itu sudah ada di kamus korporat terpisah.',
    '   Untuk tiap kompetensi, tulis definisi singkat, dan untuk level 1-5 tulis HANYA "perilakuKunci" (1-3 bullet kalimat aktif, spesifik ke kompetensi itu, levelnya makin advanced) — JANGAN tulis ulang deskripsi level generiknya, itu sudah baku dan akan ditempel otomatis oleh sistem.',
    '',
    'Keluarkan HANYA JSON valid dengan skema berikut, tanpa teks lain, tanpa markdown fence:',
    '{',
    '  "jabatan": "nama jabatan dari JD",',
    '  "tier": "staff|supervisor|manager|division_head|lainnya, baca dari konteks jabatan",',
    '  "divisi": "jika tersebutkan, kalau tidak kosongkan",',
    '  "departemen": "jika tersebutkan, kalau tidak kosongkan",',
    '  "taskBreakdown": [',
    '    { "tugasUtama": "...", "subAktivitas": [ { "label": "...", "subSubAktivitas": ["...", "..."] } ] }',
    '  ],',
    '  "kompetensi": [',
    '    {',
    '      "nama": "...", "tipe": "technical|managerial", "definisi": "...",',
    '      "sumberTugas": "rujukan ke tugas utama nomor berapa",',
    '      "levelTarget": 3,',
    '      "levels": [ { "perilakuKunci": ["...", "..."] }, ... 5 entri total untuk level 1 sampai 5 ]',
    '    }',
    '  ]',
    '}',
    '',
    '=== TEKS JD ===',
    jdText
  ].join('\n');
}

function callClaude_(prompt) {
  var apiKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
  if (!apiKey) throw new Error('CLAUDE_API_KEY belum diisi di Script Properties.');
  var resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    payload: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }]
    }),
    muteHttpExceptions: true
  });
  var code = resp.getResponseCode();
  var body = JSON.parse(resp.getContentText());
  if (code !== 200) throw new Error('Claude API error: ' + (body.error ? body.error.message : resp.getContentText()));
  return body.content[0].text;
}

function extractJson_(text) {
  var start = text.indexOf('{');
  var end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('AI tidak mengembalikan JSON yang valid.');
  return JSON.parse(text.substring(start, end + 1));
}

/* ================= SIMPAN MATRIX ================= */
/* Dipanggil setelah admin mengedit hasil generate di layar (lihat index.html) — StatusReview
   ditandai 'reviewed', bukan 'draft', karena pada titik ini manusia sudah meninjau/mengedit
   sebelum menekan Simpan (bukan AI auto-publish). */

function actionSimpanMatrix_(payload, session) {
  requireRole_(session, ['admin', 'ld']);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var jabatanId = slugify_(payload.jabatan);
  var shJabatan = ss.getSheetByName(SHEET_JABATAN);
  var existingRow = findRowByValue_(shJabatan, 'JabatanID', jabatanId);
  if (existingRow && !payload.overwrite) {
    return { needsConfirm: true, message: 'Jabatan "' + payload.jabatan + '" sudah ada. Timpa data lama?' };
  }
  if (existingRow) {
    removeRowsByValue_(ss.getSheetByName(SHEET_KOMPETENSI), 'JabatanID', jabatanId);
    removeRowsByValue_(ss.getSheetByName(SHEET_TASKBREAKDOWN), 'JabatanID', jabatanId);
    shJabatan.deleteRow(existingRow.rowIndex);
  }
  shJabatan.appendRow([jabatanId, payload.jabatan, payload.tier || '', payload.divisi || '', payload.departemen || '', 'reviewed', new Date()]);

  var shKomp = ss.getSheetByName(SHEET_KOMPETENSI);
  var shLevel = ss.getSheetByName(SHEET_LEVEL);
  (payload.kompetensi || []).forEach(function (k, idx) {
    var kompId = jabatanId + '_k' + idx;
    shKomp.appendRow([kompId, jabatanId, k.nama, k.tipe, k.definisi, k.sumberTugas || '', k.levelTarget || 3, 'reviewed']);
    var heads = k.tipe === 'managerial' ? LEVEL_HEAD_MANAGERIAL : LEVEL_HEAD_TECHNICAL;
    (k.levels || []).forEach(function (lv, li) {
      shLevel.appendRow([kompId, li + 1, heads[li], (lv.perilakuKunci || []).join(' | ')]);
    });
  });

  var shTask = ss.getSheetByName(SHEET_TASKBREAKDOWN);
  (payload.taskBreakdown || []).forEach(function (t) {
    (t.subAktivitas || []).forEach(function (sa) {
      var subsub = (sa.subSubAktivitas || []).join(' | ');
      shTask.appendRow([jabatanId, t.tugasUtama, sa.label, subsub]);
    });
  });

  return { jabatan: payload.jabatan, jabatanId: jabatanId, catatan: 'Tersimpan: ' + (payload.kompetensi || []).length + ' kompetensi untuk "' + payload.jabatan + '".' };
}

/* ================= LOOKUP ================= */

function actionGetJabatanList_(payload, session) {
  return sheetRows_(SHEET_JABATAN).map(function (r) { return { jabatanId: r.JabatanID, nama: r.NamaJabatan, tier: r.Tier }; });
}

function actionGetKompetensiByJabatan_(payload, session) {
  var komp = sheetRows_(SHEET_KOMPETENSI).filter(function (r) { return r.JabatanID === payload.jabatanId; });
  var levels = sheetRows_(SHEET_LEVEL);
  var hasil = komp.map(function (k) {
    var lv = levels.filter(function (l) { return l.KompID === k.KompID; })
      .sort(function (a, b) { return a.Level - b.Level; })
      .map(function (l) { return { level: l.Level, deskripsi: l.DeskripsiLevel, perilakuKunci: l.PerilakuKunci.split(' | ') }; });
    return { kompId: k.KompID, nama: k.NamaKompetensi, tipe: k.Tipe, definisi: k.Definisi, levelTarget: k.LevelTarget, levels: lv };
  });
  var jab = sheetRows_(SHEET_JABATAN).filter(function (r) { return r.JabatanID === payload.jabatanId; })[0];
  return hasil.concat(getKompetensiWajibUntukTier_(jab ? jab.Tier : 'staff'));
}

/* ================= KOMPETENSI WAJIB PERUSAHAAN =================
 * Kompetensi yang diwajibkan perusahaan untuk SEMUA jabatan (lintas JD), bukan diturunkan dari
 * Tugas Utama satu jabatan tertentu — jadi tidak lewat pipeline generate-dari-JD, disimpan di
 * sheet terpisah (KompetensiWajib/LevelWajib) dan digabung otomatis ke hasil getKompetensiByJabatan_.
 * Level target berbeda per tier jabatan (staff paling ringan, division_head paling berat).
 * EfektifMulai dibiarkan tampil (bukan disembunyikan) sebelum tanggalnya tiba, supaya organisasi
 * punya waktu bersiap — ditandai aktifSekarang:false ke frontend untuk itu.
 */

function wajibLevelTargetForTier_(w, tier) {
  var col = tier === 'supervisor' ? 'LevelTargetSupervisor'
    : tier === 'manager' ? 'LevelTargetManager'
    : (tier === 'division_head' ? 'LevelTargetDivisionHead' : 'LevelTargetStaff');
  var v = Number(w[col]);
  return v || Number(w.LevelTargetStaff) || 2;
}

function getKompetensiWajibUntukTier_(tier) {
  var wajibRows = sheetRows_(SHEET_KOMPETENSI_WAJIB);
  var levelWajib = sheetRows_(SHEET_LEVEL_WAJIB);
  return wajibRows.map(function (w) {
    var lv = levelWajib.filter(function (l) { return l.KompID === w.KompID; })
      .sort(function (a, b) { return a.Level - b.Level; })
      .map(function (l) { return { level: l.Level, deskripsi: l.DeskripsiLevel, perilakuKunci: l.PerilakuKunci.split(' | ') }; });
    return {
      kompId: w.KompID, nama: w.Nama, tipe: 'wajib', definisi: w.Definisi,
      levelTarget: wajibLevelTargetForTier_(w, tier), levels: lv,
      efektifMulai: w.EfektifMulai, aktifSekarang: !w.EfektifMulai || new Date(w.EfektifMulai) <= new Date()
    };
  });
}

/* resolveKompForJabatan_: dipakai setiap kali ada KompID + JabatanID dari baris Assessment/ITP dan
   butuh tahu nama/tipe/levelTarget-nya lagi — KompID kompetensi wajib TIDAK ada di sheet Kompetensi
   biasa (itu per-jabatan), jadi harus dicek juga ke KompetensiWajib dengan tier jabatan terkait. */
function resolveKompForJabatan_(jabatanId, kompId) {
  var k = sheetRows_(SHEET_KOMPETENSI).filter(function (r) { return r.KompID === kompId; })[0];
  if (k) return { kompId: kompId, nama: k.NamaKompetensi, tipe: k.Tipe, levelTarget: Number(k.LevelTarget) };
  var w = sheetRows_(SHEET_KOMPETENSI_WAJIB).filter(function (r) { return r.KompID === kompId; })[0];
  if (!w) return null;
  var jab = sheetRows_(SHEET_JABATAN).filter(function (r) { return r.JabatanID === jabatanId; })[0];
  return { kompId: kompId, nama: w.Nama, tipe: 'wajib', levelTarget: wajibLevelTargetForTier_(w, jab ? jab.Tier : 'staff') };
}

/* ================= EMPLOYEE DIRECTORY (P1) ================= */
/* Admin/L&D lihat semua karyawan; atasan cuma lihat bawahan langsungnya sendiri (AtasanNIK cocok) —
   ini juga jadi lapisan least-privilege tambahan, bukan cuma kemudahan cari NIK. */

function actionGetUsersList_(payload, session) {
  var rows = sheetRows_(SHEET_USERS);
  if (session.role !== 'admin' && session.role !== 'ld') {
    rows = rows.filter(function (r) { return String(r.AtasanNIK) === String(session.nik); });
  }
  return rows.map(function (r) { return { nik: r.NIK, nama: r.Nama, jabatan: r.Jabatan }; });
}

/* ================= PROFIL / RIWAYAT INDIVIDU (P1) ================= */
/* Data histori multi-siklus sebenarnya SUDAH ada sejak awal (setiap submitAssessment menambah
   baris baru bertimestamp, tidak menimpa), cuma belum pernah divisualisasikan. Ini agregasi +
   penyajiannya. */

function actionGetProfile_(payload, session) {
  var nik = payload.nik;
  if (!nik) throw new Error('NIK wajib diisi.');
  if (session.role !== 'admin' && session.role !== 'ld') {
    var target = sheetRows_(SHEET_USERS).filter(function (r) { return String(r.NIK) === String(nik); })[0];
    if (!target || String(target.AtasanNIK) !== String(session.nik)) {
      throw new Error('Anda tidak punya akses melihat profil karyawan ini.');
    }
  }
  var user = sheetRows_(SHEET_USERS).filter(function (r) { return String(r.NIK) === String(nik); })[0];
  var assessments = sheetRows_(SHEET_ASSESSMENT).filter(function (a) { return String(a.NIK) === String(nik); });
  var byKomp = {};
  assessments.forEach(function (a) {
    var k = resolveKompForJabatan_(a.JabatanID, a.KompID);
    if (!k) return;
    if (!byKomp[a.KompID]) byKomp[a.KompID] = { kompId: a.KompID, nama: k.nama, tipe: k.tipe, levelTarget: k.levelTarget, history: [] };
    byKomp[a.KompID].history.push({ levelAktual: a.LevelAktual, tanggal: a.Tanggal, asesorNik: a.AsesorNIK });
  });
  var items = Object.keys(byKomp).map(function (id) {
    var row = byKomp[id];
    row.history.sort(function (x, y) { return new Date(x.tanggal) - new Date(y.tanggal); });
    var last = row.history[row.history.length - 1];
    row.levelAwal = row.history[0].levelAktual;
    row.levelTerakhir = last.levelAktual;
    row.gapTerakhir = row.levelTarget - last.levelAktual;
    return row;
  });
  return { nik: nik, nama: user ? user.Nama : nik, jabatan: user ? user.Jabatan : '', items: items };
}

/* ================= ASSESSMENT & GAP ================= */
/* asesorNik TIDAK LAGI dipercaya dari klien — diambil dari session. Atasan hanya boleh menilai
   NIK yang AtasanNIK-nya memang dia (kecuali admin/ld, yang boleh menilai siapa pun). */

function actionSubmitAssessment_(payload, session) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var targetUser = sheetRows_(SHEET_USERS).filter(function (r) { return String(r.NIK) === String(payload.nik); })[0];
  if (!targetUser) throw new Error('NIK karyawan tidak ditemukan di Users.');
  if (session.role !== 'admin' && session.role !== 'ld' && String(targetUser.AtasanNIK) !== String(session.nik)) {
    throw new Error('Anda bukan atasan langsung karyawan ini, tidak bisa memberi asesmen.');
  }

  var sh = ss.getSheetByName(SHEET_ASSESSMENT);
  var shItp = ss.getSheetByName(SHEET_ITP);
  var siklus = payload.siklus || 'Tanpa Siklus';
  var now = new Date();
  var results = [], itpDibuat = 0;
  (payload.scores || []).forEach(function (s) {
    var id = payload.nik + '_' + s.kompId + '_' + now.getTime();
    var selfRating = (s.levelSelfRating === undefined || s.levelSelfRating === null || s.levelSelfRating === '') ? '' : s.levelSelfRating;
    sh.appendRow([id, payload.nik, payload.jabatanId, s.kompId, s.levelAktual, selfRating, session.nik, siklus, now]);
    var k = resolveKompForJabatan_(payload.jabatanId, s.kompId);
    var target = k ? k.levelTarget : 3;
    var gap = target - s.levelAktual;
    var nama = k ? k.nama : s.kompId;
    var tipe = k ? k.tipe : 'technical';
    var rekomendasi = rekomendasiGap_(gap, tipe);
    var selisihSelf = selfRating === '' ? null : (Number(selfRating) - s.levelAktual);
    results.push({ kompId: s.kompId, nama: nama, tipe: tipe, target: target, aktual: s.levelAktual, selfRating: selfRating === '' ? null : Number(selfRating), selisihSelf: selisihSelf, gap: gap, rekomendasi: rekomendasi });
    if (gap > 0) {
      shItp.appendRow([
        payload.nik + '_itp_' + s.kompId + '_' + now.getTime(), payload.nik, s.kompId, nama,
        rekomendasi, '', '', 'Belum Mulai', '', siklus, now
      ]);
      itpDibuat++;
    }
  });
  return { nik: payload.nik, results: results, siklus: siklus, itpDibuat: itpDibuat };
}

function rekomendasiGap_(gap, tipe) {
  if (gap <= 0) return 'Sesuai standar — kandidat talent pool / calon mentor.';
  if (tipe === 'wajib') return gap === 1 ? 'Ikuti modul wajib perusahaan (e-learning singkat) untuk menutup gap.' : 'Wajib ikut pelatihan formal kompetensi wajib perusahaan sebelum tenggat berlaku.';
  if (gap === 1 && tipe === 'technical') return 'On-the-job practice / shadowing dengan rekan level lebih tinggi.';
  if (gap === 1) return 'Coaching rutin oleh atasan langsung.';
  if (tipe === 'technical') return 'Formal training module + OJT terstruktur (gap >= 2 level).';
  return 'Program leadership development + mentoring oleh senior leader (gap >= 2 level).';
}

/* ================= TRAINING NEEDS MATRIX ================= */

function actionGetTrainingMatrix_(payload, session) {
  requireRole_(session, ['admin', 'ld']);
  var assessments = sheetRows_(SHEET_ASSESSMENT);
  var modules = sheetRows_(SHEET_TRAININGMODULE);
  var byKomp = {};
  assessments.forEach(function (a) {
    var k = resolveKompForJabatan_(a.JabatanID, a.KompID);
    if (!k) return;
    var gap = k.levelTarget - a.LevelAktual;
    if (!byKomp[a.KompID]) byKomp[a.KompID] = { nama: k.nama, tipe: k.tipe, mandatoryCount: 0, developmentCount: 0, maxGap: 0 };
    if (gap > 0) { byKomp[a.KompID].mandatoryCount++; byKomp[a.KompID].maxGap = Math.max(byKomp[a.KompID].maxGap, gap); }
    else byKomp[a.KompID].developmentCount++;
  });
  return Object.keys(byKomp).map(function (kompId) {
    var row = byKomp[kompId];
    var mod = modules.filter(function (m) { return m.NamaKompetensi === row.nama; })[0];
    return {
      kompetensi: row.nama, tipe: row.tipe,
      wajibPerusahaan: row.tipe === 'wajib',
      kategori: row.mandatoryCount > 0 ? 'mandatory' : 'development',
      jumlahButuh: row.mandatoryCount || row.developmentCount,
      urgency: row.maxGap >= 2 ? 'tinggi' : (row.maxGap === 1 ? 'sedang' : 'aman'),
      statusModul: mod ? mod.StatusModul : 'belum',
      catatanModul: mod ? mod.CatatanSumber : 'Belum ada data modul untuk kompetensi ini di katalog.'
    };
  });
}

/* ================= CAREER PATH ================= */
/* P2: pencocokan transferable/perlu-dipelajari sekarang coba pakai AI (kesamaan SUBSTANSI skill
   dari nama+definisi), bukan cuma keyword overlap. Kalau API key tidak ada / gagal, fallback ke
   keyword matching lama supaya fitur tetap jalan. Hasil "perlu dipelajari" dilengkapi status modul
   training (actionable, bukan cuma daftar nama). */

function actionCareerPath_(payload, session) {
  var fromKomp = actionGetKompetensiByJabatan_({ jabatanId: payload.fromJabatanId }, session);
  var toKomp = actionGetKompetensiByJabatan_({ jabatanId: payload.toJabatanId }, session);
  var result;
  var apiKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
  if (apiKey && fromKomp.length && toKomp.length) {
    try {
      result = aiCareerPathMatch_(fromKomp, toKomp);
    } catch (e) {
      result = keywordCareerPathMatch_(fromKomp, toKomp);
    }
  } else {
    result = keywordCareerPathMatch_(fromKomp, toKomp);
  }
  result.toLearn = enrichWithModule_(result.toLearn);
  return result;
}

function keywordCareerPathMatch_(fromKomp, toKomp) {
  var fromNames = fromKomp.map(function (k) { return k.nama.toLowerCase(); });
  var transferable = [], toLearn = [];
  toKomp.forEach(function (k) {
    var match = fromNames.some(function (n) { return shareWord_(n, k.nama.toLowerCase()); });
    (match ? transferable : toLearn).push(k);
  });
  return { transferable: transferable, toLearn: toLearn, method: 'keyword' };
}

function aiCareerPathMatch_(fromKomp, toKomp) {
  var prompt = [
    'Anda ahli competency mapping untuk talent mobility. Diberi daftar kompetensi jabatan ASAL dan jabatan TUJUAN (nama + definisi singkat).',
    'Untuk setiap kompetensi TUJUAN, tentukan TRANSFERABLE (orang dari jabatan asal sudah menguasai skill yang SUBSTANSINYA sama/sangat mirip, bukan cuma namanya mirip) atau PERLU_DIPELAJARI (skill baru/beda signifikan meski namanya mungkin terdengar mirip).',
    'Keluarkan HANYA JSON valid, tanpa teks lain: {"hasil":[{"nama":"...","status":"transferable|perlu_dipelajari","alasan":"1 kalimat singkat"}]}',
    '',
    '=== KOMPETENSI JABATAN ASAL ===',
    fromKomp.map(function (k) { return '- ' + k.nama + ': ' + k.definisi; }).join('\n'),
    '',
    '=== KOMPETENSI JABATAN TUJUAN ===',
    toKomp.map(function (k) { return '- ' + k.nama + ': ' + k.definisi; }).join('\n')
  ].join('\n');
  var raw = callClaude_(prompt);
  var parsed = extractJson_(raw);
  var byName = {};
  (parsed.hasil || []).forEach(function (h) { byName[h.nama] = h; });
  var transferable = [], toLearn = [];
  toKomp.forEach(function (k) {
    var h = byName[k.nama];
    var withReason = Object.assign({}, k, { alasan: h ? h.alasan : '' });
    (h && h.status === 'transferable' ? transferable : toLearn).push(withReason);
  });
  return { transferable: transferable, toLearn: toLearn, method: 'ai' };
}

function enrichWithModule_(items) {
  var modules = sheetRows_(SHEET_TRAININGMODULE);
  return items.map(function (k) {
    var mod = modules.filter(function (m) { return m.NamaKompetensi === k.nama; })[0];
    return Object.assign({}, k, { statusModul: mod ? mod.StatusModul : 'belum', catatanModul: mod ? mod.CatatanSumber : 'Belum ada data modul.' });
  });
}

/* ================= BENCH STRENGTH & HAV MAP (rule-based, bukan ML) =================
 * Keputusan 2026-10-12: HAV Map, Bench Strength, dan status Ready Now/6-12bln/>1thn
 * dibangun SEKARANG sebagai heuristik rule-based dari Gap Engine yang sudah ada —
 * BUKAN model prediktif, TIDAK butuh data historis. Persen probabilitas sukses
 * rotasi/promosi SENGAJA TIDAK dibangun (lihat PRD/roadmap: "diagnostic dulu,
 * dibuktikan dulu, baru prediktif" — belum ada data outcome untuk divalidasi).
 * Kedua fungsi ini JUGA proxy: readiness & potential dihitung murni dari gap
 * kompetensi, BELUM menggabungkan data performa/KPI riil (itu baru masuk begitu
 * BAMS/Database Sales terintegrasi — Fase 3). Frontend WAJIB menampilkan disclaimer
 * ini, jangan dihilangkan.
 */

function actionGetBenchStrength_(payload, session) {
  requireRole_(session, ['admin', 'ld']);
  var targetJabatanId = payload.targetJabatanId;
  if (!targetJabatanId) throw new Error('Pilih jabatan target dulu.');
  var targetKomp = actionGetKompetensiByJabatan_({ jabatanId: targetJabatanId }, session);
  if (!targetKomp.length) throw new Error('Jabatan target ini belum punya kompetensi tersimpan.');

  var users = sheetRows_(SHEET_USERS);
  var latestByNik = latestAssessmentByNik_();

  var candidates = Object.keys(latestByNik).map(function (nik) {
    var u = users.filter(function (r) { return String(r.NIK) === nik; })[0];
    if (u && slugify_(u.Jabatan || '') === targetJabatanId) return null; // sudah di jabatan target, bukan kandidat suksesi

    var byName = {};
    Object.keys(latestByNik[nik]).forEach(function (kid) {
      var row = latestByNik[nik][kid];
      var k = resolveKompForJabatan_(row.JabatanID, kid);
      if (k) byName[k.nama.toLowerCase()] = row.LevelAktual;
    });

    var maxGap = 0, kompetensiTercakup = 0;
    targetKomp.forEach(function (tk) {
      var tname = tk.nama.toLowerCase();
      var level = byName[tname];
      if (level === undefined) {
        var fuzzyKey = Object.keys(byName).filter(function (n) { return shareWord_(n, tname); })[0];
        if (fuzzyKey !== undefined) level = byName[fuzzyKey];
      }
      if (level !== undefined) kompetensiTercakup++;
      var assumed = level === undefined ? 1 : level; // worst-case: belum pernah diasesmen di kompetensi ini/sejenis
      var gap = tk.levelTarget - assumed;
      if (gap > maxGap) maxGap = gap;
    });

    var readiness = maxGap <= 0 ? 'ready_now' : (maxGap === 1 ? 'ready_6_12' : 'ready_1yr');
    return {
      nik: nik, nama: u ? u.Nama : nik, jabatanSaatIni: u ? u.Jabatan : '-',
      maxGap: maxGap, readiness: readiness,
      kompetensiTercakup: kompetensiTercakup, totalKompetensiTarget: targetKomp.length
    };
  }).filter(Boolean);

  var summary = { ready_now: 0, ready_6_12: 0, ready_1yr: 0 };
  candidates.forEach(function (c) { summary[c.readiness]++; });

  return { targetJabatanId: targetJabatanId, totalKandidat: candidates.length, summary: summary, kandidat: candidates };
}

/* ================= HELPER BERSAMA (dipakai bench strength, 9-box, talent card) ================= */

function latestAssessmentByNik_() {
  var out = {};
  sheetRows_(SHEET_ASSESSMENT).forEach(function (a) {
    out[a.NIK] = out[a.NIK] || {};
    var cur = out[a.NIK][a.KompID];
    if (!cur || new Date(a.Tanggal) > new Date(cur.Tanggal)) out[a.NIK][a.KompID] = a;
  });
  return out;
}

function latestPerformanceByNik_() {
  var out = {};
  sheetRows_(SHEET_PERFORMANCE).forEach(function (r) {
    var cur = out[r.NIK];
    if (!cur || new Date(r.Tanggal) > new Date(cur.Tanggal)) out[r.NIK] = r;
  });
  return out;
}

function readinessProfile_(nik, latestMap) {
  var perKomp = latestMap[nik] || {};
  var total = 0, ready = 0, items = [];
  Object.keys(perKomp).forEach(function (kid) {
    var row = perKomp[kid];
    var k = resolveKompForJabatan_(row.JabatanID, kid);
    if (!k) return;
    total++;
    var aktual = Number(row.LevelAktual), target = Number(k.levelTarget);
    if (aktual >= target) ready++;
    items.push({
      kompId: kid, nama: k.nama, tipe: k.tipe,
      target: target, aktual: aktual, gap: target - aktual, tanggal: row.Tanggal
    });
  });
  return { total: total, readiness: total ? Math.round(ready / total * 100) : 0, items: items };
}

/* ================= 9-BOX / HAV MAP =================
 * Sumbu Y = Kinerja (rating 1-5 yang DIINPUT MANUAL oleh L&D/HC, bukan dihitung AI).
 * Sumbu X = Kesiapan Kompetensi (% kompetensi yang sudah >= target, dari Gap Engine).
 * Dua sumbu ini sengaja datang dari SUMBER BERBEDA — versi sebelumnya memakai dua ukuran
 * yang sama-sama diturunkan dari gap kompetensi, jadi sebenarnya bukan 9-box (kedua sumbu
 * saling berkorelasi). Catatan jujur: sumbu X ini "kesiapan kompetensi", BUKAN "potensi"
 * dalam arti 9-box klasik (learning agility/aspirasi) — itu butuh instrumen terpisah yang
 * belum ada di BBM. Jangan ganti label sumbunya jadi "Potensi" tanpa instrumen itu.
 */

var NINE_BOX_CELLS = {
  '3_3': { nama: 'Bintang', aksi: 'Prioritas suksesi — siapkan untuk peran lebih besar sekarang.' },
  '3_2': { nama: 'Performer Tinggi', aksi: 'Kinerja kuat, tutup sisa gap kompetensi — kandidat 6-12 bulan.' },
  '3_1': { nama: 'Spesialis Andal', aksi: 'Pertahankan di perannya, dalamkan keahlian; belum siap pindah jalur.' },
  '2_3': { nama: 'Calon Kuat', aksi: 'Kompetensi sudah siap — dorong kinerja lewat target lebih menantang.' },
  '2_2': { nama: 'Inti Organisasi', aksi: 'Tulang punggung tim — jaga retensi, kembangkan bertahap.' },
  '2_1': { nama: 'Pekerja Solid', aksi: 'Stabil di peran sekarang; fokus tutup gap kompetensi dasar.' },
  '1_3': { nama: 'Belum Tergali', aksi: 'Kompetensi ada tapi kinerja rendah — cek kecocokan peran/hambatan, bukan training.' },
  '1_2': { nama: 'Belum Konsisten', aksi: 'Coaching intensif atasan langsung + target jangka pendek yang jelas.' },
  '1_1': { nama: 'Perlu Perhatian', aksi: 'Rencana perbaikan kinerja terstruktur dengan tenggat jelas.' }
};

function bucketPerf_(rating) { return rating >= 4 ? 3 : (rating === 3 ? 2 : 1); }
function bucketReady_(pct) { return pct >= 85 ? 3 : (pct >= 50 ? 2 : 1); }

function actionSavePerformance_(payload, session) {
  requireRole_(session, ['admin', 'ld']);
  var nik = payload.nik, rating = parseInt(payload.rating, 10);
  if (!nik) throw new Error('Pilih karyawan dulu.');
  if (!(rating >= 1 && rating <= 5)) throw new Error('Rating kinerja harus angka 1-5.');
  var user = sheetRows_(SHEET_USERS).filter(function (r) { return String(r.NIK) === String(nik); })[0];
  if (!user) throw new Error('NIK tidak ditemukan di Users.');
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_PERFORMANCE)
    .appendRow([nik, payload.periode || '', rating, payload.catatan || '', session.nik, new Date()]);
  return { nik: nik, nama: user.Nama, rating: rating };
}

function actionGetNineBox_(payload, session) {
  requireRole_(session, ['admin', 'ld']);
  var latest = latestAssessmentByNik_();
  var perf = latestPerformanceByNik_();
  var users = sheetRows_(SHEET_USERS);
  var placed = [], tanpaKinerja = [];

  Object.keys(latest).forEach(function (nik) {
    var prof = readinessProfile_(nik, latest);
    if (!prof.total) return;
    var u = users.filter(function (r) { return String(r.NIK) === String(nik); })[0];
    var orang = {
      nik: nik, nama: u ? u.Nama : nik, jabatan: u ? u.Jabatan : '-', cabang: u ? u.Cabang : '-',
      readiness: prof.readiness, totalKompetensi: prof.total
    };
    var p = perf[nik];
    if (!p) { tanpaKinerja.push(orang); return; }
    orang.kinerja = Number(p.RatingKinerja);
    orang.periodeKinerja = p.Periode || '-';
    var key = bucketPerf_(orang.kinerja) + '_' + bucketReady_(prof.readiness);
    orang.cellKey = key;
    orang.cellNama = NINE_BOX_CELLS[key].nama;
    orang.cellAksi = NINE_BOX_CELLS[key].aksi;
    placed.push(orang);
  });

  return { cells: NINE_BOX_CELLS, placed: placed, tanpaRatingKinerja: tanpaKinerja };
}

/* ================= TALENT CARD (satu halaman per orang, buat rapat talent review) ================= */

function actionGetTalentCard_(payload, session) {
  var nik = payload.nik;
  if (!nik) throw new Error('Pilih karyawan dulu.');
  var users = sheetRows_(SHEET_USERS);
  var u = users.filter(function (r) { return String(r.NIK) === String(nik); })[0];
  if (session.role !== 'admin' && session.role !== 'ld') {
    if (!u || String(u.AtasanNIK) !== String(session.nik)) {
      throw new Error('Anda tidak punya akses melihat talent card karyawan ini.');
    }
  }

  var prof = readinessProfile_(nik, latestAssessmentByNik_());
  var p = latestPerformanceByNik_()[nik];
  var modules = sheetRows_(SHEET_TRAININGMODULE);

  var urut = prof.items.slice().sort(function (a, b) { return b.gap - a.gap; });
  var prioritas = urut.filter(function (i) { return i.gap > 0; }).slice(0, 3).map(function (i) {
    var mod = modules.filter(function (m) { return m.NamaKompetensi === i.nama; })[0];
    return {
      nama: i.nama, tipe: i.tipe, target: i.target, aktual: i.aktual, gap: i.gap,
      rekomendasi: rekomendasiGap_(i.gap, i.tipe),
      statusModul: mod ? mod.StatusModul : 'belum',
      catatanModul: mod ? mod.CatatanSumber : 'Belum ada data modul untuk kompetensi ini di katalog.'
    };
  });

  var nineBox = null;
  if (p) {
    var key = bucketPerf_(Number(p.RatingKinerja)) + '_' + bucketReady_(prof.readiness);
    nineBox = { key: key, nama: NINE_BOX_CELLS[key].nama, aksi: NINE_BOX_CELLS[key].aksi };
  }

  var tanggalUnik = {};
  sheetRows_(SHEET_ASSESSMENT).forEach(function (a) {
    if (String(a.NIK) === String(nik)) tanggalUnik[new Date(a.Tanggal).toISOString().slice(0, 10)] = true;
  });
  var tanggalList = Object.keys(tanggalUnik).sort();

  return {
    nik: nik, nama: u ? u.Nama : nik, jabatan: u ? u.Jabatan : '-', cabang: u ? u.Cabang : '-',
    kinerja: p ? Number(p.RatingKinerja) : null,
    periodeKinerja: p ? (p.Periode || '-') : null,
    readiness: prof.readiness, totalKompetensi: prof.total,
    kompetensi: prof.items, prioritasPengembangan: prioritas, nineBox: nineBox,
    jumlahSiklusAsesmen: tanggalList.length,
    asesmenTerakhir: tanggalList.length ? tanggalList[tanggalList.length - 1] : null
  };
}

/* ================= ITP (yang dimonitor SETELAH asesmen, bukan re-asesmen) =================
 * Draft dibuat otomatis oleh actionSubmitAssessment_ untuk tiap kompetensi dengan gap>0.
 * Simplifikasi yang diakui (lihat PRD.md): draft dibuat untuk SEMUA gap>0, bukan hanya untuk
 * talent yang sengaja disiapkan jadi future leader — L&D menyaring/menghapus yang tidak relevan.
 */

function actionGetItpList_(payload, session) {
  var nik = payload.nik;
  if (!nik) throw new Error('Pilih karyawan dulu.');
  if (session.role !== 'admin' && session.role !== 'ld') {
    var target = sheetRows_(SHEET_USERS).filter(function (r) { return String(r.NIK) === String(nik); })[0];
    if (!target || String(target.AtasanNIK) !== String(session.nik)) {
      throw new Error('Anda tidak punya akses melihat ITP karyawan ini.');
    }
  }
  var rows = sheetRows_(SHEET_ITP).filter(function (r) { return String(r.NIK) === String(nik); });
  return rows.map(function (r) {
    return {
      itpId: r.ItpID, kompId: r.KompID, nama: r.NamaKompetensi, tindakan: r.Tindakan,
      pic: r.PIC, targetTanggal: r.TargetTanggal, status: r.Status || 'Belum Mulai',
      catatanProgress: r.CatatanProgress, siklus: r.Siklus, dibuatPada: r.DibuatPada,
      terlambat: !!(r.TargetTanggal && r.Status !== 'Selesai' && new Date(r.TargetTanggal) < new Date())
    };
  });
}

function actionUpdateItp_(payload, session) {
  var itpId = payload.itpId;
  if (!itpId) throw new Error('ITP tidak ditemukan.');
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ITP);
  var found = findRowByValue_(sh, 'ItpID', itpId);
  if (!found) throw new Error('ITP tidak ditemukan.');
  var headers = sh.getDataRange().getValues()[0];
  var nik = found.values[headers.indexOf('NIK')];

  if (session.role !== 'admin' && session.role !== 'ld') {
    var target = sheetRows_(SHEET_USERS).filter(function (r) { return String(r.NIK) === String(nik); })[0];
    if (!target || String(target.AtasanNIK) !== String(session.nik)) {
      throw new Error('Anda tidak punya akses mengubah ITP ini.');
    }
  }

  var allowedStatus = ['Belum Mulai', 'Berjalan', 'Selesai'];
  if (payload.status && allowedStatus.indexOf(payload.status) === -1) throw new Error('Status tidak valid.');

  function setCol(colName, value) {
    if (value === undefined) return;
    sh.getRange(found.rowIndex, headers.indexOf(colName) + 1).setValue(value);
  }
  setCol('Status', payload.status);
  setCol('PIC', payload.pic);
  setCol('TargetTanggal', payload.targetTanggal);
  setCol('CatatanProgress', payload.catatanProgress);
  return { itpId: itpId, ok: true };
}

function actionGetItpMonitoring_(payload, session) {
  requireRole_(session, ['admin', 'ld']);
  var rows = sheetRows_(SHEET_ITP);
  var users = sheetRows_(SHEET_USERS);
  var now = new Date();
  var summary = { 'Belum Mulai': 0, 'Berjalan': 0, 'Selesai': 0 };
  var terlambat = [];
  rows.forEach(function (r) {
    var status = r.Status || 'Belum Mulai';
    summary[status] = (summary[status] || 0) + 1;
    var isTerlambat = r.TargetTanggal && status !== 'Selesai' && new Date(r.TargetTanggal) < now;
    if (isTerlambat) {
      var u = users.filter(function (x) { return String(x.NIK) === String(r.NIK); })[0];
      terlambat.push({
        itpId: r.ItpID, nik: r.NIK, nama: u ? u.Nama : r.NIK, kompetensi: r.NamaKompetensi,
        pic: r.PIC, targetTanggal: r.TargetTanggal, status: status
      });
    }
  });
  return { total: rows.length, summary: summary, terlambat: terlambat };
}

function shareWord_(a, b) {
  var stop = ['dan', 'di', 'ke', 'yang', 'untuk', 'pada', 'manajemen', 'kemampuan', 'operasional'];
  var wa = a.split(/\s+/), wb = b.split(/\s+/);
  return wa.some(function (w) { return w.length > 4 && stop.indexOf(w) === -1 && wb.indexOf(w) !== -1; });
}

/* ================= SHEET HELPERS ================= */

function sheetRows_(name) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return [];
  var values = sh.getDataRange().getValues();
  var headers = values[0];
  return values.slice(1).map(function (row) {
    var obj = {};
    headers.forEach(function (h, i) { obj[h] = row[i]; });
    return obj;
  });
}

function findRowByValue_(sh, colName, value) {
  var values = sh.getDataRange().getValues();
  var headers = values[0];
  var colIdx = headers.indexOf(colName);
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][colIdx]) === String(value)) return { rowIndex: i + 1, values: values[i] };
  }
  return null;
}

function removeRowsByValue_(sh, colName, value) {
  var values = sh.getDataRange().getValues();
  var headers = values[0];
  var colIdx = headers.indexOf(colName);
  for (var i = values.length - 1; i >= 1; i--) {
    if (String(values[i][colIdx]) === String(value)) sh.deleteRow(i + 1);
  }
}

function slugify_(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

/* ================= SEED: TRAINING MODULE CATALOG =================
 * Hasil cross-check manual ke folder Google Drive "Kurikulum & Modul"
 * (katalog internal BBM, BUKAN SFID/materi ATPM), dari sesi perancangan
 * 5 jabatan sample (Branch Head, Sales Supervisor LCV, Warehouse Sparepart
 * Head, HC & GA Division Head, Finance Department Head). Jalankan sekali
 * lewat menu Run untuk isi starter data; untuk kompetensi baru di luar
 * 5 jabatan ini, isi manual di sheet TrainingModule atau cross-check ulang.
 */
/* ================= SEED: KOMPETENSI WAJIB PERUSAHAAN =================
 * Dua kompetensi wajib lintas-jabatan (2026-10-12): AI Generatif (efektif mulai 2027-01-01,
 * level target lebih ringan untuk staff) dan Anti-Fraud (efektif sekarang, applies for all).
 *
 * CATATAN JUJUR SOAL SUMBER: tidak ada satu standar industri tunggal untuk level kompetensi AI
 * karyawan korporat atau untuk level kewaspadaan anti-fraud dengan indikator perilaku per level —
 * sudah dicek (2026-10-12). Yang ada: DigComp 3.0 dan kerangka AILit OECD/EU (ditujukan untuk
 * kebijakan publik/pendidikan, bukan korporat) untuk AI; dan "Fraud Prevention Pyramid" (progresi
 * 5 tahap kesadaran fraud, ditujukan untuk individu profesional keuangan, bukan skema korporat
 * lintas-level) untuk anti-fraud. Dua kompetensi di bawah ini RACIKAN SENDIRI yang terinspirasi
 * dari kerangka itu dan mengikuti format 5-level + Perilaku Kunci yang sama dengan Kamus 2022 —
 * bukan jiplakan standar resmi. Kalau BBM punya kebijakan anti-fraud formal dengan definisi level
 * sendiri, GANTI isi di bawah dengan itu, jangan dipakai sebagai pengganti kebijakan resmi.
 */
function seedKompetensiWajib() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var shK = ss.getSheetByName(SHEET_KOMPETENSI_WAJIB);
  var shL = ss.getSheetByName(SHEET_LEVEL_WAJIB);

  shK.appendRow([
    'WAJIB_AI', 'Pemanfaatan AI Generatif untuk Produktivitas Kerja',
    'Kemampuan memanfaatkan tools AI generatif (chat, image generator, dsb) secara efektif, kritis, dan aman untuk mendukung produktivitas kerja sehari-hari.',
    2, 3, 4, 4, '2027-01-01'
  ]);
  shK.appendRow([
    'WAJIB_ANTIFRAUD', 'Kepatuhan & Kewaspadaan Anti-Fraud',
    'Kemampuan memahami, menerapkan, dan menegakkan prinsip anti-fraud dalam pekerjaan sehari-hari.',
    2, 3, 4, 4, ''
  ]);

  var levelAi = [
    ['Mengetahui apa itu AI generatif (chat & image generation) dan contoh penggunaannya di pekerjaan kantor.', 'Belum pernah menggunakan AI generatif untuk tugas kerja.'],
    ['Menggunakan AI chat (ChatGPT/Claude/Gemini, dsb) untuk tugas rutin sederhana: meringkas teks, draft email/pesan, mencari ide.', 'Menggunakan AI image generator untuk kebutuhan visual dasar (bukan materi final tanpa review).', 'Tidak memasukkan data rahasia/pribadi pelanggan ke tools AI publik.'],
    ['Menyusun prompt terstruktur (konteks, format keluaran, contoh) untuk hasil yang lebih relevan.', 'Memeriksa ulang (fact-check) hasil AI sebelum dipakai/dikirim ke pihak lain — tidak menelan mentah-mentah.', 'Memilih tools AI yang sesuai kebutuhan tugas secara mandiri.'],
    ['Mengintegrasikan AI ke alur kerja rutin timnya dan membimbing rekan kerja memakainya dengan benar dan aman.', 'Mengenali situasi di mana AI tidak tepat/boleh dipakai (keputusan sensitif, data rahasia, kepatuhan hukum) dan menegakkan itu di timnya.'],
    ['Merancang panduan/SOP ringan pemanfaatan AI untuk unit kerjanya, termasuk batasan dan eskalasi.', 'Mengevaluasi tools AI baru yang relevan untuk diadopsi dan menjadi rujukan kebijakan penggunaan AI yang etis & aman di lingkupnya.']
  ];
  levelAi.forEach(function (pk, i) { shL.appendRow(['WAJIB_AI', i + 1, LEVEL_HEAD_TECHNICAL[i], pk.join(' | ')]); });

  var levelFraud = [
    ['Memahami definisi fraud dan bentuk umumnya (penggelapan, suap, manipulasi laporan, dsb) serta kebijakan anti-fraud perusahaan.', 'Mengetahui jalur pelaporan (whistleblowing channel) dan kewajiban melapor bila menemukan indikasi fraud.'],
    ['Mengenali red flag fraud yang relevan di area kerjanya sendiri (gaya hidup tidak wajar, dokumen/transaksi tidak konsisten, tekanan finansial yang mencolok).', 'Tidak menandatangani/mengesahkan dokumen yang belum diverifikasi.'],
    ['Menerapkan kontrol anti-fraud dalam tugas rutin (segregation of duties, verifikasi berjenjang, dokumentasi transaksi yang rapi).', 'Berani menolak dan melaporkan instruksi/praktik yang mencurigakan, termasuk dari atasan, lewat jalur yang benar.'],
    ['Mendeteksi pola fraud yang lebih halus lintas transaksi/tim dan melakukan eskalasi/investigasi awal dengan benar.', 'Membangun kesadaran anti-fraud di timnya secara rutin (briefing, pengingat kebijakan).'],
    ['Merancang atau memperkuat kontrol anti-fraud di unit kerjanya berdasarkan temuan/pola risiko yang berulang.', 'Memimpin atau mengkoordinasikan investigasi internal dan menjadi rujukan kebijakan anti-fraud di lingkup kerjanya.']
  ];
  levelFraud.forEach(function (pk, i) { shL.appendRow(['WAJIB_ANTIFRAUD', i + 1, LEVEL_HEAD_TECHNICAL[i], pk.join(' | ')]); });

  SpreadsheetApp.getUi().alert('Seed Kompetensi Wajib selesai: AI Generatif (efektif 2027-01-01) & Anti-Fraud (efektif sekarang), masing-masing 5 level.');
}

function seedTrainingModuleContoh() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_TRAININGMODULE);
  var rows = [
    ['Manajemen Operasional 3S Cabang', 'belum', 'Tidak ada modul 3S terintegrasi; yang ada hanya modul per fungsi (Sales) terpisah.'],
    ['Analisis Pasar & Strategi Komersial Cabang', 'belum', 'Belum ditemukan modul analisis pasar/komersial level cabang.'],
    ['Perencanaan & Pengendalian Anggaran Cabang', 'belum', 'Belum ditemukan modul budgeting/kontrol anggaran cabang.'],
    ['Manajemen Kualitas Layanan & Fasilitas Pelanggan', 'sebagian', 'SA & CS Master Class dan Customer Retention Management (IST-M1-07) ada, tapi untuk level Service Advisor/CS.'],
    ['Manajemen Operasional Bengkel & Purna Jual', 'belum', 'Materi MStep menyasar level mekanik/teknisi, bukan workshop management level kepala cabang.'],
    ['Kepemimpinan Lintas Fungsi', 'sebagian', '"Konsep Assertive Leadership" & "COACHING & COUNSELING" ada di folder Sales Branch Head, tapi leadership umum, belum spesifik lintas-fungsi 3S.'],
    ['Perencanaan & Eksekusi Strategi Bisnis Cabang', 'sebagian', '"ROOT CAUSE ANALYSIS & DECISION MAKING" ada di folder Sales Branch Head, menyentuh sebagian aspek pengambilan keputusan.'],
    ['Pengembangan & Evaluasi Kinerja Tim Cabang', 'sebagian', '"COACHING & COUNSELING" & "EFEKTIVITAS RECRUITMENT SALES" ada di folder Sales Branch Head.'],
    ['Manajemen Operasional Penjualan Unit', 'ada', 'Match kuat: BST/IST/AST (Basic/Intermediate/Advance Salesmanship Training) & "BAMS Training for SPV Final".'],
    ['Administrasi & Kepatuhan Transaksi Penjualan', 'sebagian', 'Disentuh ringkas di modul BAMS Utilization, belum ada modul administrasi penjualan berdiri sendiri.'],
    ['Manajemen Kualitas Layanan Pelanggan Penjualan', 'ada', 'Match: SA & CS Master Class, Customer Retention Management (IST-M1-07), modul After Sales Service.'],
    ['Supervisi & Pembinaan Tim Sales Lapangan', 'ada', 'Match kuat folder KATEGORI SALES/Sales SPV: COACHING & COUNSELING, Motivational Training, Konsep Assertive Leadership.'],
    ['Perencanaan & Evaluasi Kinerja Tim Penjualan', 'sebagian', '"Skala Prioritas Dalam Bekerja" & "ROOT CAUSE ANALYSIS & DECISION MAKING" ada di folder Sales SPV.'],
    ['Manajemen Inventori & Operasional Gudang Spare Part', 'ada', 'Match kuat folder COMPETENCY-TECHNICAL/MANAGEMENT INVENTORY: Modul Training-Inventory Control, Business Strategy Alignment & Inventory Excellence Training, Part Management.'],
    ['Penanganan Klaim & Koordinasi Vendor Spare Part', 'belum', 'Belum ditemukan modul klaim/koordinasi vendor spare part.'],
    ['Pelaporan & Dokumentasi Operasional Gudang', 'sebagian', '"Modul Training-Inventory Control" kemungkinan menyentuh pelaporan stok, belum berdiri sendiri.'],
    ['Supervisi Tim Operasional Gudang', 'belum', 'Modul leadership yang ada baru tersedia untuk klaster Sales, belum konteks gudang.'],
    ['Perancangan Strategi & Kebijakan SDM', 'belum', 'Belum ditemukan modul perancangan strategi/kebijakan SDM.'],
    ['Manajemen Kepatuhan & Risiko Operasional', 'belum', 'Belum ditemukan modul kepatuhan/manajemen risiko operasional.'],
    ['Pengendalian Anggaran Fungsi SDM', 'belum', 'Belum ditemukan modul budgeting khusus fungsi SDM.'],
    ['Kepemimpinan Multi-Departemen & Business Partnering', 'belum', 'Modul leadership yang ada baru tersedia untuk klaster Sales.'],
    ['Pembinaan & Pengembangan Kepala Departemen', 'belum', 'Belum ditemukan modul pembinaan kepala departemen.'],
    ['Manajemen Cash Flow & Treasury Korporat', 'belum', 'Belum ditemukan modul cash flow/treasury.'],
    ['Manajemen Hutang & Piutang Korporat', 'belum', 'Belum ditemukan modul manajemen hutang-piutang korporat.'],
    ['Pengendalian Anggaran Korporat', 'belum', 'Belum ditemukan modul pengendalian anggaran korporat.'],
    ['Manajemen Administrasi Aset & Legalitas Kendaraan', 'belum', 'Belum ditemukan modul administrasi aset/legalitas kendaraan.'],
    ['Kepemimpinan Tim Keuangan Departemen', 'belum', 'Belum ditemukan modul kepemimpinan tim khusus konteks keuangan.']
  ];
  rows.forEach(function (r) { sh.appendRow(r); });
  SpreadsheetApp.getUi().alert('Seed TrainingModule selesai: ' + rows.length + ' baris starter dari 5 jabatan sample.');
}
