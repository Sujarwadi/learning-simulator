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

// ---- 2. Konteks
r = T({ action: 'tnaKonteks', ...auth('ASH1') });
assert.strictEqual(JSON.stringify(r.tugas.map(t => t.nik).sort()), JSON.stringify(['LM1', 'M1', 'M2']));
r = T({ action: 'tnaKonteks', ...auth('BH1') });
assert.strictEqual(r.kelompok.length, 1); assert.strictEqual(r.kelompok[0].anggota, 2);
r = T({ action: 'tnaKonteks', ...auth('LM1') });
assert.strictEqual(JSON.stringify(r.delegasi.map(t => t.nik).sort()), JSON.stringify(['M1', 'M2']));
// otorisasi: M1 tidak boleh menilai M2
r = T({ action: 'tnaForm', ...auth('M1'), target: 'M2' });
assert.strictEqual(r.ok, false, 'rekan tidak boleh menilai');
// PIN salah
r = T({ action: 'tnaKonteks', nik: 'M1', pin: '0000' }); assert.strictEqual(r.ok, false);

// ---- 3. Submit
const J = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, { checks: v }]));
// M1 oleh ASS Head: T-ENG L2 (YNNN), T-ELC L3 (YYNN), B-CUS L4 (YYYN)
r = T({ action: 'tnaSubmit', ...auth('ASH1'), target: 'M1', jawaban: J({ 'T-ENG': '0000', 'T-ELC': '1100', 'B-CUS': '1110' }) });
assert.ok(r.ok, JSON.stringify(r));
// submit tidak lengkap ditolak
r = T({ action: 'tnaSubmit', ...auth('ASH1'), target: 'M2', jawaban: J({ 'T-ENG': '1000' }) });
assert.strictEqual(r.ok, false);
// self M1: T-ENG L5 (YYYY) -> selisih 3 -> KALIBRASI ; T-ELC L3
r = T({ action: 'tnaSubmit', ...auth('M1'), target: 'M1', jawaban: J({ 'T-ENG': '1111', 'T-ELC': '1100', 'B-CUS': '1110' }) });
assert.ok(r.ok);
// M2 oleh delegasi Leader -> menunggu approval
r = T({ action: 'tnaSubmit', ...auth('LM1'), target: 'M2', jawaban: J({ 'T-ENG': '1100', 'T-ELC': '1010', 'B-CUS': '1000' }) });
assert.strictEqual(r.status, 'MENUNGGU_APPROVAL');
r = T({ action: 'tnaKonteks', ...auth('ASH1') }); assert.strictEqual(r.menungguApproval.length, 1);
r = T({ action: 'tnaApprove', ...auth('ASH1'), target: 'M2' }); assert.strictEqual(r.jumlah, 3);
// Kelompok sales oleh Kacab: B-CUS L2
r = T({ action: 'tnaSubmit', ...auth('BH1'), kelompokId: 'CAB1|SALES JUNIOR', jawaban: J({ 'B-CUS': '1000' }) });
assert.ok(r.ok);
// Kacab dinilai NOH1 saja (L2) -> RATER TUNGGAL ; revisi: NOH1 submit dua kali, yang dipakai terakhir (L3)
T({ action: 'tnaSubmit', ...auth('NOH1'), target: 'BH1', jawaban: J({ 'L-LEAD': '1000' }) });
r = T({ action: 'tnaSubmit', ...auth('NOH1'), target: 'BH1', jawaban: J({ 'L-LEAD': '1100' }) });
assert.ok(r.ok);
// N/A tanpa alasan ditolak, dengan alasan diterima
r = T({ action: 'tnaSubmit', ...auth('ASH1'), target: 'LM1', jawaban: { 'T-ENG': { checks: '0000', na: true } } });
assert.strictEqual(r.ok, false);
r = T({ action: 'tnaSubmit', ...auth('ASH1'), target: 'LM1', jawaban: { 'T-ENG': { checks: '0000', na: true, alasan: 'baru mutasi' } } });
assert.ok(r.ok);

