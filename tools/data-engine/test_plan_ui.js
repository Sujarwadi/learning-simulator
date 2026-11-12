// Uji UI impor Training Plan 2027 (Studio v3.41, TNA v4.2) di Chromium dengan backend TNA.gs tersimulasi (data sintetis).
const path = require('path');
const { chromium } = require('playwright');
process.argv[2] = require('path').resolve(__dirname, '../../backend/TNA.gs');
const { ctx, ACTIVE, makeSS } = require('./gas_mock.js');

// --- data sintetis seperti test_tna.js
const users = ACTIVE.insertSheet('Users');
users.data = [['NIK', 'PIN', 'Nama', 'Cabang', 'Jabatan', 'Role', 'Atasan NIK', 'NoHP', 'Wajib_Ganti_PIN'],
  ['A1', '1111', 'Admin LD', 'HO', 'L&D Dept Head', 'Admin', '', '', false],
  ['BH1', '2222', 'Kacab Satu', 'CAB1', 'BRANCH HEAD', 'User', '', '', false],
  ['ASH1', '3333', 'Ass Head', 'CAB1', 'AFTER SALES SERVICE HEAD', 'User', '', '', false],
  ['LM1', '4444', 'Leader Mek', 'CAB1', 'LEADER MEKANIK', 'User', '', '', false],
  ['M1', '5555', 'Mekanik Satu', 'CAB1', 'MEKANIK', 'User', '', '', true],
  ['M2', '6666', 'Mekanik Dua', 'CAB1', 'MEKANIK', 'User', '', '', false],
  ['NOH1', '7777', 'Noh Satu', 'HO', 'NOH', 'User', '', '', false]];
const imp = makeSS('imp'); const H = ctx.TNA_TAB;
const tab = (n, rows) => { imp.insertSheet(n).data = [H[n], ...rows.map(o => H[n].map(k => o[k] ?? ''))]; };
const base = { Cabang: 'CAB1', Wilayah: 'W1', Aktif: 'Y', ModeAsesmen: 'INDIVIDU' };
tab('Karyawan', [
  { ...base, NIK: 'BH1', Nama: 'Kacab Satu', Dept: 'OPS', KodeJabatan: 'J63', JobTitle: 'BRANCH HEAD', Jabatan: 'BRANCH HEAD', PenilaiNIK: 'NOH1' },
  { ...base, ValidatorNIK: 'NOH1', NIK: 'ASH1', Nama: 'Ass Head', Dept: 'SVC', KodeJabatan: 'J75', JobTitle: 'AFTER SALES SERVICE HEAD', Jabatan: 'ASS HEAD', PenilaiNIK: 'BH1' },
  { ...base, ValidatorNIK: 'BH1', NIK: 'LM1', Nama: 'Leader Mek', Dept: 'SVC', KodeJabatan: 'J79', JobTitle: 'LEADER MEKANIK', Jabatan: 'LEADER MEKANIK', PenilaiNIK: 'ASH1' },
  { ...base, ValidatorNIK: 'BH1', NIK: 'M1', Nama: 'Mekanik Satu', Dept: 'SVC', KodeJabatan: 'J81', JobTitle: 'MEKANIK', Jabatan: 'MEKANIK', PenilaiNIK: 'ASH1', DelegasiBoleh: 'LEADER MEKANIK' },
  { ...base, ValidatorNIK: 'BH1', NIK: 'M2', Nama: 'Mekanik Dua', Dept: 'SVC', KodeJabatan: 'J81', JobTitle: 'MEKANIK', Jabatan: 'MEKANIK', PenilaiNIK: 'ASH1' },
  { ...base, ValidatorNIK: 'NOH1', NIK: 'S1', Nama: 'Sales Satu', Dept: 'SLS', KodeJabatan: 'J73', JobTitle: 'SALES FORCE', Jabatan: 'SALES JUNIOR', PenilaiNIK: 'BH1', ModeAsesmen: 'KELOMPOK', KelompokID: 'CAB1|SALES JUNIOR' },
]);
tab('MasterJabatan', ['J63', 'J75', 'J79', 'J81', 'J73'].map(k => ({ KodeJabatan: k, JobTitle: k, Dept: 'X', JmlIncumbent: 1, StatusMatriks: 'APPROVED', StatusJD: 'OK' })));
tab('Kamus', [['T-ENG', 'Gasoline & Diesel Engine', 'Technical'], ['B-CUS', 'Customer Focus', 'Behavioral'], ['L-LEAD', 'Leading Others', 'Leadership']]
  .map(([k, n, c]) => ({ KodeKompetensi: k, Nama: n, Kategori: c, Definisi: 'Definisi ' + n, L1: 'l1', L2: 'l2', L3: 'l3', L4: 'l4', L5: 'l5' })));
