// Uji kualitas data penilaian (v4.0) dengan data SINTETIS (bukan data karyawan asli).
const assert = require('assert');
const { ctx, ACTIVE, makeSS, created } = require('./gas_mock.js');
const T = (req) => ctx.handleTNA(req);

// ---- Users (format Kode.gs: NIK, PIN, Nama, Cabang, Jabatan, Role, AtasanNIK, NoHP, Wajib_Ganti_PIN)
const users = ACTIVE.insertSheet('Users');
users.data = [['NIK', 'PIN', 'Nama', 'Cabang', 'Jabatan', 'Role', 'Atasan NIK', 'NoHP', 'Wajib_Ganti_PIN'],
  ['A1', '1111', 'Admin LD', 'HO', 'L&D', 'Admin', '', '', false],
  ['BH1', '2222', 'Kacab Satu', 'CAB1', 'BRANCH HEAD', 'User', '', '', false],
  ['ASH1', '3333', 'ASS Head', 'CAB1', 'AFTER SALES SERVICE HEAD', 'User', '', '', false],
  ['LM1', '4444', 'Leader Mek', 'CAB1', 'LEADER MEKANIK', 'User', '', '', false],
  ['M1', '5555', 'Mekanik Satu', 'CAB1', 'MEKANIK', 'User', '', '', false],
  ['M2', '6666', 'Mekanik Dua', 'CAB1', 'MEKANIK', 'User', '', '', false],
  ['NOH1', '7777', 'NOH MMKSI', 'HO', 'NOH', 'User', '', '', false],
  ['NOH2', '8888', 'NOH KTB', 'HO', 'NOH', 'User', '', '', false],
  // S1, S2 (sales) sengaja tidak ada di Users -> harus dibuat otomatis
];