const ases = ACTIVE.getSheetByName('TNA_Asesmen').data.filter(x => x[0] === 'TNA2027');
assert.strictEqual(ases.filter(x => x[5] === 'NOH1').length, 1, 'revisi menimpa, bukan dobel');

// ---- 4. Progres
r = T({ action: 'tnaProgres', ...auth('A1') });
console.log('progres', r.selesai + '/' + r.total, r.persen + '%');
assert.strictEqual(r.total, 7);
// Lingkup tim (v2.6): langsung <= bawahan <= semua; non-admin tidak bisa memaksa "semua"
{
  const L = (nik, lk) => T({ action: 'tnaProgres', ...auth(nik), lingkup: lk });
  const lang = L('BH1', 'langsung'), baw = L('BH1', 'bawahan'), sem = L('BH1', 'semua');
  console.log('lingkup BH1: langsung', lang.total, 'bawahan', baw.total, 'semua->', sem.lingkup.pilih, sem.total);
  assert.ok(lang.total >= 1 && lang.total <= baw.total && baw.total < 7, 'langsung <= bawahan < seluruh');
  assert.notStrictEqual(sem.lingkup.pilih, 'semua', 'non-admin ditolak memilih semua');
  assert.strictEqual(sem.total, lang.total, 'permintaan semua dari non-admin jatuh ke bawaan, bukan seluruh BBM');
  assert.strictEqual(L('A1', 'semua').total, 7);
  assert.strictEqual(L('A1', 'semua').lingkup.jumlah.semua, 7);
  assert.strictEqual(baw.lingkup.jumlah.langsung, lang.total);
  assert.strictEqual(T({ action: 'tnaTim', ...auth('BH1'), lingkup: 'langsung' }).lingkup.pilih, 'langsung');
}

