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

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const run = async (nik, pin, fn, vp) => {
    const page = await browser.newPage({ viewport: vp || { width: 390, height: 844 } });
    await page.addInitScript(() => { const g = Storage.prototype.getItem; Storage.prototype.getItem = function (k) { return String(k).startsWith('bblc_panduan_') ? '1' : g.call(this, k); }; }); // panduan dianggap sudah dibaca; gerbang diuji di test_panduan.js
    page.on('pageerror', e => errors.push(nik + ': ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(nik + ' console: ' + m.text()); });
    page.on('dialog', d => d.accept());
    await page.route('**/macros/s/**', async route => {
      const req = JSON.parse(route.request().postData());
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(backend(req)) });
    });
    await page.goto('file://' + require('path').resolve(__dirname, '../../kompetensi/index.html') + '');
    await page.fill('#inp-nik', nik); await page.fill('#inp-pin', pin); await page.click('#btn-login');
    await fn(page); await page.close();
  };
  const shot = (p, n) => p.screenshot({ path: path.join(require('os').tmpdir(), 'ui_' + n + '.png'), fullPage: true });

  // Uji bukti Level 4/5 (v3.8): pilih Level 4 tanpa bukti -> ditolak dengan pesan ramah; isi bukti -> terkirim; bukti tersimpan di Sheet
  await run('M1', '5555', async (p) => {
    await p.waitForSelector('#scr-ganti-pin.active');
    await p.fill('#inp-pin-baru', '9090'); await p.fill('#inp-pin-baru2', '9090'); await p.click('#btn-ganti-pin');
    await p.waitForSelector('#btn-self'); await p.click('#btn-self'); await p.waitForSelector('.tna-chk');
    // kolom bukti tersembunyi selama level < 4
    const awal = await p.$eval('.tna-bukti-wrap[data-k="0"]', e => getComputedStyle(e).display); if (awal !== 'none') throw new Error('kolom bukti harus tersembunyi di bawah Level 4');
    const chks = await p.$$('.tna-chk'); await chks[0].check(); await chks[1].check(); await chks[2].check(); // T-ENG: Level 2,3,4 dicentang -> Level 4
    const lv = await p.textContent('#tna-lv-0'); if (!/Level 4/.test(lv)) throw new Error('level preview salah: ' + lv);
    const tampil = await p.$eval('.tna-bukti-wrap[data-k="0"]', e => getComputedStyle(e).display); if (tampil === 'none') throw new Error('kolom bukti harus muncul pada Level 4');
    await p.click('#btn-tna-submit');
    await p.waitForSelector('#err-tna-form.show');
    const pesan = await p.textContent('#err-tna-form');
    if (!/Level 4 dan 5 perlu bukti/.test(pesan)) throw new Error('pesan bukti tidak tampil: ' + pesan);
    if (/\{|undefined|BUKTI_KURANG|Error:/.test(pesan)) throw new Error('pesan teknis bocor: ' + pesan);
    const fokus = await p.evaluate(() => document.activeElement && document.activeElement.className); if (!/tna-bukti/.test(fokus)) throw new Error('fokus harus pindah ke kolom bukti: ' + fokus);
    await shot(p, 'bukti_ditolak');
    // bukti terlalu singkat tetap ditolak
    await p.fill('.tna-bukti[data-k="0"]', 'bagus');
    await p.click('#btn-tna-submit'); await p.waitForSelector('#err-tna-form.show');
    if (!/perlu bukti/.test(await p.textContent('#err-tna-form'))) throw new Error('bukti singkat harus ditolak');
    // bukti cukup -> terkirim
    await p.fill('.tna-bukti[data-k="0"]', 'Menyelesaikan overhaul mesin Triton tanpa komplain ulang bulan Agustus');
    await shot(p, 'bukti_diisi');
    await p.click('#btn-tna-submit'); await p.waitForSelector('#scr-tna-home.active'); await p.waitForSelector('#btn-self .badge-green');
  });
  await browser.close();
  const baris = ctx.tnaBaca(ACTIVE, 'Asesmen').find(x => String(x.RaterNIK) === 'M1' && x.KodeKompetensi === 'T-ENG');
  if (!baris || !/overhaul mesin Triton/.test(String(baris.Bukti)) || Number(baris.Level) !== 4) throw new Error('bukti tidak tersimpan di Sheet: ' + JSON.stringify(baris));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exit(1); }
  console.log('UI BUKTI OK');
})().catch(e => { console.error('GAGAL', e); process.exit(1); });
