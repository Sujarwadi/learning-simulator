/* BBLC TNA Engine v3.1, 30 Okt 2026. Perubahan: PIN berawalan nol (mis. 0805) tidak lagi ditolak karena Sheets menyimpannya sebagai angka (tnaPinNorm). Sebelumnya v3.0: tanggal window asesmen kosong bawaan (jadwal diumumkan di luar aplikasi; status BELUM_DIJADWALKAN, form hanya dapat dilihat, pengingat dan jadwal output menolak sampai tanggal diisi). Sebelumnya v2.9: jendela bulan default P-SETARA (Seminar oleh SETARA, Oktober). Sebelumnya v2.8: Pusat Matrix (tnaMatrixOutput) terbuka untuk level Dept Head ke atas (tnaBolehMatrix, parameter baru KodeJabatanMatrix) dengan jabatan, orang, gap, dan ITP dibatasi pada timnya; tnaKonteks mengirim flag matrix. Sebelumnya v2.7: tnaDosierJabatan (dosier satu jabatan tanpa asesmen, bentuk master L&D: breakdown tugas + KSA, kompetensi 5 level + indikator, matriks departemen, 70/20 turunan data, training wajib, jalur bila gap); tab baru TNA_Indikator; kolom baru Kamus.Kelompok dan Task (SubProses, SubSubProses, Pengetahuan, StandarKinerja, SubStandar, KSA, LevelAktivitas).
 * BBLC TNA Engine v2.6, 28 Okt 2026. Perubahan (koreksi user 28 Okt): tnaKonteks mengirim `internal` (admin atau jabatan tim L&D,
 * parameter KodeJabatanLD) supaya catatan internal (status draf silabus, materi belum siap, flag kualitas penilai, status matriks/JD)
 * hanya tampil untuk L&D; tnaProgres, tnaTim, tnaTrainingTim menerima `lingkup` (langsung | bawahan | semua; semua hanya admin; bawaan langsung) dan tnaMatrixOutput mengirim timLangsung serta timSaya (seluruh bawahan)
 * dan mengembalikan `lingkup` berisi pilihan aktif serta jumlah orang tiap lingkup; tnaRingkasHasil menambah `jenis` (jenis flag unik) agar UI menampilkan catatan kualitas sekali per hasil.
 * BBLC TNA Engine v2.5, 27 Okt 2026. Perubahan (keputusan user 27 Okt): nilai aktual dibulatkan ke level utuh,
 * Actual = round(70% atasan + 30% self), 0,5 ke atas; gap bulat; kategori gap 1 = Minor, 2 = Moderate, >= 3 = Major.
 * BBLC TNA Engine v2.4.1, 27 Okt 2026. Perubahan: tnaMatrixOutput sumber "hasil" (gap live /* BBLC TNA Engine v2.4, 27 Okt 2026. ITP per orang, tim saya).
 * BBLC TNA Engine v2.4, 27 Okt 2026. Perubahan: tnaMatrixOutput (khusus admin L&D) untuk Pusat Matrix: Competency Matrix dan
 * Training Matrix per jabatan, dept, divisi, atau seluruh BBM. Penanda training memakai aturan yang sama dengan mesin rekomendasi:
 * W = wajib (Mandatory jabatan/korporat), G = wajib bila ada gap (modul yang dipilih mesin untuk gap dari level 1 sampai syarat-1,
 * menghormati SasaranJabatan & tanpa dobel dengan W), I = IHT Sabtu (pola 2026), P = pengayaan opsional. Divisi diturunkan dari Dept
 * (TNA_DIVISI, keputusan user 27 Okt: pengelompokan fungsional). Dengan sumber "hasil": data per orang (gap live dari penilaian
 * yang masuk, ITP dari output terakhir) dan daftar "tim saya" (seluruh orang di bawah admin menurut rantai PenilaiNIK).
 * BBLC TNA Engine v2.3.1, 27 Okt 2026. Perubahan: tnaITPSaya menyertakan nama kompetensi training penutup gap dan targetJam.
 * BBLC TNA Engine v2.3, 27 Okt 2026. Perubahan (koreksi user 27 Okt): setiap kompetensi yang gap WAJIB mendapat training
 * penutup gap (kategori ITP "WajibGap"), tanpa batas jumlah per tahun, tanpa ditunda, dan untuk semua kategori kompetensi
 * (Technical, Behavioral, Leadership). Parameter MaksDianjurkan & KategoriDianjurkan dihapus; validator hanya bisa mengganti
 * modul, tidak bisa meniadakan training (opsi "TANPA" lama diabaikan). tnaHasil.wajib memuat program wajib + training penutup gap.
 * Kolom Katalog.SasaranJabatan (opsional, KodeJabatan dipisah koma): modul program/peran (BMDP, SSDP, jalur sales/aftersales,
 * sertifikasi peran) hanya ditawarkan sebagai penutup gap untuk jabatan sasarannya; kosong = semua jabatan. Gap yang kompetensinya
 * sudah dicakup program Wajib orang itu (mis. SL-02 Kacab oleh BMDP-02) tidak diberi training tambahan (tidak dobel).
 * tnaITPSaya menyertakan nama kompetensi yang dikembangkan tiap training penutup gap (tanpa skor) dan targetJam setahun.
 * BBLC TNA Engine v2.2, 26 Okt 2026. Perubahan: default JendelaKhusus mengikuti kalender program 2027 yang disepakati
 * (satu program tatap muka per bulan): BMDP kelas Jan (modul online mandiri dirilis Jan) & Jul, IST Feb/Mei/Agu/Nov,
 * AST Mar/Jun/Sep/Des, SSDP Apr & Okt (shadowing bengkel bulan berikutnya). Tab TNA_Parameter yang sudah ada tidak ditimpa.
 * BBLC TNA Engine v2.1, 26 Okt 2026. Perubahan: batas porsi IHT dihitung dari jam karyawan saja (kursi proyeksi calon BST tidak
 * menambah jatah IHT; keputusan user 26 Okt); tnaITPSaya menyertakan StatusKatalog (program USULAN_PENGADAAN diberi label di UI);
 * tnaTrainingTim meringkas IHT per bulan per rumpun (tidak dipecah per Sabtu).
 * BBLC TNA Engine v2.0, 26 Okt 2026. Perubahan: parameter JendelaKhusus (JSON kode training -> bulan 1-12) supaya program 2027
 * (Kacab Academy per kuartal, jalur sales, PK online, HR for Non-HR, BEI) tersebar sepanjang tahun, tidak menumpuk di jendela Wajib Jan-Jun.
 * BBLC TNA Engine v1.9, 26 Okt 2026. Perubahan: peserta BST diproyeksikan dari batch terakhir (parameter ProyeksiPesertaBST,
 * default 63 = BST 1-2 Sep 2026) karena pesertanya mayoritas calon sales baru yang belum ada di data karyawan; kolom Batch
 * PesertaProyeksi, rekonsiliasi = jam ITP + jam proyeksi calon = jam Calendar; jam proyeksi ikut total jam L&D non-IHT.
 * BBLC TNA Engine v1.8, 26 Okt 2026. Perubahan: kalender default 2027 mengamankan slot BST tiap awal bulan (2 hari pelatihan +
 * 1 hari remedial mulai tanggal 1, hari Minggu dilewati, Sabtu tetap jalan) dan IHT tiap Sabtu per cabang (rotasi rumpun
 * Selling/PK/After Sales/Self Management minggu ke-1..4, Sabtu ke-5 cadangan). Jam IHT per orang dari tab TNA_IHT (rata-rata
 * rencana IHT 2026 per jabatan) dan dibatasi MaksPersenIHT (default 20%) dari total jam L&D; kelas reguler mulai Selasa
 * setelah slot BST. Rekonsiliasi memuat porsi IHT.
 * BBLC TNA Engine v1.7, 26 Okt 2026. Perubahan: katalog training + silabus (tab TNA_Silabus hasil ringkasan materi Drive,
 * status DRAF_AI sampai L&D menandai FINAL; tnaKatalog, tnaSilabusStatus); riwayat training lengkap 2025-2026 per karyawan
 * (tab TNA_RekamTraining, diurutkan per NIK; tnaRekam hanya untuk karyawan itu sendiri, penilai, validator, atasan berjenjang, admin).
 * BBLC TNA Engine v1.6, 25 Okt 2026. Perubahan (P1): mode nilai per kompetensi untuk satu tim (tnaFormTim, tnaSubmitTim),
 * dashboard tim (tnaTim: heatmap, gap terbesar, prioritas), rencana training tim (tnaTrainingTim), draft di server (TNA_Draft),
 * pengingat WhatsApp manual & terjadwal via kirimWA Kode.gs (tnaPengingat, tnaPengingatTerjadwal), pemantauan validator (tnaPantau),
 * cache data statis (CacheService, dibatalkan otomatis saat tab ditulis ulang), penjadwalan trigger dari Panel Admin (tnaJadwalkan).
 * BBLC TNA Engine v1.5, 25 Okt 2026. Perubahan: ValidatorNIK boleh lebih dari satu (dipisah koma, mis. dua NOH; siapa pun
 * boleh memvalidasi, sekali divalidasi selesai untuk semua); tnaHasil menyertakan centangan perilaku tiap penilai (bukti) dan
 * kalimat checklist-nya; tnaKonteks mengirim ringkasan tugas (todo) dan batas waktu.
 * BBLC TNA Engine v1.4, 25 Okt 2026. Perubahan: karyawan hanya melihat ITP & kalender training miliknya (gap & rekomendasi
 * hanya untuk penilai, validator Head unit, dan admin); tnaITPSaya menyertakan jadwal batch (tanggal, lokasi, metode).
 * BBLC TNA Engine v1.3, 24 Okt 2026. Perubahan: hasil live per orang (tnaHasil) langsung setelah penilai submit, validasi Head unit
 * (tnaValidasi: setujui / edit rekomendasi / kembalikan ke penilai), tab TNA_Validasi, kolom StatusValidasi di Gap/Rekomendasi/ITP,
 * mesin rekomendasi dipakai bersama (live = output), header tab ditulis ulang saat tab ditimpa.
 * BBLC TNA Engine v1.2, 24 Okt 2026. Perubahan: ModeAsesmen DIKECUALIKAN (C-level tidak dinilai, tetap bisa menilai tim),
 * Mandatory per orang (KodeJabatan "NIK:<nik>"), Riwayat juga melewati training Dianjurkan yang sudah lulus, parameter
 * KategoriDianjurkan (fokus 2027: Technical & Leadership), kelas tatap muka dibentuk per cabang (online digabung).
 * BBLC TNA Engine v1.1, 24 Okt 2026. Perubahan: tab TNA_Riwayat (training Wajib yang sudah lulus tidak dijadwalkan ulang),
 * rekomendasi 70 memprioritaskan task JD jabatan, lalu Intervensi, lalu teks umum.
 * BBLC TNA Engine v1.0, 24 Okt 2026. Modul TNA 2027 (PRD docs/PRD_TNA_Engine_2027.md).
 * File TERPISAH dari Kode.gs: semua tab memakai prefiks TNA_ sehingga fitur Simulator dan Studio
 * lama (MatriksKompetensi, AssessmentTool, IDP, dst) tidak tersentuh sama sekali.
 * Router: Kode.gs doPost meneruskan setiap action berawalan "tna" ke handleTNA(req).
 * Tidak ada secret di file ini. */
var TNA_VERSION = "2.7";

/* ============================================================
 * SKEMA TAB
 * ============================================================ */
var TNA_TAB = {
  Parameter: ["Key", "Value", "Keterangan"],
  Karyawan: ["NIK", "Nama", "Cabang", "Wilayah", "Lokasi", "Dept", "KodeJabatan", "JobTitle", "Jabatan", "Varian", "PJS",
    "TglMasuk", "PenilaiNIK", "Penilai2NIK", "ModeAsesmen", "KelompokID", "DelegasiBoleh", "Aktif", "ValidatorNIK"],
  MasterJabatan: ["KodeJabatan", "JobTitle", "Dept", "Lokasi", "JmlIncumbent", "ModeAsesmen", "FileJD", "LinkJD", "StatusJD",
    "StatusMatriks", "Versi", "DisetujuiOleh", "DisetujuiPada", "Catatan"],
  Kamus: ["KodeKompetensi", "Nama", "Kategori", "Definisi", "L1", "L2", "L3", "L4", "L5", "Status", "Kelompok"],
  Indikator: ["KodeKompetensi", "Level", "Label", "DefinisiLevel", "Indikator"],
  Checklist: ["KodeKompetensi", "C2", "C3", "C4", "C5"],
  Matriks: ["KodeJabatan", "KodeKompetensi", "RequiredLevel", "Bobot", "Sumber", "Flag"],
  Task: ["KodeJabatan", "NoTugas", "TugasUtama", "Task", "KodeKompetensi", "SubProses", "SubSubProses", "Pengetahuan", "StandarKinerja", "SubStandar", "KSA", "LevelAktivitas"],
  Intervensi: ["KodeKompetensi", "Tipe", "Deskripsi"],
  Katalog: ["KodeTraining", "Judul", "Kategori", "KodeKompetensi", "LevelTarget", "Metode", "DurasiJam", "SumberFile", "Link", "Status", "SasaranJabatan"],
  Mandatory: ["KodeJabatan", "KodeTraining", "Dasar"],
  Riwayat: ["NIK", "KodeTraining", "Tanggal", "Sumber"],
  Silabus: ["KodeTraining", "Judul", "Rumpun", "Kompetensi", "Sasaran", "Tujuan", "Outline", "Metode", "Durasi", "Evaluasi", "Sumber",
    "Status", "DiperbaruiOleh", "Timestamp"],
  RekamTraining: ["NIK", "Tahun", "Tanggal", "KodeProgram", "Judul", "Kategori", "Metode", "Penyelenggara", "Status", "Jam",
    "PreTest", "PostTest", "KodeTNA"],
  IHT: ["KodeJabatan", "JobTitle", "Orang2026", "Peserta2026", "JamSelling", "JamPK", "JamASS", "JamSelf", "JamTotal", "Sumber"],
  Asesmen: ["Periode", "NIK", "KelompokID", "KodeKompetensi", "Rater", "RaterNIK", "Checks", "Level", "NA", "Alasan", "Status", "Timestamp"],
  Gap: ["Periode", "NIK", "Nama", "Cabang", "Dept", "KodeJabatan", "JobTitle", "KodeKompetensi", "Kompetensi", "Kategori",
    "Required", "Bobot", "SkorAtasan", "SkorSelf", "Actual", "Gap", "Prioritas", "KategoriGap", "Flag", "StatusValidasi"],
  Rekomendasi: ["NIK", "Nama", "KodeKompetensi", "Kompetensi", "Gap", "Prioritas", "R70_Penugasan", "R20_Sosial", "R10_Training", "DiubahValidator", "StatusValidasi"],
  ITP: ["NIK", "Nama", "Cabang", "Wilayah", "KodeJabatan", "JobTitle", "KodeTraining", "Judul", "Kategori", "KodeKompetensi",
    "Bulan", "BatchID", "Jam", "Status", "StatusValidasi"],
  Validasi: ["Periode", "Target", "Jenis", "Nama", "Jabatan", "Cabang", "PenilaiNIK", "ValidatorNIK", "Status", "Catatan", "Edit", "Ringkasan", "DiperbaruiOleh", "Timestamp"],
  Batch: ["BatchID", "KodeTraining", "Judul", "Kategori", "Metode", "Bulan", "Minggu", "TanggalMulai", "TanggalSelesai", "Lokasi", "JmlPeserta", "PesertaProyeksi", "DurasiJam", "TotalJam", "Catatan"],
  Proyeksi: ["NIK", "Nama", "Cabang", "Dept", "KodeJabatan", "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    "TotalJam", "TargetJam", "PersenTarget", "StatusJam", "ReadinessSaatIni", "ReadinessProyeksi"],
  Draft: ["Periode", "RaterNIK", "Target", "Jawaban", "Timestamp"],
  Log: ["Timestamp", "NIK", "Aksi", "Detail"]
};

var TNA_PARAM_DEFAULT = [
  ["Periode", "TNA2027", "Kode periode asesmen"],
  ["WindowBuka", "", "Mulai window asesmen (WITA); kosong = belum dijadwalkan. Isi dari Panel Admin bila jadwal sudah diumumkan"],
  ["WindowTutup", "", "Akhir window asesmen (WITA); kosong = belum dijadwalkan"],
  ["BobotAtasan", 0.7, "Bobot skor atasan pada skor Actual"],
  ["BobotSelf", 0.3, "Bobot self-rating pada skor Actual"],
  ["TahunITP", 2027, "Tahun rencana ITP"],
  ["TargetJamBulan", 3, "Target jam belajar per orang per bulan"],
  ["KapasitasKelas", 20, "Default peserta per batch kelas"],
  ["DurasiDefaultJam", 4, "Durasi training bila katalog kosong"],
  ["KoefTraining", 0.5, "Kenaikan level proyeksi per training penutup gap"],
  ["KoefCoaching", 0.5, "Kenaikan level proyeksi dari coaching terstruktur"],
  ["KoefPenugasan", 0.5, "Kenaikan level proyeksi dari penugasan"],
  ["JamCoachingPerGap", 1, "Jam coaching terstruktur per kompetensi gap per tahun (dihitung jam belajar)"],
  ["KodeBST", "D-BST", "Kode katalog BST: slot tetap tiap awal bulan (tgl 1-3, Minggu dilewati)"],
  ["ProyeksiPesertaBST", 63, "Proyeksi peserta per batch BST bulanan (calon sales baru + karyawan); referensi BST 1-2 Sep 2026"],
  ["KodeJabatanLD", "J013,J014,J015,J023", "Kode jabatan tim L&D (Instructor, L&D Dept Head, L&D Section Head, Training Supervisor): melihat catatan internal seperti admin"],
  ["KodeJabatanMatrix", "", "Kode jabatan tambahan yang boleh membuka Pusat Matrix selain admin dan atasan dua tingkat (Dept Head, Div Head, Kacab), pisahkan dengan koma"],
  ["JendelaKhusus", JSON.stringify({ "BMDP-01": [1], "BMDP-02": [1], "BMDP-03": [1], "BMDP-05": [1], "BMDP-10": [1],
    "BMDP-04": [1], "BMDP-07": [1], "BMDP-08": [1], "BMDP-06": [7], "BMDP-09": [7], "W-PK27": [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    "D-IST": [2, 5, 8, 11], "D-LEAS": [2, 5, 8, 11], "D-AST": [3, 6, 9, 12], "D-FLEET": [3, 6, 9, 12], "D-MENTOR": [3, 6, 9, 12],
    "D-SPV": [4, 10], "D-ASX": [5, 11], "D-SACS": [2, 3, 4, 5, 6, 7, 8],
    "W-HRNH": [2, 3, 4, 5, 6, 7, 8, 9, 10], "W-BEI": [2, 3, 4, 5, 6, 7, 8, 9, 10], "P-SETARA": [10] }),
    "Jendela bulan (1-12) per kode training, menggantikan jendela kategori"],
  ["MaksPersenIHT", 20, "Batas porsi jam IHT dari total jam L&D karyawan (%), dihitung dari jam PLANNED; kursi calon BST tidak dihitung"],
  ["JamSesiIHT", 2, "Durasi satu sesi IHT Sabtu (jam)"],
  ["OutputTerakhir", "", "Diisi sistem: waktu generate output terakhir"],
  ["OutputLinks", "", "Diisi sistem: link 5 dokumen output (JSON)"],
  ["Rekonsiliasi", "", "Diisi sistem: total jam Plan/ITP/Calendar"],
  ["UrlStudio", "https://sujarwadi.github.io/learning-simulator/kompetensi/", "Link Studio di pesan pengingat WA"],
  ["PengingatHari", "5,3,1,0", "Pengingat WA dikirim H-n sebelum window tutup (0 = hari terakhir)"],
  ["PengingatJam", 8, "Jam kirim pengingat WA terjadwal (WITA)"]
];

var TNA_BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// Rumpun IHT Sabtu: indeks = Sabtu ke-1..4 tiap bulan (pola folder IHT WEEK 1..4), kolom = jam rata-rata 2026 di tab TNA_IHT.
// Sabtu ke-5 menjadi slot cadangan (susulan/remedial).
var TNA_IHT_RUMPUN = [{ kode: "IHT-SELL", kolom: "JamSelling" }, { kode: "IHT-PK", kolom: "JamPK" },
  { kode: "IHT-ASV", kolom: "JamASS" }, { kode: "IHT-SELF", kolom: "JamSelf" }];

// Hari BST pada bulan itu: 2 hari pelatihan + 1 hari remedial berurutan mulai tanggal 1, hari Minggu dilewati (Sabtu tetap jalan).
function tnaHariBST(tahun, bln) {
  var hari = [], d = new Date(tahun, bln, 1);
  while (hari.length < 3) { if (d.getDay() !== 0) hari.push(new Date(d.getTime())); d.setDate(d.getDate() + 1); }
  return hari;
}

/* ============================================================
 * ROUTER
 * ============================================================ */
function handleTNA(req) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  switch (req.action) {
    case "tnaPing": return { ok: true, versi: TNA_VERSION };
    case "tnaKonteks": return tnaKonteks(ss, req);
    case "tnaForm": return tnaForm(ss, req);
    case "tnaSubmit": return tnaSubmit(ss, req);
    case "tnaApprove": return tnaApprove(ss, req);
    case "tnaProgres": return tnaProgres(ss, req);
    case "tnaMatriksJabatan": return tnaMatriksJabatan(ss, req);
    case "tnaDosierJabatan": return tnaDosierJabatan(ss, req);
    case "tnaMatrixOutput": return tnaMatrixOutput(ss, req);
    case "tnaApproveMatriks": return tnaApproveMatriks(ss, req);
    case "tnaSetParameter": return tnaSetParameter(ss, req);
    case "tnaGenerateOutput": return tnaGenerateOutputEndpoint(ss, req);
    case "tnaGetOutput": return tnaGetOutput(ss, req);
    case "tnaITPSaya": return tnaITPSaya(ss, req);
    case "tnaHasil": return tnaHasil(ss, req);
    case "tnaValidasi": return tnaValidasi(ss, req);
    case "tnaValidasiMassal": return tnaValidasiMassal(ss, req);
    case "tnaSimpanDraft": return tnaSimpanDraft(ss, req);
    case "tnaFormTim": return tnaFormTim(ss, req);
    case "tnaSubmitTim": return tnaSubmitTim(ss, req);
    case "tnaTim": return tnaTim(ss, req);
    case "tnaTrainingTim": return tnaTrainingTim(ss, req);
    case "tnaPantau": return tnaPantau(ss, req);
    case "tnaPengingat": return tnaPengingat(ss, req);
    case "tnaJadwalkan": return tnaJadwalkanEndpoint(ss, req);
    case "tnaKatalog": return tnaKatalog(ss, req);
    case "tnaSilabusStatus": return tnaSilabusStatus(ss, req);
    case "tnaRekam": return tnaRekam(ss, req);
    default: return { ok: false, error: "Aksi TNA tidak dikenal." };
  }
}

/* ============================================================
 * UTILITAS SHEET
 * ============================================================ */
function tnaSheet(ss, nama) {
  var full = "TNA_" + nama;
  var sh = ss.getSheetByName(full);
  if (!sh) {
    sh = ss.insertSheet(full);
    var h = TNA_TAB[nama];
    sh.getRange(1, 1, 1, h.length).setValues([h]).setFontWeight("bold");
    sh.setFrozenRows(1);
  }
  return sh;
}

// Membaca tab sebagai array objek berdasarkan header baris 1.
// Tab statis (berubah hanya saat import/approve) disimpan di CacheService 6 jam supaya layar hasil & validasi cepat.
var TNA_CACHE_TAB = { Karyawan: 1, Kamus: 1, Indikator: 1, Checklist: 1, Matriks: 1, Task: 1, Intervensi: 1, Katalog: 1, Mandatory: 1, Riwayat: 1, Silabus: 1 };
function tnaCacheVer() {
  if (typeof PropertiesService === "undefined") return "0";
  return PropertiesService.getScriptProperties().getProperty("TNA_CACHE_VER") || "0";
}
function tnaCacheBatal(nama) {
  if (!TNA_CACHE_TAB[nama] || typeof PropertiesService === "undefined") return;
  PropertiesService.getScriptProperties().setProperty("TNA_CACHE_VER", String(new Date().getTime()));
}
function tnaBaca(ss, nama) {
  if (TNA_CACHE_TAB[nama] && typeof CacheService !== "undefined") {
    var c = CacheService.getScriptCache(), key = "tna|" + nama + "|" + tnaCacheVer();
    try {
      var meta = c.get(key);
      if (meta) {
        var n = Number(meta), keys = [];
        for (var i = 0; i < n; i++) keys.push(key + "|" + i);
        var parts = c.getAll(keys), str = "";
        for (var j = 0; j < n; j++) { if (parts[keys[j]] === undefined || parts[keys[j]] === null) { str = null; break; } str += parts[keys[j]]; }
        if (str !== null) return JSON.parse(str);
      }
    } catch (e) { /* cache rusak: baca dari sheet */ }
    var rows = tnaBacaSheet(ss, nama);
    try {
      var s = JSON.stringify(rows), CH = 90000, obj = {}, m = Math.ceil(s.length / CH);
      if (m <= 40) {
        for (var k = 0; k < m; k++) obj[key + "|" + k] = s.substring(k * CH, (k + 1) * CH);
        obj[key] = String(m);
        c.putAll(obj, 21600);
      }
    } catch (e2) { /* melebihi batas cache: tetap jalan tanpa cache */ }
    return rows;
  }
  return tnaBacaSheet(ss, nama);
}
function tnaBacaSheet(ss, nama) {
  var sh = ss.getSheetByName("TNA_" + nama);
  if (!sh || sh.getLastRow() < 2) return [];
  var v = sh.getDataRange().getValues();
  var h = v[0];
  var out = [];
  for (var i = 1; i < v.length; i++) {
    if (v[i].join("") === "") continue;
    var o = {};
    for (var c = 0; c < h.length; c++) o[h[c]] = v[i][c];
    out.push(o);
  }
  return out;
}

// Menimpa seluruh isi tab (di bawah header) dalam satu setValues.
function tnaTulisUlang(ss, nama, rows) {
  tnaCacheBatal(nama);
  var sh = tnaSheet(ss, nama);
  var h = TNA_TAB[nama];
  sh.getRange(1, 1, 1, h.length).setValues([h]);
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, Math.max(sh.getLastColumn(), h.length)).clearContent();
  if (!rows.length) return;
  var data = rows.map(function (o) { return h.map(function (k) { return o[k] === undefined || o[k] === null ? "" : o[k]; }); });
  sh.getRange(2, 1, data.length, h.length).setValues(data);
}