// Otorisasi dosier jabatan (v2.7): non-L&D hanya jabatan sendiri dan tim; admin semua
{
  const dM = T({ action: 'tnaMatriksJabatan', ...auth('M1') });
  assert.strictEqual(JSON.stringify(dM.jabatan.map(j => j.kode)), '["J81"]', 'mekanik hanya melihat jabatannya');
  assert.strictEqual(T({ action: 'tnaDosierJabatan', ...auth('M1'), kodeJabatan: 'J81' }).ok, true);
  assert.strictEqual(T({ action: 'tnaDosierJabatan', ...auth('M1'), kodeJabatan: 'J63' }).ok, false, 'dosier jabatan lain ditolak');
  assert.strictEqual(T({ action: 'tnaMatriksJabatan', ...auth('M1'), kodeJabatan: 'J63' }).ok, false);
  const dB = T({ action: 'tnaMatriksJabatan', ...auth('ASH1') }).jabatan.map(j => j.kode);
  assert.ok(dB.includes('J75') && dB.includes('J81') && !dB.includes('J63') && !dB.includes('J73'), 'head: jabatan sendiri + bawahan saja: ' + dB);
  assert.ok(T({ action: 'tnaMatriksJabatan', ...auth('A1') }).jabatan.length >= 5, 'admin melihat semua');
  assert.strictEqual(T({ action: 'tnaDosierJabatan', ...auth('A1'), kodeJabatan: 'J63' }).ok, true);
}
// ---- 5. Output
// ---- 3b. Hasil live & validasi Head unit
let h = T({ action: 'tnaHasil', ...auth('ASH1'), target: 'M1' });
assert.ok(h.ok, JSON.stringify(h)); assert.ok(h.dinilai);
assert.strictEqual(h.validasi.status, 'MENUNGGU_VALIDASI', 'submit atasan -> menunggu validasi');
assert.ok(h.gap.length === 3 && h.rekomendasi.length >= 1, 'gap & rekomendasi langsung tersedia');
assert.strictEqual(h.bisaValidasi, false, 'penilai bukan validator');
const r70Awal = h.rekomendasi.find(x => x.KodeKompetensi === 'T-ENG').R70_Penugasan;
assert.strictEqual(T({ action: 'tnaHasil', ...auth('M1'), target: 'M1' }).ok, false, 'self belum bisa lihat sebelum validasi');
assert.strictEqual(T({ action: 'tnaValidasi', ...auth('ASH1'), target: 'M1', aksi: 'SETUJUI' }).ok, false, 'penilai tidak boleh memvalidasi');
let kt = T({ action: 'tnaKonteks', ...auth('BH1') });
assert.ok(kt.validasi.some(v => v.kunci === 'M1' && v.status === 'MENUNGGU_VALIDASI' && v.ringkasan), 'muncul di daftar validasi Kacab');
h = T({ action: 'tnaHasil', ...auth('BH1'), target: 'M1' }); assert.strictEqual(h.bisaValidasi, true);
// validator edit: R70 diganti & training T-ENG dipilih manual
r = T({ action: 'tnaValidasi', ...auth('BH1'), target: 'M1', aksi: 'SETUJUI', catatan: 'ok', edit: { 'T-ENG': { r70: 'Pegang 2 kasus overhaul mesin', r10: 'T01' } } });
assert.ok(r.ok, JSON.stringify(r));
assert.strictEqual(T({ action: 'tnaHasil', ...auth('M1'), target: 'M1' }).ok, false, 'karyawan tidak melihat gap/rekomendasi walau sudah divalidasi');
h = T({ action: 'tnaHasil', ...auth('BH1'), target: 'M1' });
assert.strictEqual(h.rekomendasi.find(x => x.KodeKompetensi === 'T-ENG').R70_Penugasan, 'Pegang 2 kasus overhaul mesin');
// kembalikan M2 -> asesmen atasan tidak dihitung, penilai lihat catatan, revisi -> menunggu lagi
assert.strictEqual(T({ action: 'tnaValidasi', ...auth('BH1'), target: 'M2', aksi: 'KEMBALIKAN' }).ok, false, 'kembalikan wajib catatan');
r = T({ action: 'tnaValidasi', ...auth('BH1'), target: 'M2', aksi: 'KEMBALIKAN', catatan: 'Electrical terlalu rendah, cek ulang' }); assert.ok(r.ok);
kt = T({ action: 'tnaKonteks', ...auth('ASH1') });
const m2 = kt.tugas.find(t => t.nik === 'M2'); assert.strictEqual(m2.validasi, 'DIKEMBALIKAN'); assert.ok(/Electrical/.test(m2.catatanValidasi));
assert.strictEqual(T({ action: 'tnaHasil', ...auth('ASH1'), target: 'M2' }).dinilai, false, 'rating dikembalikan tidak dihitung');
r = T({ action: 'tnaSubmit', ...auth('ASH1'), target: 'M2', jawaban: J({ 'T-ENG': '1100', 'T-ELC': '1100', 'B-CUS': '1000' }) }); assert.ok(r.ok && r.lihatHasil);
assert.strictEqual(T({ action: 'tnaHasil', ...auth('BH1'), target: 'M2' }).validasi.status, 'MENUNGGU_VALIDASI');
// dua validator (NOH1 & NOH2): keduanya melihat item yang sama
assert.ok(T({ action: 'tnaKonteks', ...auth('NOH2') }).validasi.some(v => v.kelompokId === 'CAB1|SALES JUNIOR'), 'NOH2 juga validator kelompok');
// bukti centangan penilai untuk validator
h = T({ action: 'tnaHasil', ...auth('BH1'), target: 'M2' });
assert.ok(h.bukti['T-ENG'] && h.bukti['T-ENG'].penilai.some(x => x.peran === 'ATASAN' && x.checks === 'YYNN') && h.bukti['T-ENG'].checklist.length === 4, 'bukti centangan');
assert.ok(T({ action: 'tnaKonteks', ...auth('ASH1') }).todo, 'todo ada di konteks');
// validasi massal kelompok sales oleh NOH1
kt = T({ action: 'tnaKonteks', ...auth('NOH1') });
const kSales = kt.validasi.find(v => v.kelompokId === 'CAB1|SALES JUNIOR'); assert.ok(kSales, 'kelompok sales masuk daftar validasi NOH');
r = T({ action: 'tnaValidasiMassal', ...auth('NOH1'), targets: [kSales.kunci, 'M1'] });
assert.strictEqual(r.disetujui, 1); assert.strictEqual(r.dilewati, 1, 'M1 bukan milik NOH1 -> dilewati');
assert.ok(T({ action: 'tnaKonteks', ...auth('NOH2') }).validasi.find(v => v.kelompokId === 'CAB1|SALES JUNIOR').status === 'DISETUJUI', 'disetujui NOH1 -> selesai juga bagi NOH2');
// self-rating sesudah disetujui -> kembali menunggu validasi
r = T({ action: 'tnaSubmit', ...auth('M1'), target: 'M1', jawaban: J({ 'T-ENG': '1111', 'T-ELC': '1100', 'B-CUS': '1110' }) }); assert.ok(r.ok);
assert.strictEqual(T({ action: 'tnaHasil', ...auth('BH1'), target: 'M1' }).validasi.status, 'MENUNGGU_VALIDASI');
T({ action: 'tnaValidasi', ...auth('BH1'), target: 'M1', aksi: 'SETUJUI', edit: { 'T-ENG': { r70: 'Pegang 2 kasus overhaul mesin', r10: 'T01' } } });
const hasilLive = T({ action: 'tnaHasil', ...auth('BH1'), target: 'M1' });

