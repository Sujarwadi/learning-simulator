"""Melengkapi uraian tugas (tab Task) ke standar yang sama dengan master L&D Section Head:
Pengetahuan, Standar Kinerja, Bila Tidak Terpenuhi (SubStandar), KSA, Level aktivitas, dan Kompetensi Teknis.
Aturan: nilai yang sudah ada (master user) TIDAK PERNAH ditimpa; hanya sel kosong yang diisi.
Isi disusun dari teks tugas itu sendiri (kata kerja menentukan kelas, sisanya menjadi objek) dan nama kompetensi; draf, dapat dikoreksi Dept Head."""
import re, hashlib, statistics, collections

KELAS = {
 "catat": "menginput mencatat mengarsipkan merekap mendata mengolah menyimpan mengklasifikasi mengklasifikasikan mengunggah mengunduh mendokumentasikan memperbarui melengkapi mendaftarkan memelihara membukukan mencetak",
 "susun": "membuat menyusun merancang menyiapkan merencanakan mendesain merumuskan menghitung memperkirakan menyajikan menerbitkan memetakan merestrukturisasi mengembangkan mengadakan menjadwalkan membagi mengalokasikan",
 "kontrol": "mengontrol mengawasi memonitor memantau memeriksa mengecek memverifikasi memvalidasi mencocokkan merekonsiliasi membandingkan mengkonfirmasi mencegah menyelidiki meninjau mengukur mendampingi",
 "analisa": "mengevaluasi menganalisa menganalisis menilai mengidentifikasi menggali menimbang mengumpulkan",
 "koordinasi": "berkoordinasi mengkoordinasikan mengkoordinir mengkoordinasi menjalin mensosialisasikan melaporkan menyampaikan mengkomunikasikan menjelaskan meneruskan mengingatkan mengikuti mengunjungi menjadi mempelopori follow menegosiasikan menawarkan menjawab",
 "layani": "menangani menindaklanjuti menerima memproses menyerahkan mengirim mengantarkan mendistribusikan melayani memberikan mengembalikan mengurus menagih mengeluarkan memesan meminta mengajukan menyetujui mengesahkan menyediakan mengaktifkan/menonaktifkan mempercepat mengatur menjaga membersihkan merekrut mewawancarai menyeleksi survey menyesuaikan meningkatkan",
 "putus": "menentukan menetapkan merekomendasikan memastikan mengambil mendelegasikan mengarahkan",
 "laksana": "melakukan melaksanakan menjalankan mengeksekusi memakai mengelola memimpin membina bertindak",
}
VERBA = {v: k for k, vs in KELAS.items() for v in vs.split()}
BUKAN_VERBA = set("berkas berkala bersama berdasarkan berdasar berbasis melalui mengenai metode mekanik media mekanisme member memo merchandise bermasalah bersih menjadi mesin meeting menit menu mengacu menurut mencapai merek mengikuti".split())