// ---- Paket import sintetis
const imp = makeSS('TNA2027_Import');
function tab(name, header, rows) { const s = imp.insertSheet(name); s.data = [header, ...rows]; }
const H = ctx.TNA_TAB;
const K = (o) => H.Karyawan.map(k => o[k] ?? '');
tab('Karyawan', H.Karyawan, [
  K({ NIK: 'BH1', Nama: 'Kacab Satu', Cabang: 'CAB1', Wilayah: 'W1', Dept: 'OPS', KodeJabatan: 'J63', JobTitle: 'BRANCH HEAD', Jabatan: 'BRANCH HEAD', PenilaiNIK: 'NOH1', Penilai2NIK: 'NOH2', ModeAsesmen: 'INDIVIDU', Aktif: 'Y' }),
  K({ ValidatorNIK: 'NOH1', NIK: 'ASH1', Nama: 'ASS Head', Cabang: 'CAB1', Wilayah: 'W1', Dept: 'SVC', KodeJabatan: 'J75', JobTitle: 'AFTER SALES SERVICE HEAD', Jabatan: 'ASS HEAD', PenilaiNIK: 'BH1', ModeAsesmen: 'INDIVIDU', Aktif: 'Y' }),
  K({ ValidatorNIK: 'BH1', NIK: 'LM1', Nama: 'Leader Mek', Cabang: 'CAB1', Wilayah: 'W1', Dept: 'SVC', KodeJabatan: 'J79', JobTitle: 'LEADER MEKANIK', Jabatan: 'LEADER MEKANIK', PenilaiNIK: 'ASH1', ModeAsesmen: 'INDIVIDU', Aktif: 'Y' }),
  K({ ValidatorNIK: 'BH1', NIK: 'M1', Nama: 'Mekanik Satu', Cabang: 'CAB1', Wilayah: 'W1', Dept: 'SVC', KodeJabatan: 'J81', JobTitle: 'MEKANIK', Jabatan: 'MEKANIK', PenilaiNIK: 'ASH1', ModeAsesmen: 'INDIVIDU', DelegasiBoleh: 'LEADER MEKANIK', Aktif: 'Y' }),
  K({ ValidatorNIK: 'BH1', NIK: 'M2', Nama: 'Mekanik Dua', Cabang: 'CAB1', Wilayah: 'W1', Dept: 'SVC', KodeJabatan: 'J81', JobTitle: 'MEKANIK', Jabatan: 'MEKANIK', PenilaiNIK: 'ASH1', ModeAsesmen: 'INDIVIDU', DelegasiBoleh: 'LEADER MEKANIK', Aktif: 'Y' }),
  K({ ValidatorNIK: 'NOH1,NOH2', NIK: 'S1', Nama: 'Sales Satu', Cabang: 'CAB1', Wilayah: 'W1', Dept: 'SLS', KodeJabatan: 'J73', JobTitle: 'SALES FORCE', Jabatan: 'SALES JUNIOR', PenilaiNIK: 'BH1', ModeAsesmen: 'KELOMPOK', KelompokID: 'CAB1|SALES JUNIOR', Aktif: 'Y' }),
  K({ ValidatorNIK: 'NOH1,NOH2', NIK: 'S2', Nama: 'Sales Dua', Cabang: 'CAB1', Wilayah: 'W1', Dept: 'SLS', KodeJabatan: 'J73', JobTitle: 'SALES FORCE', Jabatan: 'SALES JUNIOR', PenilaiNIK: 'BH1', ModeAsesmen: 'KELOMPOK', KelompokID: 'CAB1|SALES JUNIOR', Aktif: 'Y' }),
]);
const MJ = (k, j) => H.MasterJabatan.map(x => ({ KodeJabatan: k, JobTitle: j, StatusMatriks: 'REVIEW' })[x] ?? '');
tab('MasterJabatan', H.MasterJabatan, [MJ('J63', 'BRANCH HEAD'), MJ('J75', 'ASS HEAD'), MJ('J79', 'LEADER MEKANIK'), MJ('J81', 'MEKANIK'), MJ('J73', 'SALES FORCE')]);
tab('Kamus', H.Kamus, ['T-ENG', 'T-ELC', 'B-CUS', 'L-LEAD'].map(k => [k, 'Nama ' + k, k[0] === 'T' ? 'Technical' : (k[0] === 'B' ? 'Behavioral' : 'Leadership'), 'Def', 'l1', 'l2', 'l3', 'l4', 'l5', 'APPROVED']));
tab('Checklist', H.Checklist, ['T-ENG', 'T-ELC', 'B-CUS', 'L-LEAD'].map(k => [k, 'c2', 'c3', 'c4', 'c5']));
tab('Matriks', H.Matriks, [
  ['J81', 'T-ENG', 3, 3, 'JD', ''], ['J81', 'T-ELC', 3, 2, 'JD', ''], ['J81', 'B-CUS', 2, 1, 'JD', ''],
  ['J73', 'B-CUS', 3, 3, 'JD', ''], ['J63', 'L-LEAD', 4, 3, 'JD', ''], ['J75', 'L-LEAD', 4, 3, 'JD', ''], ['J79', 'T-ENG', 4, 3, 'JD', ''],
]);
tab('Task', H.Task, [['J81', 1, 'Service', 'Melakukan perbaikan mesin bensin', 'T-ENG']]);
tab('Intervensi', H.Intervensi, []);
tab('Katalog', H.Katalog, [
  ['W-AFA', 'Anti Fraud Awareness', 'Wajib', '', '', 'E-Learning', 2, '', '', 'AKTIF'],
  ['W-AIDW', 'AI for Daily Work', 'Wajib', '', '', 'Classroom', 3, '', '', 'AKTIF'],
  ['T01', 'Engine Diagnosis', 'Dianjurkan', 'T-ENG', 4, 'Classroom', 8, '', '', 'AKTIF'],
  ['T02', 'Electrical Basic', 'Dianjurkan', 'T-ELC', 3, 'Classroom', 6, '', '', 'AKTIF'],
  ['P01', 'Financial Literacy', 'Pengayaan', '', '', 'E-Learning', 2, '', '', 'AKTIF'],
  ['P02', 'Public Speaking', 'Pengayaan', '', '', 'Classroom', 4, '', '', 'AKTIF'],
]);
tab('Mandatory', H.Mandatory, [['*', 'W-AFA', 'Korporat'], ['*', 'W-AIDW', 'Korporat'], ['J81', 'T01', 'Syarat JD (contoh)']]);
const HR = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
const RK = (nik, tgl, st, kode) => H.RekamTraining.map(x => ({ NIK: nik, Tahun: tgl.slice(0, 4), Tanggal: tgl, KodeProgram: kode, Judul: 'Program ' + kode, Kategori: 'TEKNIKAL', Metode: 'Classroom', Penyelenggara: 'BBLC', Status: st, Jam: 8, KodeTNA: kode })[x] ?? '');
tab('RekamTraining', H.RekamTraining, [
  RK('M1', HR(100), 'HADIR', 'T01'),      // jatuh tempo 10 hari lalu, belum terlambat -> muncul
  RK('M1', HR(200), 'SELESAI', 'T02'),    // lewat jatuh tempo + toleransi -> terlambat
  RK('LM1', HR(100), 'HADIR', 'T01'),     // J79 punya T-ENG -> muncul
  RK('M2', HR(60), 'HADIR', 'T02'),       // belum 90 hari -> belum muncul
  RK('M1', HR(100), 'HADIR', 'P01'),      // Pengayaan -> dikecualikan
  RK('M2', HR(120), 'TIDAK HADIR', 'T01'),// tidak hadir -> dikecualikan
  RK('S1', HR(100), 'HADIR', 'T01'),      // J73 tidak punya T-ENG -> tidak ada kompetensi terukur
  RK('M1', HR(400), 'SELESAI', 'T01'),    // sebelum PascaMulai -> dikecualikan
]);
tab('Indikator', H.Indikator, [['T-ELC', 4, 'Advanced', 'Menangani gangguan kelistrikan kompleks secara mandiri', 'Mendiagnosis gangguan ECU', 'uji'], ['T-ELC', 4, 'Advanced', '', 'Membimbing rekan pada kasus kelistrikan', 'uji']]);
global.__IMPORT = imp;

