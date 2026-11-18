// Uji impor Training Plan 2027 (TNA v4.2) dengan data SINTETIS (bukan data karyawan asli).
// Pakai: node test_plan.js ../../backend/TNA.gs
const assert = require('assert');
const { ctx, ACTIVE, makeSS } = require('./gas_mock.js');
const T = (req) => ctx.handleTNA(req);
const H = ctx.TNA_TAB;

const users = ACTIVE.insertSheet('Users');
users.data = [['NIK', 'PIN', 'Nama', 'Cabang', 'Jabatan', 'Role', 'Atasan NIK', 'NoHP', 'Wajib_Ganti_PIN'],
  ['A1', '1111', 'Admin LD', 'HO', 'L&D', 'Admin', '', '', false],
  ['BH1', '2222', 'Kacab Satu', 'CAB1', 'BRANCH HEAD', 'User', '', '', false],
  ['M1', '5555', 'Mekanik Satu', 'CAB1', 'MEKANIK', 'User', '', '', false],
  ['M2', '6666', 'Mekanik Dua', 'CAB1', 'MEKANIK', 'User', '', '', false],
  ['M3', '7777', 'Mekanik Tiga', 'CAB2', 'MEKANIK', 'User', '', '', false]];
const imp = makeSS('TNA2027_Import');
function tab(name, header, rows) { const s = imp.insertSheet(name); s.data = [header, ...rows]; }
const K = (o) => H.Karyawan.map(k => o[k] ?? '');
const emp = (nik, nama, cab, kj, jt) => K({ NIK: nik, Nama: nama, Cabang: cab, Wilayah: 'W1', Dept: 'SVC', KodeJabatan: kj, JobTitle: jt, Jabatan: jt, PenilaiNIK: 'BH1', ModeAsesmen: 'INDIVIDU', Aktif: 'Y', ValidatorNIK: 'BH1' });
tab('Karyawan', H.Karyawan, [emp('BH1', 'Kacab Satu', 'CAB1', 'J63', 'BRANCH HEAD'), emp('M1', 'Mekanik Satu', 'CAB1', 'J81', 'MEKANIK'), emp('M2', 'Mekanik Dua', 'CAB1', 'J81', 'MEKANIK'), emp('M3', 'Mekanik Tiga', 'CAB2', 'J81', 'MEKANIK')]);
tab('MasterJabatan', H.MasterJabatan, [['J63', 'BRANCH HEAD'], ['J81', 'MEKANIK']].map(([k, j]) => H.MasterJabatan.map(x => ({ KodeJabatan: k, JobTitle: j, StatusMatriks: 'APPROVED' })[x] ?? '')));
tab('Kamus', H.Kamus, ['T-ENG', 'T-ELC', 'B-CUS'].map(k => [k, 'Nama ' + k, k[0] === 'T' ? 'Technical' : 'Behavioral', 'Def', 'l1', 'l2', 'l3', 'l4', 'l5', 'APPROVED']));
tab('Checklist', H.Checklist, ['T-ENG', 'T-ELC', 'B-CUS'].map(k => [k, 'c2', 'c3', 'c4', 'c5']));
tab('Matriks', H.Matriks, [['J81', 'T-ENG', 3, 3, 'JD', ''], ['J81', 'B-CUS', 2, 1, 'JD', '']]);
tab('Task', H.Task, [['J81', 1, 'Service', 'Perbaikan mesin', 'T-ENG']]);
tab('Intervensi', H.Intervensi, []);
const kat = (k, j, c, m, d) => [k, j, c, '', '', m, d, '', '', 'AKTIF'];
tab('Katalog', H.Katalog, [kat('W-AFA', 'Anti Fraud Awareness', 'Wajib', 'E-Learning', 2), kat('IHT-SELL', 'IHT Selling', 'IHT', 'KLASIKAL', 2), kat('IHT-PK', 'IHT PK', 'IHT', 'KLASIKAL', 2), kat('IHT-ASV', 'IHT ASS', 'IHT', 'KLASIKAL', 2), kat('IHT-SELF', 'IHT Self', 'IHT', 'KLASIKAL', 2)]);
tab('Mandatory', H.Mandatory, []);
tab('IHT', H.IHT, [['J81', 'MEKANIK', 3, 3, 8, 8, 8, 8, 32, 'uji']]);
global.__IMPORT = imp;
ctx.tnaImport('x');
const auth = (nik) => ({ nik, pin: users.data.find(r => r[0] === nik)[1] });
const adm = auth('A1');