function tnaTambah(ss, nama, rows) {
  if (!rows.length) return;
  tnaCacheBatal(nama);
  var sh = tnaSheet(ss, nama);
  var h = TNA_TAB[nama];
  var data = rows.map(function (o) { return h.map(function (k) { return o[k] === undefined || o[k] === null ? "" : o[k]; }); });
  sh.getRange(sh.getLastRow() + 1, 1, data.length, h.length).setValues(data);
}

function tnaParam(ss) {
  var p = {};
  TNA_PARAM_DEFAULT.forEach(function (r) { p[r[0]] = r[1]; });
  tnaBaca(ss, "Parameter").forEach(function (r) { if (r.Key) p[String(r.Key)] = r.Value; });
  return p;
}

function tnaLog(ss, nik, aksi, detail) {
  try { tnaTambah(ss, "Log", [{ Timestamp: new Date(), NIK: nik, Aksi: aksi, Detail: String(detail || "").substring(0, 500) }]); }
  catch (e) { Logger.log("Log gagal: " + e.message); }
}

function tnaWindow(p) {
  var now = new Date();
  var buka = new Date(p.WindowBuka), tutup = new Date(p.WindowTutup);
  // Tanggal belum diisi (jadwal diumumkan di luar aplikasi): form hanya bisa dilihat, tidak ada hitung mundur
  if (!p.WindowBuka || !p.WindowTutup || isNaN(buka) || isNaN(tutup)) return { status: "BELUM_DIJADWALKAN", buka: null, tutup: null };
  if (now < buka) return { status: "BELUM_DIBUKA", buka: buka, tutup: tutup };
  if (now > tutup) return { status: "DITUTUP", buka: buka, tutup: tutup };
  return { status: "DIBUKA", buka: buka, tutup: tutup };
}

function tnaR2(x) { return Math.round(Number(x) * 100) / 100; }

/* ============================================================
 * OTENTIKASI & PERAN
 * Login tetap memakai NIK + PIN di tab Users (handleLogin Kode.gs). Setiap aksi TNA mengirim nik + pin
 * dan divalidasi ulang di sini, karena otorisasi wajib di backend.
 * ============================================================ */
// Google Sheets mengubah teks "0805" menjadi angka 805. PIN dibandingkan setelah dinormalkan ke 4 digit supaya PIN berawalan nol tetap cocok.
function tnaPinNorm(v) {
  var s = String(v == null ? "" : v).trim();
  return /^[0-9]{1,3}$/.test(s) ? ("000" + s).slice(-4) : s;
}

function tnaAuth(ss, req) {
  var nik = String(req.nik || "").trim(), pin = String(req.pin || "").trim();
  if (!nik || !pin) return { ok: false, error: "Sesi berakhir, silakan login ulang." };
  var rows = ss.getSheetByName("Users").getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() !== nik) continue;
    if (tnaPinNorm(rows[i][1]) !== tnaPinNorm(pin)) return { ok: false, error: "PIN salah, silakan login ulang." };
    if (wajibGantiPinAktif(rows[i][8])) return { ok: false, error: "Ganti PIN dulu di halaman masuk sebelum mengisi asesmen." };
    return { ok: true, nik: nik, nama: String(rows[i][2]), role: String(rows[i][5] || "user").toLowerCase() };
  }
  return { ok: false, error: "NIK tidak terdaftar." };
}

// Default: hanya karyawan yang dinilai. termasukDikecualikan=true juga memuat ModeAsesmen DIKECUALIKAN
// (mis. C-level: tidak dinilai & tidak masuk ITP, tetapi tetap menjadi penilai timnya).
function tnaPetaKaryawan(ss, termasukDikecualikan) {
  var map = {};
  tnaBaca(ss, "Karyawan").forEach(function (k) {
    k.NIK = String(k.NIK); k.PenilaiNIK = String(k.PenilaiNIK || ""); k.Penilai2NIK = String(k.Penilai2NIK || "");
    if (!termasukDikecualikan && k.ModeAsesmen === "DIKECUALIKAN") return;
    if (String(k.Aktif).toUpperCase() !== "N") map[k.NIK] = k;
  });
  return map;
}

// Peran pengguna terhadap seorang karyawan / kelompok: ATASAN, ATASAN2, DELEGASI, SELF, ADMIN, atau null.
function tnaPeranTerhadap(auth, karyawanMap, target) {
  if (target.NIK === auth.nik) return "SELF";
  if (target.PenilaiNIK === auth.nik) return "ATASAN";
  if (target.Penilai2NIK && target.Penilai2NIK === auth.nik) return "ATASAN2";
  var saya = karyawanMap[auth.nik];
  if (saya && target.DelegasiBoleh && saya.JobTitle === "LEADER MEKANIK" && saya.Cabang === target.Cabang) return "DELEGASI";
  if (auth.role === "admin") return "ADMIN";
  return null;
}

/* ============================================================
 * KONTEKS: siapa saja yang harus dinilai pengguna + progres
 * ============================================================ */
// Internal L&D: admin atau pemegang jabatan tim L&D (parameter KodeJabatanLD). Menentukan siapa yang boleh melihat catatan internal.
function tnaInternalLD(ss, auth, p) {
  if (auth.role === "admin") return true;
  var kode = String((p || tnaParam(ss)).KodeJabatanLD || "").split(/[,;]\s*/).filter(String);
  var saya = tnaPetaKaryawan(ss, true)[auth.nik];
  return !!saya && kode.indexOf(String(saya.KodeJabatan)) !== -1;
}
// Jabatan yang boleh dibuka dosier/matriksnya: admin dan tim L&D semua; selain itu hanya jabatan sendiri dan jabatan bawahannya.
// Hasil null = semua jabatan. Pemeriksaan di backend (aturan wajib otorisasi), bukan hanya menu.
function tnaJabatanBoleh(ss, auth) {
  var p = tnaParam(ss);
  if (tnaInternalLD(ss, auth, p)) return null;
  return tnaJabatanLingkup(ss, auth);
}
// Kode jabatan milik saya dan seluruh bawahan (rantai penilai/validator).
function tnaJabatanLingkup(ss, auth) {
  var km = tnaPetaKaryawan(ss), ok = {}, saya = km[auth.nik];
  if (saya) ok[String(saya.KodeJabatan)] = true;
  tnaLingkupTampil(auth, km, "", "bawahan").forEach(function (k) { ok[String(k.KodeJabatan)] = true; });
  return ok;
}
// Pusat Matrix (Competency dan Training Matrix) untuk level Dept Head ke atas, agar dapat memetakan pengembangan timnya.
// Aturan: admin; atau pemegang jabatan di parameter KodeJabatanMatrix; atau punya bawahan langsung yang juga memimpin bawahan
// (dua tingkat ke bawah: Dept Head, Div Head, Kacab). Section Head, Supervisor, dan staf tidak.
function tnaBolehMatrix(ss, auth, p) {
  if (auth.role === "admin") return true;
  var km = tnaPetaKaryawan(ss), saya = km[auth.nik];
  var kode = String((p || tnaParam(ss)).KodeJabatanMatrix || "").split(/[,;]\s*/).filter(String);
  if (saya && kode.indexOf(String(saya.KodeJabatan)) !== -1) return true;
  return tnaLingkupTampil(auth, km, "", "langsung").some(function (k) { return tnaLingkupTampil({ nik: k.NIK, role: "" }, km, "", "langsung").length > 0; });
}
function tnaKonteks(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  var p = tnaParam(ss), win = tnaWindow(p);
  var km = tnaPetaKaryawan(ss);
  var ases = tnaBaca(ss, "Asesmen").filter(function (a) { return a.Periode === p.Periode; });
  var sudah = {}; // key target|rater -> status
  ases.forEach(function (a) {
    var key = (a.KelompokID ? "K:" + a.KelompokID : "N:" + a.NIK) + "|" + a.RaterNIK;
    if (!sudah[key] || a.Status === "FINAL") sudah[key] = a.Status;
  });

  var valMap = tnaPetaValidasi(ss, p);
  var tugas = [], kelompok = {}, delegasi = [];
  Object.keys(km).forEach(function (nik) {
    var k = km[nik];
    var peran = tnaPeranTerhadap(auth, km, k);
    if (!peran || peran === "SELF" || peran === "ADMIN") return;
    if (k.ModeAsesmen === "KELOMPOK") {
      if (peran !== "ATASAN") return;
      if (!kelompok[k.KelompokID]) kelompok[k.KelompokID] = { kelompokId: k.KelompokID, jobTitle: k.JobTitle, jabatan: k.Jabatan, cabang: k.Cabang, anggota: 0 };
      kelompok[k.KelompokID].anggota++;
      return;
    }
    var st = sudah["N:" + nik + "|" + auth.nik] || "";
    var vv = valMap[nik] || {};
    var item = { nik: nik, nama: k.Nama, jabatan: k.Jabatan, jobTitle: k.JobTitle, cabang: k.Cabang, peran: peran, status: st || "BELUM",
      validasi: vv.Status || "", catatanValidasi: vv.Status === "DIKEMBALIKAN" ? String(vv.Catatan || "") : "" };
    if (peran === "DELEGASI") delegasi.push(item); else tugas.push(item);
  });
  var kelompokList = Object.keys(kelompok).map(function (id) {
    var g = kelompok[id], vv = valMap["K:" + id] || {};
    g.status = sudah["K:" + id + "|" + auth.nik] || "BELUM"; g.validasi = vv.Status || "";
    g.catatanValidasi = vv.Status === "DIKEMBALIKAN" ? String(vv.Catatan || "") : ""; return g;
  });

  // Delegasi menunggu approval untuk penilai utama
  var menunggu = [];
  ases.forEach(function (a) {
    if (a.Status !== "MENUNGGU_APPROVAL" || a.Rater !== "DELEGASI") return;
    var t = km[String(a.NIK)];
    if (t && t.PenilaiNIK === auth.nik) {
      if (!menunggu.some(function (m) { return m.nik === t.NIK; })) {
        menunggu.push({ nik: t.NIK, nama: t.Nama, jabatan: t.Jabatan, olehNik: String(a.RaterNIK), olehNama: (km[String(a.RaterNIK)] || {}).Nama || "" });
      }
    }
  });

  var saya = tnaPetaKaryawan(ss, true)[auth.nik];
  var selfStatus = !saya ? "TIDAK_PERLU" : saya.ModeAsesmen === "DIKECUALIKAN" ? "DIKECUALIKAN" :
    saya.ModeAsesmen !== "KELOMPOK" ? (sudah["N:" + auth.nik + "|" + auth.nik] || "BELUM") : "TIDAK_PERLU";
  tugas.sort(function (a, b) { return a.nama.localeCompare(b.nama); });
  return {
    ok: true, nama: auth.nama, role: auth.role, internal: tnaInternalLD(ss, auth, p), matrix: tnaBolehMatrix(ss, auth, p), window: win.status,
    windowBuka: win.buka, windowTutup: win.tutup, periode: p.Periode,
    terdaftar: !!saya, jabatan: saya ? saya.Jabatan : "", selfStatus: selfStatus,
    todo: {
      nilai: tugas.filter(function (t) { return t.status !== "FINAL" || t.validasi === "DIKEMBALIKAN"; }).length +
        kelompokList.filter(function (g) { return g.status !== "FINAL" || g.validasi === "DIKEMBALIKAN"; }).length,
      revisi: tugas.filter(function (t) { return t.validasi === "DIKEMBALIKAN"; }).length + kelompokList.filter(function (g) { return g.validasi === "DIKEMBALIKAN"; }).length,
      delegasi: delegasi.filter(function (t) { return t.status !== "FINAL" && t.status !== "MENUNGGU_APPROVAL"; }).length,
      approval: menunggu.length
    },
    tugas: tugas, kelompok: kelompokList, delegasi: delegasi, menungguApproval: menunggu,
    validasi: Object.keys(valMap).map(function (key) { return valMap[key]; }).filter(function (v) { return tnaAdalahValidator(auth.nik, v.ValidatorNIK); })
      .map(function (v) {
        var key = String(v.Target), kel = key.indexOf("K:") === 0;
        return { kunci: key, nik: kel ? "" : key, kelompokId: kel ? key.substring(2) : "", nama: v.Nama, jabatan: v.Jabatan, cabang: v.Cabang,
          penilai: (km[String(v.PenilaiNIK)] || {}).Nama || "", status: v.Status, ringkasan: tnaParseEdit(v.Ringkasan) };
      }).sort(function (a, b) { return (a.status === "MENUNGGU_VALIDASI" ? 0 : 1) - (b.status === "MENUNGGU_VALIDASI" ? 0 : 1) || String(a.nama).localeCompare(String(b.nama)); })
  };
}

/* ============================================================
 * FORM ASESMEN
 * Penilaian memakai checklist perilaku observable per level (L2..L5), bukan angka langsung,
 * meneruskan prinsip Studio v2 (mengurangi bias). Skor = 1 + jumlah level berturut-turut
 * yang tercentang dari bawah (skala Guttman); centang yang melompat diberi flag INKONSISTEN.
 * ============================================================ */
function tnaKompetensiJabatan(ss, kodeJabatan) {
  var kamus = {};
  tnaBaca(ss, "Kamus").forEach(function (k) { kamus[k.KodeKompetensi] = k; });
  var cek = {};
  tnaBaca(ss, "Checklist").forEach(function (c) { cek[c.KodeKompetensi] = [c.C2, c.C3, c.C4, c.C5].map(String); });
  return tnaBaca(ss, "Matriks").filter(function (m) { return m.KodeJabatan === kodeJabatan; }).map(function (m) {
    var k = kamus[m.KodeKompetensi] || {};
    return {
      kode: m.KodeKompetensi, nama: k.Nama || m.KodeKompetensi, kategori: k.Kategori || "", definisi: k.Definisi || "",
      levels: [k.L1, k.L2, k.L3, k.L4, k.L5].map(function (x) { return String(x || ""); }),
      checklist: cek[m.KodeKompetensi] || ["", "", "", ""], required: Number(m.RequiredLevel), bobot: Number(m.Bobot || 2)
    };
  });
}

function tnaForm(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  var p = tnaParam(ss), km = tnaPetaKaryawan(ss);
  var target, peran, kodeJabatan, judul;
  if (req.kelompokId) {
    var anggota = Object.keys(km).map(function (n) { return km[n]; }).filter(function (k) { return k.KelompokID === req.kelompokId; });
    if (!anggota.length) return { ok: false, error: "Kelompok tidak ditemukan." };
    if (anggota[0].PenilaiNIK !== auth.nik && auth.role !== "admin") return { ok: false, error: "Anda bukan penilai kelompok ini." };
    peran = "ATASAN"; kodeJabatan = anggota[0].KodeJabatan;
    judul = anggota[0].Jabatan + " di " + anggota[0].Cabang + " (" + anggota.length + " orang)";
    target = { kelompokId: req.kelompokId, anggota: anggota.map(function (a) { return a.Nama; }) };
  } else {
    var t = km[String(req.target || auth.nik)];
    if (!t) return { ok: false, error: tnaPetaKaryawan(ss, true)[String(req.target || auth.nik)] ? "Jabatan ini tidak termasuk asesmen TNA 2027." : "Karyawan tidak terdaftar di TNA 2027." };
    peran = tnaPeranTerhadap(auth, km, t);
    if (!peran || peran === "ADMIN") return { ok: false, error: "Anda tidak berwenang menilai karyawan ini." };
    if (peran === "SELF" && t.ModeAsesmen === "KELOMPOK") return { ok: false, error: "Jabatan Anda dinilai per kelompok oleh Kepala Cabang, tidak perlu self-rating." };
    kodeJabatan = t.KodeJabatan; judul = t.Nama + ", " + t.Jabatan;
    target = { nik: t.NIK, nama: t.Nama, jabatan: t.Jabatan, cabang: t.Cabang };
  }
  var mj = tnaBaca(ss, "MasterJabatan").filter(function (j) { return j.KodeJabatan === kodeJabatan; })[0];
  if (!mj || mj.StatusMatriks !== "APPROVED") return { ok: false, error: "Matriks kompetensi jabatan ini belum disetujui. Hubungi L&D." };
  var komp = tnaKompetensiJabatan(ss, kodeJabatan);

  // Jawaban sebelumnya (supaya bisa dilanjutkan / direvisi selama window dibuka)
  var prev = {};
  var lihatDelegasi = req.lihatDelegasi === true && !req.kelompokId;
  if (lihatDelegasi && peran !== "ATASAN" && auth.role !== "admin") return { ok: false, error: "Hanya penilai utama yang dapat meninjau isian delegasi." };
  tnaBaca(ss, "Asesmen").forEach(function (a) {
    if (a.Periode !== p.Periode) return;
    if (lihatDelegasi) { if (a.Rater !== "DELEGASI" || a.Status !== "MENUNGGU_APPROVAL") return; }
    else if (String(a.RaterNIK) !== auth.nik) return;
    if (req.kelompokId ? a.KelompokID !== req.kelompokId : String(a.NIK) !== target.nik) return;
    prev[a.KodeKompetensi] = { checks: tnaNormalChecks(a.Checks), na: a.NA === true || String(a.NA).toUpperCase() === "TRUE", alasan: a.Alasan };
  });
  var draft = lihatDelegasi ? null : (tnaDraftMilik(ss, p, auth.nik)[req.kelompokId ? "K:" + req.kelompokId : target.nik] || null);
  return { ok: true, peran: peran, judul: judul, target: target, kompetensi: komp, jawaban: prev, draft: draft, window: tnaWindow(p).status };
}

// Checks disimpan sebagai huruf Y/N (contoh "YYNN" untuk L2..L5) supaya Sheets tidak mengubahnya jadi angka.
function tnaNormalChecks(checks) {
  var s = String(checks || "").toUpperCase().replace(/1/g, "Y").replace(/0/g, "N").replace(/[^YN]/g, "");
  while (s.length < 4) s += "N";
  return s.substring(0, 4);
}

function tnaSkorDariChecks(checks) {
  var s = tnaNormalChecks(checks).replace(/Y/g, "1").replace(/N/g, "0");
  var lvl = 1, putus = false, inkonsisten = false;
  for (var i = 0; i < 4; i++) {
    var c = s.charAt(i) === "1";
    if (c && !putus) lvl++;
    else if (!c) putus = true;
    else if (c && putus) inkonsisten = true;
  }
  return { level: lvl, inkonsisten: inkonsisten };
}

