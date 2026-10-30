/* BBLC TNA Engine, paket MANDIRI v1.2, 30 Okt 2026 (nama dan jabatan dari data karyawan). v1.1 (PIN berawalan nol). Sebelumnya v1.0, 29 Okt 2026.
 * Dipakai bila TNA berdiri sendiri: Google Sheet, project Apps Script, alamat web app, dan daftar user terpisah dari
 * Learning Simulator (keputusan user 29 Okt: beda user, beda objective). File ini menggantikan peran Kode.gs bagi TNA.
 * Pasang BERSAMA TNA.gs di project Apps Script baru (tanpa Kode.gs). Isi:
 *  - router doPost / doGet (login, gantiPin, semua action berawalan "tna")
 *  - login dan ganti PIN terhadap tab Users milik Sheet TNA ini
 *  - tnaSetupMandiri: membuat tab Users + admin awal, lalu semua tab TNA_
 *  - pengirim WhatsApp (Fonnte) memakai Script Properties WA_TOKEN dan WA_AKTIF, tidak ada secret di kode
 * Tab Users (kolom A-I): NIK, PIN, Nama, Cabang, Jabatan, Role, Atasan NIK, NoHP, Wajib_Ganti_PIN. */

var PALET = { navy: "#1F4E79" };
var TNA_USERS_HEADER = ["NIK", "PIN", "Nama", "Cabang", "Jabatan", "Role", "Atasan NIK", "NoHP", "Wajib_Ganti_PIN"];

function wajibGantiPinAktif(v) { return v === true || String(v || "").toUpperCase() === "TRUE"; }

function waitLockDenganRetry(lock, ms, kali) {
  for (var i = 0; i < (kali || 3); i++) {
    try { lock.waitLock(ms); return; } catch (e) { if (i === (kali || 3) - 1) throw new Error("Server sedang sibuk, coba lagi sebentar lagi."); }
  }
}

/* ---------- Router ---------- */
function doGet() {
  return ContentService.createTextOutput("BBLC TNA Engine aktif.").setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  var out;
  try {
    var req = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    out = tnaMandiriRute(req);
  } catch (err) {
    out = { ok: false, error: "Permintaan tidak valid. Muat ulang halaman lalu coba lagi." };
    Logger.log("doPost: " + err.message);
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function tnaMandiriRute(req) {
  var aksi = String(req.action || "");
  if (aksi === "login") return tnaMandiriLogin(req);
  if (aksi === "gantiPin") return tnaMandiriGantiPin(req);
  if (aksi.indexOf("tna") === 0) return handleTNA(req);
  return { ok: false, error: "Aksi tidak dikenal." };
}

/* ---------- Login dan ganti PIN ---------- */
function tnaMandiriProfil(rows, i) {
  var nik = String(rows[i][0]).trim(), adaBawahan = false;
  for (var j = 1; j < rows.length; j++) if (String(rows[j][6] || "").trim() === nik) { adaBawahan = true; break; }
  var nama = String(rows[i][2] || ""), jabatan = String(rows[i][4] || "");
  // Nama dan jabatan resmi diambil dari data karyawan (hasil import); isi tab Users hanya cadangan (mis. baris admin awal)
  try {
    var k = tnaPetaKaryawan(SpreadsheetApp.getActiveSpreadsheet(), true)[nik];
    if (k) { nama = String(k.Nama || nama); jabatan = String(k.Jabatan || jabatan); }
  } catch (e) { Logger.log("profil: " + e.message); }
  return { ok: true, nik: nik, nama: nama, jabatan: jabatan, role: String(rows[i][5] || "user").toLowerCase(), isAtasan: adaBawahan };
}

function tnaMandiriLogin(req) {
  var nik = String(req.nik || "").trim(), pin = String(req.pin || "").trim();
  if (!nik || !pin) return { ok: false, error: "NIK dan PIN wajib diisi." };
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
  if (!sh) return { ok: false, error: "Data pengguna belum disiapkan. Hubungi Learning & Development." };
  var rows = sh.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() !== nik) continue;
    if (tnaPinNorm(rows[i][1]) !== tnaPinNorm(pin)) return { ok: false, error: "NIK atau PIN salah." };
    var p = tnaMandiriProfil(rows, i);
    p.wajibGantiPin = wajibGantiPinAktif(rows[i][8]);
    return p;
  }
  return { ok: false, error: "NIK atau PIN salah." };
}