// ---- Paket Plan sintetis
const batchKol = ['BatchID', 'KodeTraining', 'Judul', 'Kategori', 'Metode', 'Bulan', 'Minggu', 'TanggalMulai', 'TanggalSelesai', 'Lokasi', 'JmlPeserta', 'PesertaProyeksi', 'DurasiJam', 'TotalJam', 'Catatan'];
const itpKol = ['NIK', 'KodeTraining', 'Judul', 'Kategori', 'KodeKompetensi', 'Bulan', 'BatchID', 'Jam', 'Status', 'Alasan'];
const batches = [
  ['K27-001', 'PLN-CB02', 'Communication Level 2', 'Behavioral', 'Online', 'Mar', 1, '2027-03-09', '2027-03-09', 'ONLINE', 4, 0, 6, 24, ''],
  ['K27-002', 'W-AFA', 'Anti Fraud Awareness', 'Wajib korporat', 'Offline HO', 'Jan', 1, '2027-01-12', '2027-01-12', 'HO', 3, 0, 2, 6, ''],
  ['K27-003', 'PLN-VENDOR', 'Vendor Eksternal X', 'Technical', 'Offline Jakarta', 'Jun', 1, '', '', 'JAKARTA', 1, 0, 16, 16, 'Jadwal mengikuti penyelenggara'],
];
const itpRows = [
  ['M1', 'PLN-CB02', 'Communication Level 2', 'WajibGap', 'B-CUS', 'Mar', 'K27-001', 6, 'PLANNED', 'Menutup gap kompetensi Customer'],
  ['M2', 'PLN-CB02', 'Communication Level 2', 'WajibGap', 'B-CUS', 'Mar', 'K27-001', 6, 'PLANNED', 'Menutup gap kompetensi Customer'],
  ['M3', 'PLN-CB02', 'Communication Level 2', 'WajibGap', 'B-CUS', 'Mar', 'K27-001', 6, 'PLANNED', 'Menutup gap kompetensi Customer'],
  ['XX9', 'PLN-CB02', 'Communication Level 2', 'WajibGap', 'B-CUS', 'Mar', 'K27-001', 6, 'PLANNED', 'karyawan sudah keluar'],
  ['M1', 'W-AFA', 'Anti Fraud Awareness', 'Wajib', '', 'Jan', 'K27-002', 2, 'PLANNED', 'Program wajib korporat'],
  ['M2', 'W-AFA', 'Anti Fraud Awareness', 'Wajib', '', 'Jan', 'K27-002', 2, 'PLANNED', 'Program wajib korporat'],
  ['M3', 'W-AFA', 'Anti Fraud Awareness', 'Wajib', '', 'Jan', 'K27-002', 2, 'PLANNED', 'Program wajib korporat'],
  ['BH1', 'PLN-VENDOR', 'Vendor Eksternal X', 'WajibGap', 'T-ENG', 'Jun', 'K27-003', 16, 'PLANNED', 'Program eksternal'],
];
batches[0][10] = 4; batches[0][13] = 24; // peserta termasuk XX9 (dilewati saat bangun output)
const katBaru = [['PLN-CB02', 'Communication Level 2', 'Behavioral', 'B-CUS', 2, 'Online', 6, '', '', 'USULAN_PENGADAAN', ''], ['PLN-VENDOR', 'Vendor Eksternal X', 'Technical', 'T-ENG', 3, 'Offline Jakarta', 16, '', '', 'USULAN_PENGADAAN', '']];
const katKol = H.Katalog;
const matKol = ['KodeJabatan', 'KodeKompetensi', 'RequiredLevel', 'Bobot', 'Sumber', 'Flag'];
const matBaru = [['J81', 'B-CUS', 3, 1, 'Koreksi L&D 12 Nov 2026', ''], ['J81', 'T-ELC', 2, 2, 'Koreksi L&D 12 Nov 2026', '']];

// ---- 1. Otorisasi
let r = T({ action: 'tnaImporPlan', ...auth('BH1'), fase: 'mulai' });
assert.strictEqual(r.ok, false, 'non-admin ditolak');
r = T({ action: 'tnaImporPlan', ...adm, fase: 'tambah', tab: 'PlanITP', kolom: itpKol, rows: itpRows });
assert.strictEqual(r.ok, false, 'tambah sebelum mulai ditolak');