function tnaSubmit(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  var p = tnaParam(ss);
  if (tnaWindow(p).status !== "DIBUKA" && auth.role !== "admin") return { ok: false, error: "Window asesmen sedang tidak dibuka." };
  var km = tnaPetaKaryawan(ss);
  var peran, nikTarget = "", kelompokId = "", kodeJabatan;
  if (req.kelompokId) {
    var ang = Object.keys(km).map(function (n) { return km[n]; }).filter(function (k) { return k.KelompokID === req.kelompokId; });
    if (!ang.length) return { ok: false, error: "Kelompok tidak ditemukan." };
    if (ang[0].PenilaiNIK !== auth.nik && auth.role !== "admin") return { ok: false, error: "Anda bukan penilai kelompok ini." };
    peran = "ATASAN"; kelompokId = req.kelompokId; kodeJabatan = ang[0].KodeJabatan;
  } else {
    var t = km[String(req.target || "")];
    if (!t) return { ok: false, error: "Karyawan tidak terdaftar di TNA 2027." };
    peran = tnaPeranTerhadap(auth, km, t);
    if (!peran || peran === "ADMIN") return { ok: false, error: "Anda tidak berwenang menilai karyawan ini." };
    nikTarget = t.NIK; kodeJabatan = t.KodeJabatan;
  }
  var komp = tnaKompetensiJabatan(ss, kodeJabatan);
  var wajib = {}; komp.forEach(function (k) { wajib[k.kode] = true; });
  var jawaban = req.jawaban || {};
  var baris = [], kurang = [];
  Object.keys(wajib).forEach(function (kode) {
    var j = jawaban[kode];
    if (!j) { kurang.push(kode); return; }
    var na = j.na === true;
    if (na && !String(j.alasan || "").trim()) { kurang.push(kode); return; }
    var sk = tnaSkorDariChecks(j.checks);
    baris.push({
      Periode: p.Periode, NIK: nikTarget, KelompokID: kelompokId, KodeKompetensi: kode, Rater: peran, RaterNIK: auth.nik,
      Checks: tnaNormalChecks(j.checks), Level: na ? "" : sk.level, NA: na, Alasan: String(j.alasan || ""),
      Status: peran === "DELEGASI" ? "MENUNGGU_APPROVAL" : "FINAL", Timestamp: new Date()
    });
  });
  if (kurang.length) return { ok: false, error: "Masih ada " + kurang.length + " kompetensi yang belum diisi (atau N/A tanpa alasan)." };

  var lock = LockService.getScriptLock();
  waitLockDenganRetry(lock, 15000, 3);
  try {
    // Hapus jawaban lama rater yang sama untuk target yang sama (revisi), lalu tulis baru.
    var sh = tnaSheet(ss, "Asesmen");
    var v = sh.getDataRange().getValues();
    var simpan = [v[0]];
    for (var i = 1; i < v.length; i++) {
      var sama = v[i][0] === p.Periode && String(v[i][5]) === auth.nik &&
        (kelompokId ? v[i][2] === kelompokId : String(v[i][1]) === nikTarget);
      if (!sama) simpan.push(v[i]);
    }
    if (simpan.length !== v.length) {
      sh.getRange(1, 1, v.length, v[0].length).clearContent();
      sh.getRange(1, 1, simpan.length, v[0].length).setValues(simpan);
    }
    tnaTambah(ss, "Asesmen", baris);
    tnaHapusDraft(ss, p, auth.nik, [kelompokId ? "K:" + kelompokId : nikTarget]);
    // Validasi Head unit: rating atasan baru/revisi -> MENUNGGU_VALIDASI. Self-rating sesudah disetujui -> tinjau ulang.
    var kunciV = kelompokId ? "K:" + kelompokId : nikTarget;
    var vAda = tnaPetaValidasi(ss, p)[kunciV];
    if (peran === "ATASAN" || peran === "ATASAN2") tnaSimpanValidasi(ss, p, km, kunciV, { Status: "MENUNGGU_VALIDASI", Edit: "" }, auth.nik);
    else if (peran === "SELF" && vAda && vAda.Status === "DISETUJUI")
      tnaSimpanValidasi(ss, p, km, kunciV, { Status: "MENUNGGU_VALIDASI", Catatan: "Self-rating masuk setelah validasi, mohon tinjau ulang." }, auth.nik);
  } finally { lock.releaseLock(); }
  tnaLog(ss, auth.nik, "submit", (kelompokId || nikTarget) + " peran " + peran + " " + baris.length + " kompetensi");
  return { ok: true, peran: peran, jumlah: baris.length, status: peran === "DELEGASI" ? "MENUNGGU_APPROVAL" : "FINAL",
    lihatHasil: peran === "ATASAN" || peran === "ATASAN2" };
}

// Penilai utama menyetujui (atau menolak) isian delegasi Leader Mekanik.
function tnaApprove(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  var p = tnaParam(ss), km = tnaPetaKaryawan(ss);
  var t = km[String(req.target || "")];
  if (!t || (t.PenilaiNIK !== auth.nik && auth.role !== "admin")) return { ok: false, error: "Anda bukan penilai utama karyawan ini." };
  var setuju = req.setuju !== false;
  var lock = LockService.getScriptLock();
  waitLockDenganRetry(lock, 15000, 3);
  var n = 0;
  try {
    var sh = tnaSheet(ss, "Asesmen");
    var v = sh.getDataRange().getValues();
    var h = v[0], cSt = h.indexOf("Status"), cRater = h.indexOf("Rater"), cRN = h.indexOf("RaterNIK");
    var simpan = [h];
    for (var i = 1; i < v.length; i++) {
      var hit = v[i][0] === p.Periode && String(v[i][1]) === t.NIK && v[i][cRater] === "DELEGASI" && v[i][cSt] === "MENUNGGU_APPROVAL";
      if (hit) {
        n++;
        if (!setuju) continue;
        v[i][cSt] = "FINAL"; v[i][cRater] = "ATASAN"; v[i][cRN] = auth.nik;
        v[i][h.indexOf("Alasan")] = String(v[i][h.indexOf("Alasan")] || "") + " [diisi delegasi, disetujui " + auth.nama + "]";
      }
      simpan.push(v[i]);
    }
    sh.getRange(1, 1, v.length, h.length).clearContent();
    sh.getRange(1, 1, simpan.length, h.length).setValues(simpan);
    if (setuju && n) tnaSimpanValidasi(ss, p, km, t.NIK, { Status: "MENUNGGU_VALIDASI", Edit: "" }, auth.nik);
  } finally { lock.releaseLock(); }
  tnaLog(ss, auth.nik, setuju ? "approve" : "tolak", t.NIK + " " + n + " baris");
  return { ok: true, jumlah: n, setuju: setuju };
}

/* ============================================================
 * DASHBOARD PROGRES
 * ============================================================ */
function tnaProgres(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  var p = tnaParam(ss), km = tnaPetaKaryawan(ss);
  var mode = tnaModeLingkup(auth, req, "langsung", km);
  var lingkup = tnaLingkupTampil(auth, km, "", mode);
  var ases = tnaBaca(ss, "Asesmen").filter(function (a) { return a.Periode === p.Periode && a.Status === "FINAL"; });
  var dinilai = {}, self = {}, kel = {};
  ases.forEach(function (a) {
    if (a.KelompokID) kel[a.KelompokID] = true;
    else if (a.Rater === "SELF") self[String(a.NIK)] = true;
    else dinilai[String(a.NIK)] = true;
  });
  var agg = {}, belum = [];
  lingkup.forEach(function (k) {
    var key = k.Cabang;
    if (!agg[key]) agg[key] = { unit: key, total: 0, selesai: 0, self: 0, perluSelf: 0 };
    var a = agg[key]; a.total++;
    var ok = k.ModeAsesmen === "KELOMPOK" ? !!kel[k.KelompokID] : !!dinilai[k.NIK];
    if (ok) a.selesai++; else belum.push({ nik: k.NIK, nama: k.Nama, cabang: k.Cabang, jabatan: k.Jabatan, penilai: (km[k.PenilaiNIK] || {}).Nama || "" });
    if (k.ModeAsesmen !== "KELOMPOK") { a.perluSelf++; if (self[k.NIK]) a.self++; }
  });
  var units = Object.keys(agg).map(function (x) { var a = agg[x]; a.persen = a.total ? Math.round(a.selesai / a.total * 100) : 0; return a; })
    .sort(function (a, b) { return a.persen - b.persen; });
  var tot = units.reduce(function (s, u) { s.total += u.total; s.selesai += u.selesai; return s; }, { total: 0, selesai: 0 });
  // Rekap penilai yang belum selesai (untuk reminder)
  var perPenilai = {};
  belum.forEach(function (b) { perPenilai[b.penilai] = (perPenilai[b.penilai] || 0) + 1; });
  var valMapP = tnaPetaValidasi(ss, p), rekapVal = { DISETUJUI: 0, MENUNGGU_VALIDASI: 0, DIKEMBALIKAN: 0 }, sudahK = {};
  lingkup.forEach(function (k) {
    var key = tnaKunciValidasi(k); if (sudahK[key]) return; sudahK[key] = true;
    var v = valMapP[key]; if (v && rekapVal[v.Status] !== undefined) rekapVal[v.Status]++;
  });
  return { ok: true, lingkup: tnaInfoLingkup(auth, km, mode), total: tot.total, selesai: tot.selesai, persen: tot.total ? Math.round(tot.selesai / tot.total * 100) : 0, validasi: rekapVal,
    units: units, belum: belum.slice(0, 300), perPenilai: perPenilai, window: tnaWindow(p).status };
}

/* ============================================================
 * MATRIKS: review & approve per jabatan (Dept Head / Admin)
 * ============================================================ */
function tnaMatriksJabatan(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  var jab = tnaBaca(ss, "MasterJabatan"), boleh = tnaJabatanBoleh(ss, auth);
  if (boleh) jab = jab.filter(function (j) { return boleh[String(j.KodeJabatan)]; });
  if (!req.kodeJabatan) {
    return { ok: true, jabatan: jab.map(function (j) {
      return { kode: j.KodeJabatan, jobTitle: j.JobTitle, dept: j.Dept, jml: j.JmlIncumbent, status: j.StatusMatriks, statusJD: j.StatusJD, link: j.LinkJD };
    }) };
  }
  var mj = jab.filter(function (j) { return j.KodeJabatan === req.kodeJabatan; })[0];
  if (!mj) return { ok: false, error: "Kode jabatan tidak ditemukan." };
  var task = tnaBaca(ss, "Task").filter(function (t) { return t.KodeJabatan === req.kodeJabatan; });
  var flags = {};
  tnaBaca(ss, "Matriks").forEach(function (m) { if (m.KodeJabatan === req.kodeJabatan) flags[m.KodeKompetensi] = { flag: m.Flag, sumber: m.Sumber }; });
  var komp = tnaKompetensiJabatan(ss, req.kodeJabatan).map(function (k) { k.flag = (flags[k.kode] || {}).flag || ""; k.sumber = (flags[k.kode] || {}).sumber || ""; return k; });
  return { ok: true, jabatan: mj, kompetensi: komp, task: task };
}

/* ============================================================
 * DOSIER JABATAN (v2.7): satu jabatan, seluruh dokumen standar TANPA menunggu asesmen. Bentuknya mengikuti master kompetensi
 * teknis buatan L&D: (1) breakdown JD dan KSA, (2) kamus kompetensi 5 level + indikator, (3) skala level, (4) matriks kompetensi
 * (satu departemen), ditambah (5) rencana pengembangan 70/20/10 dan (6) TNA standar jabatan (training wajib dan jalur bila gap).
 * Tidak ada angka per orang. Jabatan yang belum punya master tetap dihasilkan dari data otomatis dan diberi penanda sumber.
 * ============================================================ */