function tnaMandiriGantiPin(req) {
  var nik = String(req.nik || "").trim(), lama = String(req.pinLama || "").trim(), baru = String(req.pinBaru || "").trim();
  if (!/^[0-9]{4}$/.test(baru)) return { ok: false, error: "PIN baru harus tepat 4 angka." };
  if (tnaPinNorm(baru) === tnaPinNorm(lama)) return { ok: false, error: "PIN baru harus berbeda dari PIN lama." };
  var lock = LockService.getScriptLock();
  waitLockDenganRetry(lock, 15000, 3);
  try {
    var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
    var rows = sh.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (String(rows[i][0]).trim() !== nik) continue;
      if (tnaPinNorm(rows[i][1]) !== tnaPinNorm(lama)) return { ok: false, error: "PIN lama salah." };
      var sel = sh.getRange(i + 1, 2); sel.setNumberFormat("@"); sel.setValue(baru); // teks, supaya 0805 tidak menjadi 805
      sh.getRange(i + 1, 9).setValue(false);
      rows[i][1] = baru;
      return tnaMandiriProfil(rows, i);
    }
    return { ok: false, error: "NIK tidak terdaftar." };
  } finally { lock.releaseLock(); }
}

/* ---------- Setup awal ---------- */
// Isi dua baris di bawah di editor (jangan commit ke repo), pilih tnaSetupMandiri, lalu Jalankan SEKALI sebelum tnaImportPaket.
function tnaSetupMandiri() {
  var NIK_ADMIN = "ISI_NIK_ADMIN";
  var PIN_ADMIN = "ISI_PIN_4_ANGKA";
  if (NIK_ADMIN === "ISI_NIK_ADMIN" || !/^[0-9]{4}$/.test(PIN_ADMIN)) throw new Error("Isi dulu NIK_ADMIN dan PIN_ADMIN (4 angka) di fungsi tnaSetupMandiri.");
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Users") || ss.insertSheet("Users");
  if (sh.getLastRow() < 1) sh.getRange(1, 1, 1, TNA_USERS_HEADER.length).setValues([TNA_USERS_HEADER]).setFontWeight("bold");
  var v = sh.getDataRange().getValues(), ada = false;
  for (var i = 1; i < v.length; i++) if (String(v[i][0]).trim() === NIK_ADMIN) ada = true;
  sh.getRange("B:B").setNumberFormat("@"); // kolom PIN berformat teks (PIN berawalan nol aman)
  if (ada) { for (var k = 1; k < v.length; k++) if (String(v[k][0]).trim() === NIK_ADMIN) sh.getRange(k + 1, 2).setValue(PIN_ADMIN); }
  else sh.appendRow([NIK_ADMIN, PIN_ADMIN, "Admin L&D", "HO", "Learning & Development", "Admin", "", "", false]);
  tnaSetup();
  Logger.log("Setup mandiri selesai. Admin awal: " + NIK_ADMIN + ". Lanjut jalankan tnaImportPaket.");
}

/* ---------- WhatsApp (Fonnte) ---------- */
function waAktif() {
  var pr = PropertiesService.getScriptProperties();
  return pr.getProperty("WA_AKTIF") === "1" && !!pr.getProperty("WA_TOKEN");
}

function kirimWA(ss, hp, teks) {
  var token = PropertiesService.getScriptProperties().getProperty("WA_TOKEN");
  if (!token || !hp) return false;
  var res = UrlFetchApp.fetch("https://api.fonnte.com/send", {
    method: "post", headers: { Authorization: token }, muteHttpExceptions: true,
    payload: { target: String(hp), message: String(teks), countryCode: "62" }
  });
  return res.getResponseCode() === 200;
}