// ---- 2. Unggah
assert.ok(T({ action: 'tnaImporPlan', ...adm, fase: 'mulai', versi: 'uji' }).ok);
r = T({ action: 'tnaImporPlan', ...adm, fase: 'tambah', tab: 'Katalog', kolom: katKol, rows: katBaru }); assert.ok(r.ok && r.baru === 2, JSON.stringify(r));
r = T({ action: 'tnaImporPlan', ...adm, fase: 'tambah', tab: 'Matriks', kolom: matKol, rows: matBaru }); assert.ok(r.ok && r.baru === 1 && r.ubah === 1, JSON.stringify(r)); // B-CUS diubah 2->3, T-ELC baru
r = T({ action: 'tnaImporPlan', ...adm, fase: 'tambah', tab: 'Hapus', kolom: ['KodeKompetensi'], rows: [['T-ELC']] }); assert.ok(r.ok && r.hapus[0].Matriks === 1 && r.hapus[0].Kamus === 1 && r.hapus[0].Checklist === 1, JSON.stringify(r));
r = T({ action: 'tnaImporPlan', ...adm, fase: 'tambah', tab: 'PlanBatch', kolom: batchKol, rows: batches }); assert.ok(r.ok);
r = T({ action: 'tnaImporPlan', ...adm, fase: 'tambah', tab: 'PlanITP', kolom: itpKol.concat(['Bukan']), rows: itpRows });
assert.strictEqual(r.ok, false, 'kolom asing ditolak');
r = T({ action: 'tnaImporPlan', ...adm, fase: 'tambah', tab: 'PlanITP', kolom: itpKol, rows: itpRows.slice(0, 5) }); assert.ok(r.ok);
// selesai sebelum semua baris masuk -> ditolak
r = T({ action: 'tnaImporPlan', ...adm, fase: 'selesai', ringkas: { itp: itpRows.length, batch: batches.length } });
assert.strictEqual(r.ok, false, 'unggahan terputus ditolak'); assert.ok(/tidak cocok/.test(r.error), r.error);
assert.strictEqual(ctx.tnaParam(ACTIVE).SumberITP || '', '', 'belum dipakai');
// setelah ditolak, unggahan harus diulang dari awal
r = T({ action: 'tnaImporPlan', ...adm, fase: 'tambah', tab: 'PlanITP', kolom: itpKol, rows: itpRows.slice(5) }); assert.strictEqual(r.ok, false, 'tambah setelah ditolak harus mulai ulang');
assert.ok(T({ action: 'tnaImporPlan', ...adm, fase: 'mulai', versi: 'uji' }).ok);
r = T({ action: 'tnaImporPlan', ...adm, fase: 'tambah', tab: 'PlanBatch', kolom: batchKol, rows: batches }); assert.ok(r.ok, JSON.stringify(r));
r = T({ action: 'tnaImporPlan', ...adm, fase: 'tambah', tab: 'PlanITP', kolom: itpKol, rows: itpRows.slice(0, 5) }); assert.ok(r.ok, JSON.stringify(r));
r = T({ action: 'tnaImporPlan', ...adm, fase: 'tambah', tab: 'PlanITP', kolom: itpKol, rows: itpRows.slice(5) }); assert.ok(r.ok, JSON.stringify(r));
r = T({ action: 'tnaImporPlan', ...adm, fase: 'selesai', ringkas: { itp: itpRows.length, batch: batches.length }, versi: 'uji-1' });
assert.ok(r.ok, JSON.stringify(r)); assert.strictEqual(r.ringkas.itp, 8); assert.strictEqual(r.ringkas.dilewati, 1);
assert.strictEqual(ctx.tnaParam(ACTIVE).SumberITP, 'PLAN');

// ---- 3. Matriks dan Katalog ter-upsert
const mx = ctx.tnaBacaSheet(ACTIVE, 'Matriks');
assert.strictEqual(Number(mx.find(x => x.KodeJabatan === 'J81' && x.KodeKompetensi === 'B-CUS').RequiredLevel), 3);
assert.ok(!mx.some(x => x.KodeKompetensi === 'T-ELC'), 'kompetensi yang dibuang hilang dari Matriks');
assert.ok(!ctx.tnaBacaSheet(ACTIVE, 'Kamus').some(x => x.KodeKompetensi === 'T-ELC'), 'dan dari Kamus');
assert.ok(ctx.tnaBacaSheet(ACTIVE, 'Kamus').some(x => x.KodeKompetensi === 'T-ENG'), 'kompetensi lain utuh');
assert.ok(ctx.tnaBacaSheet(ACTIVE, 'Katalog').find(x => x.KodeTraining === 'PLN-CB02' && x.Status === 'USULAN_PENGADAAN'));

