// Uji skala penuh: struktur paket import ASLI (807 karyawan, 96 jabatan), penilaian SINTETIS acak.
const assert = require('assert');
const ADMIN = process.env.ADMIN_NIK; if (!ADMIN) throw new Error('Isi variabel lingkungan ADMIN_NIK (NIK admin, dari konfigurasi_lokal.json).');
const fs = require('fs');
const { ctx, ACTIVE, makeSS, created } = require('./gas_mock.js'); const T = (req) => ctx.handleTNA(req);
const D = JSON.parse(fs.readFileSync(__dirname + '/import_real.json', 'utf8'));
let seed = 42; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;

const imp = makeSS('TNA2027_Import');
Object.entries(D).forEach(([n, rows]) => { const s = imp.insertSheet(n); s.data = rows.map(r => r.slice()); });
global.__IMPORT = imp;
const KH = D.Karyawan[0], karAll = D.Karyawan.slice(1).map(r => Object.fromEntries(KH.map((h, i) => [h, r[i]])));
const kar = karAll.filter(k => k.ModeAsesmen !== 'DIKECUALIKAN');
const users = ACTIVE.insertSheet('Users');
users.data = [['NIK', 'PIN', 'Nama', 'Cabang', 'Jabatan', 'Role', 'Atasan NIK', 'NoHP', 'Wajib_Ganti_PIN'],
  ...karAll.slice(0, 700).map((k, i) => [k.NIK, String(1000 + i), 'SINTETIS ' + i, k.Cabang, k.Jabatan, k.NIK === ADMIN ? 'Admin' : 'User', '', '', false])];
if (!users.data.find(r => r[0] === ADMIN)) users.data.push([ADMIN, '9999', 'ADMIN', 'HO', 'L&D', 'Admin', '', '', false]);

let t0 = Date.now();
const lap = ctx.tnaImport('x'); console.log(lap.join(' | '), (Date.now() - t0) + 'ms');
// user baru dari import: set PIN diketahui & tidak wajib ganti (simulasi sudah ganti PIN)
users.data.slice(1).forEach((r, i) => { r[8] = false; });
const pin = {}; users.data.slice(1).forEach(r => { pin[r[0]] = r[1]; });
assert.strictEqual(users.data.length - 1, karAll.length, 'Semua karyawan ada di Users');
const auth = (nik) => ({ nik, pin: pin[nik] });
ctx.tnaSetParamInternal(ACTIVE, 'WindowBuka', new Date(Date.now() - 3600e3).toISOString());
ctx.tnaSetParamInternal(ACTIVE, 'WindowTutup', new Date(Date.now() + 3600e3).toISOString());

const kodeJab = D.MasterJabatan.slice(1).map(r => r[0]);
let r = T({ action: 'tnaApproveMatriks', ...auth(ADMIN), kodeList: kodeJab });
assert.strictEqual(r.jumlah, kodeJab.length - D.MasterJabatan.slice(1).filter(x => x[9] === 'DIKECUALIKAN').length, JSON.stringify(r));

const semua = [];
D.MasterJabatan.slice(1).forEach(r => { const kj = r[0]; const x = T({ action: 'tnaDosierJabatan', ...auth(ADMIN), kodeJabatan: kj }); if (!x.ok) { console.log('GAGAL', kj, x.error); return; } semua.push(x); });
fs.writeFileSync(__dirname + '/dosier_semua.json', JSON.stringify(semua)); console.log('jabatan:', semua.length, 'bytes', fs.statSync(__dirname + '/dosier_semua.json').size);