// ---- 1. Import
const lap = ctx.tnaImport('x');
console.log(lap.join(' | '));
const u = users.data;
assert.strictEqual(u.find(r => r[0] === 'M1')[6], 'ASH1', 'Atasan NIK M1 terisi');
assert.ok(u.find(r => r[0] === 'S1'), 'Sales S1 dibuat di Users');
assert.strictEqual(u.find(r => r[0] === 'S1')[8], true, 'User baru wajib ganti PIN');

// window dibuka sekarang
ctx.tnaSetParamInternal(ACTIVE, 'WindowBuka', new Date(Date.now() - 3600e3).toISOString());
ctx.tnaSetParamInternal(ACTIVE, 'WindowTutup', new Date(Date.now() + 3600e3).toISOString());

const auth = (nik) => ({ nik, pin: u.find(r => r[0] === nik)[1] });
// form ditolak sebelum matriks approved
let r = T({ action: 'tnaForm', ...auth('ASH1'), target: 'M1' });
assert.strictEqual(r.ok, false, 'form ditolak sebelum approve');
r = T({ action: 'tnaApproveMatriks', ...auth('ASH1'), kodeList: ['J81'] });
assert.strictEqual(r.ok, false, 'non admin tidak boleh approve');
r = T({ action: 'tnaApproveMatriks', ...auth('A1'), kodeList: ['J63', 'J75', 'J79', 'J81', 'J73'] });
assert.strictEqual(r.jumlah, 5);

// ---- 2. Data asesmen sintetis langsung ke tab Asesmen (pola penilai yang sengaja dibuat)
const P = Array.from({ length: 12 }, (_, i) => 'P' + String(i + 1).padStart(2, '0'));
const A = (nik, komp, rater, rnik, lv, checks, bukti) => ({ Periode: 'TNA2027', NIK: nik, KelompokID: '', KodeKompetensi: komp, Rater: rater, RaterNIK: rnik, Checks: checks, Level: lv, NA: false, Alasan: '', Status: 'FINAL', Timestamp: new Date(), Bukti: bukti || '' });
const CH = (lv) => ['NNNN', 'NNNN', 'YNNN', 'YYNN', 'YYYN', 'YYYY'][lv];
const rows = [];
P.forEach(n => rows.push(A(n, 'B-CUS', 'ATASAN', 'ASH1', 5, 'YYYY', 'Selalu melayani pelanggan dengan sangat baik')));            // seragam, tinggi, bukti disalin
const LB = [2, 3, 3, 2, 4, 3, 2, 3, 4, 3, 2, 3];
const BB = { P05: 'Memperbaiki 3 unit gangguan kelistrikan ECU tanpa komplain ulang', P09: 'Membimbing rekan memperbaiki wiring yang rumit' };
P.forEach((n, i) => rows.push(A(n, 'T-ELC', 'ATASAN', 'BH1', LB[i], CH(LB[i]), BB[n])));                                       // wajar
const LA = [2, 3, 3, 2, 3, 2, 3, 3, 2, 3, 2, 2], L2 = [2, 3, 2, 2, 3, 3, 3, 4, 2, 3, 2, 2];
P.forEach((n, i) => rows.push(A(n, 'T-ENG', 'ATASAN', 'NOH1', LA[i], i < 3 ? 'YNYN' : CH(LA[i]))));                             // 3 centang melompat
P.forEach((n, i) => rows.push(A(n, 'T-ENG', 'ATASAN2', 'NOH2', L2[i], CH(L2[i]), L2[i] >= 4 ? 'Menangani 2 kasus overhaul mesin bulan Mei' : '')));
rows.push(A('P01', 'T-ENG', 'SELF', 'P01', 4, 'YYYN', 'Saya sudah bisa semua pekerjaan mesin'), A('P02', 'T-ENG', 'SELF', 'P02', 3, 'YYNN'));
rows.push(Object.assign(A('P04', 'B-CUS', 'ATASAN', 'BH1', 4, 'YYYN', 'Draf belum dikirim ke sistem'), { Status: 'DRAFT' })); // draf tidak boleh ikut dihitung
ctx.tnaTambah(ACTIVE, 'Asesmen', rows);