NOM = dict(l.split("=") for l in """membuat=pembuatan mengontrol=pengendalian menyusun=penyusunan mengevaluasi=evaluasi melakukan=pelaksanaan menganalisa=analisis menganalisis=analisis memonitor=pemantauan menginput=penginputan mengumpulkan=pengumpulan berkoordinasi=koordinasi mengajukan=pengajuan memeriksa=pemeriksaan memverifikasi=verifikasi mengawasi=pengawasan menentukan=penentuan mengarsipkan=pengarsipan mengidentifikasi=identifikasi menerima=penerimaan menindaklanjuti=tindak_lanjut menyerahkan=penyerahan melaporkan=pelaporan menangani=penanganan menyiapkan=penyiapan menetapkan=penetapan meminta=permintaan menawarkan=penawaran mensosialisasikan=sosialisasi melengkapi=pelengkapan memesan=pemesanan memberikan=pemberian merekomendasikan=rekomendasi mengelola=pengelolaan mengolah=pengolahan merancang=perancangan memvalidasi=validasi merekap=rekapitulasi mengkoordinir=koordinasi memantau=pemantauan merencanakan=perencanaan memproses=pemrosesan menjalankan=pelaksanaan menghitung=perhitungan mengkoordinasikan=koordinasi mengirim=pengiriman mengecek=pengecekan menggali=penggalian mencatat=pencatatan membina=pembinaan mengembangkan=pengembangan mengatur=pengaturan follow=tindak_lanjut menerbitkan=penerbitan menegosiasikan=negosiasi mendata=pendataan mengeluarkan=pengeluaran menyelidiki=penyelidikan melaksanakan=pelaksanaan memperbarui=pembaruan memperkirakan=perkiraan menyimpan=penyimpanan mencocokkan=pencocokan mengantarkan=pengantaran membukukan=pembukuan membandingkan=perbandingan merestrukturisasi=restrukturisasi menyampaikan=penyampaian menilai=penilaian memetakan=pemetaan mengadakan=pengadaan menyediakan=penyediaan menyeleksi=seleksi mengkomunikasikan=komunikasi meninjau=peninjauan mengklasifikasi=klasifikasi mengklasifikasikan=klasifikasi merekonsiliasi=rekonsiliasi mengkonfirmasi=konfirmasi survey=survei mewawancarai=wawancara menjadwalkan=penjadwalan mencegah=pencegahan menyetujui=persetujuan mendistribusikan=pendistribusian meneruskan=penerusan menyajikan=penyajian merumuskan=perumusan menjelaskan=penjelasan mencetak=pencetakan mengurus=pengurusan menagih=penagihan melayani=pelayanan mendelegasikan=pendelegasian mempercepat=percepatan menyesuaikan=penyesuaian meningkatkan=peningkatan mendaftarkan=pendaftaran mendesain=desain memelihara=pemeliharaan mengesahkan=pengesahan mengalokasikan=alokasi membagi=pembagian mengunggah=pengunggahan mengunduh=pengunduhan mengarahkan=pengarahan mengukur=pengukuran menimbang=pertimbangan mengambil=pengambilan merekrut=perekrutan mengkoordinasi=koordinasi mendokumentasikan=pendokumentasian mengeksekusi=eksekusi mendampingi=pendampingan mengembalikan=pengembalian membersihkan=pembersihan""".split())
NOM = {k: v.replace("_", " ") for k, v in NOM.items()}

