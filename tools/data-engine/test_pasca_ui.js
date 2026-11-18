// Uji UI Studio v3.0 di Chromium dengan backend TNA.gs tersimulasi (data sintetis).
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


const HR = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
(async () => {
  const browser = await chromium.launch();
  const errors = [];
  // data uji: PascaMulai awal, rekam training baru, dan baseline atasan
  ctx.tnaSetParamInternal(ACTIVE, 'PascaMulai', '2025-01-01');
  const rk = ctx.tnaBaca(ACTIVE, 'RekamTraining');
  ctx.tnaTambah(ACTIVE, 'RekamTraining', [{ NIK: 'LM1', Tahun: 2026, Tanggal: HR(100), Judul: 'Engine Diagnosis', Status: 'HADIR', Jam: 8, KodeTNA: 'T01' }]);
  ctx.tnaTambah(ACTIVE, 'Gap', [{ Periode: 'TNA2027', NIK: 'M1', KodeKompetensi: 'T-ENG', SkorAtasan: 2, Actual: 2.3 }]);
  const run = async (nik, pin, fn, vp) => {
    const page = await browser.newPage({ viewport: vp || { width: 390, height: 844 } });
    await page.addInitScript(() => { window.claude = { use: async n => n === 'downloads' ? { save: async ({ filename, data }) => { window.__simpan = { filename, ukuran: data.size }; return { status: 'saved' }; } } : null }; const g = Storage.prototype.getItem; Storage.prototype.getItem = function (k) { return String(k).startsWith('bblc_panduan_') ? '1' : g.call(this, k); }; });
    page.on('pageerror', e => errors.push(nik + ': ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(nik + ' console: ' + m.text()); });
    page.on('dialog', d => { page.__dialog = d.message(); d.accept(); });
    await page.route('**/macros/s/**', async route => {
      const req = JSON.parse(route.request().postData());
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(backend(req)) });
    });
    await page.goto('file://' + require('path').resolve(__dirname, '../../kompetensi/index.html'));
    await page.fill('#inp-nik', nik); await page.fill('#inp-pin', pin); await page.click('#btn-login');
    await fn(page); await page.close();
  };
  const shot = (p, n) => p.screenshot({ path: require('path').join(require('os').tmpdir(), 'ui_' + n + '.png'), fullPage: true });

  // 1. Karyawan biasa tanpa bawahan: tile tidak tampil
  await run('M2', '6666', async (p) => {
    await p.waitForSelector('#scr-tna-home.active'); await p.waitForTimeout(1200);
    if (await p.isVisible('#btn-tna-pasca')) throw new Error('tile tindak lanjut tidak boleh tampil bagi yang tidak punya bawahan');
  });
  // 2. Atasan langsung: tile + isi tindak lanjut (Level 4 wajib bukti)
  await run('ASH1', '3333', async (p) => {
    await p.waitForSelector('#scr-tna-home.active'); await p.waitForSelector('#btn-tna-pasca', { state: 'visible' });
    const d = await p.textContent('#pasca-tile-d'); if (!/2 penilaian menunggu/.test(d)) throw new Error('hitungan tile salah: ' + d);
    await p.click('#btn-tna-pasca'); await p.waitForSelector('.pc-kirim');
    const n = (await p.$$('.pc-kirim')).length; if (n !== 2) throw new Error('harus 2 kartu menunggu, dapat ' + n);
    await shot(p, 'pasca_tugas');
    // kartu pertama: Level 4 tanpa bukti -> ditolak
    const kartu = (await p.$$('[data-pi="0"] .pc-chk'));
    await kartu[0].check(); await kartu[1].check(); await kartu[2].check();
    const lv = await p.textContent('#pc-lv-0-0'); if (!/Level 4/.test(lv) || !/sebelumnya 2/.test(lv)) throw new Error('level/baseline salah: ' + lv);
    if ((await p.$eval('#pc-bw-0-0', e => getComputedStyle(e).display)) === 'none') throw new Error('kolom bukti harus muncul');
    await p.click('.pc-kirim[data-i="0"]'); await p.waitForSelector('#err-pc-0.show');
    const pesan = await p.textContent('#err-pc-0'); if (!/Level 4 dan 5 perlu bukti/.test(pesan) || /BUKTI_KURANG|\{/.test(pesan)) throw new Error('pesan bukti salah: ' + pesan);
    await p.fill('.pc-bukti[data-i="0"][data-j="0"]', 'Menyelesaikan overhaul mesin tanpa komplain ulang bulan lalu');
    await p.fill('.pc-dampak[data-i="0"]', 'Waktu servis turun');
    await p.click('.pc-kirim[data-i="0"]'); await p.waitForFunction(() => document.querySelectorAll('.pc-kirim').length > 0 && /tersimpan/i.test(document.body.innerText) || true);
    await p.waitForSelector('#pasca-sub'); await p.waitForFunction(() => /1 penilaian menunggu/.test(document.getElementById('pasca-sub').textContent));
    if (!/Level 2 → Level 4/.test(p.__dialog || '')) throw new Error('ringkasan hasil salah: ' + p.__dialog);
    await shot(p, 'pasca_selesai');
    const sudah = await p.$('details summary'); if (!sudah || !/Sudah diisi \(1\)/.test(await sudah.textContent())) throw new Error('bagian Sudah diisi tidak tampil');
  });
  // 3. Admin/L&D: tile tampil walau tanpa bawahan; rekap dan unduh
  await run('A1', '1111', async (p) => {
    await p.waitForSelector('#btn-tna-pasca', { state: 'visible' });
    await p.click('#btn-tna-pasca'); await p.waitForSelector('#pasca-tab', { state: 'visible' });
    await p.click('#pasca-tab button[data-v="rekap"]'); await p.waitForSelector('#btn-pasca-xls');
    const t = await p.textContent('#pasca-body');
    if (!/bukan bukti sebab-akibat/.test(t)) throw new Error('catatan metodologi harus tampil');
    if (!/jatuh tempo/.test(t) || !/perilaku naik/.test(t)) throw new Error('KPI rekap tidak tampil: ' + t.slice(0, 200));
    if (/undefined|NaN|\[object/.test(t)) throw new Error('nilai rusak di rekap: ' + t.slice(0, 300));
    await shot(p, 'pasca_rekap');
    await p.click('#btn-pasca-xls'); await p.waitForFunction(() => window.__simpan);
    const sv = await p.evaluate(() => window.__simpan); if (!/^Tindak_Lanjut_Training_.*\.xlsx$/.test(sv.filename) || sv.ukuran < 4000) throw new Error('unduhan salah: ' + JSON.stringify(sv));
  });
  await browser.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exit(1); }
  console.log('UI PASCA OK');
})().catch(e => { console.error('GAGAL', e); process.exit(1); });