r = T({ action: 'tnaGenerateOutput', ...auth('A1') });
assert.ok(r.ok, JSON.stringify(r));
console.log('hasil', JSON.stringify(r.hasil));
const gap = ctx.tnaBaca(ACTIVE, 'Gap');
const g = (nik, k) => gap.find(x => x.NIK === nik && x.KodeKompetensi === k);
// v2.5 (keputusan 27 Okt): aktual dibulatkan ke level utuh. M1 T-ENG: A=1, S=5 -> 0.7*1+0.3*5 = 2.2 -> 2 ; syarat 3 ; gap 1 ; bobot 3 -> prio 3 ; Minor ; KALIBRASI
assert.strictEqual(g('M1', 'T-ENG').Actual, 2); assert.strictEqual(g('M1', 'T-ENG').Gap, 1);
assert.strictEqual(g('M1', 'T-ENG').Prioritas, 3); assert.strictEqual(g('M1', 'T-ENG').KategoriGap, 'Minor');
assert.ok(/KALIBRASI/.test(g('M1', 'T-ENG').Flag));
// M1 T-ELC: A=3,S=3 -> 3, gap 0 Kompeten
assert.strictEqual(g('M1', 'T-ELC').Gap, 0); assert.strictEqual(g('M1', 'T-ELC').KategoriGap, 'Kompeten');
// M2 T-ELC: delegasi "1010" (L2) dikembalikan validator, direvisi ASS Head "1100" -> L3 ; tanpa self -> actual 3, Kompeten
assert.strictEqual(g('M2', 'T-ELC').Actual, 3); assert.strictEqual(g('M2', 'T-ELC').KategoriGap, 'Kompeten');
// Sales kelompok: B-CUS req 3, A=2 -> gap 1 untuk S1 dan S2, tanpa self
assert.strictEqual(g('S1', 'B-CUS').Gap, 1); assert.strictEqual(g('S2', 'B-CUS').Gap, 1);
// BH1: L-LEAD L3 (revisi), req 4 -> gap 1, flag RATER TUNGGAL
assert.strictEqual(g('BH1', 'L-LEAD').Actual, 3); assert.ok(/RATER TUNGGAL/.test(g('BH1', 'L-LEAD').Flag));
// LM1 N/A -> BELUM DINILAI, tidak dihitung 0
assert.strictEqual(g('LM1', 'T-ENG').KategoriGap, 'BELUM DINILAI'); assert.strictEqual(g('LM1', 'T-ENG').Gap, '');
// ASH1 belum dinilai
assert.strictEqual(g('ASH1', 'L-LEAD').KategoriGap, 'BELUM DINILAI');