# per kelas: pengetahuan[3], standar[3], bila_tidak[3], keterampilan[2], sikap[3]. {X} = frasa kegiatan, {S} = kegiatan berhuruf kapital, {t} = kalimat tugas
T = {
 "catat": (
  ["Prosedur dan sistem pencatatan yang mengatur {X}; ketentuan kelengkapan dan ketepatan data", "Tata cara pencatatan dan penyimpanan untuk {X}; fungsi sistem yang dipakai", "Format, standar kelengkapan, dan aturan penyimpanan yang berlaku pada {X}"],
  ["{S} dilakukan benar, lengkap, dan tepat waktu sesuai prosedur; kesalahan data dikoreksi segera", "{S} terdokumentasi akurat sehingga mudah ditelusuri kembali kapan pun dibutuhkan", "Hasil {X} akurat, lengkap, dan konsisten dengan dokumen sumbernya"],
  ["Bila {X} tidak akurat atau terlambat, laporan menjadi keliru dan pengendalian terganggu", "Bila {X} tidak terdokumentasi dengan baik, penelusuran saat pemeriksaan atau audit menjadi sulit", "Kesalahan pada {X} menyebar ke proses berikutnya dan memerlukan koreksi berulang"],
  ["Mampu {t} dengan teliti dan sesuai prosedur", "Mampu {t} secara akurat dan tertib"], ["Teliti dan disiplin", "Rapi dan konsisten", "Jujur dan akuntabel"]),
 "susun": (
  ["Format, prosedur, dan ketentuan yang mengatur {X}; sumber data dan sistem pendukung", "Prinsip dan tahapan {X} sesuai kebijakan perusahaan", "Standar mutu, acuan data, dan jadwal penyelesaian untuk {X}"],
  ["{S} menghasilkan dokumen atau rencana yang lengkap, akurat, sesuai format dan ketentuan, serta selesai tepat waktu", "Hasil {X} siap dipakai sebagai dasar keputusan atau kerja berikutnya tanpa perbaikan besar", "Hasil {X} konsisten dengan data sumber dan disetujui atasan pada pemeriksaan pertama"],
  ["Bila {X} tidak lengkap atau terlambat, proses berikutnya dan keputusan atasan terhambat", "Bila hasil {X} tidak akurat, pekerjaan harus diulang dan kepercayaan unit terkait menurun", "Bila {X} tidak selaras dengan kebijakan, hasilnya berisiko ditolak atau dikoreksi"],
  ["Mampu {t} secara sistematis dan akurat", "Mampu {t} sesuai format dan tenggat"], ["Teliti dan rapi", "Analitis dan tepat waktu", "Bertanggung jawab atas hasil kerja"]),
 "kontrol": (
  ["Standar, indikator, dan batas toleransi yang berlaku pada {X}; metode pemeriksaan dan pelaporan temuan", "Prosedur pengawasan dan dokumen pendukung yang harus tersedia untuk {X}", "Ketentuan dan kriteria kelayakan terkait {X}; cara menelusuri penyimpangan"],
  ["{S} dilakukan berkala, penyimpangan teridentifikasi dan ditindaklanjuti sesuai batas waktu", "{S} menyeluruh, temuan terdokumentasi, dan perbaikan dipantau sampai selesai", "Hasil {X} sesuai standar dan ketentuan, dan penyimpangan dilaporkan kepada atasan"],
  ["Bila {X} lemah, penyimpangan tidak terdeteksi atau terlambat ditangani sehingga risiko kerugian meningkat", "Bila {X} tidak dilakukan memadai, temuan yang sama berulang", "Kesalahan yang lolos dari {X} menimbulkan koreksi dan biaya tambahan di tahap berikutnya"],
  ["Mampu {t} secara kritis dan menyimpulkan temuan dengan jelas", "Mampu {t} sesuai standar pemeriksaan"], ["Kritis dan objektif", "Teliti dan konsisten", "Berintegritas dan tegas pada standar"]),
 "analisa": (
  ["Metode analisis, sumber data, dan indikator yang relevan untuk {X}", "Cara mengolah dan menafsirkan data pada {X}; standar pembanding yang berlaku", "Kerangka evaluasi dan kriteria penilaian untuk {X}"],
  ["{S} berbasis data, akurat, dan menghasilkan kesimpulan serta rekomendasi yang dapat ditindaklanjuti", "{S} dilakukan objektif dan hasilnya dipakai untuk perbaikan atau keputusan", "Temuan dari {X} disampaikan jelas dan tepat waktu kepada pihak yang berkepentingan"],
  ["Bila {X} tidak berbasis data, keputusan diambil tanpa dasar yang jelas dan tindakan kurang tepat sasaran", "Bila {X} tidak memadai, peluang perbaikan terlewat", "Bila kesimpulan dari {X} keliru atau terlambat, tindak lanjut tidak efektif"],
  ["Mampu {t} dan merumuskan kesimpulan yang dapat ditindaklanjuti", "Mampu {t} secara objektif berbasis data"], ["Analitis dan berorientasi data", "Objektif dan terbuka pada fakta", "Kritis dan berorientasi solusi"]),
 "koordinasi": (
  ["Alur kerja, peran, dan batas wewenang unit yang terlibat dalam {X}; etika komunikasi bisnis", "Kebutuhan informasi dan jadwal bersama pihak yang terlibat dalam {X}", "Prosedur komunikasi dan eskalasi untuk {X}"],
  ["{S} berjalan jelas, informasi tersampaikan lengkap dan tepat waktu, dan tindak lanjut disepakati", "Pihak terkait memahami peran dan tenggat dalam {X}; hambatan dieskalasi segera", "Hubungan kerja pada {X} terjaga baik dan menghasilkan kesepakatan yang dijalankan"],
  ["Bila informasi dalam {X} terlambat atau tidak utuh, pekerjaan antarunit tertunda dan terjadi salah paham", "Bila {X} lemah, tugas tumpang tindih atau terlewat", "Bila hambatan dalam {X} tidak dieskalasi, target unit ikut terdampak"],
  ["Mampu {t} secara jelas dan menjaga hubungan kerja", "Mampu {t} dan menindaklanjuti kesepakatan"], ["Komunikatif dan proaktif", "Kolaboratif dan menghargai pihak lain", "Responsif dan dapat dipercaya"]),
 "layani": (
  ["Prosedur, persyaratan, dan standar waktu penyelesaian untuk {X}; sistem yang dipakai", "Ketentuan layanan dan dokumen yang dibutuhkan dalam {X}", "Alur proses dan batas wewenang dalam {X}"],
  ["{S} diselesaikan sesuai prosedur, dokumen lengkap, dan dalam batas waktu yang ditetapkan", "{S} cepat, tepat, dan memuaskan pihak yang dilayani", "{S} tercatat dan dapat ditelusuri, tanpa keluhan atau pengulangan pekerjaan"],
  ["Bila {X} terlambat atau tidak sesuai prosedur, pelanggan atau unit terkait dirugikan dan muncul keluhan", "Bila dokumen atau langkah pada {X} tidak lengkap, proses harus diulang", "Bila {X} tidak tuntas, kepuasan dan target unit terdampak"],
  ["Mampu {t} sesuai prosedur dan standar layanan", "Mampu {t} dengan cepat dan tepat"], ["Cekatan dan berorientasi pada pelayanan", "Teliti dan bertanggung jawab", "Sopan dan responsif"]),
 "putus": (
  ["Dasar pertimbangan, kriteria, dan kebijakan yang mengatur {X}; data pendukung keputusan", "Wewenang, batas anggaran, dan konsekuensi keputusan dalam {X}", "Alternatif, risiko, dan prioritas yang relevan untuk {X}"],
  ["{S} didasarkan pada data dan kebijakan, terdokumentasi, dan dikomunikasikan kepada pihak terkait", "{S} dilakukan tepat waktu dan dapat dipertanggungjawabkan", "Pertimbangan dalam {X} lengkap sehingga hasilnya tidak perlu direvisi"],
  ["Bila {X} terlambat atau tanpa dasar cukup, risiko operasional dan finansial meningkat", "Bila hasil {X} tidak jelas, pelaksana ragu dan pekerjaan tertunda", "Bila {X} kurang matang, koreksi diperlukan di kemudian hari"],
  ["Mampu {t} dengan dasar pertimbangan yang jelas", "Mampu {t} secara tegas dan dapat dipertanggungjawabkan"], ["Tegas dan bertanggung jawab", "Objektif dan berani mengambil keputusan", "Berintegritas dan berorientasi hasil"]),
 "laksana": (
  ["Prosedur kerja, standar mutu, dan ketentuan perusahaan yang mengatur {X}", "Tahapan pelaksanaan, sumber daya, dan jadwal untuk {X}", "Aturan keselamatan, mutu, dan pelaporan dalam {X}"],
  ["{S} sesuai prosedur, standar mutu, dan jadwal, dengan hasil yang dapat dipertanggungjawabkan", "{S} tertib, terdokumentasi, dan tanpa pengulangan pekerjaan", "{S} berjalan lancar dan sasaran unit tercapai"],
  ["Bila {X} tidak sesuai prosedur atau terlambat, target unit terganggu", "Bila {X} tidak terkendali, pekerjaan harus diulang", "Bila mutu {X} menurun, muncul koreksi dan keluhan"],
  ["Mampu {t} sesuai prosedur dan standar mutu", "Mampu {t} secara tertib dan konsisten"], ["Disiplin dan bertanggung jawab", "Tekun dan konsisten", "Proaktif dan berorientasi hasil"]),
}