tab('Checklist', ['T-ENG', 'B-CUS', 'L-LEAD'].map(k => ({ KodeKompetensi: k, C2: k + ' perilaku dasar', C3: k + ' perilaku mandiri', C4: k + ' perilaku mahir', C5: k + ' perilaku ahli' })));
tab('Matriks', [['J81', 'T-ENG', 3], ['J81', 'B-CUS', 2], ['J73', 'B-CUS', 3], ['J63', 'L-LEAD', 4], ['J75', 'L-LEAD', 4], ['J79', 'T-ENG', 4]].map(([j, k, r]) => ({ KodeJabatan: j, KodeKompetensi: k, RequiredLevel: r, Bobot: 2 })));
tab('Katalog', [{ KodeTraining: 'W-AFA', Judul: 'Anti Fraud Awareness', Kategori: 'Wajib', Metode: 'E-Learning', DurasiJam: 2, Status: 'AKTIF' },
  { KodeTraining: 'T01', Judul: 'Engine Diagnosis', Kategori: 'Dianjurkan', KodeKompetensi: 'T-ENG', LevelTarget: 4, Metode: 'Classroom', DurasiJam: 8, Status: 'AKTIF' }]);
tab('Mandatory', [{ KodeJabatan: '*', KodeTraining: 'W-AFA', Dasar: 'Korporat' }]);
['Task', 'Intervensi'].forEach(n => tab(n, []));
tab('Silabus', [{ KodeTraining: 'T01', Judul: 'Engine Diagnosis', Rumpun: 'Technical Service', Kompetensi: 'Gasoline & Diesel Engine', Sasaran: 'Mekanik',
  Tujuan: 'Mendiagnosis gangguan mesin.', Outline: 'Sesi 1 Dasar diagnosa\nSesi 2 Praktik MUT-III', Metode: 'Klasikal', Durasi: '8 jam', Evaluasi: 'Pre/post test', Sumber: 'Folder materi', Status: 'DRAF_AI' },
  { KodeTraining: 'IHT-KYC', Judul: 'IHT Know Your Customer', Rumpun: 'Sales', Tujuan: 'Mengenali karakter pelanggan', Outline: 'Model DISC', Status: 'DRAF_AI' }]);
tab('RekamTraining', [{ NIK: 'M1', Tahun: 2025, Tanggal: '2025-04-01', Judul: 'Engine Diagnosis', Status: 'SELESAI', Jam: 8, PostTest: 85, KodeTNA: 'T01' },
  { NIK: 'M1', Tahun: 2026, Tanggal: '2026-06-06', Judul: '(IHT) KYC', Status: 'TIDAK HADIR', Jam: 2, KodeTNA: 'IHT-KYC' }]);
global.__IMPORT = imp; ctx.tnaImport('x');
ctx.tnaSetParamInternal(ACTIVE, 'WindowBuka', new Date(Date.now() - 3600e3).toISOString());
ctx.tnaSetParamInternal(ACTIVE, 'WindowTutup', new Date(Date.now() + 3600e3).toISOString()); ctx.tnaSetParamInternal(ACTIVE, 'ITPRilis', '1');

// --- mock login/gantiPin (meniru Kode.gs)
function backend(req) {
  const rows = users.data;
  if (req.action === 'login') {
    const u = rows.find(r => r[0] === req.nik); if (!u) return { ok: false, error: 'NIK tidak terdaftar.' };
    if (String(u[1]) !== req.pin) return { ok: false, error: 'PIN salah.' };
    if (u[8] === true) return { ok: true, wajibGantiPin: true, nik: req.nik, nama: u[2] };
    return { ok: true, nama: u[2], cabang: u[3], jabatan: u[4], role: String(u[5]).toLowerCase(), isAtasan: rows.some(r => r[6] === req.nik) };
  }
  if (req.action === 'gantiPin') {
    const u = rows.find(r => r[0] === req.nik); if (String(u[1]) !== req.pinLama) return { ok: false, error: 'PIN lama salah.' };
    u[1] = req.pinBaru; u[8] = false; return { ok: true, nama: u[2], cabang: u[3], jabatan: u[4], role: 'user', isAtasan: false };
  }
  if (String(req.action).startsWith('tna')) return JSON.parse(JSON.stringify(ctx.handleTNA(req)));
  return { ok: false, error: 'Aksi tidak dikenal.' };
}