// ---- 3. Otorisasi
r = T({ action: 'tnaKualitasPenilai', ...auth('M1') });
assert.strictEqual(r.ok, false, 'karyawan biasa ditolak');
r = T({ action: 'tnaAuditBukti', ...auth('ASH1') });
assert.strictEqual(r.ok, false, 'non admin tidak boleh menjalankan audit AI');

// ---- 4. Indikator statistik (dicocokkan dengan hitungan manual)
r = T({ action: 'tnaKualitasPenilai', ...auth('A1') });
assert.ok(r.ok, JSON.stringify(r));
const pen = Object.fromEntries(r.penilai.map(x => [x.nik, x]));
const kode = (n) => pen[n].temuan.map(t => t.kode).sort().join(',');
assert.strictEqual(kode('ASH1'), 'BUKTI_SAMA,MURAH,SERAGAM', 'ASH1: seragam, cenderung tinggi, bukti disalin: ' + kode('ASH1'));
assert.strictEqual(kode('BH1'), '', 'BH1 wajar: ' + kode('BH1'));
assert.strictEqual(kode('NOH1'), 'LOMPAT', 'NOH1: 3/12 = 25% centang melompat: ' + kode('NOH1'));
assert.strictEqual(kode('NOH2'), '', 'NOH2 wajar');
assert.strictEqual(pen.ASH1.persenTinggi, 100); assert.strictEqual(pen.BH1.rataRata, 2.83);
// lolos: ASH1 0/12, BH1 12/12, NOH1 9/12, NOH2 12/12 = 33/48
assert.strictEqual(r.ringkas.penilaian, 48); assert.strictEqual(r.ringkas.lolos, 33); assert.strictEqual(r.ringkas.persenLolos, 69);
assert.strictEqual(r.ringkas.penilaiTemuan, 2);
// dua penilai: 9 dari 12 sama persis (75%), semua selisih <= 1 (100%)
assert.strictEqual(r.duaPenilai.pasangan, 12); assert.strictEqual(r.duaPenilai.persenSama, 75); assert.strictEqual(r.duaPenilai.persenDekat, 100);
// kappa kuadrat dihitung ulang secara mandiri
const kapMandiri = (() => {
  const pr = LA.map((a, i) => [a, L2[i]]), n = pr.length, cats = [1, 2, 3, 4, 5];
  const pa = c => pr.filter(x => x[0] === c).length / n, pb = c => pr.filter(x => x[1] === c).length / n;
  let o = 0, e = 0;
  cats.forEach(i => cats.forEach(j => { const w = ((i - j) ** 2) / 16; o += w * pr.filter(x => x[0] === i && x[1] === j).length / n; e += w * pa(i) * pb(j); }));
  return Math.round((1 - o / e) * 100) / 100;
})();
assert.strictEqual(r.duaPenilai.kappa, kapMandiri, 'kappa ' + r.duaPenilai.kappa + ' vs manual ' + kapMandiri);
console.log('kappa kuadrat =', r.duaPenilai.kappa, '(' + r.duaPenilai.tafsir + ')');
// nilai diri vs atasan: P01 4 vs 2 (+2), P02 3 vs 3 (0)
assert.strictEqual(r.diriAtasan.pasangan, 2); assert.strictEqual(r.diriAtasan.rataSelisih, 1); assert.strictEqual(r.diriAtasan.persenJauh, 50);
assert.strictEqual(r.bukti.perlu, 15, 'L4-5 dari penilai: 12 ASH1 + 2 BH1 + 1 NOH2'); assert.strictEqual(r.bukti.belum, 15);
assert.strictEqual(r.audit.aktif, false, 'tanpa GEMINI_API_KEY audit nonaktif');