def _pilih(opsi, kunci):
    return opsi[int(hashlib.md5(kunci.encode()).hexdigest(), 16) % len(opsi)]

def urai(teks):
    t = re.sub(r"\s+", " ", str(teks or "").strip())
    if not t: return "", ""
    kata = t.split(" ")
    v = kata[0].lower()
    if v == "follow" and len(kata) > 1 and kata[1].lower() == "up": return "follow", " ".join(kata[2:])
    return v, " ".join(kata[1:])

def objek_bersih(r):
    if not r or len(r) < 3: return False
    kata = r.split()
    if kata[0].lower() in ("dan", "serta", "atau", "ke", "kepada", "untuk", "di", "dari", "pada", "sesuai", "bersama", "melalui", "via", "agar", "supaya", "yang", "sebagai", "terhadap", "menjadi"): return False
    for i, w in enumerate(kata):
        lw = re.sub(r"[^a-z]", "", w.lower())
        if i > 0 and len(lw) >= 7 and lw not in BUKAN_VERBA and re.match(r"^(meng|mem|men|meny|ber|me)[a-z]+(kan|i)?$", lw): return False
    return True

def lengkapi_baris(task, komp, level_komp, kunci):
    task = re.sub(r"\s+", " ", str(task).strip()).rstrip(".")
    v, r = urai(task)
    kelas = VERBA.get(v, "laksana")
    n = NOM.get(v)
    tl = task[:1].lower() + task[1:]
    if n and objek_bersih(r) and len(r) <= 80:
        X = (n + " " + r).strip() if v != "berkoordinasi" else ("koordinasi " + r)
    else:
        X = "pekerjaan " + tl if len(tl) <= 100 else "pekerjaan ini"
    S = X[:1].upper() + X[1:]
    tt = tl if len(tl) <= 100 else "menjalankan tugas ini"
    p3, s3, b3, sk2, sikap = T[kelas]
    fmt = lambda x: x.replace("{X}", X).replace("{S}", S).replace("{t}", tt)
    peng = fmt(_pilih(p3, kunci + "p")); stan = fmt(_pilih(s3, kunci + "s")); bila = fmt(_pilih(b3, kunci + "b")); skill = fmt(_pilih(sk2, kunci + "k"))
    pk = peng + ("; " + komp if komp else "")
    ksa = "K: " + peng + ("\nK: " + komp + (" (level %s)" % level_komp if level_komp else "") if komp else "") + "\nS: " + skill + "\nA: " + _pilih(sikap, kunci + "a")
    return {"Pengetahuan": pk, "StandarKinerja": stan, "SubStandar": bila, "KSA": ksa}