const itp = ctx.tnaBaca(ACTIVE, 'ITP');
// Semua 7 orang dapat 2 training wajib korporat di Q1
['BH1', 'ASH1', 'LM1', 'M1', 'M2', 'S1', 'S2'].forEach(n => {
  ['W-AFA', 'W-AIDW'].forEach(k => { const x = itp.find(i => i.NIK === n && i.KodeTraining === k); assert.ok(x, n + k); assert.ok(['Jan', 'Feb', 'Mar'].includes(x.Bulan)); assert.strictEqual(x.Kategori, 'Wajib'); });
});
// Mekanik dapat T01 sebagai Wajib (syarat JD), tidak dobel sebagai Dianjurkan
assert.strictEqual(itp.filter(i => i.NIK === 'M1' && i.KodeTraining === 'T01').length, 1);
assert.strictEqual(itp.find(i => i.NIK === 'M1' && i.KodeTraining === 'T01').Kategori, 'Wajib');
// M2 setelah revisi tidak ada gap T-ELC -> T02 tidak dianjurkan (training ikut hasil terbaru yang valid)
assert.ok(!itp.some(i => i.NIK === 'M2' && i.KodeTraining === 'T02'));
// Pengayaan OPSIONAL hanya mengisi sampai target
assert.ok(itp.filter(i => i.Kategori === 'Pengayaan').every(i => i.Status === 'OPSIONAL'));
// Batch kapasitas & ID terisi
assert.ok(itp.every(i => i.BatchID));
const rek = JSON.parse(ctx.tnaParam(ACTIVE).Rekonsiliasi);
assert.strictEqual(rek.selisih, 0); console.log('rekonsiliasi', rek);
const rekom = ctx.tnaBaca(ACTIVE, 'Rekomendasi');
assert.ok(!rekom.some(x => /ditunda|Tidak dijadwalkan/.test(x.R10_Training)), 'v2.3: training gap tidak pernah ditunda/ditiadakan');
assert.ok(rekom.filter(x => x.NIK === 'S1').every(x => /wajib|GAP KATALOG/.test(x.R10_Training)), 'gap behavioral juga wajib training / gap katalog');
assert.ok(!ctx.tnaBaca(ACTIVE, 'ITP').some(x => x.Kategori === 'Dianjurkan'), 'kategori Dianjurkan tidak dipakai lagi');
assert.ok(/perbaikan mesin bensin/.test(r70Awal), '70 dari task JD (sebelum diedit validator)');
assert.strictEqual(rekom.find(x => x.NIK === 'M1' && x.KodeKompetensi === 'T-ENG').DiubahValidator, '70,10');
const proy = ctx.tnaBaca(ACTIVE, 'Proyeksi');
const pm2 = proy.find(x => x.NIK === 'M2');
const sumBulan = ctx.TNA_BULAN.reduce((s, b) => s + Number(pm2[b]), 0);
assert.ok(Math.abs(sumBulan - pm2.TotalJam) < 0.05, 'total = jumlah bulan');
console.log('proyeksi M2', JSON.stringify(pm2));
console.log('dokumen', created.map(c => c.name + ' [' + c.sheets.map(s => s.name + ':' + (s.data.length - 1)).join(', ') + ']').join('\n'));
assert.strictEqual(created.length, 5);
// ITP saya: M1 bisa lihat diri sendiri, M1 tidak bisa lihat M2, ASH1 bisa lihat M2
assert.ok(T({ action: 'tnaITPSaya', ...auth('M1') }).ok);
assert.strictEqual(T({ action: 'tnaITPSaya', ...auth('M1'), target: 'M2' }).ok, false);
assert.ok(T({ action: 'tnaITPSaya', ...auth('ASH1'), target: 'M2' }).ok);
// window tutup -> submit ditolak untuk non admin
ctx.tnaSetParamInternal(ACTIVE, 'WindowTutup', new Date(Date.now() - 1000).toISOString());
assert.strictEqual(T({ action: 'tnaSubmit', ...auth('ASH1'), target: 'M2', jawaban: J({ 'T-ENG': '1000', 'T-ELC': '1000', 'B-CUS': '1000' }) }).ok, false);
// Output memakai hasil validasi: edit validator terbawa, StatusValidasi terisi, live = output
const rekOut = ctx.tnaBaca(ACTIVE, 'Rekomendasi').filter(x => x.NIK === 'M1');
assert.strictEqual(rekOut.find(x => x.KodeKompetensi === 'T-ENG').R70_Penugasan, 'Pegang 2 kasus overhaul mesin');
assert.ok(rekOut.every(x => x.StatusValidasi === 'DISETUJUI'));
assert.strictEqual(JSON.stringify(rekOut.map(x => [x.KodeKompetensi, x.R10_Training])), JSON.stringify(hasilLive.rekomendasi.map(x => [x.KodeKompetensi, x.R10_Training])), 'rekomendasi live = output');
const itpOut = ctx.tnaBaca(ACTIVE, 'ITP');
assert.ok(itpOut.some(x => x.NIK === 'M1' && x.KodeTraining === 'T01'), 'training pilihan validator masuk ITP');
assert.ok(itpOut.filter(x => x.NIK === 'M2').every(x => x.StatusValidasi === 'BELUM VALIDASI'), 'M2 belum divalidasi -> flag');
assert.ok(ctx.tnaBaca(ACTIVE, 'Gap').filter(x => x.NIK === 'S1').every(x => x.StatusValidasi === 'DISETUJUI'), 'kelompok disetujui massal');
// Karyawan: hanya ITP + kalender (tanggal/lokasi batch), tanpa gap & rekomendasi
// gerbang rilis: sebelum dirilis karyawan dan atasan tidak melihat ITP, admin tetap melihat
{ const blm = T({ action: 'tnaITPSaya', ...auth('M1') }); assert.ok(blm.ok && blm.belumRilis === true && blm.itp.length === 0 && blm.rekomendasi.length === 0, 'M1 sebelum rilis tidak melihat ITP');
  const adm = T({ action: 'tnaITPSaya', ...auth('A1'), target: 'M1' }); assert.ok(adm.ok && adm.itp.length > 0, 'admin melihat ITP sebelum rilis (pratinjau)');
  const tt = T({ action: 'tnaTrainingTim', ...auth('BH1') }); assert.strictEqual(tt.terbit, false, 'rencana tim belum terbit sebelum rilis');
  ctx.tnaSetParamInternal(ACTIVE, 'ITPRilis', '1'); const ttb = T({ action: 'tnaTrainingTim', ...auth('BH1') }); assert.strictEqual(ttb.terbit, true, 'rencana tim terbit setelah rilis'); }