// ---- 4. Bangun output memakai Plan
const hasil = ctx.tnaBangunOutput(ACTIVE);
console.log('rekon', JSON.stringify(hasil.rekon));
assert.strictEqual(hasil.rekon.sumberITP, 'PLAN');
assert.ok(!ctx.tnaBacaSheet(ACTIVE, 'Gap').some(g => g.KodeKompetensi === 'T-ELC'), 'Gap tidak lagi memuat kompetensi yang dibuang');
assert.strictEqual(hasil.rekon.selisih, 0, 'Plan = ITP = Calendar');
assert.strictEqual(hasil.rekon.planDilewati, 1, 'XX9 dilewati');
const itp = ctx.tnaBacaSheet(ACTIVE, 'ITP'), bat = ctx.tnaBacaSheet(ACTIVE, 'Batch');
const nonIHT = itp.filter(x => x.Kategori !== 'IHT');
assert.strictEqual(nonIHT.length, 7, 'tujuh baris Plan terpakai');
assert.ok(!nonIHT.some(x => x.NIK === 'XX9'));
assert.strictEqual(nonIHT.find(x => x.NIK === 'M1' && x.KodeTraining === 'PLN-CB02').Bulan, 'Mar');
assert.strictEqual(nonIHT.find(x => x.NIK === 'M1' && x.KodeTraining === 'PLN-CB02').BatchID, 'K27-001');
assert.strictEqual(nonIHT.find(x => x.NIK === 'M1' && x.KodeTraining === 'PLN-CB02').Alasan, 'Menutup gap kompetensi Customer');
assert.ok(!nonIHT.some(x => x.Kategori === 'Pengayaan' || x.Kategori === 'Dianjurkan'), 'mesin tidak menambah program di mode Plan');
const b1 = bat.find(x => x.BatchID === 'K27-001'); assert.strictEqual(Number(b1.JmlPeserta), 3); assert.strictEqual(Number(b1.TotalJam), 18, 'dihitung ulang tanpa peserta yang dilewati');
assert.ok(itp.some(x => x.Kategori === 'IHT') && bat.some(x => x.Kategori === 'IHT'), 'IHT Sabtu tetap disusun mesin');
const iht = hasil.rekon.jamIHT, non = hasil.rekon.jamNonIHT; assert.ok(iht / (iht + non) <= hasil.rekon.maksPersenIHT / 100 + 1e-9, 'porsi IHT dalam batas');
assert.strictEqual(hasil.rekon.jamNonIHT, 18 + 6 + 16 - 0, 'jam non-IHT = jam Plan terpakai (18+6+16)');

// ---- 5. ITP karyawan membawa alasan dan batch
ctx.tnaSetParamInternal(ACTIVE, 'ITPRilis', '1');
r = T({ action: 'tnaITPSaya', ...auth('M1') });
assert.ok(r.ok); const row = r.itp.find(x => x.KodeTraining === 'PLN-CB02');
assert.strictEqual(row.Alasan, 'Menutup gap kompetensi Customer'); assert.ok(row.TanggalMulai, 'tanggal batch ikut');
const vendor = T({ action: 'tnaITPSaya', ...adm, target: 'BH1' }).itp.find(x => x.KodeTraining === 'PLN-VENDOR');
assert.ok(vendor && vendor.Bulan === 'Jun' && vendor.TanggalMulai === '', 'kelas vendor tanpa tanggal tetap muncul');

// ---- 6. Output ulang idempoten; lepas Plan kembali ke mesin
const h2 = ctx.tnaBangunOutput(ACTIVE); assert.strictEqual(h2.rekon.selisih, 0); assert.strictEqual(h2.itp, hasil.itp);
r = T({ action: 'tnaImporPlan', ...adm, fase: 'lepas' }); assert.ok(r.ok);
const h3 = ctx.tnaBangunOutput(ACTIVE); assert.strictEqual(h3.rekon.sumberITP, 'MESIN'); assert.strictEqual(h3.rekon.selisih, 0);

// ---- 7. Plan rusak ditolak: peserta merujuk batch yang tidak ada
T({ action: 'tnaImporPlan', ...adm, fase: 'mulai' });
T({ action: 'tnaImporPlan', ...adm, fase: 'tambah', tab: 'PlanBatch', kolom: batchKol, rows: batches });
T({ action: 'tnaImporPlan', ...adm, fase: 'tambah', tab: 'PlanITP', kolom: itpKol, rows: itpRows.map((x, i) => i === 0 ? x.slice(0, 6).concat(['TIDAK-ADA'], x.slice(7)) : x) });
r = T({ action: 'tnaImporPlan', ...adm, fase: 'selesai', ringkas: { itp: itpRows.length, batch: batches.length } });
assert.strictEqual(r.ok, false); assert.ok(/tidak ada/.test(r.error), r.error);
assert.strictEqual(ctx.tnaParam(ACTIVE).SumberITP || '', '');
console.log('SEMUA UJI PLAN LULUS');