function tnaPotong(t, n) { t = String(t || ""); return t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, "") + "…" : t; }
function tnaJudulJabatan(t) { return String(t || "").toLowerCase().replace(/(^|[\s(\/.-])([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); }).replace(/\bAnd\b/g, "and").replace(/\bHc\b/g, "HC").replace(/\bGa\b/g, "GA").replace(/\bAmu\b/g, "AMU").replace(/\bBpkb\b/g, "BPKB").replace(/\bCfo\b/g, "CFO").replace(/\bIt\b/g, "IT"); }
var TNA_NAMA_LEVEL = ["", "Awareness", "Basic", "Intermediate", "Advanced", "Expert"];
var TNA_SKALA = [
  { level: 1, label: "Awareness", status: "Belum mandiri", definisi: "Mengetahui konsep dan istilah dasar. Membutuhkan bimbingan penuh dalam mengerjakan tugas.", panduan: "Mampu menjelaskan pengertian dan fungsi kompetensi; mengetahui kapan kompetensi ini dipakai; belum bisa mengerjakan tugas tanpa arahan." },
  { level: 2, label: "Basic", status: "Perlu bimbingan", definisi: "Mampu mengerjakan tugas rutin yang sederhana dengan panduan. Hasil kerja masih perlu direview dan dikoreksi atasan.", panduan: "Mengerjakan tugas rutin sederhana dengan panduan; masih membutuhkan bimbingan pada situasi yang tidak biasa." },
  { level: 3, label: "Intermediate", status: "Mandiri", definisi: "Menguasai kompetensi dan mampu mengerjakannya secara mandiri pada situasi yang bervariasi. Hasil kerja dapat diandalkan.", panduan: "Mengerjakan seluruh tugas terkait kompetensi secara mandiri; mampu menangani variasi dan masalah umum." },
  { level: 4, label: "Advanced", status: "Mahir dan rujukan", definisi: "Mahir dan menjadi rujukan rekan kerja. Mampu mengelola situasi kompleks serta membimbing orang lain.", panduan: "Mengerjakan tugas kompleks secara mandiri; menjadi tempat bertanya; membimbing rekan di bawahnya." },
  { level: 5, label: "Expert", status: "Inovator", definisi: "Menginisiasi pengembangan sistem, kebijakan, atau metodologi baru. Menjadi rujukan di tingkat perusahaan.", panduan: "Menginisiasi pengembangan sistem, kebijakan, atau metode baru; rujukan utama di tingkat perusahaan." }
];
function tnaDosierJabatan(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  var kj = String(req.kodeJabatan || "");
  var jabAll = tnaBaca(ss, "MasterJabatan"), boleh = tnaJabatanBoleh(ss, auth);
  var mj = jabAll.filter(function (j) { return j.KodeJabatan === kj; })[0];
  if (!mj) return { ok: false, error: "Kode jabatan tidak ditemukan." };
  if (boleh && !boleh[kj]) return { ok: false, error: "Dosier ini hanya untuk jabatan Anda dan jabatan tim Anda." };
  var p = tnaParam(ss), durDef = Number(p.DurasiDefaultJam) || 4;
  var kamus = {}; tnaBaca(ss, "Kamus").forEach(function (k) { kamus[k.KodeKompetensi] = k; });
  var indik = {}; tnaBaca(ss, "Indikator").forEach(function (r) { (indik[r.KodeKompetensi] = indik[r.KodeKompetensi] || {})[Number(r.Level)] = r; });
  var matAll = tnaBaca(ss, "Matriks");
  var flags = {}; matAll.forEach(function (m) { if (m.KodeJabatan === kj) flags[m.KodeKompetensi] = { flag: m.Flag, sumber: m.Sumber }; });
  var interv = {}; tnaBaca(ss, "Intervensi").forEach(function (r) { (interv[r.KodeKompetensi] = interv[r.KodeKompetensi] || {})[String(r.Tipe)] = String(r.Deskripsi || ""); });
  var katalog = tnaBaca(ss, "Katalog").filter(function (c) { return String(c.Status).toUpperCase() !== "NONAKTIF"; });
  var katBy = {}; katalog.forEach(function (c) { katBy[c.KodeTraining] = c; });
  var kompList = function (c) { return String(c.KodeKompetensi || "").split(/[,;]\s*/).filter(String); };
  var infoTraining = function (c) {
    var j = Number(c.DurasiJam);
    return { kode: String(c.KodeTraining), judul: c.Judul, kategori: String(c.Kategori), metode: String(c.Metode || ""), jam: j > 0 ? j : durDef, jamDefault: !(j > 0), status: String(c.Status || "") };
  };
  var nama = function (kode) { return (kamus[kode] || {}).Nama || kode; };
  // 1. breakdown tugas: dikelompokkan per tugas utama, lalu per aktivitas (satu aktivitas bisa menuntut beberapa kompetensi)
  var tugas = [], idx = {}, terkait = {}, aktSemua = {};
  tnaBaca(ss, "Task").filter(function (t) { return t.KodeJabatan === kj; }).forEach(function (t) {
    var key = String(t.TugasUtama || "").trim();
    if (!idx[key]) { idx[key] = { no: tugas.length + 1, utama: key, akt: [], _a: {} }; tugas.push(idx[key]); }
    var tg = idx[key], nm = String(t.Task || "").trim(), ak = tg._a[nm];
    if (!ak) {
      ak = tg._a[nm] = { task: nm, subProses: String(t.SubProses || ""), subSubProses: String(t.SubSubProses || ""), pengetahuan: String(t.Pengetahuan || ""),
        standar: String(t.StandarKinerja || ""), subStandar: String(t.SubStandar || ""), ksa: String(t.KSA || ""), level: t.LevelAktivitas === "" || t.LevelAktivitas == null ? "" : Number(t.LevelAktivitas), komp: [] };
      tg.akt.push(ak);
    }
    if (t.KodeKompetensi) {
      if (!ak.komp.some(function (c) { return c.kode === t.KodeKompetensi; })) ak.komp.push({ kode: t.KodeKompetensi, nama: nama(t.KodeKompetensi) });
      var u = (terkait[t.KodeKompetensi] = terkait[t.KodeKompetensi] || { utama: {}, akt: {} }); u.utama[tg.utama] = true; u.akt[nm] = true;
    }
  });
  tugas.forEach(function (t) { delete t._a; });
  var punyaKsa = tugas.some(function (t) { return t.akt.some(function (a) { return a.ksa || a.standar || a.pengetahuan; }); });
  // 2. kompetensi: level 1-5 beserta indikator
  var wajibKode = tnaBaca(ss, "Mandatory").filter(function (m) { return m.KodeJabatan === "*" || m.KodeJabatan === kj; });
  var wajib = wajibKode.filter(function (m) { return katBy[m.KodeTraining]; }).map(function (m) { var o = infoTraining(katBy[m.KodeTraining]); o.dasar = String(m.Dasar || ""); return o; });
  var wajibC = wajibKode.map(function (m) { return katBy[m.KodeTraining]; }).filter(Boolean);
  var jabBy = {}; jabAll.forEach(function (j) { jabBy[j.KodeJabatan] = j; });
  var komp = tnaKompetensiJabatan(ss, kj).map(function (k) {
    var kd = kamus[k.kode] || {}, ind = indik[k.kode] || {};
    k.kelompok = String(kd.Kelompok || "");
    k.levelDetail = [1, 2, 3, 4, 5].map(function (n) {
      var r = ind[n], cek = (k.checklist[n - 2] || "");
      var daftar = r && r.Indikator ? String(r.Indikator).split("\n").filter(String) : (n >= 2 ? cek.split(/;\s*/).filter(String) : []);
      return { level: n, label: TNA_NAMA_LEVEL[n], definisi: r ? String(r.DefinisiLevel || "") : String(k.levels[n - 1] || ""), indikator: daftar }; // master: definisi level boleh kosong (indikator sudah memuatnya)
    });
    // jalur training bila gap, per level awal
    var jalur = [];
    for (var lv = Math.max(0, k.required - 1); lv >= 1; lv--) {
      var tutup = wajibC.some(function (c) { return kompList(c).indexOf(k.kode) !== -1 && Number(c.LevelTarget || 5) > lv; });
      var opsi = katalog.filter(function (c) {
        var sas = String(c.SasaranJabatan || "").trim();
        return String(c.Kategori) !== "Pengayaan" && String(c.Kategori) !== "IHT" && kompList(c).indexOf(k.kode) !== -1 &&
          Number(c.LevelTarget || 5) > lv && (!sas || sas.split(/[,;]\s*/).indexOf(kj) !== -1);
      }).sort(function (a, b) { return Number(a.LevelTarget || 5) - Number(b.LevelTarget || 5); });
      jalur.push({ dariLevel: lv, sudahWajib: tutup, training: opsi.length ? infoTraining(opsi[0]) : null });
    }
    // 20: belajar dari jabatan lain yang levelnya lebih tinggi pada kompetensi yang sama (departemen sama didahulukan)
    var mentor = matAll.filter(function (m) { return m.KodeKompetensi === k.kode && m.KodeJabatan !== kj && Number(m.RequiredLevel) > k.required && jabBy[m.KodeJabatan]; })
      .map(function (m) { var j = jabBy[m.KodeJabatan]; return { jabatan: j.JobTitle, level: Number(m.RequiredLevel), samaDept: j.Dept === mj.Dept }; })
      .sort(function (a, b) { return (a.samaDept ? 0 : 1) - (b.samaDept ? 0 : 1) || a.level - b.level; }).slice(0, 3);
    var f = flags[k.kode] || {};
    k.flag = f.flag || ""; k.sumber = f.sumber || "";
    var akt = Object.keys((terkait[k.kode] || { akt: {} }).akt);
    k.aktivitasTerkait = akt;
    k.tugasTerkait = Object.keys((terkait[k.kode] || { utama: {} }).utama);
    k.p70 = akt.length ? "Pegang langsung: " + akt.slice(0, 2).map(function (x) { return tnaPotong(x, 95); }).join("; ") + (akt.length > 2 ? " (dan " + (akt.length - 2) + " aktivitas lain)" : "") : ((interv[k.kode] || {})["70"] || "");
    k.p20 = mentor.length ? "Belajar dari " + mentor.map(function (m) { return tnaJudulJabatan(m.jabatan) + " (level " + m.level + ")"; }).join(", ") : ((interv[k.kode] || {})["20"] || "");
    k.mentor = mentor; k.jalur = jalur;
    return k;
  });
  // 4. matriks satu departemen (jabatan yang punya matriks), jabatan ini di kolom pertama
  var rekanKode = {}; jabAll.forEach(function (j) { if (j.Dept === mj.Dept) rekanKode[j.KodeJabatan] = true; });
  var lvBy = {}; matAll.forEach(function (m) { if (rekanKode[m.KodeJabatan]) (lvBy[m.KodeJabatan] = lvBy[m.KodeJabatan] || {})[m.KodeKompetensi] = Number(m.RequiredLevel); });
  // kolom pembanding: jabatan se-departemen yang berbagi minimal satu kompetensi TEKNIS (kompetensi perilaku dimiliki semua jabatan, tidak informatif)
  var teknisIni = lvBy[kj] || {};
  var kolom = Object.keys(lvBy).filter(function (c) {
    return c !== kj && (!boleh || boleh[c]) && Object.keys(lvBy[c]).some(function (kk) { return teknisIni[kk] && (kamus[kk] || {}).Kategori === "Technical"; });
  }).sort();
  kolom.unshift(kj);
  var kompMat = {}; kolom.forEach(function (c) { Object.keys(lvBy[c] || {}).forEach(function (kk) { kompMat[kk] = true; }); });
  var baris = Object.keys(kompMat).map(function (kk) { var kd = kamus[kk] || {}; return { kode: kk, nama: kd.Nama || kk, kategori: kd.Kategori || "", kelompok: kd.Kelompok || "" }; })
    .sort(function (a, b) { var o = { Technical: 0, Behavioral: 1, Leadership: 2 }; return (o[a.kategori] === undefined ? 3 : o[a.kategori]) - (o[b.kategori] === undefined ? 3 : o[b.kategori]) || a.kode.localeCompare(b.kode); });
  var matriks = { kolom: kolom.map(function (c) { var j = jabBy[c]; return { kode: c, nama: j.JobTitle, dept: j.Dept, ini: c === kj }; }), baris: baris,
    level: lvBy };
  var ih = tnaBaca(ss, "IHT").filter(function (r) { return r.KodeJabatan === kj; })[0];
  var jamWajib = wajib.reduce(function (a, w) { return a + (w.jamDefault ? 0 : w.jam); }, 0), jamTbd = wajib.filter(function (w) { return w.jamDefault; }).length;
  return { ok: true,
    jabatan: { kode: kj, jobTitle: mj.JobTitle, dept: mj.Dept, divisi: tnaDivisi(mj.Dept), jml: Number(mj.JmlIncumbent) || 0, statusJD: mj.StatusJD, linkJD: mj.LinkJD, statusMatriks: mj.StatusMatriks, master: String(mj.Versi) === "MASTER" },
    tugas: tugas, punyaKsa: punyaKsa, kompetensi: komp, skala: TNA_SKALA, matriks: matriks, wajib: wajib,
    iht: ih ? { jamTotal: Number(ih.JamTotal) || 0, selling: Number(ih.JamSelling) || 0, pk: Number(ih.JamPK) || 0, ass: Number(ih.JamASS) || 0, self: Number(ih.JamSelf) || 0 } : null,
    ringkas: { tugasUtama: tugas.length, aktivitas: tugas.reduce(function (a, t) { return a + t.akt.length; }, 0), kompetensi: komp.length,
      teknis: komp.filter(function (k) { return k.kategori === "Technical"; }).length, jamWajib: jamWajib, jamBelumDitetapkan: jamTbd, durasiDefault: durDef } };
}

/* ============================================================
 * PUSAT MATRIX L&D: competency matrix & training matrix per lingkup (jabatan / dept / divisi / BBM)
 * ============================================================ */
var TNA_DIVISI = {
  "HC & GA": "HC & GA", "IT": "HC & GA",
  "HO FINANCE": "Finance", "FINANCE ADMIN": "Finance",
  "HO ASS SERVICE": "After Sales", "HO ASS SPARE PART": "After Sales", "OPERATION SERVICE": "After Sales", "OPERATION SPARE PART": "After Sales",
  "HO OPERATION": "Operation (Sales & Marketing)", "OPERATION SALES": "Operation (Sales & Marketing)",
  "OPERATION SALES (JUNIOR & SENIOR)": "Operation (Sales & Marketing)", "HO MARKETING": "Operation (Sales & Marketing)",
  "OTHER HO": "Direksi & Perwakilan", "OTHER PERWAKILAN": "Direksi & Perwakilan"
};
function tnaDivisi(dept) { return TNA_DIVISI[String(dept || "").toUpperCase()] || "Lainnya"; }

function tnaMatrixOutput(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  var admin = auth.role === "admin";
  if (!tnaBolehMatrix(ss, auth)) return { ok: false, error: "Pusat Matrix untuk level Dept Head ke atas." };
  var boleh = admin ? null : tnaJabatanLingkup(ss, auth);
  var jab = tnaBaca(ss, "MasterJabatan").filter(function (j) { return String(j.StatusMatriks) !== "DIKECUALIKAN" && (!boleh || boleh[String(j.KodeJabatan)]); });
  var kamus = {}; tnaBaca(ss, "Kamus").forEach(function (k) { kamus[k.KodeKompetensi] = [k.Nama, k.Kategori]; });
  var mat = tnaBaca(ss, "Matriks");
  var katalog = tnaBaca(ss, "Katalog").filter(function (c) { return String(c.Status).toUpperCase() !== "NONAKTIF"; });
  var katBy = {}; katalog.forEach(function (c) { katBy[c.KodeTraining] = c; });
  var mand = tnaBaca(ss, "Mandatory"), iht = {}; tnaBaca(ss, "IHT").forEach(function (r) { iht[r.KodeJabatan] = r; });
  var kompList = function (c) { return String(c.KodeKompetensi || "").split(/[,;]\s*/).filter(String); };
  var perJab = {}; mat.forEach(function (m) { (perJab[m.KodeJabatan] = perJab[m.KodeJabatan] || []).push(m); });
  var tanda = {};
  jab.forEach(function (j) {
    var kj = j.KodeJabatan, t = tanda[kj] = {};
    var wajib = mand.filter(function (m) { return (m.KodeJabatan === "*" || m.KodeJabatan === kj) && katBy[m.KodeTraining]; }).map(function (m) { return katBy[m.KodeTraining]; });
    wajib.forEach(function (c) { t[c.KodeTraining] = { m: "W" }; });
    (perJab[kj] || []).forEach(function (m) {
      for (var lv = 1; lv < Number(m.RequiredLevel); lv++) {
        var tutup = wajib.some(function (c) { return kompList(c).indexOf(m.KodeKompetensi) !== -1 && Number(c.LevelTarget || 5) > lv; });
        if (tutup) continue;
        var opsi = katalog.filter(function (c) {
          var sas = String(c.SasaranJabatan || "").trim();
          return String(c.Kategori) !== "Pengayaan" && String(c.Kategori) !== "IHT" && kompList(c).indexOf(m.KodeKompetensi) !== -1 &&
            Number(c.LevelTarget || 5) > lv && (!sas || sas.split(/[,;]\s*/).indexOf(kj) !== -1);
        }).sort(function (a, b) { return Number(a.LevelTarget || 5) - Number(b.LevelTarget || 5); });
        if (!opsi.length || t[opsi[0].KodeTraining]) continue;
        t[opsi[0].KodeTraining] = { m: "G", k: m.KodeKompetensi };
      }
    });
    var ih = iht[kj];
    if (ih) [["IHT-SELL", "JamSelling"], ["IHT-PK", "JamPK"], ["IHT-ASV", "JamASS"], ["IHT-SELF", "JamSelf"]].forEach(function (x) {
      if (Number(ih[x[1]]) > 0 && katBy[x[0]]) t[x[0]] = { m: "I" };
    });
  });
  var dipakai = {}; Object.keys(tanda).forEach(function (kj) { Object.keys(tanda[kj]).forEach(function (k) { dipakai[k] = true; }); });
  katalog.forEach(function (c) { if (String(c.Kategori) === "Pengayaan") dipakai[c.KodeTraining] = true; });
  var train = {}; Object.keys(dipakai).forEach(function (k) {
    var c = katBy[k];
    train[k] = [c.Judul, String(c.Kategori), c.DurasiJam === "" ? "" : Number(c.DurasiJam), String(c.Status || ""), kompList(c).map(function (x) { return (kamus[x] || [x])[0]; }).join(", "), c.LevelTarget === "" ? "" : Number(c.LevelTarget)];
  });
  var hasil = null;
  if (req.sumber === "hasil") {
    var p = tnaParam(ss), km = tnaPetaKaryawan(ss);
    var nikDari = function (arr) { return arr.map(function (k) { return String(k.NIK); }); };
    var tim = nikDari(tnaLingkupTampil(auth, km, "", "bawahan")), timLangsung = nikDari(tnaLingkupTampil(auth, km, "", "langsung"));
    var kelihatan = {}; if (!admin) { tim.forEach(function (n) { kelihatan[n] = true; }); kelihatan[auth.nik] = true; }
    var lihat = function (n) { return admin || kelihatan[String(n)]; };
    hasil = {
      orang: Object.keys(km).filter(lihat).map(function (n) { var k = km[n]; return [n, k.Nama, k.KodeJabatan, k.Jabatan, k.Cabang, k.Dept, tnaDivisi(k.Dept)]; }),
      timSaya: tim, timLangsung: timLangsung,
      gap: tnaHitungGap(ss, p, km).filter(function (g) { return lihat(g.NIK); }).map(function (g) { return [String(g.NIK), g.KodeKompetensi, g.Actual === "" ? null : Number(g.Actual), Number(g.Required), g.KategoriGap]; }),
      itp: tnaBaca(ss, "ITP").filter(function (r) { return lihat(r.NIK); }).map(function (r) { return [String(r.NIK), r.KodeTraining, r.Kategori, r.Bulan, Number(r.Jam || 0), r.Status]; }),
      outputTerakhir: String(p.OutputTerakhir || "")
    };
    tnaBaca(ss, "ITP").filter(function (r) { return lihat(r.NIK); }).forEach(function (r) { var c = katBy[r.KodeTraining]; if (c && !train[r.KodeTraining]) train[r.KodeTraining] = [c.Judul, String(c.Kategori), c.DurasiJam === "" ? "" : Number(c.DurasiJam), String(c.Status || ""), kompList(c).map(function (x) { return (kamus[x] || [x])[0]; }).join(", "), c.LevelTarget === "" ? "" : Number(c.LevelTarget)]; });
  }
  return {
    ok: true, dibuat: new Date().toISOString(), hasil: hasil,
    jabatan: jab.map(function (j) { return { kode: j.KodeJabatan, title: j.JobTitle, dept: j.Dept, div: tnaDivisi(j.Dept), jml: Number(j.JmlIncumbent || 0), lokasi: j.Lokasi, statusJD: j.StatusJD }; }),
    kamus: kamus,
    matriks: mat.filter(function (m) { return tanda[m.KodeJabatan]; }).map(function (m) { return [m.KodeJabatan, m.KodeKompetensi, Number(m.RequiredLevel), Number(m.Bobot || 2)]; }),
    tanda: tanda, training: train
  };
}

function tnaApproveMatriks(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  if (auth.role !== "admin") return { ok: false, error: "Hanya admin L&D yang dapat menyetujui matriks." };
  var kodeList = req.kodeList || (req.kodeJabatan ? [req.kodeJabatan] : []);
  var sh = tnaSheet(ss, "MasterJabatan");
  var v = sh.getDataRange().getValues(), h = v[0];
  var n = 0;
  for (var i = 1; i < v.length; i++) {
    if (kodeList.indexOf(v[i][0]) === -1) continue;
    v[i][h.indexOf("StatusMatriks")] = req.status || "APPROVED";
    v[i][h.indexOf("DisetujuiOleh")] = auth.nama;
    v[i][h.indexOf("DisetujuiPada")] = new Date();
    n++;
  }
  sh.getRange(1, 1, v.length, h.length).setValues(v);
  tnaLog(ss, auth.nik, "approveMatriks", kodeList.join(","));
  return { ok: true, jumlah: n };
}

function tnaSetParameter(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  if (auth.role !== "admin") return { ok: false, error: "Hanya admin." };
  var boleh = ["KodeJabatanLD", "WindowBuka", "WindowTutup", "BobotAtasan", "BobotSelf", "TargetJamBulan", "KapasitasKelas", "DurasiDefaultJam",
    "KoefTraining", "KoefCoaching", "KoefPenugasan", "JamCoachingPerGap", "MaksPersenIHT", "JamSesiIHT", "ProyeksiPesertaBST"];
  var sh = tnaSheet(ss, "Parameter");
  var v = sh.getDataRange().getValues();
  var ubah = req.parameter || {};
  Object.keys(ubah).forEach(function (k) {
    if (boleh.indexOf(k) === -1) return;
    var found = false;
    for (var i = 1; i < v.length; i++) if (v[i][0] === k) { v[i][1] = ubah[k]; found = true; }
    if (!found) v.push([k, ubah[k], ""]);
  });
  sh.getRange(1, 1, v.length, 3).setValues(v);
  tnaLog(ss, auth.nik, "setParameter", JSON.stringify(ubah));
  return { ok: true, parameter: tnaParam(ss) };
}

/* ============================================================
 * MESIN OUTPUT: Gap -> Rekomendasi 70/20/10 -> ITP -> Batch/Kalender -> Proyeksi
 * Satu fungsi in-memory, ditulis per blok. 807 orang x ~15 kompetensi aman di bawah 6 menit.
 * ============================================================ */
function tnaHitungGap(ss, p, km) {
  var bA = Number(p.BobotAtasan), bS = Number(p.BobotSelf);
  var ases = tnaBaca(ss, "Asesmen").filter(function (a) { return a.Periode === p.Periode && a.Status === "FINAL" && !(a.NA === true || String(a.NA).toUpperCase() === "TRUE"); });
  // Kumpulkan skor per (nik, kompetensi)
  var kel = {}; // kelompokId -> {kode: [levels]}
  var atas = {}, self = {}, raterStat = {};
  ases.forEach(function (a) {
    var lv = Number(a.Level); if (!lv) return;
    var rk = String(a.RaterNIK);
    if (a.Rater !== "SELF") { (raterStat[rk] = raterStat[rk] || []).push(lv); }
    if (a.KelompokID) { ((kel[a.KelompokID] = kel[a.KelompokID] || {})[a.KodeKompetensi] = kel[a.KelompokID][a.KodeKompetensi] || []).push(lv); return; }
    var key = String(a.NIK) + "|" + a.KodeKompetensi;
    if (a.Rater === "SELF") self[key] = lv;
    else (atas[key] = atas[key] || []).push(lv);
  });
  // Flag rater: straight-lining & leniency
  var flagRater = {}, rerata = [];
  Object.keys(raterStat).forEach(function (r) {
    var arr = raterStat[r]; var m = arr.reduce(function (s, x) { return s + x; }, 0) / arr.length; rerata.push(m);
    if (arr.length >= 10) {
      var freq = {}; arr.forEach(function (x) { freq[x] = (freq[x] || 0) + 1; });
      var maks = Math.max.apply(null, Object.keys(freq).map(function (k) { return freq[k]; }));
      if (maks / arr.length >= 0.9) flagRater[r] = "STRAIGHT-LINING";
    }
    raterStat[r] = m;
  });
  if (rerata.length > 2) {
    var mu = rerata.reduce(function (s, x) { return s + x; }, 0) / rerata.length;
    var sd = Math.sqrt(rerata.reduce(function (s, x) { return s + (x - mu) * (x - mu); }, 0) / rerata.length);
    Object.keys(raterStat).forEach(function (r) { if (raterStat[r] > mu + sd) flagRater[r] = (flagRater[r] ? flagRater[r] + ", " : "") + "LENIENCY"; });
  }
  var kamus = {}; tnaBaca(ss, "Kamus").forEach(function (k) { kamus[k.KodeKompetensi] = k; });
  var matriks = {}; tnaBaca(ss, "Matriks").forEach(function (m) { (matriks[m.KodeJabatan] = matriks[m.KodeJabatan] || []).push(m); });

  var gapRows = [];
  Object.keys(km).forEach(function (nik) {
    var k = km[nik];
    (matriks[k.KodeJabatan] || []).forEach(function (m) {
      var key = nik + "|" + m.KodeKompetensi, flags = [];
      var la = k.ModeAsesmen === "KELOMPOK" ? ((kel[k.KelompokID] || {})[m.KodeKompetensi] || []) : (atas[key] || []);
      var sA = la.length ? la.reduce(function (s, x) { return s + x; }, 0) / la.length : null;
      var sS = k.ModeAsesmen === "KELOMPOK" ? null : (self[key] === undefined ? null : self[key]);
      if (k.Penilai2NIK && la.length === 1) flags.push("RATER TUNGGAL");
      if (sA !== null && sS !== null && Math.abs(sA - sS) >= 2) flags.push("KALIBRASI");
      var fr = flagRater[k.PenilaiNIK]; if (fr) flags.push(fr);
      var req = Number(m.RequiredLevel), bobot = Number(m.Bobot || 2);
      var actual = "", gap = "", prio = "", kat;
      if (sA === null) { kat = "BELUM DINILAI"; }
      else {
        // Level adalah skala bertingkat: aktual dibulatkan ke level utuh (0,5 ke atas), keputusan user 27 Okt
        actual = Math.round(sS === null ? sA : bA * sA + bS * sS);
        gap = Math.max(0, req - actual);
        prio = gap * bobot;
        kat = gap === 0 ? "Kompeten" : (gap === 1 ? "Minor" : (gap === 2 ? "Moderate" : "Major"));
      }
      var kk = kamus[m.KodeKompetensi] || {};
      gapRows.push({ Periode: p.Periode, NIK: nik, Nama: k.Nama, Cabang: k.Cabang, Dept: k.Dept, KodeJabatan: k.KodeJabatan, JobTitle: k.JobTitle,
        KodeKompetensi: m.KodeKompetensi, Kompetensi: kk.Nama || m.KodeKompetensi, Kategori: kk.Kategori || "", Required: req, Bobot: bobot,
        SkorAtasan: sA === null ? "" : tnaR2(sA), SkorSelf: sS === null ? "" : sS, Actual: actual, Gap: gap, Prioritas: prio, KategoriGap: kat,
        Flag: flags.join(", ") });
    });
  });
  return gapRows;
}

/* ============================================================
 * REKOMENDASI PER ORANG (dipakai live setelah submit dan saat generate output)
 * ============================================================ */
function tnaSiapRekom(ss, p, km, gapRows) {
  var cx = { km: km, p: p };
  cx.katalog = tnaBaca(ss, "Katalog").filter(function (c) { return String(c.Status).toUpperCase() !== "NONAKTIF"; });
  cx.katByKode = {}; cx.katalog.forEach(function (c) { cx.katByKode[c.KodeTraining] = c; });
  cx.intervensi = {}; tnaBaca(ss, "Intervensi").forEach(function (i) { ((cx.intervensi[i.KodeKompetensi] = cx.intervensi[i.KodeKompetensi] || {})[String(i.Tipe)] = i.Deskripsi); });
  cx.taskMap = {}; tnaBaca(ss, "Task").forEach(function (t) { var key = t.KodeJabatan + "|" + t.KodeKompetensi; (cx.taskMap[key] = cx.taskMap[key] || []).push(t.Task); });
  cx.mandatory = tnaBaca(ss, "Mandatory");
  cx.lulus = {}; tnaBaca(ss, "Riwayat").forEach(function (r) { cx.lulus[String(r.NIK) + "|" + r.KodeTraining] = true; });
  // Indeks calon mentor per kompetensi: actual tinggi
  cx.mentor = {};
  gapRows.forEach(function (g) { if (g.Actual !== "" && Number(g.Actual) >= 4) (cx.mentor[g.KodeKompetensi] = cx.mentor[g.KodeKompetensi] || []).push(g); });
  return cx;
}

// Opsi training katalog untuk satu gap (urut LevelTarget terendah yang masih di atas level sekarang).
// Modul ber-SasaranJabatan hanya untuk jabatan sasarannya (BMDP tidak ditawarkan ke non-Kacab, dst).
function tnaOpsiTraining(cx, nik, g) {
  var lvlNow = Math.floor(Number(g.Actual));
  return cx.katalog.filter(function (c) {
    var sas = String(c.SasaranJabatan || "").trim();
    return String(c.Kategori) !== "Pengayaan" && String(c.Kategori) !== "IHT" && String(c.KodeKompetensi).split(/[,;]\s*/).indexOf(g.KodeKompetensi) !== -1 &&
      Number(c.LevelTarget || 5) > lvlNow && !cx.lulus[nik + "|" + c.KodeTraining] &&
      (!sas || sas.split(/[,;]\s*/).indexOf(String(g.KodeJabatan)) !== -1);
  }).sort(function (a, b) { return Number(a.LevelTarget || 5) - Number(b.LevelTarget || 5); });
}

// gapList: baris Gap orang ini yang Gap > 0. edit: {KodeKompetensi: {r70, r20, r10}} dari validator,
// r10 = KodeTraining pengganti pilihan validator. Hasil: baris Rekomendasi + training penutup gap (wajib, tanpa batas,
// tidak ditunda; keputusan user 27 Okt). Nilai lama "TANPA" diabaikan: training wajib tidak bisa ditiadakan.
function tnaRekomOrang(cx, nik, gapList, edit) {
  edit = edit || {};
  var k = cx.km[nik] || {}, rekom = [], dianjurkan = [], sudah = {};
  // Program Wajib orang ini (korporat, jabatan, per NIK) yang belum lulus: dipakai agar gap tidak diberi training dobel
  var wajibOrang = (cx.mandatory || []).filter(function (m) {
    return (m.KodeJabatan === "*" || m.KodeJabatan === k.KodeJabatan || m.KodeJabatan === "NIK:" + nik) && cx.katByKode[m.KodeTraining] && !cx.lulus[nik + "|" + m.KodeTraining];
  }).map(function (m) { return cx.katByKode[m.KodeTraining]; });
  gapList.slice().sort(function (a, b) { return Number(b.Prioritas) - Number(a.Prioritas); }).forEach(function (g) {
    var e = edit[g.KodeKompetensi] || {};
    var tasks = cx.taskMap[g.KodeJabatan + "|" + g.KodeKompetensi] || [];
    var r70 = tasks.length ? "Penugasan terstruktur 3 bulan pada tugas: " + tasks.slice(0, 2).join("; ") + ", dipantau atasan." :
      ((cx.intervensi[g.KodeKompetensi] || {})["70"] || "Penugasan terstruktur pada tugas yang memakai kompetensi ini, dipantau atasan.");
    var cand = (cx.mentor[g.KodeKompetensi] || []).filter(function (m) { return m.NIK !== nik && Number(m.Actual) >= Math.min(5, Number(g.Required) + 1); })
      .sort(function (a, b) { return (a.Cabang === g.Cabang ? 0 : 1) - (b.Cabang === g.Cabang ? 0 : 1) || Number(b.Actual) - Number(a.Actual); });
    var r20 = "Coaching bulanan oleh " + ((cx.km[k.PenilaiNIK] || {}).Nama || "atasan langsung") +
      (cand.length ? "; mentoring/shadowing: " + cand.slice(0, 2).map(function (m) { return m.Nama + " (" + m.Cabang + ")"; }).join(", ") : "") +
      ((cx.intervensi[g.KodeKompetensi] || {})["20"] ? "; " + cx.intervensi[g.KodeKompetensi]["20"] : "");
    var r10, kodeR10 = "";
    var pakaiEdit = e.r10 && e.r10 !== "TANPA" && cx.katByKode[e.r10];
    var lvlNow = Math.floor(Number(g.Actual));
    var olehWajib = wajibOrang.filter(function (c) {
      return String(c.KodeKompetensi).split(/[,;]\s*/).indexOf(g.KodeKompetensi) !== -1 && Number(c.LevelTarget || 5) > lvlNow;
    })[0];
    if (!pakaiEdit && olehWajib) {
      r10 = olehWajib.KodeTraining + " " + olehWajib.Judul + " (sudah termasuk program wajib)";
    } else if (pakaiEdit) {
      kodeR10 = e.r10; r10 = e.r10 + " " + cx.katByKode[e.r10].Judul + " (wajib, dipilih validator)";
    } else {
      var opsi = tnaOpsiTraining(cx, nik, g);
      if (!opsi.length) r10 = "GAP KATALOG: belum ada modul untuk kompetensi ini (L&D menyiapkan/mengadakan)";
      else { kodeR10 = opsi[0].KodeTraining; r10 = opsi[0].KodeTraining + " " + opsi[0].Judul + " (wajib)"; }
    }
    if (kodeR10 && !sudah[kodeR10]) {
      sudah[kodeR10] = true; dianjurkan.push({ kode: kodeR10, kompetensi: g.KodeKompetensi, namaKompetensi: g.Kompetensi, prioritas: Number(g.Prioritas) });
    }
    var diubah = [];
    if (e.r70) { r70 = String(e.r70); diubah.push("70"); }
    if (e.r20) { r20 = String(e.r20); diubah.push("20"); }
    if (pakaiEdit) diubah.push("10");
    rekom.push({ NIK: nik, Nama: g.Nama, KodeKompetensi: g.KodeKompetensi, Kompetensi: g.Kompetensi, Gap: g.Gap, Prioritas: g.Prioritas,
      R70_Penugasan: r70, R20_Sosial: r20, R10_Training: r10, DiubahValidator: diubah.join(",") });
  });
  return { rekom: rekom, dianjurkan: dianjurkan };
}

/* ============================================================
 * VALIDASI HEAD UNIT
 * Penilai submit -> gap & rekomendasi langsung terlihat -> Head unit (ValidatorNIK) menyetujui,
 * mengedit rekomendasi, atau mengembalikan ke penilai. Satu baris TNA_Validasi per target
 * (NIK, atau K:<KelompokID> untuk penilaian kelompok sales).
 * ============================================================ */
function tnaKunciValidasi(k) { return !k ? "" : (k.ModeAsesmen === "KELOMPOK" ? "K:" + k.KelompokID : String(k.NIK)); }
function tnaParseEdit(x) { try { return x ? JSON.parse(String(x)) : {}; } catch (e) { return {}; } }
function tnaPetaValidasi(ss, p) {
  var m = {};
  tnaBaca(ss, "Validasi").forEach(function (v) { if (v.Periode === p.Periode) m[String(v.Target)] = v; });
  return m;
}
function tnaWakilTarget(km, kunci) {
  if (kunci.indexOf("K:") !== 0) return km[kunci] || null;
  var id = kunci.substring(2), hit = null;
  Object.keys(km).some(function (n) { if (km[n].KelompokID === id) { hit = km[n]; return true; } return false; });
  return hit;
}
// Upsert satu baris validasi. ubah: field yang diganti (Status, Catatan, Edit, ...).
function tnaSimpanValidasi(ss, p, km, kunci, ubah, olehNik) {
  var w = tnaWakilTarget(km, kunci); if (!w) return;
  var sh = tnaSheet(ss, "Validasi"), h = TNA_TAB.Validasi;
  var v = sh.getDataRange().getValues(), baris = -1;
  for (var i = 1; i < v.length; i++) if (v[i][0] === p.Periode && String(v[i][1]) === kunci) { baris = i; break; }
  var o = {};
  if (baris > 0) h.forEach(function (c, j) { o[c] = v[baris][j]; });
  else o = { Periode: p.Periode, Target: kunci, Jenis: kunci.indexOf("K:") === 0 ? "KELOMPOK" : "INDIVIDU", Catatan: "", Edit: "" };
  o.Nama = kunci.indexOf("K:") === 0 ? w.Jabatan + " " + w.Cabang : w.Nama;
  o.Jabatan = w.Jabatan; o.Cabang = w.Cabang; o.PenilaiNIK = w.PenilaiNIK; o.ValidatorNIK = String(w.ValidatorNIK || "");
  Object.keys(ubah).forEach(function (c) { o[c] = ubah[c]; });
  if (ubah.Status === "MENUNGGU_VALIDASI") o.Ringkasan = tnaRingkasHasil(ss, p, w);
  o.DiperbaruiOleh = olehNik; o.Timestamp = new Date();
  var row = h.map(function (c) { return o[c] === undefined || o[c] === null ? "" : o[c]; });
  if (baris > 0) sh.getRange(baris + 1, 1, 1, h.length).setValues([row]);
  else sh.getRange(sh.getLastRow() + 1, 1, 1, h.length).setValues([row]);
}
// Ringkasan untuk daftar validasi: jumlah gap per kategori + flag validitas (KALIBRASI, LENIENCY, dst).
function tnaRingkasHasil(ss, p, w) {
  var sub = {}; sub[w.NIK] = w;
  var g = tnaHitungGap(ss, p, sub), r = { major: 0, moderate: 0, minor: 0, kompeten: 0, flag: 0, jenis: [] }, jn = {};
  g.forEach(function (x) {
    var k = String(x.KategoriGap).toLowerCase(); if (r[k] !== undefined) r[k]++;
    if (x.Flag) { r.flag++; String(x.Flag).split(/,\s*/).forEach(function (f) { if (f) jn[f] = true; }); }
  });
  r.jenis = Object.keys(jn); // jenis catatan kualitas (khusus tampilan L&D)
  return JSON.stringify(r);
}
function tnaAdalahValidator(nik, daftar) { return String(daftar || "").split(/[,;]\s*/).indexOf(String(nik)) !== -1; }
function tnaBolehValidasi(auth, w) { return auth.role === "admin" || (!!w && tnaAdalahValidator(auth.nik, w.ValidatorNIK)); }

// Hasil live satu target: gap + rekomendasi 70/20/10 + training wajib + status validasi.
function tnaHasil(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  var p = tnaParam(ss), km = tnaPetaKaryawan(ss);
  var kunci = req.kelompokId ? "K:" + req.kelompokId : String(req.target || "");
  var w = tnaWakilTarget(km, kunci);
  if (!w) return { ok: false, error: "Karyawan/kelompok tidak ditemukan di TNA 2027." };
  var val = tnaPetaValidasi(ss, p)[kunci] || null;
  var peran = req.kelompokId ? (w.PenilaiNIK === auth.nik ? "ATASAN" : null) : tnaPeranTerhadap(auth, km, w);
  var validator = tnaBolehValidasi(auth, w);
  // Karyawan yang dinilai tidak melihat gap/rekomendasi; yang ia lihat hanya ITP & kalender training (tnaITPSaya).
  var bolehLihat = validator || peran === "ATASAN" || peran === "ATASAN2" || peran === "ADMIN" ||
    (peran !== "SELF" && tnaLingkup(auth, km, "").some(function (k) { return k.NIK === w.NIK; })); // atasan berjenjang: baca saja
  if (!bolehLihat) return { ok: false, error: peran === "SELF" ? "Yang dapat Anda lihat adalah ITP & kalender training, setelah output TNA terbit." : "Anda tidak berwenang melihat hasil ini." };
  var gapAll = tnaHitungGap(ss, p, km);
  var gapT = gapAll.filter(function (g) { return g.NIK === w.NIK; });
  var cx = tnaSiapRekom(ss, p, km, gapAll);
  var edit = tnaParseEdit(val && val.Edit);
  var hasil = tnaRekomOrang(cx, w.NIK, gapT.filter(function (g) { return Number(g.Gap) > 0; }), edit);
  var opsi = {};
  gapT.forEach(function (g) {
    if (Number(g.Gap) > 0) opsi[g.KodeKompetensi] = tnaOpsiTraining(cx, w.NIK, g).map(function (c) { return { kode: c.KodeTraining, judul: c.Judul, level: c.LevelTarget, jam: c.DurasiJam }; });
  });
  var wajib = [];
  tnaBaca(ss, "Mandatory").forEach(function (m) {
    if (m.KodeJabatan !== "*" && m.KodeJabatan !== w.KodeJabatan && m.KodeJabatan !== "NIK:" + w.NIK) return;
    var c = cx.katByKode[m.KodeTraining];
    if (c && !cx.lulus[w.NIK + "|" + m.KodeTraining]) wajib.push({ kode: c.KodeTraining, judul: c.Judul, jam: c.DurasiJam || Number(p.DurasiDefaultJam) || "", dasar: m.Dasar, jenis: "PROGRAM" });
  });
  // Training penutup gap juga wajib (keputusan user 27 Okt); program yang sudah wajib tidak dobel
  var adaW = {}; wajib.forEach(function (x) { adaW[x.kode] = true; });
  hasil.dianjurkan.forEach(function (d) {
    var c = cx.katByKode[d.kode] || {}; if (adaW[d.kode]) return; adaW[d.kode] = true;
    wajib.push({ kode: d.kode, judul: c.Judul, jam: c.DurasiJam || Number(p.DurasiDefaultJam) || "", dasar: "Menutup gap " + (d.namaKompetensi || d.kompetensi), jenis: "GAP", kompetensi: d.kompetensi });
  });
  var dinilai = gapT.some(function (g) { return g.SkorAtasan !== ""; });
  return {
    ok: true, kunci: kunci, nama: req.kelompokId ? w.Jabatan + " di " + w.Cabang : w.Nama, jabatan: w.Jabatan, cabang: w.Cabang,
    kelompok: !!req.kelompokId, dinilai: dinilai, gap: gapT, rekomendasi: hasil.rekom,
    dianjurkan: hasil.dianjurkan.map(function (d) { var c = cx.katByKode[d.kode] || {}; return { kode: d.kode, judul: c.Judul, jam: c.DurasiJam, kompetensi: d.kompetensi }; }),
    wajib: wajib, opsiTraining: opsi, edit: edit, window: tnaWindow(p).status,
    validasi: val ? { status: val.Status, catatan: val.Catatan, oleh: (km[String(val.DiperbaruiOleh)] || {}).Nama || String(val.DiperbaruiOleh || ""), waktu: val.Timestamp } : null,
    validatorNama: (function () {
      var semua = tnaPetaKaryawan(ss, true);
      var n = String(w.ValidatorNIK || "").split(/[,;]\s*/).map(function (x) { return (semua[x] || {}).Nama; }).filter(Boolean);
      return n.length ? n.join(" / ") : (String(w.ValidatorNIK || "") ? "Head unit" : "L&D (Admin)");
    })(),
    bukti: tnaBuktiPenilai(ss, p, km, w, !!req.kelompokId),
    bisaValidasi: validator && dinilai
  };
}

// Centangan perilaku per penilai (FINAL) untuk ditinjau validator: {KodeKompetensi: [{rater, peran, checks, level, na, alasan}]}
function tnaBuktiPenilai(ss, p, km, w, kelompok) {
  var semua = tnaPetaKaryawan(ss, true), out = {};
  tnaBaca(ss, "Asesmen").forEach(function (a) {
    if (a.Periode !== p.Periode || a.Status !== "FINAL") return;
    if (kelompok ? a.KelompokID !== w.KelompokID : (String(a.NIK) !== w.NIK || a.KelompokID)) return;
    (out[a.KodeKompetensi] = out[a.KodeKompetensi] || []).push({
      rater: (semua[String(a.RaterNIK)] || {}).Nama || String(a.RaterNIK), peran: a.Rater, checks: tnaNormalChecks(a.Checks),
      level: a.Level, na: a.NA === true || String(a.NA).toUpperCase() === "TRUE", alasan: String(a.Alasan || "") });
  });
  var cek = {}; tnaBaca(ss, "Checklist").forEach(function (c) { cek[c.KodeKompetensi] = [c.C2, c.C3, c.C4, c.C5].map(String); });
  Object.keys(out).forEach(function (k) { out[k] = { penilai: out[k], checklist: cek[k] || [] }; });
  return out;
}

function tnaValidasi(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  var p = tnaParam(ss), km = tnaPetaKaryawan(ss);
  var kunci = req.kelompokId ? "K:" + req.kelompokId : String(req.target || "");
  var w = tnaWakilTarget(km, kunci);
  if (!w) return { ok: false, error: "Karyawan/kelompok tidak ditemukan di TNA 2027." };
  if (!tnaBolehValidasi(auth, w)) return { ok: false, error: "Hanya Head unit (validator) yang dapat memvalidasi hasil ini." };
  var aksi = String(req.aksi || "").toUpperCase(), catatan = String(req.catatan || "").trim();
  if (["SETUJUI", "KEMBALIKAN"].indexOf(aksi) === -1) return { ok: false, error: "Aksi validasi tidak dikenal." };
  if (aksi === "KEMBALIKAN" && !catatan) return { ok: false, error: "Tulis catatan untuk penilai: bagian mana yang perlu direvisi." };
  if (aksi === "KEMBALIKAN" && tnaWindow(p).status !== "DIBUKA") return { ok: false, error: "Window asesmen sudah ditutup, penilai tidak bisa merevisi. Silakan edit rekomendasi lalu Setujui, atau hubungi L&D." };
  var lock = LockService.getScriptLock();
  waitLockDenganRetry(lock, 15000, 3);
  var n = 0;
  try {
    var ada = tnaPetaValidasi(ss, p)[kunci];
    if (!ada) return { ok: false, error: "Belum ada penilaian atasan untuk divalidasi." };
    if (aksi === "KEMBALIKAN") {
      var sh = tnaSheet(ss, "Asesmen"), v = sh.getDataRange().getValues(), h = v[0];
      var cSt = h.indexOf("Status"), cR = h.indexOf("Rater"), cK = h.indexOf("KelompokID");
      for (var i = 1; i < v.length; i++) {
        var kena = v[i][0] === p.Periode && v[i][cSt] === "FINAL" && (v[i][cR] === "ATASAN" || v[i][cR] === "ATASAN2") &&
          (req.kelompokId ? v[i][cK] === req.kelompokId : String(v[i][1]) === w.NIK);
        if (kena) { v[i][cSt] = "DIKEMBALIKAN"; n++; }
      }
      if (n) sh.getRange(1, 1, v.length, h.length).setValues(v);
      tnaSimpanValidasi(ss, p, km, kunci, { Status: "DIKEMBALIKAN", Catatan: catatan, Edit: "" }, auth.nik);
    } else {
      var edit = {};
      Object.keys(req.edit || {}).forEach(function (kk) {
        var e = req.edit[kk] || {}, o = {};
        ["r70", "r20", "r10"].forEach(function (f) { if (e[f] && String(e[f]).trim()) o[f] = String(e[f]).trim().substring(0, 500); });
        if (Object.keys(o).length) edit[kk] = o;
      });
      tnaSimpanValidasi(ss, p, km, kunci, { Status: "DISETUJUI", Catatan: catatan, Edit: Object.keys(edit).length ? JSON.stringify(edit) : "" }, auth.nik);
    }
  } finally { lock.releaseLock(); }
  tnaLog(ss, auth.nik, "validasi" + aksi, kunci + (n ? " " + n + " baris asesmen dikembalikan" : ""));
  return { ok: true, status: aksi === "SETUJUI" ? "DISETUJUI" : "DIKEMBALIKAN" };
}

// Setujui banyak hasil sekaligus (tanpa edit). Hanya baris MENUNGGU_VALIDASI milik validator ini.
function tnaValidasiMassal(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  var p = tnaParam(ss), km = tnaPetaKaryawan(ss);
  var minta = {}; (req.targets || []).forEach(function (t) { minta[String(t)] = true; });
  var lock = LockService.getScriptLock();
  waitLockDenganRetry(lock, 15000, 3);
  var n = 0, lewat = 0;
  try {
    var sh = tnaSheet(ss, "Validasi"), h = TNA_TAB.Validasi, v = sh.getDataRange().getValues();
    var cT = h.indexOf("Target"), cS = h.indexOf("Status"), cO = h.indexOf("DiperbaruiOleh"), cW = h.indexOf("Timestamp"), cC = h.indexOf("Catatan");
    for (var i = 1; i < v.length; i++) {
      var key = String(v[i][cT]);
      if (v[i][0] !== p.Periode || !minta[key]) continue;
      var w = tnaWakilTarget(km, key);
      if (!tnaBolehValidasi(auth, w) || v[i][cS] !== "MENUNGGU_VALIDASI") { lewat++; continue; }
      v[i][cS] = "DISETUJUI"; v[i][cO] = auth.nik; v[i][cW] = new Date(); v[i][cC] = String(req.catatan || "Disetujui massal");
      n++;
    }
    if (n) sh.getRange(1, 1, v.length, h.length).setValues(v);
  } finally { lock.releaseLock(); }
  tnaLog(ss, auth.nik, "validasiMassal", n + " disetujui, " + lewat + " dilewati");
  return { ok: true, disetujui: n, dilewati: lewat };
}

/* ============================================================
 * DRAFT DI SERVER: isian yang belum dikirim tersimpan per penilai x target,
 * sehingga bisa dilanjutkan dari perangkat lain. Dihapus otomatis saat submit.
 * ============================================================ */
function tnaDraftMilik(ss, p, raterNik) {
  var m = {};
  tnaBaca(ss, "Draft").forEach(function (d) {
    if (d.Periode !== p.Periode || String(d.RaterNIK) !== String(raterNik)) return;
    try { m[String(d.Target)] = { jawaban: JSON.parse(String(d.Jawaban)), waktu: d.Timestamp }; } catch (e) { /* draft rusak diabaikan */ }
  });
  return m;
}
function tnaHapusDraft(ss, p, raterNik, targets) {
  var sh = ss.getSheetByName("TNA_Draft"); if (!sh || sh.getLastRow() < 2) return;
  var hapus = {}; targets.forEach(function (t) { hapus[String(t)] = true; });
  var v = sh.getDataRange().getValues(), simpan = [v[0]];
  for (var i = 1; i < v.length; i++) if (!(v[i][0] === p.Periode && String(v[i][1]) === String(raterNik) && hapus[String(v[i][2])])) simpan.push(v[i]);
  if (simpan.length === v.length) return;
  sh.getRange(1, 1, v.length, v[0].length).clearContent();
  sh.getRange(1, 1, simpan.length, v[0].length).setValues(simpan);
}
// req.drafts = [{ target | kelompokId, jawaban }] (satu atau banyak sekaligus, untuk mode per kompetensi)
function tnaSimpanDraft(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  var p = tnaParam(ss), km = tnaPetaKaryawan(ss);
  if (tnaWindow(p).status !== "DIBUKA" && auth.role !== "admin") return { ok: false, error: "Window asesmen sedang tidak dibuka." };
  var list = req.drafts || [{ target: req.target, kelompokId: req.kelompokId, jawaban: req.jawaban }];
  var baru = {};
  for (var i = 0; i < list.length; i++) {
    var d = list[i], key;
    if (d.kelompokId) {
      var w = tnaWakilTarget(km, "K:" + d.kelompokId);
      if (!w || (w.PenilaiNIK !== auth.nik && auth.role !== "admin")) return { ok: false, error: "Anda bukan penilai kelompok ini." };
      key = "K:" + d.kelompokId;
    } else {
      var t = km[String(d.target || "")];
      if (!t || !tnaPeranTerhadap(auth, km, t)) return { ok: false, error: "Anda tidak berwenang menilai karyawan ini." };
      key = t.NIK;
    }
    var js = JSON.stringify(d.jawaban || {});
    if (js.length > 45000) return { ok: false, error: "Draft terlalu besar." };
    baru[key] = js;
  }
  var lock = LockService.getScriptLock();
  waitLockDenganRetry(lock, 15000, 3);
  try {
    var sh = tnaSheet(ss, "Draft"), v = sh.getDataRange().getValues(), sekarang = new Date();
    for (var r = 1; r < v.length; r++) {
      var k = String(v[r][2]);
      if (v[r][0] === p.Periode && String(v[r][1]) === auth.nik && baru[k] !== undefined) { v[r][3] = baru[k]; v[r][4] = sekarang; delete baru[k]; }
    }
    if (v.length > 1) sh.getRange(1, 1, v.length, v[0].length).setValues(v);
    var tambah = Object.keys(baru).map(function (k2) { return [p.Periode, auth.nik, k2, baru[k2], sekarang]; });
    if (tambah.length) sh.getRange(sh.getLastRow() + 1, 1, tambah.length, 5).setValues(tambah);
  } finally { lock.releaseLock(); }
  return { ok: true, waktu: new Date() };
}

/* ============================================================
 * MODE NILAI PER KOMPETENSI: satu jabatan, seluruh tim sekaligus.
 * Menilai satu kompetensi untuk semua orang berturut-turut mengurangi efek halo
 * dan membuat penilai membandingkan anggota tim secara langsung (kalibrasi alami).
 * ============================================================ */
function tnaAnggotaTim(auth, km) {
  return Object.keys(km).map(function (n) { return km[n]; }).filter(function (k) {
    if (k.ModeAsesmen === "KELOMPOK") return false;
    var pr = tnaPeranTerhadap(auth, km, k); return pr === "ATASAN" || pr === "ATASAN2";
  });
}
function tnaFormTim(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  var p = tnaParam(ss), km = tnaPetaKaryawan(ss);
  var anggota = tnaAnggotaTim(auth, km);
  var grup = {};
  anggota.forEach(function (k) { (grup[k.KodeJabatan] = grup[k.KodeJabatan] || []).push(k); });
  var daftar = Object.keys(grup).map(function (kj) { return { kode: kj, jobTitle: grup[kj][0].JobTitle, jabatan: grup[kj][0].Jabatan, jumlah: grup[kj].length }; })
    .sort(function (a, b) { return b.jumlah - a.jumlah; });
  var kode = req.kodeJabatan || (daftar[0] || {}).kode;
  if (!kode || !grup[kode]) return { ok: true, daftar: daftar, kodeJabatan: "", kompetensi: [], orang: [], window: tnaWindow(p).status };
  var mj = tnaBaca(ss, "MasterJabatan").filter(function (j) { return j.KodeJabatan === kode; })[0];
  if (!mj || mj.StatusMatriks !== "APPROVED") return { ok: false, error: "Matriks kompetensi jabatan ini belum disetujui. Hubungi L&D." };
  var prev = {}, sudah = {}, val = tnaPetaValidasi(ss, p), drafts = tnaDraftMilik(ss, p, auth.nik);
  tnaBaca(ss, "Asesmen").forEach(function (a) {
    if (a.Periode !== p.Periode || String(a.RaterNIK) !== auth.nik || a.KelompokID) return;
    var n = String(a.NIK);
    (prev[n] = prev[n] || {})[a.KodeKompetensi] = { checks: tnaNormalChecks(a.Checks), na: a.NA === true || String(a.NA).toUpperCase() === "TRUE", alasan: a.Alasan };
    if (!sudah[n] || a.Status === "FINAL") sudah[n] = a.Status;
  });
  var orang = grup[kode].sort(function (a, b) { return String(a.Nama).localeCompare(String(b.Nama)); }).map(function (k) {
    return { nik: k.NIK, nama: k.Nama, cabang: k.Cabang, peran: tnaPeranTerhadap(auth, km, k), status: sudah[k.NIK] || "BELUM",
      validasi: (val[k.NIK] || {}).Status || "", jawaban: prev[k.NIK] || {}, draft: drafts[k.NIK] || null };
  });
  return { ok: true, daftar: daftar, kodeJabatan: kode, jobTitle: grup[kode][0].JobTitle, kompetensi: tnaKompetensiJabatan(ss, kode), orang: orang, window: tnaWindow(p).status };
}
// req.jawabanPer = { nik: { kodeKompetensi: {checks, na, alasan} } }. Hanya orang yang lengkap yang dikirim (dicek per orang oleh tnaSubmit).
function tnaSubmitTim(ss, req) {
  var hasil = [], ok = 0;
  Object.keys(req.jawabanPer || {}).forEach(function (nik) {
    var r = tnaSubmit(ss, { nik: req.nik, pin: req.pin, target: nik, jawaban: req.jawabanPer[nik] });
    hasil.push({ nik: nik, ok: r.ok, error: r.error || "" }); if (r.ok) ok++;
  });
  return { ok: true, terkirim: ok, hasil: hasil };
}

/* ============================================================
 * DASHBOARD TIM untuk penilai / Head unit / admin.
 * Lingkup: semua orang di bawah rantai penilai/validator pengguna (admin: seluruh karyawan, bisa difilter cabang).
 * ============================================================ */
function tnaLingkup(auth, km, cabang) {
  var semua = Object.keys(km).map(function (n) { return km[n]; });
  if (auth.role === "admin") return semua.filter(function (k) { return !cabang || k.Cabang === cabang; });
  var bawah = {}, ubah = true; bawah[auth.nik] = true;
  while (ubah) {
    ubah = false;
    semua.forEach(function (k) {
      if (bawah[k.NIK]) return;
      if (bawah[k.PenilaiNIK] || bawah[k.Penilai2NIK] || tnaAdalahValidator(auth.nik, k.ValidatorNIK)) { bawah[k.NIK] = true; ubah = true; }
    });
  }
  delete bawah[auth.nik];
  return semua.filter(function (k) { return bawah[k.NIK] && (!cabang || k.Cabang === cabang); });
}
// Lingkup tampilan tim (Progres, Dashboard Tim, Training Tim, Pusat Matrix):
//   langsung = orang yang saya nilai (PenilaiNIK/Penilai2NIK = saya); bawahan = seluruh rantai penilai/validator di bawah saya;
//   semua = seluruh BBM (hanya admin). Tidak pernah "semua" secara diam-diam: admin pun default ke bawahannya sendiri.
function tnaLingkupTampil(auth, km, cabang, mode) {
  var semua = Object.keys(km).map(function (n) { return km[n]; });
  var saring = function (arr) { return arr.filter(function (k) { return !cabang || k.Cabang === cabang; }); };
  if (mode === "semua" && auth.role === "admin") return saring(semua);
  if (mode === "langsung") return saring(semua.filter(function (k) { return k.NIK !== auth.nik && (k.PenilaiNIK === auth.nik || k.Penilai2NIK === auth.nik); }));
  var bawah = {}, ubah = true; bawah[auth.nik] = true;
  while (ubah) {
    ubah = false;
    semua.forEach(function (k) {
      if (bawah[k.NIK]) return;
      if (bawah[k.PenilaiNIK] || bawah[k.Penilai2NIK] || tnaAdalahValidator(auth.nik, k.ValidatorNIK)) { bawah[k.NIK] = true; ubah = true; }
    });
  }
  delete bawah[auth.nik];
  return saring(semua.filter(function (k) { return bawah[k.NIK]; }));
}
function tnaModeLingkup(auth, req, bawaan, km) {
  var m = String(req.lingkup || "");
  if (m === "langsung" || m === "bawahan" || (m === "semua" && auth.role === "admin")) return m;
  // Tidak dipilih eksplisit: mulai dari bawaan, naik satu tingkat bila kosong (admin tanpa tim -> seluruh BBM)
  var urut = bawaan === "langsung" ? ["langsung", "bawahan"] : ["bawahan"];
  if (auth.role === "admin") urut.push("semua");
  for (var i = 0; i < urut.length; i++) if (tnaLingkupTampil(auth, km, "", urut[i]).length) return urut[i];
  return bawaan;
}
function tnaInfoLingkup(auth, km, mode) {
  var j = { langsung: tnaLingkupTampil(auth, km, "", "langsung").length, bawahan: tnaLingkupTampil(auth, km, "", "bawahan").length };
  if (auth.role === "admin") j.semua = Object.keys(km).length;
  return { pilih: mode, jumlah: j };
}
function tnaTim(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  var p = tnaParam(ss), km = tnaPetaKaryawan(ss);
  var mode = tnaModeLingkup(auth, req, "langsung", km);
  var lingkup = tnaLingkupTampil(auth, km, req.cabang || "", mode);
  if (!lingkup.length) return { ok: true, kosong: true, cabangList: [], lingkup: tnaInfoLingkup(auth, km, mode) };
  var di = {}; lingkup.forEach(function (k) { di[k.NIK] = true; });
  var gap = tnaHitungGap(ss, p, km).filter(function (g) { return di[g.NIK]; });
  var val = tnaPetaValidasi(ss, p);
  // Kelompok jabatan di lingkup
  var grup = {};
  lingkup.forEach(function (k) { (grup[k.KodeJabatan] = grup[k.KodeJabatan] || { kode: k.KodeJabatan, jobTitle: k.JobTitle, jumlah: 0 }).jumlah++; });
  var daftar = Object.keys(grup).map(function (x) { return grup[x]; }).sort(function (a, b) { return b.jumlah - a.jumlah; });
  var kode = req.kodeJabatan && grup[req.kodeJabatan] ? req.kodeJabatan : daftar[0].kode;
  // Heatmap orang x kompetensi untuk jabatan terpilih
  var kompList = [], kompIdx = {}, perOrang = {};
  gap.forEach(function (g) {
    if (g.KodeJabatan !== kode) return;
    if (kompIdx[g.KodeKompetensi] === undefined) { kompIdx[g.KodeKompetensi] = kompList.length; kompList.push({ kode: g.KodeKompetensi, nama: g.Kompetensi, kategori: g.Kategori, required: g.Required }); }
    var o = perOrang[g.NIK] = perOrang[g.NIK] || { nik: g.NIK, nama: g.Nama, cabang: g.Cabang, sel: {}, prioritas: 0, dinilai: false };
    o.sel[g.KodeKompetensi] = { a: g.Actual, g: g.Gap, k: g.KategoriGap, f: g.Flag };
    if (g.Actual !== "") { o.dinilai = true; o.prioritas += Number(g.Prioritas || 0); }
  });
  var urutKat = { Leadership: 0, Technical: 1, Behavioral: 2 };
  kompList.sort(function (a, b) { return (urutKat[a.kategori] || 9) - (urutKat[b.kategori] || 9) || String(a.nama).localeCompare(String(b.nama)); });
  var baris = Object.keys(perOrang).map(function (n) {
    var o = perOrang[n], k = km[n];
    o.prioritas = tnaR2(o.prioritas); o.validasi = (val[tnaKunciValidasi(k)] || {}).Status || "";
    o.sel = kompList.map(function (c) { return o.sel[c.kode] || { a: "", g: "", k: "BELUM DINILAI", f: "" }; });
    return o;
  }).sort(function (a, b) { return b.prioritas - a.prioritas; });
  // Gap terbesar di seluruh lingkup (per kompetensi)
  var agg = {};
  gap.forEach(function (g) {
    if (g.Actual === "") return;
    var a = agg[g.KodeKompetensi] = agg[g.KodeKompetensi] || { kode: g.KodeKompetensi, nama: g.Kompetensi, kategori: g.Kategori, dinilai: 0, bergap: 0, totalGap: 0 };
    a.dinilai++; if (Number(g.Gap) > 0) { a.bergap++; a.totalGap += Number(g.Gap); }
  });
  var topGap = Object.keys(agg).map(function (x) { var a = agg[x]; a.persen = Math.round(a.bergap / a.dinilai * 100); a.rataGap = a.bergap ? tnaR2(a.totalGap / a.bergap) : 0; return a; })
    .filter(function (a) { return a.bergap > 0; })
    .sort(function (a, b) { return b.bergap * b.rataGap - a.bergap * a.rataGap; }).slice(0, 8);
  // Orang prioritas (seluruh lingkup)
  var prio = {};
  gap.forEach(function (g) {
    if (g.Actual === "") return;
    var o = prio[g.NIK] = prio[g.NIK] || { nik: g.NIK, nama: g.Nama, jobTitle: g.JobTitle, cabang: g.Cabang, prioritas: 0, major: 0 };
    o.prioritas += Number(g.Prioritas || 0); if (g.KategoriGap === "Major") o.major++;
  });
  var prioritas = Object.keys(prio).map(function (x) { prio[x].prioritas = tnaR2(prio[x].prioritas); return prio[x]; })
    .filter(function (o) { return o.prioritas > 0; }).sort(function (a, b) { return b.prioritas - a.prioritas; }).slice(0, 10);
  var dinilaiN = {}; gap.forEach(function (g) { if (g.Actual !== "") dinilaiN[g.NIK] = true; });
  var komp = gap.filter(function (g) { return g.Actual !== ""; });
  var cabangSet = {}; tnaLingkupTampil(auth, km, "", mode).forEach(function (k) { cabangSet[k.Cabang] = true; });
  return {
    ok: true, lingkup: tnaInfoLingkup(auth, km, mode), ringkasan: { orang: lingkup.length, dinilai: Object.keys(dinilaiN).length,
      persenKompeten: komp.length ? Math.round(komp.filter(function (g) { return Number(g.Gap) === 0; }).length / komp.length * 100) : 0 },
    daftar: daftar, kodeJabatan: kode, kompetensi: kompList, baris: baris, topGap: topGap, prioritas: prioritas,
    cabangList: Object.keys(cabangSet).sort(), cabang: req.cabang || ""
  };
}
// Rencana & kalender training tim (setelah output terbit). Diagregasi di server per bulan x training x batch
// supaya ringan di HP; untuk lingkup besar tanpa filter cabang, daftar nama tidak dikirim (cukup jumlah).
function tnaTrainingTim(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  var p = tnaParam(ss), km = tnaPetaKaryawan(ss);
  var mode = tnaModeLingkup(auth, req, "langsung", km);
  var lingkup = tnaLingkupTampil(auth, km, req.cabang || "", mode), di = {}; lingkup.forEach(function (k) { di[k.NIK] = true; });
  var denganNama = lingkup.length <= 150;
  var batch = {}; tnaBaca(ss, "Batch").forEach(function (b) { batch[b.BatchID] = b; });
  var katStatus = {}; tnaBaca(ss, "Katalog").forEach(function (c) { katStatus[c.KodeTraining] = String(c.Status || ""); });
  var grup = {}, jamOrang = {}, totalJam = 0, peserta = 0;
  tnaBaca(ss, "ITP").forEach(function (r) {
    if (!di[String(r.NIK)]) return;
    // IHT diringkas per bulan per rumpun (tanggal Sabtu tiap orang ada di ITP-nya), bukan dipecah per Sabtu
    var b = batch[r.BatchID] || {}, iht = r.Kategori === "IHT", tgl = iht ? "" : (b.TanggalMulai || "");
    var key = r.Bulan + "|" + r.KodeTraining + "|" + tgl + "|" + (b.Lokasi || "");
    var g = grup[key] = grup[key] || { bulan: r.Bulan, kode: r.KodeTraining, judul: r.Judul, kategori: r.Kategori, jam: Number(r.Jam), tanggal: tgl, lokasi: b.Lokasi || "",
      opsional: r.Status === "OPSIONAL", iht: iht, usulan: (katStatus[r.KodeTraining] || "") === "USULAN_PENGADAAN", jumlah: 0, nama: [] };
    g.jumlah++; peserta++;
    if (denganNama) g.nama.push(r.Nama);
    if (r.Status !== "OPSIONAL") { totalJam += Number(r.Jam); jamOrang[r.Nama] = (jamOrang[r.Nama] || 0) + Number(r.Jam); }
  });
  var terbanyak = Object.keys(jamOrang).sort(function (x, y) { return jamOrang[y] - jamOrang[x]; }).slice(0, 3).map(function (n) { return { nama: n, jam: tnaR2(jamOrang[n]) }; });
  var cabangSet = {}; tnaLingkupTampil(auth, km, "", mode).forEach(function (k) { cabangSet[k.Cabang] = true; });
  return { ok: true, lingkup: tnaInfoLingkup(auth, km, mode), terbit: !!p.OutputTerakhir, terakhir: p.OutputTerakhir, orang: lingkup.length, denganNama: denganNama,
    grup: Object.keys(grup).map(function (k) { return grup[k]; }), totalJam: tnaR2(totalJam), peserta: peserta, terbanyak: terbanyak,
    cabangList: Object.keys(cabangSet).sort(), cabang: req.cabang || "" };
}

/* ============================================================
 * PEMANTAUAN & PENGINGAT (admin)
 * ============================================================ */
function tnaRekapTugas(ss, p, km) {
  var ases = tnaBaca(ss, "Asesmen").filter(function (a) { return a.Periode === p.Periode && a.Status === "FINAL"; });
  var sudah = {};
  ases.forEach(function (a) { if (a.Rater === "ATASAN" || a.Rater === "ATASAN2") sudah[(a.KelompokID ? "K:" + a.KelompokID : String(a.NIK)) + "|" + a.RaterNIK] = true; });
  var penilai = {}, kel = {};
  function catat(nik, key) { if (!nik) return; var o = penilai[nik] = penilai[nik] || { nik: nik, total: 0, sisa: 0 }; o.total++; if (!sudah[key + "|" + nik]) o.sisa++; }
  Object.keys(km).forEach(function (n) {
    var k = km[n];
    if (k.ModeAsesmen === "KELOMPOK") { if (kel[k.KelompokID]) return; kel[k.KelompokID] = true; catat(k.PenilaiNIK, "K:" + k.KelompokID); return; }
    catat(k.PenilaiNIK, n); catat(k.Penilai2NIK, n);
  });
  var validator = {};
  var val = tnaPetaValidasi(ss, p);
  Object.keys(val).forEach(function (key) {
    var v = val[key];
    String(v.ValidatorNIK || "").split(/[,;]\s*/).filter(Boolean).forEach(function (n) {
      var o = validator[n] = validator[n] || { nik: n, menunggu: 0, disetujui: 0, dikembalikan: 0 };
      if (v.Status === "MENUNGGU_VALIDASI") o.menunggu++; else if (v.Status === "DISETUJUI") o.disetujui++; else if (v.Status === "DIKEMBALIKAN") o.dikembalikan++;
    });
  });
  return { penilai: penilai, validator: validator };
}
function tnaPantau(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  if (auth.role !== "admin") return { ok: false, error: "Hanya admin." };
  var p = tnaParam(ss), km = tnaPetaKaryawan(ss), semua = tnaPetaKaryawan(ss, true), hp = tnaNomorHP(ss);
  var r = tnaRekapTugas(ss, p, km);
  function info(n) { var k = semua[n] || {}; return { nama: k.Nama || n, jabatan: k.JobTitle || "", cabang: k.Cabang || "", adaHP: !!hp[n] }; }
  var penilai = Object.keys(r.penilai).map(function (n) { var o = r.penilai[n], i = info(n); i.nik = n; i.total = o.total; i.sisa = o.sisa; return i; })
    .sort(function (a, b) { return b.sisa - a.sisa; });
  var validator = Object.keys(r.validator).map(function (n) { var o = r.validator[n], i = info(n); i.nik = n; i.menunggu = o.menunggu; i.disetujui = o.disetujui; i.dikembalikan = o.dikembalikan; return i; })
    .sort(function (a, b) { return b.menunggu - a.menunggu; });
  var trig = [];
  try { ScriptApp.getProjectTriggers().forEach(function (t) { trig.push(t.getHandlerFunction()); }); } catch (e) { trig = null; }
  return { ok: true, penilai: penilai, validator: validator, trigger: trig, waAktif: typeof waAktif === "function" ? waAktif() : false };
}
function tnaNomorHP(ss) {
  var m = {}, sh = ss.getSheetByName("Users"); if (!sh) return m;
  var v = sh.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) if (String(v[i][7] || "").trim()) m[String(v[i][0]).trim()] = String(v[i][7]).trim();
  return m;
}
// Susun pesan pengingat. jenis: "penilai" | "validator" | "semua".
function tnaSusunPengingat(ss, p, jenis) {
  var km = tnaPetaKaryawan(ss), semua = tnaPetaKaryawan(ss, true), hp = tnaNomorHP(ss), r = tnaRekapTugas(ss, p, km);
  var tutup = new Date(p.WindowTutup), sisaHari = Math.ceil((tutup - new Date()) / 86400000);
  var batas = Utilities.formatDate(tutup, "Asia/Makassar", "d MMM yyyy HH:mm") + " WITA";
  var pesan = {};
  if (jenis !== "validator") Object.keys(r.penilai).forEach(function (n) {
    var o = r.penilai[n]; if (!o.sisa) return;
    pesan[n] = (pesan[n] || []).concat(o.sisa + " dari " + o.total + " penilaian tim belum dikirim");
  });
  if (jenis !== "penilai") Object.keys(r.validator).forEach(function (n) {
    var o = r.validator[n]; if (!o.menunggu) return;
    pesan[n] = (pesan[n] || []).concat(o.menunggu + " hasil tim menunggu validasi Anda");
  });
  return Object.keys(pesan).map(function (n) {
    var k = semua[n] || {};
    return { nik: n, nama: k.Nama || n, hp: hp[n] || "",
      teks: "Yth. Bapak/Ibu" + (k.Nama ? " " + k.Nama : "") + ",\n\nPengingat TNA 2027 (BBLC):\n- " + pesan[n].join("\n- ") +
        "\n\nBatas waktu: " + batas + (sisaHari > 0 ? " (sisa " + sisaHari + " hari)" : " (hari ini)") +
        ".\nSilakan buka: " + p.UrlStudio + "\nLogin dengan NIK & PIN Anda.\n\nTerima kasih.\nL&D Bosowa Berlian Motor" };
  });
}
function tnaPengingat(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  if (auth.role !== "admin") return { ok: false, error: "Hanya admin." };
  var p = tnaParam(ss);
  if (tnaWindow(p).status === "BELUM_DIJADWALKAN") return { ok: false, error: "Jadwal window asesmen belum diisi. Isi waktu buka dan tutup di Parameter dulu." };
  var daftar = tnaSusunPengingat(ss, p, req.jenis || "semua");
  var tanpaHP = daftar.filter(function (d) { return !d.hp; }).map(function (d) { return d.nama; });
  if (req.kirim !== true) return { ok: true, pratinjau: true, jumlah: daftar.length, tanpaHP: tanpaHP, contoh: daftar.length ? daftar[0].teks : "" };
  if (typeof kirimWA !== "function") return { ok: false, error: "Fungsi kirimWA (Kode.gs) tidak ditemukan." };
  if (typeof waAktif === "function" && !waAktif()) return { ok: false, error: "WhatsApp belum aktif. Atur WA_AKTIF=1 dan WA_TOKEN di Script Properties." };
  var n = tnaKirimDaftar(ss, daftar);
  tnaLog(ss, auth.nik, "pengingatWA", n + " terkirim dari " + daftar.length);
  return { ok: true, terkirim: n, jumlah: daftar.length, tanpaHP: tanpaHP };
}
function tnaKirimDaftar(ss, daftar) {
  var n = 0;
  daftar.forEach(function (d) {
    if (!d.hp) return;
    try { if (kirimWA(ss, d.hp, d.teks)) n++; } catch (e) { /* satu nomor gagal tidak menghentikan yang lain */ }
    Utilities.sleep(400);
  });
  return n;
}
// Trigger harian: kirim pengingat pada hari-hari yang ditetapkan PengingatHari (H-n sebelum window tutup).
function tnaPengingatTerjadwal() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), p = tnaParam(ss);
  if (typeof kirimWA !== "function" || (typeof waAktif === "function" && !waAktif())) return;
  var sisa = Math.floor((new Date(p.WindowTutup) - new Date()) / 86400000);
  var hari = String(p.PengingatHari || "").split(/[,;]\s*/).map(Number);
  var w = tnaWindow(p).status, daftar = [];
  if (w === "DIBUKA" && hari.indexOf(sisa) !== -1) daftar = tnaSusunPengingat(ss, p, "semua");
  else if (w === "DITUTUP" && sisa === -1) daftar = tnaSusunPengingat(ss, p, "validator"); // H+1: sisa validasi
  if (!daftar.length) return;
  var n = tnaKirimDaftar(ss, daftar);
  tnaLog(ss, "SYSTEM", "pengingatWATerjadwal", "H" + (sisa >= 0 ? "-" : "+") + Math.abs(sisa) + ": " + n + " terkirim dari " + daftar.length);
}
// Jadwalkan trigger output otomatis dan/atau pengingat harian (dipanggil dari editor atau Panel Admin).
function tnaJadwalkanPengingat() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), p = tnaParam(ss);
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === "tnaPengingatTerjadwal") ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger("tnaPengingatTerjadwal").timeBased().everyDays(1).atHour(Number(p.PengingatJam) || 8).inTimezone("Asia/Makassar").create();
  Logger.log("Pengingat WA harian dijadwalkan jam " + p.PengingatJam + " WITA.");
}
function tnaJadwalkanEndpoint(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  if (auth.role !== "admin") return { ok: false, error: "Hanya admin." };
  if (tnaWindow(tnaParam(ss)).status === "BELUM_DIJADWALKAN") return { ok: false, error: "Isi waktu buka dan tutup window asesmen di Parameter dulu, lalu aktifkan jadwal otomatis." };
  try {
    if (req.output !== false) tnaJadwalkanOutput();
    if (req.pengingat !== false) tnaJadwalkanPengingat();
  } catch (e) {
    return { ok: false, error: "Gagal membuat jadwal otomatis. Pastikan appsscript.json memuat scope script.scriptapp dan sudah diotorisasi ulang. (" + String(e.message || e).substring(0, 120) + ")" };
  }
  tnaLog(ss, auth.nik, "jadwalkan", JSON.stringify({ output: req.output !== false, pengingat: req.pengingat !== false }));
  return { ok: true };
}