const itpSaya = T({ action: 'tnaITPSaya', ...auth('M1') });
assert.ok(itpSaya.ok && itpSaya.hanyaITP && itpSaya.itp.length && !itpSaya.gap.length && !itpSaya.rekomendasi.length);
assert.ok(itpSaya.itp.every(x => x.TanggalMulai && x.Lokasi), 'ITP karyawan memuat jadwal batch');
const itpAtasan = T({ action: 'tnaITPSaya', ...auth('BH1'), target: 'M1' }); assert.ok(itpAtasan.gap.length, 'validator tetap lihat gap');
// ---- P1: cache, draft server, form tim, dashboard tim, pemantauan, pengingat
const kam1 = ctx.tnaBaca(ACTIVE, 'Kamus').length;
ACTIVE.getSheetByName('TNA_Kamus').data.push(['X-NEW', 'Baru', 'Technical', 'd', 'l1', 'l2', 'l3', 'l4', 'l5', 'DRAFT']);
assert.strictEqual(ctx.tnaBaca(ACTIVE, 'Kamus').length, kam1, 'cache dipakai (perubahan manual sheet belum terbaca)');
ctx.tnaTulisUlang(ACTIVE, 'Kamus', ctx.tnaBacaSheet(ACTIVE, 'Kamus'));
assert.strictEqual(ctx.tnaBaca(ACTIVE, 'Kamus').length, kam1 + 1, 'tulis ulang membatalkan cache');
// draft server
ctx.tnaSetParamInternal(ACTIVE, 'WindowTutup', new Date(Date.now() + 3600e3).toISOString());
r = T({ action: 'tnaSimpanDraft', ...auth('ASH1'), target: 'LM1', jawaban: { 'T-ENG': { checks: 'YNNN' } } }); assert.ok(r.ok, JSON.stringify(r));
assert.strictEqual(T({ action: 'tnaForm', ...auth('ASH1'), target: 'LM1' }).draft.jawaban['T-ENG'].checks, 'YNNN', 'draft terbaca di perangkat lain');
assert.strictEqual(T({ action: 'tnaSimpanDraft', ...auth('M1'), target: 'M2', jawaban: {} }).ok, false, 'tidak boleh draft untuk orang lain');
// form tim + submit tim
let ft = T({ action: 'tnaFormTim', ...auth('ASH1') });
assert.ok(ft.ok && ft.orang.length >= 1 && ft.kompetensi.length, JSON.stringify(ft).slice(0, 200));
assert.ok(ft.daftar.some(d => d.kode === 'J81' && d.jumlah === 2));
ft = T({ action: 'tnaFormTim', ...auth('ASH1'), kodeJabatan: 'J81' });
assert.strictEqual(ft.orang.length, 2);
r = T({ action: 'tnaSimpanDraft', ...auth('ASH1'), drafts: [{ target: 'M1', jawaban: { 'T-ENG': { checks: 'YYNN' } } }, { target: 'M2', jawaban: { 'T-ENG': { checks: 'YNNN' } } }] }); assert.ok(r.ok);
r = T({ action: 'tnaSubmitTim', ...auth('ASH1'), jawabanPer: { M1: J({ 'T-ENG': '1100', 'T-ELC': '1100', 'B-CUS': '1100' }), M2: J({ 'T-ENG': '1000' }) } });
assert.strictEqual(r.terkirim, 1, 'yang tidak lengkap ditolak per orang'); assert.ok(r.hasil.find(x => x.nik === 'M2' && !x.ok));
assert.ok(!T({ action: 'tnaFormTim', ...auth('ASH1'), kodeJabatan: 'J81' }).orang.find(o => o.nik === 'M1').draft, 'draft terhapus setelah submit');
// dashboard tim
assert.strictEqual(T({ action: 'tnaTim', ...auth('BH1') }).lingkup.pilih, 'langsung', 'bawaan = tim langsung');
let dt = T({ action: 'tnaTim', ...auth('BH1'), lingkup: 'bawahan' });
assert.ok(dt.ok && dt.ringkasan.orang >= 4 && dt.baris.length && dt.kompetensi.length, JSON.stringify(dt).slice(0, 300));
assert.ok(dt.baris.every(b => b.sel.length === dt.kompetensi.length), 'heatmap persegi');
assert.ok(T({ action: 'tnaTim', ...auth('M1') }).kosong, 'mekanik tanpa tim');
assert.ok(T({ action: 'tnaTim', ...auth('NOH2') }).ringkasan, 'validator kedua punya lingkup');
// training tim (output sudah ada)
const tt = T({ action: 'tnaTrainingTim', ...auth('BH1') }); assert.ok(tt.terbit && tt.grup.length && tt.grup.every(x => x.bulan && x.jumlah >= 1) && tt.denganNama && tt.grup.some(g => g.nama.length));
// pemantauan & pengingat (pratinjau; kirimWA tidak tersedia di mock -> kirim ditolak dengan pesan jelas)
const pt = T({ action: 'tnaPantau', ...auth('A1') }); assert.ok(pt.ok && pt.penilai.length && pt.validator.length);
assert.strictEqual(T({ action: 'tnaPantau', ...auth('BH1') }).ok, false);
const pg = T({ action: 'tnaPengingat', ...auth('A1') }); assert.ok(pg.pratinjau && pg.jumlah >= 1 && /Pengingat TNA 2027/.test(pg.contoh), JSON.stringify(pg));
assert.ok(/kirimWA/.test(T({ action: 'tnaPengingat', ...auth('A1'), kirim: true }).error));
console.log('\nSEMUA UJI LULUS');