// ---- 5. Audit AI (AI tiruan: bukti yang menyebut angka dianggap mendukung)
r = T({ action: 'tnaAuditBukti', ...auth('A1') });
assert.strictEqual(r.ok, false, 'tanpa kunci ditolak dengan pesan jelas'); assert.ok(/GEMINI_API_KEY/.test(r.error));
ctx.PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', 'uji');
const dikirim = [];
ctx.UrlFetchApp = { fetchAll: (reqs) => reqs.map(q => {
  const b = JSON.parse(q.payload), t = b.contents[0].parts[0].text; dikirim.push({ t, h: q.headers, s: b.systemInstruction.parts[0].text, g: b.generationConfig });
  const bukti = t.split('"""')[1], put = /\d/.test(bukti) ? 'MENDUKUNG' : 'KURANG_SPESIFIK';
  return { getResponseCode: () => 200, getContentText: () => JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ putusan: put, alasan: 'uji', levelTersirat: 0 }) }] } }] }) };
}) };
r = T({ action: 'tnaAuditBukti', ...auth('A1') });
assert.ok(r.ok, JSON.stringify(r)); assert.strictEqual(r.diproses, 15); assert.strictEqual(r.sisa, 0); assert.strictEqual(r.galat, 0);
const pELC = dikirim.find(d => /Kompetensi: Nama T-ELC/.test(d.t) && /Membimbing rekan memperbaiki/.test(d.t));
assert.ok(pELC && /Mendiagnosis gangguan ECU/.test(pELC.t) && /Menangani gangguan kelistrikan kompleks/.test(pELC.t), 'prompt memuat definisi level dan key behavior');
assert.ok(!dikirim.some(d => /P0\d|Kacab|ASS Head|NOH/.test(d.t)), 'prompt tidak memuat NIK atau nama');
assert.strictEqual(dikirim[0].h['x-goog-api-key'], 'uji'); assert.strictEqual(dikirim[0].g.temperature, 0);
assert.ok(ACTIVE.getSheetByName('TNA_AuditBukti').data.slice(1).every(x => x[12] === 'AUDIT_AI'), 'hasil AI berstatus AUDIT_AI');
r = T({ action: 'tnaKualitasPenilai', ...auth('A1') });
const pen2 = Object.fromEntries(r.penilai.map(x => [x.nik, x]));
assert.strictEqual(pen2.BH1.aiMasalah, 1, 'bukti P09 tanpa hal konkret ditandai'); assert.ok(pen2.BH1.temuan.some(t => t.kode === 'BUKTI_AI'));
assert.strictEqual(r.ringkas.lolos, 32, 'P09 tidak lolos');
assert.strictEqual(r.bukti.mendukung, 2); assert.strictEqual(r.bukti.kurangSpesifik, 13); assert.strictEqual(r.bukti.belum, 0);
assert.strictEqual(r.audit.antrean.length, 13); assert.ok(r.audit.aktif);
const item = r.audit.antrean.find(x => /wiring/.test(x.bukti));
assert.strictEqual(item.penilai, 'Kacab Satu');
// audit ulang: tidak ada yang dikirim lagi
const n0 = dikirim.length; r = T({ action: 'tnaAuditBukti', ...auth('A1') }); assert.strictEqual(r.diproses, 0); assert.strictEqual(dikirim.length, n0);