function tnaBangunOutput(ss) {
  var t0 = new Date();
  var p = tnaParam(ss), km = tnaPetaKaryawan(ss);
  var gapRows = tnaHitungGap(ss, p, km);

  var cx = tnaSiapRekom(ss, p, km, gapRows);
  var katalog = cx.katalog, katByKode = cx.katByKode, lulus = cx.lulus;
  var durDefault = Number(p.DurasiDefaultJam);
  function jamTraining(c) { var d = Number(c && c.DurasiJam); return d > 0 ? d : durDefault; }
  var mandatory = tnaBaca(ss, "Mandatory");
  var kodeBST = katByKode[String(p.KodeBST || "")] ? String(p.KodeBST) : "";
  var khusus = {};
  try { khusus = JSON.parse(String(p.JendelaKhusus || "{}")); } catch (eJ) { khusus = {}; }
  if (!khusus["P-SETARA"]) khusus["P-SETARA"] = [10]; // seminar tahunan tim HC, selalu Oktober (berlaku juga bila parameter lama belum memuatnya)
  var val = tnaPetaValidasi(ss, p);
  function statusValidasi(k) {
    var v = val[tnaKunciValidasi(k)];
    if (!v) return "BELUM DINILAI";
    return v.Status === "DISETUJUI" ? "DISETUJUI" : (v.Status === "DIKEMBALIKAN" ? "DIKEMBALIKAN (belum direvisi)" : "BELUM VALIDASI");
  }

  // ---------- Rekomendasi 70/20/10 + daftar training per orang ----------
  var rekom = [], perOrang = {};
  function tambahTraining(nik, kode, kategori, kompetensi, prioritas) {
    var o = perOrang[nik] = perOrang[nik] || { list: [], ada: {} };
    if (o.ada[kode]) return;
    o.ada[kode] = true; o.list.push({ kode: kode, kategori: kategori, kompetensi: kompetensi, prioritas: prioritas || 0 });
  }
  Object.keys(km).forEach(function (nik) {
    var k = km[nik];
    mandatory.forEach(function (m) {
      if (m.KodeJabatan !== "*" && m.KodeJabatan !== k.KodeJabatan && m.KodeJabatan !== "NIK:" + nik) return;
      if (katByKode[m.KodeTraining] && !lulus[nik + "|" + m.KodeTraining]) tambahTraining(nik, m.KodeTraining, "Wajib", "", 99);
    });
  });
  var gapPerOrang = {};
  gapRows.forEach(function (g) {
    g.StatusValidasi = statusValidasi(km[g.NIK]);
    if (Number(g.Gap) > 0) (gapPerOrang[g.NIK] = gapPerOrang[g.NIK] || []).push(g);
  });
  Object.keys(gapPerOrang).forEach(function (nik) {
    var v = val[tnaKunciValidasi(km[nik])] || {};
    var hasil = tnaRekomOrang(cx, nik, gapPerOrang[nik], tnaParseEdit(v.Edit));
    hasil.rekom.forEach(function (r) { r.StatusValidasi = statusValidasi(km[nik]); rekom.push(r); });
    hasil.dianjurkan.forEach(function (d) { tambahTraining(nik, d.kode, "WajibGap", d.kompetensi, d.prioritas); });
  });

  // ---------- Penjadwalan bulan (Wajib di depan, beban jam per orang dirata-ratakan) ----------
  var target = Number(p.TargetJamBulan), jamCoach = Number(p.JamCoachingPerGap);
  var pengayaan = katalog.filter(function (c) { return String(c.Kategori) === "Pengayaan"; });
  var orgLoad = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var itp = [], beban = {};
  function jendela(kategori, kode) {
    if (kode === kodeBST) return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // BST ada tiap bulan
    var kh = (khusus[kode] || []).map(Number).filter(function (b) { return b >= 1 && b <= 12; });
    if (kh.length) return kh.map(function (b) { return b - 1; });
    if (kategori === "Wajib") return /^W-(AFA|AIDW)$/.test(kode) ? [0, 1, 2] : [0, 1, 2, 3, 4, 5];
    if (kategori === "WajibGap") return [2, 3, 4, 5, 6, 7, 8, 9, 10];
    return [3, 4, 5, 6, 7, 8, 9, 10];
  }
  function pilihBulan(nik, win, jam) {
    var b = beban[nik];
    var best = win[0], skor = Infinity;
    win.forEach(function (m) { var s = b[m] * 1000 + orgLoad[m]; if (s < skor) { skor = s; best = m; } });
    b[best] += jam; orgLoad[best] += jam; return best;
  }
  Object.keys(km).forEach(function (nik) {
    var k = km[nik]; beban[nik] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    // coaching terstruktur dihitung sebagai jam belajar, disebar rata Mar-Nov
    var nGap = (gapPerOrang[nik] || []).length;
    if (nGap && jamCoach > 0) { var tot = nGap * jamCoach; for (var m = 2; m <= 10; m++) beban[nik][m] += tot / 9; }
    var list = (perOrang[nik] || { list: [] }).list.sort(function (a, b) {
      var urut = { Wajib: 0, WajibGap: 1, Pengayaan: 2 }; return urut[a.kategori] - urut[b.kategori] || b.prioritas - a.prioritas;
    });
    list.forEach(function (x) {
      var c = katByKode[x.kode], jam = jamTraining(c);
      var bln = pilihBulan(nik, jendela(x.kategori, x.kode), jam);
      itp.push({ NIK: nik, Nama: k.Nama, Cabang: k.Cabang, Wilayah: k.Wilayah, KodeJabatan: k.KodeJabatan, JobTitle: k.JobTitle, KodeTraining: x.kode,
        Judul: c.Judul, Kategori: x.kategori, KodeKompetensi: x.kompetensi, Bulan: bln, BatchID: "", Jam: jam, Status: "PLANNED", StatusValidasi: statusValidasi(k) });
    });
    // Pengayaan: isi kekurangan jam sampai target tahunan, status OPSIONAL
    var total = beban[nik].reduce(function (s, x) { return s + x; }, 0);
    var sudah = (perOrang[nik] || { ada: {} }).ada;
    for (var e = 0; e < pengayaan.length && total < target * 12; e++) {
      var c2 = pengayaan[e]; if (sudah[c2.KodeTraining]) continue;
      var jam2 = jamTraining(c2), bln2 = pilihBulan(nik, jendela("Pengayaan", c2.KodeTraining), jam2);
      itp.push({ NIK: nik, Nama: k.Nama, Cabang: k.Cabang, Wilayah: k.Wilayah, KodeJabatan: k.KodeJabatan, JobTitle: k.JobTitle, KodeTraining: c2.KodeTraining,
        Judul: c2.Judul, Kategori: "Pengayaan", KodeKompetensi: c2.KodeKompetensi, Bulan: bln2, BatchID: "", Jam: jam2, Status: "OPSIONAL", StatusValidasi: statusValidasi(k) });
      total += jam2;
    }
  });

  // ---------- Batch & kalender ----------
  var kap = Number(p.KapasitasKelas), tahun = Number(p.TahunITP);
  // BST: satu kelas terpusat per bulan; peserta diratakan ke 12 bulan (bulan terpadat dipindah ke bulan paling sepi).
  var bstIdx = [], perBulanBST = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  itp.forEach(function (r, i) { if (r.KodeTraining === kodeBST) { bstIdx.push(i); perBulanBST[r.Bulan]++; } });
  var batasBST = Math.min(kap, Math.ceil(bstIdx.length / 12)) || 1; // di atas 12 x kapasitas: kelas paralel di bawah
  bstIdx.forEach(function (i) {
    var m = itp[i].Bulan, ke = 0;
    if (perBulanBST[m] <= batasBST) return;
    for (var x = 1; x < 12; x++) if (perBulanBST[x] < perBulanBST[ke]) ke = x;
    if (perBulanBST[ke] >= batasBST) return;
    perBulanBST[m]--; perBulanBST[ke]++; itp[i].Bulan = ke;
  });
  // Konsolidasi kelas tatap muka: peserta satu training di satu cabang dikumpulkan ke sesedikit mungkin
  // bulan (ceil(n / kapasitas)) di dalam jendela kategorinya, supaya kalender tidak pecah jadi kelas kecil.
  var kelas = {};
  itp.forEach(function (r, idx) {
    var c = katByKode[r.KodeTraining] || {};
    if (r.KodeTraining === kodeBST || /e-?learning|online|daring/i.test(String(c.Metode || ""))) return;
    var kk = r.KodeTraining + "|" + r.Cabang; (kelas[kk] = kelas[kk] || []).push(idx);
  });
  Object.keys(kelas).forEach(function (kk) {
    var idxs = kelas[kk];
    var adaWajib = idxs.some(function (i) { return itp[i].Kategori === "Wajib"; });
    var win = jendela(adaWajib ? "Wajib" : itp[idxs[0]].Kategori, itp[idxs[0]].KodeTraining);
    var hit = {}; idxs.forEach(function (i) { hit[itp[i].Bulan] = (hit[itp[i].Bulan] || 0) + 1; });
    var bulan = win.slice().sort(function (a, b) { return (hit[b] || 0) - (hit[a] || 0) || orgLoad[a] - orgLoad[b] || a - b; })
      .slice(0, Math.ceil(idxs.length / kap));
    var isi = {}; bulan.forEach(function (m) { isi[m] = 0; });
    var sisa = [];
    idxs.forEach(function (i) { var m = itp[i].Bulan; if (isi[m] !== undefined && isi[m] < kap) isi[m]++; else sisa.push(i); });
    sisa.forEach(function (i) {
      // jendela satu bulan (mis. seminar tahunan Oktober) bisa penuh: kelas tambahan di bulan yang sama, bukan Bulan kosong
      var buka = bulan.filter(function (x) { return isi[x] < kap; }); if (!buka.length) buka = bulan.slice();
      var m = buka.sort(function (a, b) { return isi[a] - isi[b]; })[0];
      isi[m]++; itp[i].Bulan = m;
    });
  });
  var grup = {};
  itp.forEach(function (r, idx) {
    if (r.KodeTraining === kodeBST) return;
    var c = katByKode[r.KodeTraining] || {};
    var online = /e-?learning|online|daring/i.test(String(c.Metode || ""));
    var key = r.KodeTraining + "|" + r.Bulan + "|" + (online ? "ONLINE" : r.Cabang);
    (grup[key] = grup[key] || []).push(idx);
  });
  var batchRows = [], perBulanBatch = {}, hariBST = [], selasa = [];
  for (var mb = 0; mb < 12; mb++) {
    hariBST.push(tnaHariBST(tahun, mb));
    // kelas reguler mulai Selasa setelah hari remedial BST, supaya awal bulan aman untuk BST
    var d0 = new Date(tahun, mb, hariBST[mb][2].getDate() + 1), sl = [];
    while (d0.getMonth() === mb) { if (d0.getDay() === 2) sl.push(new Date(d0.getTime())); d0.setDate(d0.getDate() + 1); }
    selasa.push(sl);
  }
  var tglPendek = function (d) { return d.getDate() + " " + TNA_BULAN[d.getMonth()]; };
  var proyBST = Math.max(0, Math.round(Number(p.ProyeksiPesertaBST) || 0)), jamProyeksi = 0;
  if (kodeBST) {
    var cB = katByKode[kodeBST], onlineB = /e-?learning|online|daring/i.test(String(cB.Metode || "")), capB = onlineB ? 1000 : kap;
    for (mb = 0; mb < 12; mb++) {
      var pesertaB = bstIdx.filter(function (i) { return itp[i].Bulan === mb; }), hb = hariBST[mb];
      // peserta BST mayoritas calon sales baru (belum ada di data karyawan): kekurangan dari proyeksi diisi kursi proyeksi
      var calon = Math.max(0, proyBST - pesertaB.length), total = pesertaB.length + calon;
      var nKelas = Math.max(1, Math.ceil(total / capB)); // slot tetap diamankan walau belum ada peserta
      for (var kb = 0; kb < nKelas; kb++) {
        var anggotaB = pesertaB.slice(kb * capB, (kb + 1) * capB), idB = "B" + tahun + "-" + ("0" + (mb + 1)).slice(-2) + "-" + kodeBST + "-" + (onlineB ? "ONLINE" : "TERPUSAT") + "-" + (kb + 1);
        var calonK = Math.min(calon, capB - anggotaB.length); calon -= calonK;
        anggotaB.forEach(function (i) { itp[i].BatchID = idB; });
        jamProyeksi += jamTraining(cB) * calonK;
        batchRows.push({ BatchID: idB, KodeTraining: kodeBST, Judul: cB.Judul, Kategori: cB.Kategori, Metode: cB.Metode || "", Bulan: TNA_BULAN[mb], Minggu: 1,
          TanggalMulai: hb[0], TanggalSelesai: hb[1], Lokasi: onlineB ? "ONLINE" : "TERPUSAT", JmlPeserta: anggotaB.length, PesertaProyeksi: calonK, DurasiJam: jamTraining(cB),
          TotalJam: jamTraining(cB) * (anggotaB.length + calonK), Catatan: "Slot tetap BST awal bulan. Remedial " + tglPendek(hb[2]) + "." +
            (calonK ? " " + calonK + " kursi proyeksi calon sales baru." : "") });
      }
    }
  }
  Object.keys(grup).sort().forEach(function (key) {
    var parts = key.split("|"), kode = parts[0], bln = Number(parts[1]), wil = parts[2];
    var c = katByKode[kode] || {}, idxs = grup[key];
    var cap = wil === "ONLINE" ? 1000 : kap;
    for (var s = 0; s < idxs.length; s += cap) {
      var anggota = idxs.slice(s, s + cap);
      perBulanBatch[bln] = (perBulanBatch[bln] || 0) + 1;
      var minggu = ((perBulanBatch[bln] - 1) % selasa[bln].length) + 1, tgl = selasa[bln][minggu - 1];
      var id = "B" + tahun + "-" + ("0" + (bln + 1)).slice(-2) + "-" + kode + "-" + wil.replace(/[^A-Z0-9]/gi, "").substring(0, 12) + "-" + (Math.floor(s / cap) + 1);
      var jam = jamTraining(c);
      anggota.forEach(function (i) { itp[i].BatchID = id; });
      var kat = itp[anggota[0]].Kategori;
      batchRows.push({ BatchID: id, KodeTraining: kode, Judul: c.Judul || kode, Kategori: kat, Metode: c.Metode || "", Bulan: TNA_BULAN[bln], Minggu: minggu,
        TanggalMulai: tgl, TanggalSelesai: "", Lokasi: wil, JmlPeserta: anggota.length, PesertaProyeksi: 0, DurasiJam: jam, TotalJam: jam * anggota.length, Catatan: "" });
    }
  });

  // ---------- IHT tiap Sabtu per cabang, jam IHT maksimal MaksPersenIHT% dari total jam L&D ----------
  var jamSesi = Number(p.JamSesiIHT) || 2, maksIHT = Math.max(0, Math.min(90, Number(p.MaksPersenIHT) || 0));
  var ihtJab = {}; tnaBaca(ss, "IHT").forEach(function (r) { ihtJab[String(r.KodeJabatan)] = r; });
  // basis batas IHT = jam karyawan saja; kursi proyeksi calon BST tidak menambah jatah IHT karyawan (keputusan user 26 Okt)
  var jamNonIHT = itp.reduce(function (s, r) { return s + (r.Status === "PLANNED" ? Number(r.Jam) : 0); }, 0);
  var kuotaSesi = Math.floor(jamNonIHT * maksIHT / (100 - maksIHT) / jamSesi);
  var sabtu = TNA_BULAN.map(function (b, m) {
    var out = [], d = new Date(tahun, m, 1);
    while (d.getMonth() === m) { if (d.getDay() === 6) out.push(new Date(d.getTime())); d.setDate(d.getDate() + 1); }
    return out;
  });
  // permintaan sesi per orang per rumpun = jam rata-rata IHT 2026 jabatannya / durasi sesi (maks 12 sesi: satu per bulan)
  var minta = [], totMinta = 0, cabangIHT = {};
  Object.keys(km).sort().forEach(function (nik) {
    var j = ihtJab[String(km[nik].KodeJabatan)]; if (!j) return;
    TNA_IHT_RUMPUN.forEach(function (r, ri) {
      if (!katByKode[r.kode]) return;
      var dm = Math.min(12, Math.round(Number(j[r.kolom] || 0) / jamSesi));
      if (dm > 0) { minta.push({ nik: nik, ri: ri, d: dm, n: 0 }); totMinta += dm; cabangIHT[km[nik].Cabang] = true; }
    });
  });
  // bila melebihi kuota, sesi dibagi proporsional (sisa pecahan terbesar didahulukan)
  var faktor = totMinta > kuotaSesi ? kuotaSesi / totMinta : 1, sesiJadi = 0;
  minta.forEach(function (x) { x.n = Math.floor(x.d * faktor); x.sisa = x.d * faktor - x.n; sesiJadi += x.n; });
  minta.slice().sort(function (a, b) { return b.sisa - a.sisa || (a.nik < b.nik ? -1 : (a.nik > b.nik ? 1 : a.ri - b.ri)); })
    .forEach(function (x) { if (sesiJadi < Math.min(kuotaSesi, totMinta) && x.n < x.d) { x.n++; sesiJadi++; } });
  // peserta BST tidak dijadwalkan IHT pada Sabtu yang bertepatan dengan hari BST-nya
  var bstOrang = {}; bstIdx.forEach(function (i) { bstOrang[itp[i].NIK] = itp[i].Bulan; });
  function bentrokBST(nik, tgl) {
    var m = bstOrang[nik]; if (m === undefined || !tgl || tgl.getMonth() !== m) return false;
    return hariBST[m][0].getDate() === tgl.getDate() || hariBST[m][1].getDate() === tgl.getDate();
  }
  var isiSabtu = {}; // cabang|bulan|ke -> [idx itp]
  minta.forEach(function (x) {
    var k = km[x.nik], ke = x.ri, cR = katByKode[TNA_IHT_RUMPUN[ke].kode], pakai = {};
    for (var j = 0; j < x.n; j++) {
      // sebar merata: sesi ke-j jatuh di rentang bulan [a, b], pilih Sabtu yang pesertanya paling sedikit di cabang itu
      var a = Math.floor(j * 12 / x.n), b = Math.floor((j + 1) * 12 / x.n) - 1, best = -1;
      var muat = function (m) { return (isiSabtu[k.Cabang + "|" + m + "|" + ke] || []).length; };
      var cari = function (dari, ke2) {
        for (var m = dari; m <= ke2; m++) {
          if (pakai[m] || bentrokBST(x.nik, sabtu[m][ke])) continue;
          if (best < 0 || muat(m) < muat(best)) best = m;
        }
      };
      cari(a, b); if (best < 0) cari(0, 11);
      if (best < 0) continue;
      pakai[best] = true;
      var keyS = k.Cabang + "|" + best + "|" + ke;
      (isiSabtu[keyS] = isiSabtu[keyS] || []).push(itp.length);
      itp.push({ NIK: x.nik, Nama: k.Nama, Cabang: k.Cabang, Wilayah: k.Wilayah, KodeJabatan: k.KodeJabatan, JobTitle: k.JobTitle, KodeTraining: cR.KodeTraining,
        Judul: cR.Judul, Kategori: "IHT", KodeKompetensi: "", Bulan: best, BatchID: "", Jam: jamSesi, Status: "PLANNED", StatusValidasi: statusValidasi(k) });
    }
  });
  var slotIHT = 0;
  Object.keys(cabangIHT).sort().forEach(function (cab) {
    for (var m = 0; m < 12; m++) sabtu[m].forEach(function (tglS, ke) {
      var r = TNA_IHT_RUMPUN[ke], cR = r ? katByKode[r.kode] : null;
      var kode = cR ? cR.KodeTraining : "IHT-CAD", anggota = isiSabtu[cab + "|" + m + "|" + ke] || [];
      var id = "B" + tahun + "-" + ("0" + (m + 1)).slice(-2) + "-" + kode + "-" + cab.replace(/[^A-Z0-9]/gi, "").substring(0, 12) + "-S" + (ke + 1);
      anggota.forEach(function (i) { itp[i].BatchID = id; });
      var bst = hariBST[m][0].getDate() === tglS.getDate() || hariBST[m][1].getDate() === tglS.getDate();
      var cat = !cR ? "Sabtu ke-5: cadangan untuk susulan/remedial IHT." : (anggota.length ? "" : "Slot IHT tanpa peserta terjadwal; boleh diisi topik umum cabang.");
      if (bst) cat = (cat ? cat + " " : "") + "Bertepatan dengan BST (peserta BST tidak dijadwalkan IHT hari ini).";
      batchRows.push({ BatchID: id, KodeTraining: kode, Judul: cR ? cR.Judul : "IHT Cadangan (Sabtu ke-5)", Kategori: "IHT", Metode: cR ? cR.Metode : "KLASIKAL",
        Bulan: TNA_BULAN[m], Minggu: ke + 1, TanggalMulai: tglS, TanggalSelesai: "", Lokasi: cab, JmlPeserta: anggota.length, PesertaProyeksi: 0, DurasiJam: jamSesi,
        TotalJam: jamSesi * anggota.length, Catatan: cat });
      slotIHT++;
    });
  });
  itp.forEach(function (r) { r.Bulan = TNA_BULAN[r.Bulan]; });

  // ---------- Proyeksi jam & readiness ----------
  var kT = Number(p.KoefTraining), kC = Number(p.KoefCoaching), kP = Number(p.KoefPenugasan);
  var dianjurkanPer = {}; itp.forEach(function (r) { if (r.Kategori === "WajibGap") dianjurkanPer[r.NIK + "|" + r.KodeKompetensi] = true; });
  var ready = {};
  gapRows.forEach(function (g) {
    var o = ready[g.NIK] = ready[g.NIK] || { n: 0, now: 0, proj: 0, dinilai: false };
    o.n++;
    if (g.Actual === "") return;
    o.dinilai = true;
    var a = Number(g.Actual), req = Number(g.Required);
    if (a >= req) { o.now++; o.proj++; return; }
    var naik = kC + kP + (dianjurkanPer[g.NIK + "|" + g.KodeKompetensi] ? kT : 0);
    if (Math.min(a + naik, req + 1) >= req) o.proj++;
  });
  var jamBulan = {};
  itp.forEach(function (r) { if (r.Status === "OPSIONAL") return; var b = jamBulan[r.NIK] = jamBulan[r.NIK] || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; b[TNA_BULAN.indexOf(r.Bulan)] += Number(r.Jam); });
  itp.forEach(function (r) { if (r.Status !== "OPSIONAL") return; var b = jamBulan[r.NIK] = jamBulan[r.NIK] || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; b[TNA_BULAN.indexOf(r.Bulan)] += Number(r.Jam); });
  var proyeksi = Object.keys(km).map(function (nik) {
    var k = km[nik], b = (jamBulan[nik] || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]).slice();
    var nGap = (gapPerOrang[nik] || []).length;
    if (nGap && jamCoach > 0) for (var m = 2; m <= 10; m++) b[m] += nGap * jamCoach / 9;
    var tot = tnaR2(b.reduce(function (s, x) { return s + x; }, 0)), tgt = target * 12;
    var persen = Math.round(tot / tgt * 100);
    var rd = ready[nik] || { n: 0, now: 0, proj: 0, dinilai: false };
    var row = { NIK: nik, Nama: k.Nama, Cabang: k.Cabang, Dept: k.Dept, KodeJabatan: k.KodeJabatan, TotalJam: tot, TargetJam: tgt, PersenTarget: persen,
      StatusJam: persen < 80 ? "UNDER" : (persen > 150 ? "OVER" : "ON TARGET"),
      ReadinessSaatIni: rd.dinilai && rd.n ? Math.round(rd.now / rd.n * 100) : "",
      ReadinessProyeksi: rd.dinilai && rd.n ? Math.round(rd.proj / rd.n * 100) : "" };
    TNA_BULAN.forEach(function (bl, i) { row[bl] = tnaR2(b[i]); });
    return row;
  });

  // ---------- Rekonsiliasi jam (Plan = ITP = Calendar) ----------
  var jamITP = itp.reduce(function (s, r) { return s + Number(r.Jam); }, 0);
  var jamBatch = batchRows.reduce(function (s, r) { return s + Number(r.TotalJam); }, 0);
  var rekon = { jamITP: tnaR2(jamITP), jamProyeksiBST: tnaR2(jamProyeksi), jamCalendar: tnaR2(jamBatch), selisih: tnaR2(jamITP + jamProyeksi - jamBatch) };
  var jamIHT = itp.reduce(function (s, r) { return s + (r.Kategori === "IHT" ? Number(r.Jam) : 0); }, 0);
  rekon.jamIHT = tnaR2(jamIHT); rekon.jamNonIHT = tnaR2(jamNonIHT); rekon.jamOpsional = tnaR2(jamITP - jamIHT - jamNonIHT);
  rekon.persenIHT = jamIHT + jamNonIHT ? Math.round(jamIHT / (jamIHT + jamNonIHT) * 1000) / 10 : 0; rekon.maksPersenIHT = maksIHT;
  rekon.sesiIHTDiminta = totMinta; rekon.sesiIHTDijadwalkan = itp.filter(function (r) { return r.Kategori === "IHT"; }).length; rekon.slotIHT = slotIHT;
  rekon.slotBST = batchRows.filter(function (b) { return b.KodeTraining === kodeBST && kodeBST; }).length;

  tnaTulisUlang(ss, "Gap", gapRows);
  tnaTulisUlang(ss, "Rekomendasi", rekom);
  tnaTulisUlang(ss, "ITP", itp);
  tnaTulisUlang(ss, "Batch", batchRows);
  tnaTulisUlang(ss, "Proyeksi", proyeksi);
  tnaSetParamInternal(ss, "Rekonsiliasi", JSON.stringify(rekon));
  return { gap: gapRows.length, rekomendasi: rekom.length, itp: itp.length, batch: batchRows.length, rekon: rekon,
    belumDinilai: gapRows.filter(function (g) { return g.KategoriGap === "BELUM DINILAI"; }).length, detik: Math.round((new Date() - t0) / 1000) };
}

