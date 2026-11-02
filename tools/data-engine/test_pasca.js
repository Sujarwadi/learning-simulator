// Uji end-to-end TNA.gs dengan data SINTETIS (bukan data karyawan asli).
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

ctx.tnaSetParamInternal(ACTIVE, 'PascaMulai', HR(300));
// baseline: skor atasan pada asesmen TNA
ctx.tnaTambah(ACTIVE, 'Gap', [{ Periode: 'TNA2027', NIK: 'M1', KodeKompetensi: 'T-ENG', SkorAtasan: 2, Actual: 2.3 }, { Periode: 'TNA2027', NIK: 'M1', KodeKompetensi: 'T-ELC', SkorAtasan: '', Actual: 3 }]);
const BUKTI = 'Menyelesaikan overhaul mesin tanpa komplain ulang bulan lalu';

// 0. Pembanding cadangan: LM1 punya penilaian atasan di Asesmen tetapi belum ada baris Gap
r = T({ action: 'tnaSubmit', ...auth('ASH1'), target: 'LM1', jawaban: { 'T-ENG': { checks: '1100' } } }); assert.ok(r.ok, JSON.stringify(r));
// 1. Daftar tindak lanjut milik atasan langsung
r = T({ action: 'tnaPascaDaftar', ...auth('ASH1') });
assert.strictEqual(r.menunggu.find(x => x.nik === 'LM1').kompetensi[0].levelSebelum, 3, 'tanpa baris Gap, pembanding diambil dari penilaian atasan di Asesmen');
assert.ok(r.ok && r.adaTim, JSON.stringify(r));
assert.strictEqual(JSON.stringify(r.menunggu.map(x => x.nik + ':' + x.kodeTraining).sort()), JSON.stringify(['LM1:T01', 'M1:T01', 'M1:T02']), 'hanya yang jatuh tempo, hadir, bukan pengayaan, sesudah PascaMulai, punya kompetensi terukur');
assert.strictEqual(r.terlambat, 1, 'satu terlambat (200 hari)');
const itM1 = r.menunggu.find(x => x.id.startsWith('M1|T01|'));
assert.strictEqual(itM1.kompetensi[0].kode, 'T-ENG'); assert.strictEqual(itM1.kompetensi[0].levelSebelum, 2, 'baseline = skor atasan, bukan Actual campuran');
assert.strictEqual(r.menunggu.find(x => x.id.startsWith('M1|T02|')).kompetensi[0].levelSebelum, 3, 'tanpa skor atasan memakai Actual');
assert.strictEqual(itM1.kompetensi[0].checklist.length, 4);
// bukan atasan -> daftar kosong
r = T({ action: 'tnaPascaDaftar', ...auth('M1') }); assert.ok(r.ok && !r.adaTim && r.menunggu.length === 0);
// atasan lain tidak melihat bawahan orang lain
r = T({ action: 'tnaPascaDaftar', ...auth('BH1') }); assert.ok(!r.menunggu.some(x => x.nik === 'M1'), 'BH1 bukan atasan langsung M1');

// 2. Simpan: otorisasi dan validasi
const jw = (checks, extra) => ({ 'T-ENG': Object.assign({ checks }, extra || {}) });
r = T({ action: 'tnaPascaSimpan', ...auth('BH1'), id: itM1.id, jawaban: jw('1100') }); assert.strictEqual(r.ok, false, 'bukan atasan langsung ditolak');
r = T({ action: 'tnaPascaSimpan', ...auth('M1'), id: itM1.id, jawaban: jw('1100') }); assert.strictEqual(r.ok, false, 'karyawan tidak boleh menilai dirinya di tindak lanjut');
r = T({ action: 'tnaPascaSimpan', ...auth('ASH1'), id: 'M2|T02|' + HR(60), jawaban: jw('1100') }); assert.strictEqual(r.ok, false, 'belum jatuh tempo ditolak');
r = T({ action: 'tnaPascaSimpan', ...auth('ASH1'), id: 'M1|TXX|' + HR(100), jawaban: jw('1100') }); assert.strictEqual(r.ok, false, 'id palsu ditolak');
r = T({ action: 'tnaPascaSimpan', ...auth('ASH1'), id: itM1.id, jawaban: {} }); assert.strictEqual(r.ok, false, 'jawaban kosong ditolak');
r = T({ action: 'tnaPascaSimpan', ...auth('ASH1'), id: itM1.id, jawaban: jw('1110') }); assert.strictEqual(r.kode, 'BUKTI_KURANG', 'Level 4 wajib bukti');
r = T({ action: 'tnaPascaSimpan', ...auth('ASH1'), id: itM1.id, jawaban: jw('0000', { na: true }) }); assert.strictEqual(r.ok, false, 'N/A tanpa alasan ditolak');
assert.ok(!ACTIVE.getSheetByName('TNA_Pasca') || ACTIVE.getSheetByName('TNA_Pasca').getLastRow() <= 1, 'penolakan tidak menulis apa pun');