const fs = require('fs'), os = require('os');
const P = {
  versi: 'Plan uji', dibuat: '2026-11-12',
  PlanBatch: { kolom: ['BatchID', 'KodeTraining', 'Judul', 'Kategori', 'Metode', 'Bulan', 'Minggu', 'TanggalMulai', 'TanggalSelesai', 'Lokasi', 'JmlPeserta', 'PesertaProyeksi', 'DurasiJam', 'TotalJam', 'Catatan'],
    rows: [['K27-001', 'PLN-X', 'Program X', 'WajibGap', 'ONLINE', 'Mar', 2, '2027-03-09', '', 'ONLINE', 2, 0, 6, 12, ''], ['K27-002', 'PLN-V', 'Vendor Y', 'Wajib', 'KLASIKAL', 'Jun', 1, '', '', 'JAKARTA', 1, 0, 0, 0, 'Jadwal mengikuti penyelenggara']] },
  PlanITP: { kolom: ['NIK', 'KodeTraining', 'Judul', 'Kategori', 'KodeKompetensi', 'Bulan', 'BatchID', 'Jam', 'Status', 'Alasan'],
    rows: [['M1', 'PLN-X', 'Program X', 'WajibGap', 'T-ENG', 'Mar', 'K27-001', 6, 'PLANNED', 'Mengembangkan kompetensi Gasoline & Diesel Engine'],
      ['M2', 'PLN-X', 'Program X', 'WajibGap', 'T-ENG', 'Mar', 'K27-001', 6, 'PLANNED', 'Mengembangkan kompetensi Gasoline & Diesel Engine'],
      ['M1', 'PLN-V', 'Vendor Y', 'Wajib', '', 'Jun', 'K27-002', 0, 'PLANNED', 'Program wajib untuk jabatan Anda']] },
  Katalog: { kolom: ctx.TNA_TAB.Katalog, rows: [['PLN-X', 'Program X', 'Dianjurkan', 'T-ENG', '', 'ONLINE', 6, 'Training Plan 2027', '', 'USULAN_PENGADAAN', ''], ['PLN-V', 'Vendor Y', 'Wajib', '', '', 'KLASIKAL', 0, 'Training Plan 2027', '', 'USULAN_PENGADAAN', '']] },
  Matriks: { kolom: ['KodeJabatan', 'KodeKompetensi', 'RequiredLevel', 'Bobot', 'Sumber', 'Flag'], rows: [['J81', 'B-CUS', 3, 2, 'KOREKSI_LD_12NOV2026', 'KOREKSI_LD']] },
  ringkas: { itp: 3, batch: 2, jam: 12 }, laporan: { kursiPlaceholder: 1, programDitunda: 2 },
};
(async () => {
  const browser = await chromium.launch(); const errors = [];
  users.data.find(r => r[0] === 'M1')[8] = false; // sudah ganti PIN
  const file = path.join(os.tmpdir(), 'paket_plan_uji.json'); fs.writeFileSync(file, JSON.stringify(P));
  const rusak = path.join(os.tmpdir(), 'paket_rusak_uji.json'); fs.writeFileSync(rusak, JSON.stringify({ PlanITP: P.PlanITP }));
  const run = async (nik, pin, fn) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    page.on('pageerror', e => errors.push(nik + ': ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(nik + ' console: ' + m.text()); });
    page.on('dialog', d => { page.__dialog = d.message(); d.accept(); });
    await page.route('**/macros/s/**', async route => { const req = JSON.parse(route.request().postData()); await route.fulfill({ contentType: 'application/json', body: JSON.stringify(backend(req)) }); });
    await page.goto('file://' + path.resolve(__dirname, '../../kompetensi/index.html'));
    await page.fill('#inp-nik', nik); await page.fill('#inp-pin', pin); await page.click('#btn-login');
    await fn(page); await page.close();
  };
  const shot = (p, n) => p.screenshot({ path: path.join(os.tmpdir(), 'ui_' + n + '.png'), fullPage: true });
  // 1. Admin: berkas rusak ditolak ramah, paket utuh diunggah, output dibuat
  await run('A1', '1111', async (p) => {
    await p.waitForSelector('#btn-tna-admin', { state: 'visible' }); await p.click('#btn-tna-admin'); await p.waitForSelector('#tna-adm-plan');
    await p.waitForFunction(() => /Belum ada Plan/.test(document.getElementById('tna-adm-plan').textContent));
    if (await p.isVisible('#btn-plan-lepas')) throw new Error('tombol lepas tidak boleh tampil sebelum ada Plan');
    await p.setInputFiles('#plan-file', rusak); await p.waitForSelector('#err-tna-plan.show');
    const e = await p.textContent('#err-tna-plan'); if (!/bukan paket Plan yang utuh/.test(e) || /undefined|JSON|\{/.test(e)) throw new Error('pesan berkas rusak salah: ' + e);
    if (!(await p.$eval('#btn-plan-unggah', b => b.disabled))) throw new Error('tombol unggah harus nonaktif untuk berkas rusak');
    await p.setInputFiles('#plan-file', file); await p.waitForFunction(() => !document.getElementById('btn-plan-unggah').disabled);
    const rg = await p.textContent('#plan-ringkas'); if (!/3 baris peserta, 2 kelas, 12 jam/.test(rg) || !/2 program baru/.test(rg) || !/1 sel matriks dikoreksi/.test(rg) || !/1 kursi tanpa nama/.test(rg)) throw new Error('ringkasan paket salah: ' + rg);
    await shot(p, 'plan_pilih');
    await p.click('#btn-plan-unggah'); await p.waitForFunction(() => /Plan dipakai/.test(document.getElementById('tna-adm-plan').textContent), null, { timeout: 15000 });
    const st = await p.textContent('#tna-adm-plan'); if (!/Plan uji/.test(st) || !/3 baris peserta, 2 kelas/.test(st)) throw new Error('status Plan salah: ' + st);
    if (!(await p.isVisible('#btn-plan-lepas'))) throw new Error('tombol lepas harus tampil setelah Plan dipakai');
    await shot(p, 'plan_dipakai');
    await p.click('#btn-tna-generate'); await p.waitForFunction(() => /Selesai/.test('') || document.getElementById('tna-adm-output').textContent.length > 0 && !document.querySelector('#tna-adm-output .spinner'), null, { timeout: 15000 });
    if (!/Selesai: \d+ baris ITP/.test(p.__dialog || '')) throw new Error('generate tidak selesai: ' + p.__dialog);
  });
  // 2. Karyawan: ITP memuat alasan, bulan Plan, dan "jam menyusul" untuk program eksternal
  await run('M1', '5555', async (p) => {
    await p.waitForSelector('#scr-tna-home.active'); await p.click('#btn-tna-itp'); await p.waitForSelector('#tna-itp-body .ev', { timeout: 10000 });
    const t = await p.textContent('#tna-itp-body');
    if (!/Program X/.test(t) || !/Vendor Y/.test(t)) throw new Error('program Plan tidak tampil');
    if (!/Program wajib untuk jabatan Anda/.test(t)) throw new Error('alasan tidak tampil');
    if (!/jam menyusul/.test(t)) throw new Error('program tanpa durasi harus "jam menyusul"');
    if (/Menutup gap|skor|undefined|NaN|\[object/i.test(t)) throw new Error('teks tidak pantas di ITP karyawan: ' + t.slice(0, 300));
    await shot(p, 'plan_itp');
  });
  // 3. Lepas Plan
  await run('A1', '1111', async (p) => {
    await p.click('#btn-tna-admin'); await p.waitForSelector('#btn-plan-lepas', { state: 'visible' });
    await p.click('#btn-plan-lepas'); await p.waitForFunction(() => /Belum ada Plan/.test(document.getElementById('tna-adm-plan').textContent));
  });
  await browser.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exit(1); }
  console.log('UI PLAN OK');
})().catch(e => { console.error('GAGAL', e); process.exit(1); });