function tnaSetParamInternal(ss, key, value) {
  var sh = tnaSheet(ss, "Parameter");
  var v = sh.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) if (v[i][0] === key) { sh.getRange(i + 1, 2).setValue(value); return; }
  sh.appendRow([key, value, ""]);
}

function tnaGenerateOutputEndpoint(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  if (auth.role !== "admin") return { ok: false, error: "Hanya admin L&D yang dapat generate output." };
  var hasil = tnaBangunOutput(ss);
  if (hasil.rekon.selisih !== 0) return { ok: false, error: "Rekonsiliasi jam gagal (selisih " + hasil.rekon.selisih + "). Output tidak diterbitkan.", hasil: hasil };
  var links = tnaEksporDokumen(ss);
  tnaSetParamInternal(ss, "OutputTerakhir", new Date());
  tnaSetParamInternal(ss, "OutputLinks", JSON.stringify(links));
  tnaLog(ss, auth.nik, "generateOutput", JSON.stringify(hasil));
  return { ok: true, hasil: hasil, links: links };
}

function tnaGetOutput(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  if (auth.role !== "admin") return { ok: false, error: "Hanya admin." };
  var p = tnaParam(ss);
  var links = {}; try { links = JSON.parse(p.OutputLinks || "{}"); } catch (e) { links = {}; }
  var rekon = {}; try { rekon = JSON.parse(p.Rekonsiliasi || "{}"); } catch (e2) { rekon = {}; }
  return { ok: true, terakhir: p.OutputTerakhir, links: links, rekon: rekon, parameter: p };
}