// 3. Simpan valid, lalu revisi menimpa (bukan dobel)
r = T({ action: 'tnaPascaSimpan', ...auth('ASH1'), id: itM1.id, jawaban: jw('1100'), dampak: 'Waktu servis turun 10 persen' });
assert.ok(r.ok, JSON.stringify(r)); assert.strictEqual(JSON.stringify(r.ringkas[0]), JSON.stringify({ nama: 'Nama T-ENG', sebelum: 2, sesudah: 3 }));
let rows = ACTIVE.getSheetByName('TNA_Pasca').data.slice(1).filter(x => x[0] === itM1.id);
assert.strictEqual(rows.length, 1); assert.strictEqual(rows[0][9], 3); assert.strictEqual(rows[0][10], 2);
r = T({ action: 'tnaPascaSimpan', ...auth('ASH1'), id: itM1.id, jawaban: jw('1110', { bukti: BUKTI }), dampak: 'Waktu servis turun 10 persen' });
assert.ok(r.ok);
rows = ACTIVE.getSheetByName('TNA_Pasca').data.slice(1).filter(x => x[0] === itM1.id);
assert.strictEqual(rows.length, 1, 'revisi menimpa'); assert.strictEqual(rows[0][9], 4); assert.ok(/overhaul/.test(rows[0][13]));
r = T({ action: 'tnaPascaDaftar', ...auth('ASH1') });
assert.strictEqual(r.menunggu.length, 2); assert.strictEqual(r.selesai.length, 1); assert.strictEqual(r.selesai[0].kompetensi[0].jawaban.checks, 'YYYN', 'jawaban lama tampil untuk revisi');

// 4. Rekap hanya untuk admin dan tim L&D
r = T({ action: 'tnaPascaRekap', ...auth('ASH1') }); assert.strictEqual(r.ok, false, 'atasan biasa tidak boleh melihat rekap');
r = T({ action: 'tnaPascaRekap', ...auth('A1') });
assert.ok(r.ok, JSON.stringify(r));
assert.strictEqual(JSON.stringify([r.ringkas.jatuhTempo, r.ringkas.selesai, r.ringkas.menunggu, r.ringkas.terlambat, r.ringkas.persen]), JSON.stringify([3, 1, 2, 1, 33]));
assert.strictEqual(JSON.stringify([r.ringkas.denganBaseline, r.ringkas.naik, r.ringkas.tetap, r.ringkas.turun, r.ringkas.rataSelisih, r.ringkas.denganDampak]), JSON.stringify([1, 1, 0, 0, 2, 1]), 'sebelum 2 -> sesudah 4: selisih +2');
assert.strictEqual(r.perTraining[0].kode, 'T01'); assert.strictEqual(r.perTraining[0].rata, 2);
assert.strictEqual(r.terlambatPerPenilai[0][0], 'ASS Head'); assert.strictEqual(r.terlambatPerPenilai[0][1], 1);
assert.strictEqual(r.detail.length, 1); assert.strictEqual(r.detail[0].selisih, 2);

// 5. PascaMulai menyaring; parameter hanya admin
ctx.tnaSetParamInternal(ACTIVE, 'PascaMulai', HR(0));
r = T({ action: 'tnaPascaDaftar', ...auth('ASH1') }); assert.strictEqual(r.menunggu.length + r.selesai.length, 0, 'PascaMulai hari ini: belum ada yang jatuh tempo');
assert.strictEqual(T({ action: 'tnaSetParameter', ...auth('ASH1'), parameter: { PascaHari: 30 } }).ok, false);
assert.ok(T({ action: 'tnaSetParameter', ...auth('A1'), parameter: { PascaHari: 30, PascaMulai: HR(300) } }).ok);
r = T({ action: 'tnaPascaDaftar', ...auth('ASH1') });
assert.ok(r.menunggu.some(x => x.nik === 'M2' && x.kodeTraining === 'T02'), 'PascaHari 30: M2 (60 hari lalu) kini jatuh tempo');
assert.strictEqual(T({ action: 'tnaPing' }).versi, '3.9');
console.log('UJI PASCA LULUS');