// ---- 6. Tinjauan L&D
r = T({ action: 'tnaTinjauAudit', ...auth('M1'), id: item.id, keputusan: 'TOLAK_AI' }); assert.strictEqual(r.ok, false, 'karyawan tidak boleh meninjau');
r = T({ action: 'tnaTinjauAudit', ...auth('A1'), id: item.id, keputusan: 'TOLAK_AI', catatan: 'Bukti cukup, dicek langsung ke kepala bengkel' }); assert.ok(r.ok, JSON.stringify(r));
r = T({ action: 'tnaKualitasPenilai', ...auth('A1') });
assert.strictEqual(Object.fromEntries(r.penilai.map(x => [x.nik, x])).BH1.aiMasalah, 0, 'setelah L&D menolak putusan AI, bukti tidak dihitung lemah');
assert.strictEqual(r.ringkas.lolos, 33);
assert.strictEqual(r.audit.antrean.find(x => x.id === item.id).status, 'DITINJAU_LD');
// keputusan kelompok: 12 bukti ASH1 yang sama ditinjau sekaligus
const idsASH = r.audit.antrean.filter(x => x.penilai === 'ASS Head').map(x => x.id); assert.strictEqual(idsASH.length, 12);
r = T({ action: 'tnaTinjauAudit', ...auth('A1'), ids: idsASH, keputusan: 'SETUJU_AI' }); assert.ok(r.ok && r.jumlah === 12, JSON.stringify(r));
r = T({ action: 'tnaKualitasPenilai', ...auth('A1') });
assert.ok(r.audit.antrean.filter(x => x.penilai === 'ASS Head').every(x => x.status === 'DITINJAU_LD' && x.keputusanLD === 'SETUJU_AI'), 'semua 12 tertinjau');
assert.strictEqual(Object.fromEntries(r.penilai.map(x => [x.nik, x])).ASH1.aiMasalah, 12, 'L&D setuju AI: tetap dihitung lemah');
assert.ok(/rata-rata 5, penilai lain 3,/.test(Object.fromEntries(r.penilai.map(x => [x.nik, x])).ASH1.temuan.find(t => t.kode === 'MURAH').detail), 'desimal memakai koma');
r = T({ action: 'tnaTinjauAudit', ...auth('A1'), ids: [], keputusan: 'SETUJU_AI' }); assert.strictEqual(r.ok, false);

// ---- 7. Bukti diubah penilai: diaudit ulang
const sh = ACTIVE.getSheetByName('TNA_Asesmen'), hh = sh.data[0];
const ri = sh.data.findIndex(x => x[1] === 'P05' && x[5] === 'BH1');
sh.data[ri][hh.indexOf('Bukti')] = 'Memperbaiki 4 unit gangguan kelistrikan ECU tanpa komplain ulang';
ctx.tnaCacheBatal && ctx.tnaCacheBatal('Asesmen');
r = T({ action: 'tnaKualitasPenilai', ...auth('A1') }); assert.strictEqual(r.bukti.belum, 1, 'bukti berubah menjadi belum diaudit');
r = T({ action: 'tnaAuditBukti', ...auth('A1') }); assert.strictEqual(r.diproses, 1);

// ---- 8. Respons AI rusak tidak merusak data
ctx.UrlFetchApp = { fetchAll: (reqs) => reqs.map(() => ({ getResponseCode: () => 500, getContentText: () => 'error' })) };
sh.data[ri][hh.indexOf('Bukti')] = 'Memperbaiki 5 unit gangguan kelistrikan ECU tanpa komplain ulang';
r = T({ action: 'tnaAuditBukti', ...auth('A1') }); assert.ok(r.ok); assert.strictEqual(r.diproses, 0); assert.strictEqual(r.galat, 1);
assert.strictEqual(r.sisa, 1, 'yang gagal tetap menunggu putaran berikutnya'); assert.strictEqual(r.lanjutOtomatis, false, 'galat layanan: tidak menjadwalkan ulang tanpa henti');
ctx.UrlFetchApp = { fetchAll: (reqs) => reqs.map(() => ({ getResponseCode: () => 403, getContentText: () => 'denied' })) };
r = T({ action: 'tnaAuditBukti', ...auth('A1') }); assert.ok(/GEMINI_API_KEY/.test(r.pesan), 'kunci ditolak dijelaskan: ' + r.pesan);
ctx.UrlFetchApp = { fetchAll: (reqs) => reqs.map(() => ({ getResponseCode: () => 429, getContentText: () => 'quota' })) };
r = T({ action: 'tnaAuditBukti', ...auth('A1') }); assert.ok(r.kuota && /kuota/.test(r.pesan), 'kuota habis dijelaskan');
assert.strictEqual(ACTIVE.getSheetByName('TNA_AuditBukti').data.length - 1, 16, 'galat tidak menulis baris audit');
// ---- 9. Bobot skor aktual dikirim dari Parameter (label di layar tidak lagi angka tetap)
assert.strictEqual(JSON.stringify(T({ action: 'tnaKonteks', ...auth('ASH1') }).bobot), JSON.stringify({ atasan: 0.7, diri: 0.3 }));
ctx.tnaSetParamInternal(ACTIVE, 'BobotAtasan', 0.6); ctx.tnaSetParamInternal(ACTIVE, 'BobotSelf', 0.4);
assert.strictEqual(JSON.stringify(T({ action: 'tnaKonteks', ...auth('ASH1') }).bobot), JSON.stringify({ atasan: 0.6, diri: 0.4 }));
console.log('UJI KUALITAS LULUS');