// ITP milik sendiri (karyawan) atau bawahan langsung (atasan) setelah output terbit.
function tnaITPSaya(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  var km = tnaPetaKaryawan(ss);
  var target = String(req.target || auth.nik);
  var t = km[target];
  if (!t) return { ok: false, error: "Karyawan tidak terdaftar." };
  if (target !== auth.nik && t.PenilaiNIK !== auth.nik && t.Penilai2NIK !== auth.nik && !tnaAdalahValidator(auth.nik, t.ValidatorNIK) && auth.role !== "admin") return { ok: false, error: "Tidak berwenang." };
  var batch = {}; tnaBaca(ss, "Batch").forEach(function (b) { batch[b.BatchID] = b; });
  var katStatus = {}; tnaBaca(ss, "Katalog").forEach(function (c) { katStatus[c.KodeTraining] = String(c.Status || ""); });
  var namaK = {}; tnaBaca(ss, "Kamus").forEach(function (k) { namaK[k.KodeKompetensi] = k.Nama; });
  var itp = tnaBaca(ss, "ITP").filter(function (r) { return String(r.NIK) === target; }).map(function (r) {
    var b = batch[r.BatchID] || {};
    return { Bulan: r.Bulan, KodeTraining: r.KodeTraining, Judul: r.Judul, Kategori: r.Kategori, Jam: r.Jam, Status: r.Status,
      BatchID: r.BatchID, TanggalMulai: b.TanggalMulai || "", Lokasi: b.Lokasi || "", Metode: b.Metode || "", StatusKatalog: katStatus[r.KodeTraining] || "",
      Kompetensi: r.Kategori === "WajibGap" ? (namaK[r.KodeKompetensi] || "") : "" };
  }).sort(function (x, y) { // urut kalender: bulan, lalu tanggal mulai
    return TNA_BULAN.indexOf(x.Bulan) - TNA_BULAN.indexOf(y.Bulan) || new Date(x.TanggalMulai || 0) - new Date(y.TanggalMulai || 0);
  });
  // Karyawan sendiri hanya ITP & kalender; gap & rekomendasi untuk penilai, validator, admin.
  var targetJam = Number(tnaParam(ss).TargetJamBulan || 3) * 12;
  if (target === auth.nik && auth.role !== "admin") return { ok: true, nama: t.Nama, jabatan: t.Jabatan, itp: itp, gap: [], rekomendasi: [], hanyaITP: true, targetJam: targetJam };
  var gap = tnaBaca(ss, "Gap").filter(function (r) { return String(r.NIK) === target; });
  var rek = tnaBaca(ss, "Rekomendasi").filter(function (r) { return String(r.NIK) === target; });
  return { ok: true, nama: t.Nama, jabatan: t.Jabatan, itp: itp, gap: gap, rekomendasi: rek, targetJam: targetJam };
}