def _tok(s):
    return set(w for w in re.findall(r"[a-z]{4,}", str(s).lower()))

def lengkapi(task_rows, matriks, kamus, master_jab):
    """Mengisi sel kosong. Mengembalikan laporan jumlah."""
    kam = {k["KodeKompetensi"]: k for k in kamus}
    req, bobot = {}, {}
    for m in matriks:
        req.setdefault(m["KodeJabatan"], {})[m["KodeKompetensi"]] = int(m["RequiredLevel"]); bobot[(m["KodeJabatan"], m["KodeKompetensi"])] = int(m.get("Bobot") or 2)
    teknis = {}
    for j, d in req.items(): teknis[j] = {k: v for k, v in d.items() if kam.get(k, {}).get("Kategori") == "Technical"}
    # kompetensi dominan per tugas utama (dari tugas yang sudah terpetakan), dipakai untuk tugas yang belum terpetakan
    dom = {}
    for t in task_rows:
        k = str(t.get("KodeKompetensi") or "").strip()
        if k and k in teknis.get(t["KodeJabatan"], {}): dom.setdefault((t["KodeJabatan"], t.get("TugasUtama")), collections.Counter())[k] += 1
    lap = {"baris": 0, "dipetakan_ulang": 0, "level_turunan": 0, "ksa_master_dilengkapi": 0, "diisi": 0}
    for t in task_rows:
        lap["baris"] += 1
        kode = str(t.get("KodeKompetensi") or "").strip()
        j = t["KodeJabatan"]
        # tugas tanpa kompetensi dipetakan berurutan: (1) kata yang sama dengan nama atau definisi kompetensi jabatan itu (min. 2),
        # (2) kompetensi dominan pada tugas utama yang sama, (3) kata yang sama (min. 1), (4) kompetensi teknis berbobot tertinggi jabatan
        if not kode and teknis.get(j):
            tt = _tok(t["Task"]); skor = {k: len(tt & (_tok(kam[k]["Nama"]) | _tok(kam[k].get("Definisi", "")))) for k in teknis[j]}
            terbaik = max(skor, key=lambda k: (skor[k], bobot.get((j, k), 2)))
            if skor[terbaik] >= 2: kode = terbaik
            elif dom.get((j, t.get("TugasUtama"))): kode = dom[(j, t.get("TugasUtama"))].most_common(1)[0][0]
            elif skor[terbaik] >= 1: kode = terbaik
            else: kode = max(teknis[j], key=lambda k: (bobot.get((j, k), 2), teknis[j][k]))
            t["KodeKompetensi"] = kode; lap["dipetakan_ulang"] += 1
        komp = kam.get(kode, {}).get("Nama", "")
        lv = req.get(j, {}).get(kode)
        if not str(t.get("LevelAktivitas") or "").strip():
            if lv: t["LevelAktivitas"] = str(lv); lap["level_turunan"] += 1
            elif teknis.get(j): t["LevelAktivitas"] = str(int(round(statistics.median(teknis[j].values())))); lap["level_turunan"] += 1
        sudah_ksa = bool(str(t.get("KSA") or "").strip())
        isi = lengkapi_baris(t["Task"] if len(str(t["Task"])) <= 140 else (t.get("SubProses") or t["Task"]), komp, t.get("LevelAktivitas") or "", j + "|" + str(t["Task"]))
        if sudah_ksa:  # master Finance: KSA milik user dipertahankan; Pengetahuan dari baris K:, standar dari Sub-Proses
            ks = [x[2:].strip() for x in str(t["KSA"]).split("\n") if x.startswith("K:")]
            if ks: isi["Pengetahuan"] = "; ".join(ks)
            sp = str(t.get("SubProses") or "").strip().rstrip(".")
            if sp:
                low = sp[:1].lower() + sp[1:]
                isi["StandarKinerja"] = _pilih(["%s terlaksana akurat, lengkap, dan tepat waktu sesuai kebijakan serta ketentuan perusahaan" % sp, "%s dilakukan sesuai standar dan hasilnya dapat dipertanggungjawabkan kepada atasan dan pihak terkait" % sp, "%s berjalan sesuai rencana, terdokumentasi, dan mendukung pencapaian target unit" % sp], j + str(t["Task"]) + "s")
                isi["SubStandar"] = _pilih(["Pelaksanaan %s tidak sesuai standar, sehingga target unit dan keputusan manajemen terdampak" % low, "%s terlambat atau tidak akurat dan menimbulkan koreksi serta risiko bagi perusahaan" % sp, "Kualitas %s menurun sehingga proses berikutnya terhambat dan pengendalian melemah" % low], j + str(t["Task"]) + "b")
            isi.pop("KSA", None); lap["ksa_master_dilengkapi"] += 1
        for k, v in isi.items():
            if not str(t.get(k) or "").strip(): t[k] = v; lap["diisi"] += 1
    return lap