/* ============================================================
 * KATALOG TRAINING & SILABUS (semua pengguna) dan RIWAYAT TRAINING per karyawan
 * Silabus adalah ringkasan otomatis materi Drive (DRAF_AI) sampai L&D menandai FINAL.
 * Silabus perilaku berlaku per rumpun: W-CB03 dipakai untuk W-CB03-L1/L2/L3.
 * ============================================================ */
function tnaKatalog(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  var nama = {}; tnaBaca(ss, "Kamus").forEach(function (k) { nama[k.KodeKompetensi] = k.Nama; });
  var katalog = tnaBaca(ss, "Katalog").filter(function (c) { return String(c.Status).toUpperCase() !== "NONAKTIF"; }).map(function (c) {
    return { kode: String(c.KodeTraining), judul: c.Judul, kategori: c.Kategori, metode: c.Metode, jam: c.DurasiJam, level: c.LevelTarget,
      status: c.Status, sumber: c.SumberFile, link: c.Link,
      kompetensi: String(c.KodeKompetensi || "").split(/[,;]\s*/).filter(String).map(function (k) { return nama[k] || k; }).join(", ") };
  });
  var silabus = tnaBaca(ss, "Silabus").map(function (s) {
    var o = {}; TNA_TAB.Silabus.forEach(function (h) { o[h] = s[h] === undefined || s[h] === null ? "" : String(s[h]); }); return o;
  });
  return { ok: true, katalog: katalog, silabus: silabus, admin: auth.role === "admin" };
}

function tnaSilabusStatus(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  if (auth.role !== "admin") return { ok: false, error: "Hanya admin L&D yang dapat mengubah status silabus." };
  var status = String(req.status || "").toUpperCase();
  if (["FINAL", "DRAF_AI"].indexOf(status) === -1) return { ok: false, error: "Status silabus tidak dikenal." };
  var sh = tnaSheet(ss, "Silabus"), v = sh.getDataRange().getValues(), h = v[0];
  var cK = h.indexOf("KodeTraining"), cS = h.indexOf("Status"), cO = h.indexOf("DiperbaruiOleh"), cT = h.indexOf("Timestamp");
  for (var i = 1; i < v.length; i++) {
    if (String(v[i][cK]) !== String(req.kode)) continue;
    v[i][cS] = status; v[i][cO] = auth.nama; v[i][cT] = new Date();
    sh.getRange(i + 1, 1, 1, h.length).setValues([v[i]]);
    tnaCacheBatal("Silabus");
    tnaLog(ss, auth.nik, "silabusStatus", req.kode + " " + status);
    return { ok: true, kode: req.kode, status: status };
  }
  return { ok: false, error: "Silabus tidak ditemukan." };
}

// Riwayat training lengkap 2025-2026 (master data BBLC) untuk satu karyawan.
// Tab diurutkan per NIK saat import, jadi cukup membaca kolom NIK lalu satu blok baris milik orang itu.
function tnaRekam(ss, req) {
  var auth = tnaAuth(ss, req); if (!auth.ok) return auth;
  var km = tnaPetaKaryawan(ss), target = String(req.target || auth.nik), t = km[target];
  if (!t) return { ok: false, error: "Karyawan tidak terdaftar di TNA 2027." };
  var peran = tnaPeranTerhadap(auth, km, t);
  var boleh = peran === "SELF" || peran === "ATASAN" || peran === "ATASAN2" || peran === "DELEGASI" || peran === "ADMIN" ||
    tnaAdalahValidator(auth.nik, t.ValidatorNIK) || tnaLingkup(auth, km, "").some(function (k) { return k.NIK === target; });
  if (!boleh) return { ok: false, error: "Anda tidak berwenang melihat riwayat training karyawan ini." };
  var sh = ss.getSheetByName("TNA_RekamTraining"), rows = [];
  if (sh && sh.getLastRow() > 1) {
    var h = sh.getRange(1, 1, 1, TNA_TAB.RekamTraining.length).getValues()[0];
    var nikCol = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues(), lo = -1, hi = -1;
    for (var i = 0; i < nikCol.length; i++) if (String(nikCol[i][0]) === target) { if (lo < 0) lo = i; hi = i; }
    if (lo >= 0) {
      sh.getRange(2 + lo, 1, hi - lo + 1, h.length).getValues().forEach(function (r) {
        if (String(r[0]) !== target) return;
        var o = {}; h.forEach(function (k, c) { o[k] = r[c] instanceof Date ? Utilities.formatDate(r[c], "Asia/Makassar", "yyyy-MM-dd") : r[c]; });
        rows.push(o);
      });
    }
  }
  rows.sort(function (a, b) { return String(b.Tanggal).localeCompare(String(a.Tanggal)); });
  var tahun = {};
  rows.forEach(function (r) {
    var y = tahun[r.Tahun] = tahun[r.Tahun] || { tahun: r.Tahun, program: 0, ikut: 0, tidakHadir: 0, rencana: 0, jam: 0 };
    y.program++;
    var st = String(r.Status).toUpperCase();
    if (st === "HADIR" || st === "SELESAI") { y.ikut++; y.jam += Number(r.Jam) || 0; }
    else if (st === "TIDAK HADIR") y.tidakHadir++;
    else y.rencana++;
  });
  return { ok: true, nama: t.Nama, jabatan: t.Jabatan, cabang: t.Cabang, rekam: rows,
    ringkasan: Object.keys(tahun).sort().reverse().map(function (y) { tahun[y].jam = tnaR2(tahun[y].jam); return tahun[y]; }) };
}

/* ============================================================
 * EKSPOR 5 DOKUMEN (Google Sheets baru di Drive pemilik script)
 * ============================================================ */
function tnaEksporDokumen(ss) {
  var p = tnaParam(ss);
  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd-HHmm");
  var links = {};
  function buat(judul, sheets) {
    var doc = SpreadsheetApp.create(judul + " " + stamp);
    var first = true;
    sheets.forEach(function (s) {
      var sh = first ? doc.getSheets()[0] : doc.insertSheet();
      first = false;
      sh.setName(s.nama);
      var data = [s.header].concat(s.rows);
      sh.getRange(1, 1, data.length, s.header.length).setValues(data);
      sh.getRange(1, 1, 1, s.header.length).setFontWeight("bold").setBackground(PALET.navy).setFontColor("#FFFFFF");
      sh.setFrozenRows(1);
      if (s.rows.length) sh.getRange(1, 1, data.length, s.header.length).createFilter();
    });
    return doc.getUrl();
  }
  function tab(nama) { var h = TNA_TAB[nama]; return { header: h, rows: tnaBaca(ss, nama).map(function (o) { return h.map(function (k) { return o[k]; }); }) }; }

  // 1. Gap Competency
  var g = tab("Gap");
  var ringkas = {};
  tnaBaca(ss, "Gap").forEach(function (r) {
    var key = r.Dept + "|" + r.JobTitle + "|" + r.Kompetensi;
    var o = ringkas[key] = ringkas[key] || { dept: r.Dept, job: r.JobTitle, komp: r.Kompetensi, req: r.Required, n: 0, nilai: 0, sumGap: 0, major: 0 };
    o.n++; if (r.Actual !== "") { o.nilai++; o.sumGap += Number(r.Gap); if (r.KategoriGap === "Major") o.major++; }
  });
  var ringkasRows = Object.keys(ringkas).map(function (k) { var o = ringkas[k]; return [o.dept, o.job, o.komp, o.req, o.n, o.nilai, o.nilai ? tnaR2(o.sumGap / o.nilai) : "", o.major]; });
  links.gap = buat("TNA2027 - Gap Competency", [
    { nama: "Detail Gap", header: g.header, rows: g.rows },
    { nama: "Ringkasan Jabatan", header: ["Dept", "JobTitle", "Kompetensi", "Required", "JmlIncumbent", "JmlDinilai", "RataGap", "JmlMajor"], rows: ringkasRows },
    { nama: "Rekomendasi 70-20-10", header: TNA_TAB.Rekomendasi, rows: tab("Rekomendasi").rows }
  ]);

  // 2. Training Matrix: jabatan x training
  var itpAll = tnaBaca(ss, "ITP");
  var jt = {}, kolom = {};
  itpAll.forEach(function (r) {
    var key = r.KodeJabatan + "|" + r.JobTitle; kolom[r.KodeTraining + " " + r.Judul] = true;
    var o = jt[key] = jt[key] || {}; var c = r.KodeTraining + " " + r.Judul;
    var kode = r.Kategori === "Wajib" ? "W" : (r.Kategori === "WajibGap" ? "G" : (r.Kategori === "IHT" ? "I" : "P"));
    o[c] = o[c] || {}; o[c][kode] = (o[c][kode] || 0) + 1;
  });
  var kolList = Object.keys(kolom).sort();
  var tmRows = Object.keys(jt).sort().map(function (key) {
    var parts = key.split("|");
    return [parts[0], parts[1]].concat(kolList.map(function (c) { var o = jt[key][c]; if (!o) return ""; return Object.keys(o).map(function (k) { return k + ":" + o[k]; }).join(" "); }));
  });
  links.matrix = buat("TNA2027 - Training Matrix", [
    { nama: "Jabatan x Training", header: ["KodeJabatan", "JobTitle"].concat(kolList), rows: tmRows },
    { nama: "Orang x Training", header: ["NIK", "Nama", "Cabang", "JobTitle", "KodeTraining", "Judul", "Kategori"],
      rows: itpAll.map(function (r) { return [r.NIK, r.Nama, r.Cabang, r.JobTitle, r.KodeTraining, r.Judul, r.Kategori]; }) }
  ]);

  // 3. Training Plan
  var plan = {};
  itpAll.forEach(function (r) {
    var o = plan[r.KodeTraining] = plan[r.KodeTraining] || { kode: r.KodeTraining, judul: r.Judul, kat: r.Kategori, peserta: 0, jam: 0, bulan: {}, batch: {} };
    o.peserta++; o.jam += Number(r.Jam); o.bulan[r.Bulan] = (o.bulan[r.Bulan] || 0) + 1; o.batch[r.BatchID] = true;
  });
  tnaBaca(ss, "Batch").forEach(function (b) { // kursi proyeksi calon peserta (BST) supaya Plan = Calendar
    var n = Number(b.PesertaProyeksi || 0); if (!n) return;
    var o = plan[b.KodeTraining] = plan[b.KodeTraining] || { kode: b.KodeTraining, judul: b.Judul, kat: b.Kategori, peserta: 0, jam: 0, bulan: {}, batch: {} };
    o.peserta += n; o.jam += n * Number(b.DurasiJam); o.bulan[b.Bulan] = (o.bulan[b.Bulan] || 0) + n; o.batch[b.BatchID] = true;
  });
  var planRows = Object.keys(plan).sort().map(function (k) {
    var o = plan[k]; return [o.kode, o.judul, o.kat, o.peserta, Object.keys(o.batch).length, tnaR2(o.jam)].concat(TNA_BULAN.map(function (b) { return o.bulan[b] || ""; }));
  });
  var proy = tab("Proyeksi");
  var bulanOrg = TNA_BULAN.map(function (b) { return tnaR2(tnaBaca(ss, "Proyeksi").reduce(function (s, r) { return s + Number(r[b] || 0); }, 0)); });
  var nOrang = Object.keys(tnaPetaKaryawan(ss)).length;
  links.plan = buat("TNA2027 - Training Plan", [
    { nama: "Rencana per Training", header: ["KodeTraining", "Judul", "Kategori", "JmlPeserta", "JmlBatch", "TotalJam"].concat(TNA_BULAN), rows: planRows },
    { nama: "Proyeksi Jam Organisasi", header: ["Indikator"].concat(TNA_BULAN).concat(["Total"]), rows: [
      ["Total jam belajar"].concat(bulanOrg).concat([tnaR2(bulanOrg.reduce(function (s, x) { return s + x; }, 0))]),
      ["Jam per orang"].concat(bulanOrg.map(function (x) { return tnaR2(x / nOrang); })).concat([tnaR2(bulanOrg.reduce(function (s, x) { return s + x; }, 0) / nOrang)]),
      ["Target per orang"].concat(TNA_BULAN.map(function () { return Number(p.TargetJamBulan); })).concat([Number(p.TargetJamBulan) * 12])
    ] },
    { nama: "Proyeksi per Orang", header: proy.header, rows: proy.rows }
  ]);

  // 4. Training Calendar
  var bt = tab("Batch");
  links.calendar = buat("TNA2027 - Training Calendar", [{ nama: "Kalender Batch", header: bt.header, rows: bt.rows }]);

  // 5. ITP
  links.itp = buat("TNA2027 - Individual Training Plan", [{ nama: "ITP Semua Karyawan", header: TNA_TAB.ITP, rows: tab("ITP").rows }]);
  return links;
}

/* ============================================================
 * SETUP & IMPORT (dijalankan manual dari editor oleh admin)
 * ============================================================ */
function tnaSetup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(TNA_TAB).forEach(function (n) { tnaSheet(ss, n); });
  var sh = tnaSheet(ss, "Parameter");
  if (sh.getLastRow() < 2) sh.getRange(2, 1, TNA_PARAM_DEFAULT.length, 3).setValues(TNA_PARAM_DEFAULT);
  Logger.log("TNA setup selesai: " + Object.keys(TNA_TAB).length + " tab TNA_ siap.");
}

// Import paket data dari Google Sheet "TNA2027_Import" (disiapkan L&D/Claude). Isi tab sumber harus
// memakai header yang sama dengan TNA_TAB. Tab yang tidak ada di file import dilewati.
// Users: NIK baru ditambahkan (PIN acak, wajib ganti PIN), kolom Atasan NIK (G) diisi dari PenilaiNIK
// hanya bila masih kosong. Tidak ada baris Users yang dihapus.
// Jalankan dari editor (tombol Run tidak bisa mengirim argumen): isi ID Google Sheet import di baris berikut.
// ID ada di URL: docs.google.com/spreadsheets/d/<ID>/edit. ID tidak di-commit ke repo.
function tnaImportPaket() {
  var ID_FILE_IMPORT = "ISI_ID_FILE_IMPORT";
  if (ID_FILE_IMPORT === "ISI_ID_FILE_IMPORT") throw new Error("Isi dulu ID_FILE_IMPORT di fungsi tnaImportPaket.");
  return tnaImport(ID_FILE_IMPORT);
}

function tnaImport(fileIdImport) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  tnaSetup();
  var src = SpreadsheetApp.openById(fileIdImport);
  var lapor = [];
  ["Karyawan", "MasterJabatan", "Kamus", "Indikator", "Checklist", "Matriks", "Task", "Intervensi", "Katalog", "Mandatory", "Riwayat",
    "Silabus", "RekamTraining", "IHT"].forEach(function (nama) {
    var s = src.getSheetByName(nama);
    if (!s) { lapor.push(nama + ": dilewati (tidak ada)"); return; }
    var v = s.getDataRange().getValues(), h = v[0].map(String);
    var rows = [];
    for (var i = 1; i < v.length; i++) {
      if (v[i].join("") === "") continue;
      var o = {}; h.forEach(function (k, c) { o[k] = v[i][c]; }); rows.push(o);
    }
    var opsional = { Karyawan: ["ValidatorNIK"], Katalog: ["SasaranJabatan"], Kamus: ["Kelompok"],
      Task: ["SubProses", "SubSubProses", "Pengetahuan", "StandarKinerja", "SubStandar", "KSA", "LevelAktivitas"] }[nama] || [];
    var hilang = TNA_TAB[nama].filter(function (k) { return h.indexOf(k) === -1 && opsional.indexOf(k) === -1; });
    if (hilang.length) throw new Error("Tab " + nama + " kekurangan kolom: " + hilang.join(", "));
    tnaTulisUlang(ss, nama, rows);
    lapor.push(nama + ": " + rows.length + " baris");
  });
  lapor.push(tnaSinkronUsers(ss));
  Logger.log(lapor.join("\n"));
  return lapor;
}

function tnaSinkronUsers(ss) {
  var km = tnaPetaKaryawan(ss, true);
  var sh = ss.getSheetByName("Users");
  var v = sh.getDataRange().getValues();
  var ada = {}, isiAtasan = 0;
  for (var i = 1; i < v.length; i++) {
    var nik = String(v[i][0]).trim(); ada[nik] = true;
    var k = km[nik];
    if (k && !String(v[i][6] || "").trim() && k.PenilaiNIK) { v[i][6] = k.PenilaiNIK; isiAtasan++; }
  }
  sh.getRange(1, 1, v.length, v[0].length).setValues(v);
  var baru = [];
  Object.keys(km).forEach(function (nik) {
    if (ada[nik]) return;
    var k = km[nik];
    var pin = String(1000 + Math.floor(Math.random() * 9000));
    var row = [nik, pin, k.Nama, k.Cabang, k.Jabatan, "User", k.PenilaiNIK, "", true];
    while (row.length < v[0].length) row.push("");
    baru.push(row.slice(0, v[0].length));
  });
  if (baru.length) sh.getRange(sh.getLastRow() + 1, 1, baru.length, baru[0].length).setValues(baru);
  return "Users: " + isiAtasan + " Atasan NIK diisi, " + baru.length + " user baru (PIN acak, wajib ganti PIN)";
}

// Trigger otomatis: jalankan sekali dari editor untuk menjadwalkan generate output setelah window tutup.
function tnaJadwalkanOutput() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var p = tnaParam(ss);
  if (tnaWindow(p).status === "BELUM_DIJADWALKAN") throw new Error("Isi WindowBuka dan WindowTutup di Panel Admin dulu, baru jadwalkan output.");
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === "tnaOutputTerjadwal") ScriptApp.deleteTrigger(t); });
  var waktu = new Date(new Date(p.WindowTutup).getTime() + 5 * 60 * 1000);
  ScriptApp.newTrigger("tnaOutputTerjadwal").timeBased().at(waktu).create();
  Logger.log("Output dijadwalkan pada " + waktu);
}

function tnaOutputTerjadwal() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hasil = tnaBangunOutput(ss);
  if (hasil.rekon.selisih !== 0) { tnaLog(ss, "SYSTEM", "outputGagal", JSON.stringify(hasil)); return; }
  var links = tnaEksporDokumen(ss);
  tnaSetParamInternal(ss, "OutputTerakhir", new Date());
  tnaSetParamInternal(ss, "OutputLinks", JSON.stringify(links));
  tnaLog(ss, "SYSTEM", "outputTerjadwal", JSON.stringify(hasil));
}
