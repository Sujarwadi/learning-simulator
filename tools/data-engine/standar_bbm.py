"""Standar Kompetensi BBM v1.0 (31 Okt 2026): menerapkan aturan docs/STANDAR_KOMPETENSI_BBM.md ke data import.
Dipanggil dari build_import.py sesudah master_2027.terapkan dan ksa_gen.lengkapi. Data karyawan tidak disentuh.
 A. Tools & Technology satu set untuk seluruh BBM (TC-TL-01..07): isi master Finance + indikator master L&D yang belum ada.
 B. Setiap kompetensi yang dipakai: 5 level, tiap level punya definisi level + minimal 2 key behavior (KB) observable.
    Checklist asesmen (C2-C5) TIDAK diubah untuk kompetensi non-master supaya skor Guttman tetap sama.
 C. Task: kolom Sumber (asal setiap isi) dan BuktiPenilaian (bukti yang dicek atasan, pola panduan penilaian SKKNI).
 D. Keterlacakan: tiap sel matriks teknis didukung minimal 1 tugas; level aktivitas = level matriks.
 E. QA otomatis: hasilnya dikembalikan untuk laporan; temuan yang butuh keputusan pemilik master hanya ditandai."""
import re, collections, importlib.util, os
from ksa_gen import urai, VERBA, NOM, objek_bersih

DIR = os.path.dirname(os.path.abspath(__file__))
LABEL = ["", "Awareness", "Basic", "Intermediate", "Advanced", "Expert"]
TOOLS = [("TC-FIN-16", "TC-LND-14"), ("TC-FIN-17", "TC-LND-15"), ("TC-FIN-18", "TC-LND-16"), ("TC-FIN-19", "TC-LND-17"),
         ("TC-FIN-20", "TC-LND-18"), ("TC-FIN-21", "TC-LND-19"), ("TC-FIN-22", "TC-LND-20")]
KODE_TL = {}
for i, (f, l) in enumerate(TOOLS, 1): KODE_TL[f] = KODE_TL[l] = "TC-TL-%02d" % i
JAB_LND = {"J015"}
TIDAK_OBSERVABLE = re.compile(r"^(memahami|mengetahui|mengerti|mengenal|menyadari|paham|tahu)\b", re.I)

def _muat(nama):
    sp = importlib.util.spec_from_file_location(nama, os.path.join(DIR, "std", nama + ".py"))
    m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m

def _konten():
    kb = {}
    for n in ("kb_a", "kb_b", "kb_c"):
        for k, v in _muat(n).KB.items():
            assert k not in kb, "duplikat konten " + k
            assert len(v) == 7, k
            kb[k] = [re.sub(r"tanpa comeback(?! \()", "tanpa comeback (pekerjaan ulang)", x).strip() for x in v]
    d = _muat("kb_d")
    return kb, d.DEF_LND, d.CB_L1

def _norm(s): return re.sub(r"[^a-z0-9]+", " ", str(s).lower()).strip()
def _split(s): return [x.strip().rstrip(".").strip() for x in re.split(r";\s*|\n", str(s or "")) if x.strip()]
def _kalimat(s):
    s = str(s).strip().rstrip(".")
    return s[:1].upper() + s[1:] if s else s

STOP = set("yang dengan untuk dalam pada dari atau serta sesuai secara dapat telah sudah akan oleh agar bagi para setiap seluruh lain kerja tugas tingkat perusahaan mampu memahami konsep dasar masih memerlukan bimbingan penuh mandiri konsisten standar rujukan menjadi tempat bertanya membimbing rekan rutin panduan supervisi pekerjaan".split())
def _tok(s): return set(w for w in re.findall(r"[a-z]{4,}", str(s).lower()) if w not in STOP)

def _frasa(task):
    t = re.sub(r"\s+", " ", str(task).strip()).rstrip(".")
    v, r = urai(t); n = NOM.get(v); tl = t[:1].lower() + t[1:]
    if n and objek_bersih(r) and len(r) <= 80: return VERBA.get(v, "laksana"), ((n + " " + r) if v != "berkoordinasi" else ("koordinasi " + r)).strip()
    return VERBA.get(v, "laksana"), ("pekerjaan " + tl if len(tl) <= 90 else "pekerjaan ini")

BUKTI = {
 "catat": "Data atau catatan hasil {X} di sistem/arsip, dicocokkan dengan dokumen sumbernya",
 "susun": "Dokumen hasil {X} beserta catatan review atau persetujuan atasan",
 "kontrol": "Lembar pemeriksaan atau laporan temuan {X} beserta bukti tindak lanjutnya",
 "analisa": "Laporan hasil {X} beserta kesimpulan dan rekomendasinya",
 "koordinasi": "Notulen, email, atau pesan kerja terkait {X} beserta kesepakatan yang dihasilkan",
 "layani": "Log permintaan atau tiket {X} beserta waktu penyelesaian dan umpan balik pihak yang dilayani",
 "putus": "Dokumen keputusan atau persetujuan {X} beserta dasar pertimbangannya",
 "laksana": "Laporan pelaksanaan {X} dan hasilnya dibanding target atau standar",
}

EJAAN = [(r"\bmenganalisanya\b", "menganalisisnya"), (r"\bmenganalisa\b", "menganalisis"), (r"\bMenganalisa\b", "Menganalisis"), (r"\banalisa\b", "analisis"), (r"\bAnalisa\b", "Analisis"),
         (r"\bresiko\b", "risiko"), (r"\bResiko\b", "Risiko"), (r"\baktifitas\b", "aktivitas"), (r"\befektifitas\b", "efektivitas"),
         (r"\bkorenspondensi\b", "korespondensi")]
def _ejaan(s):
    if not isinstance(s, str): return s
    for a, b in EJAAN: s = re.sub(a, b, s)
    return s

def _mirip(a, b):
    ta, tb = _tok(a), _tok(b)
    return len(ta & tb) / max(1, len(ta | tb))

# Dimensi pembeda KB kedua untuk kompetensi draf (pola atribut generik SFIA per tingkat tanggung jawab: L2 bekerja dalam arahan,
# L3 menangani variasi secara mandiri, L4 memastikan mutu kerja orang lain, L5 dampak dan tata kelola). Dipakai hanya bila KB kedua
# yang ditulis khusus terlalu mirip dengan item checklist (>=30% kata sama), supaya dua KB mengukur dua hal berbeda.
DIMENSI = {
 2: ["Melaporkan kendala di bidang {N} kepada atasan sebelum mengambil langkah di luar prosedur",
     "Mencatat hasil pekerjaan bidang {N} sesuai format sehingga mudah diperiksa atasan",
     "Mengikuti SOP atau manual bidang {N} tanpa melewatkan langkah"],
 3: ["Menangani variasi kasus dan masalah umum di bidang {N} tanpa eskalasi",
     "Menjelaskan alasan langkah kerja yang dipilih di bidang {N} kepada atasan atau rekan",
     "Menyesuaikan cara kerja bidang {N} dengan kondisi yang berbeda tanpa menurunkan mutu hasil"],
 4: ["Memeriksa hasil kerja rekan di bidang {N} dan memberi umpan balik perbaikan yang spesifik",
     "Mendokumentasikan kasus sulit di bidang {N} beserta solusinya sebagai bahan belajar tim",
     "Menjadi pemeriksa akhir untuk pekerjaan bidang {N} yang kompleks di unitnya"],
 5: ["Mengukur dampak standar atau panduan {N} yang diterapkan terhadap waktu, biaya, atau mutu dan memperbaruinya secara berkala",
     "Menjadi narasumber bidang {N} bagi manajemen dan unit lain dalam pengambilan keputusan",
     "Menetapkan indikator keberhasilan bidang {N} di tingkat perusahaan dan memantau pencapaiannya"],
}
def _dimensi(n, kode, nama):
    import hashlib
    return DIMENSI[n][int(hashlib.md5(kode.encode()).hexdigest(), 16) % 3].replace("{N}", nama)

def terapkan(kamus, cek, indikator, matriks, task_rows, interv, katalog, master_jab):
    KB, DEF_LND, CB_L1 = _konten()
    lap, temuan = collections.OrderedDict(), []   # temuan: (Jenis, Kode, Objek, Uraian, Usulan, Status)
    kam = {k["KodeKompetensi"]: k for k in kamus}
    ind = collections.defaultdict(dict)
    for r in indikator: ind[r["KodeKompetensi"]][int(r["Level"])] = r

    # ---------- A. Tools & Technology satu set ----------
    for i, (f, l) in enumerate(TOOLS, 1):
        baru = KODE_TL[f]; kf, kl = kam[f], kam[l]
        assert _norm(kf["Nama"]) == _norm(kl["Nama"]), (f, l)
        nk = dict(kf, KodeKompetensi=baru, Status="MASTER", Kelompok="Tools & Technology")
        if _norm(kf["Definisi"]) != _norm(kl["Definisi"]):
            temuan.append(("Tools: definisi beda", baru, kf["Nama"], "Definisi master Finance dan master L&D berbeda; dipakai versi Finance.", "Konfirmasi definisi tunggal", "DIPUTUSKAN_STUDIO"))
        tambah = 0
        for n in range(1, 6):
            rf, rl = ind[f][n], ind[l][n]
            daftar = [x for x in str(rf["Indikator"]).split("\n") if x.strip()]
            ada = {_norm(x) for x in daftar}
            for x in str(rl["Indikator"]).split("\n"):
                if x.strip() and _norm(x) not in ada and all(_mirip(x, y) < 0.6 for y in daftar): daftar.append(x.strip()); ada.add(_norm(x)); tambah += 1
            ind[baru][n] = {"KodeKompetensi": baru, "Level": n, "Label": rf["Label"], "DefinisiLevel": rf["DefinisiLevel"], "Indikator": "\n".join(daftar),
                            "Sumber": "Master Finance" + (" + master L&D" if len(daftar) > len([y for y in str(rf["Indikator"]).split("\n") if y.strip()]) else "; indikator master L&D yang setara sudah tercakup")}
        kam[baru] = nk
        for old in (f, l): kam.pop(old); ind.pop(old)
        lap["Tools " + baru + " " + kf["Nama"]] = "gabungan %s + %s, %d indikator L&D ditambahkan" % (f, l, tambah)
    def ganti(kode): return KODE_TL.get(kode, kode)
    for m in matriks: m["KodeKompetensi"] = ganti(m["KodeKompetensi"])
    for t in task_rows: t["KodeKompetensi"] = ganti(t["KodeKompetensi"])
    for r in interv: r["KodeKompetensi"] = ganti(r["KodeKompetensi"])
    for c in katalog:
        ks = [ganti(x.strip()) for x in str(c.get("KodeKompetensi") or "").split(",") if x.strip()]
        c["KodeKompetensi"] = ",".join(dict.fromkeys(ks))
    # dua jabatan bisa punya baris ganda setelah penggabungan bila sebelumnya memakai keduanya (tidak terjadi, dicek)
    assert len({(m["KodeJabatan"], m["KodeKompetensi"]) for m in matriks}) == len(matriks), "matriks ganda setelah penggabungan Tools"

    # ---------- B. Kamus 5 level: definisi + >=2 KB ----------
    cekby = {c["KodeKompetensi"]: c for c in cek}
    diganti_dimensi = 0
    dipakai = {m["KodeKompetensi"] for m in matriks}
    for kode, k in kam.items():
        if kode not in dipakai: continue
        kat = k["Kategori"]
        if kode.startswith("TC-TL-"):
            pass
        elif kode.startswith("TC-FIN-"):
            for n in range(1, 6): ind[kode][n]["Sumber"] = "Master Finance"
        elif kode.startswith("TC-LND-"):
            no = "TC-%02d" % int(kode[-2:])
            for n in range(1, 6):
                r = ind[kode][n]
                if not str(r.get("DefinisiLevel") or "").strip():
                    r["DefinisiLevel"] = DEF_LND[no][n - 1]; r["Sumber"] = "Indikator: master L&D. Definisi level: disusun L&D Studio dari indikator master (perlu validasi)"
                else: r["Sumber"] = "Master L&D"
                k["L%d" % n] = r["DefinisiLevel"]
        elif kat == "Behavioral":
            c = cekby[kode]
            for n in range(1, 6):
                kbn = CB_L1[kode] if n == 1 else _split(c["C%d" % n])
                ind[kode][n] = {"KodeKompetensi": kode, "Level": n, "Label": LABEL[n], "DefinisiLevel": _kalimat(k["L%d" % n]), "Indikator": "\n".join(_kalimat(x) for x in kbn),
                                "Sumber": "Kamus perilaku BBM (FINAL)" if n > 1 else "Definisi: kamus perilaku BBM (FINAL). Key behavior Level 1: disusun L&D Studio (perlu validasi)"}
        else:
            if kode not in KB: raise SystemExit("Konten standar belum ada untuk " + kode + " " + k["Nama"])
            v = KB[kode]; c = cekby[kode]
            k["L1"] = v[0]
            for n in range(1, 6):
                if n == 1: kbn = [v[1], v[2]]
                else:
                    awal = [_ejaan(re.sub(r"^(Dapat|Pernah|Telah|Sudah)\s+", "", x)) for x in _split(c["C%d" % n])]
                    kb2 = _ejaan(v[n + 1])
                    if _mirip(awal[0], kb2) >= 0.3:  # KB2 harus menambah dimensi lain, bukan mengulang KB1 (item checklist)
                        kb2 = _dimensi(n, kode, k["Nama"]); diganti_dimensi += 1
                    kbn = [_kalimat(x) for x in awal] + [kb2]
                ind[kode][n] = {"KodeKompetensi": kode, "Level": n, "Label": LABEL[n], "DefinisiLevel": _kalimat(k["L%d" % n]), "Indikator": "\n".join(_kalimat(x) for x in kbn),
                                "Sumber": "Draf L&D Studio dari JD (DRAFT_AI, perlu validasi SME)"}
        # checklist asesmen untuk Tools gabungan: dari KB master (pola master_2027)
        if kode.startswith("TC-TL-"):
            cekby[kode] = {"KodeKompetensi": kode, **{"C%d" % n: "; ".join(x.strip() for x in ind[kode][n]["Indikator"].split("\n") if x.strip()) for n in (2, 3, 4, 5)}}
        for n in range(1, 6): ind[kode][n]["Label"] = LABEL[n]
    for old in [x for x in cekby if x in KODE_TL]: cekby.pop(old)
    lap["KB kedua L2-L5 diganti dimensi pembeda (terlalu mirip item checklist)"] = diganti_dimensi
    kamus[:] = list(kam.values()); cek[:] = list(cekby.values())
    indikator[:] = [ind[k][n] for k in kam if k in ind for n in range(1, 6) if n in ind[k]]

    # ---------- C+D. Task: sumber, bukti, keterlacakan level ----------
    jab = {j["KodeJabatan"]: j for j in master_jab}
    req = {(m["KodeJabatan"], m["KodeKompetensi"]): m for m in matriks}
    level_fix = 0
    for t in task_rows:
        j = t["KodeJabatan"]; mj = jab.get(j, {})
        master_fin = bool(str(t.get("SubProses") or "").strip())
        dipetakan = t.get("_dipetakan") or bool(t.get("KompetensiAsli"))
        if j in JAB_LND: src = "Master L&D (tugas, pengetahuan, standar kinerja, KSA, level)"
        elif master_fin: src = "Tugas utama & proses: JD verbatim (master Finance). Sub-proses, KSA, level: master Finance. Standar kinerja & bila tidak terpenuhi: L&D Studio (DRAFT_AI)"
        elif mj.get("StatusJD") == "DEKAT": src = "Tugas: JD jabatan terdekat (pendekatan, perlu JD resmi). Pengetahuan, standar, KSA, level: L&D Studio (DRAFT_AI)"
        else: src = "Tugas: JD verbatim. Pengetahuan, standar kinerja, KSA, level: L&D Studio (DRAFT_AI)"
        if t.get("KompetensiAlias"):
            src += ". Nama kompetensi di master '%s' tidak ada di kamus; disamakan dengan '%s' (perlu konfirmasi pemilik master)" % (t["KompetensiAlias"], kam[t["KodeKompetensi"]]["Nama"])
        if t.get("KompetensiAsli"):
            src += ". Kompetensi '%s' di master tidak ada di kamus; dipetakan ke kompetensi terdekat (perlu konfirmasi)" % t["KompetensiAsli"]
        m = req.get((j, t["KodeKompetensi"]))
        if m and dipetakan and str(t.get("LevelAktivitas")) != str(m["RequiredLevel"]):
            t["LevelAktivitas"] = str(m["RequiredLevel"]); level_fix += 1
        t["Sumber"] = src
        kelas, X = _frasa(t["Task"] if len(str(t["Task"])) <= 140 else (t.get("SubProses") or t["Task"]))
        if not str(t.get("BuktiPenilaian") or "").strip(): t["BuktiPenilaian"] = BUKTI[kelas].replace("{X}", X) + "; observasi langsung atasan"
    lap["Level aktivitas diselaraskan (baris hasil pemetaan ulang)"] = level_fix

    # sel matriks teknis tanpa tugas: jabatan draf -> tautkan ke tugas JD yang paling mirip; jabatan master -> ditandai saja
    tugas_by_j = collections.defaultdict(list)
    for t in task_rows: tugas_by_j[t["KodeJabatan"]].append(t)
    # aktivitas memimpin tim dipetakan ke kompetensi kepemimpinan, bukan teknis (sebelumnya terpetakan otomatis oleh kesamaan kata)
    ARAH = re.compile(r"kinerja (tim|bawahan|mekanik|staf)|efektivitas kinerja tim|evaluasi dan mengarahkan|membagi tugas|mendelegasikan|strategi (kerja|peningkatan kinerja)( tim| bawahan| mekanik)?\b|hasil kerja (bawahan|mekanik|sales)|memantau kinerja tim", re.I)
    KEMBANG = re.compile(r"coaching|counseling|motivasi|membina (tim|manajer)|mengembangkan (tim|kompetensi tim)|pengembangan kompetensi tim|produktivitas kerja karyawan|produktifitas kerja karyawan|membimbing tim", re.I)
    lv_by = {(m["KodeJabatan"], m["KodeKompetensi"]): m for m in matriks}
    n_lead = 0
    for t in task_rows:
        j = t["KodeJabatan"]
        if j in JAB_LND or t.get("_lead") or kam.get(t["KodeKompetensi"], {}).get("Kategori") != "Technical": continue
        teks = str(t["Task"])
        jenis = "kembang" if KEMBANG.search(teks) else ("arah" if (ARAH.search(teks) or re.search(r"kinerja karyawan", teks, re.I)) else None)
        if not jenis: continue
        pilihan = (["SL-02", "LD-02"] if jenis == "kembang" else ["SL-03", "LD-01"])
        kd = next((x for x in pilihan if (j, x) in lv_by), None)
        if not kd: continue
        t["KodeKompetensi"] = kd; t["LevelAktivitas"] = str(lv_by[(j, kd)]["RequiredLevel"]); t["_lead"] = True; n_lead += 1
        t["Sumber"] = str(t.get("Sumber") or "") + ". Aktivitas memimpin tim dipetakan ke kompetensi kepemimpinan (L&D 31 Okt 2026)"
    # baris ganda (aktivitas sama, kompetensi sama) dirapikan
    seen, uniq = set(), []
    for t in task_rows:
        key = (t["KodeJabatan"], t["TugasUtama"], t["Task"], t["KodeKompetensi"])
        if key in seen: continue
        seen.add(key); uniq.append(t)
    task_rows[:] = uniq
    tugas_by_j = collections.defaultdict(list)
    for t in task_rows: tugas_by_j[t["KodeJabatan"]].append(t)
    lap["Aktivitas memimpin tim dipetakan ke kompetensi kepemimpinan"] = n_lead
    # pemetaan aktivitas -> kompetensi teknis tanpa satu pun kata kunci domain dipindah ke kompetensi jabatan yang paling cocok
    KP0 = _muat("keputusan")
    LEK = {kd: [w.strip() for w in KP0.LEKSIKON[k["Nama"]].split(",") if w.strip()] for kd, k in kam.items() if k["Nama"] in KP0.LEKSIKON}
    def skor(teks, kd):
        tl = " " + re.sub(r"[^a-z0-9' ]+", " ", str(teks).lower()) + " "
        return sum(1 for w in LEK.get(kd, []) if re.search(r"(?<![a-z0-9])" + re.escape(w) + (r"(?![a-z0-9])" if len(w) <= 3 else ""), tl))  # kata pendek harus utuh
    tek_j = collections.defaultdict(list)
    for m in matriks:
        if kam.get(m["KodeKompetensi"], {}).get("Kategori") == "Technical": tek_j[m["KodeJabatan"]].append(m["KodeKompetensi"])
    n_lek = 0
    for t in task_rows:
        j, kd = t["KodeJabatan"], t["KodeKompetensi"]
        if t.get("_lead") or j in JAB_LND or str(t.get("SubProses") or "").strip() or kd not in LEK: continue
        if skor(t["Task"], kd) > 0: continue
        calon = sorted(((skor(t["Task"], c), c) for c in tek_j[j] if c in LEK and c != kd), reverse=True)
        if calon and calon[0][0] > 0:
            baru = calon[0][1]; m = lv_by.get((j, baru))
            t["Sumber"] = str(t.get("Sumber") or "") + ". Kompetensi dipindah dari %s ke %s karena isi aktivitas (L&D 31 Okt 2026)" % (kam[kd]["Nama"], kam[baru]["Nama"])
            t["KodeKompetensi"] = baru; t["LevelAktivitas"] = str(m["RequiredLevel"]) if m else t.get("LevelAktivitas"); n_lek += 1
    seen, uniq = set(), []
    for t in task_rows:
        key = (t["KodeJabatan"], t["TugasUtama"], t["Task"], t["KodeKompetensi"])
        if key in seen: continue
        seen.add(key); uniq.append(t)
    task_rows[:] = uniq
    tugas_by_j = collections.defaultdict(list)
    for t in task_rows: tugas_by_j[t["KodeJabatan"]].append(t)
    lap["Aktivitas dipetakan ulang ke kompetensi yang sesuai isi tugas"] = n_lek
    # keputusan L&D 31 Okt: tiap sel tanpa tugas ditautkan ke aktivitas JD yang menuntutnya, atau dihapus bila JD tidak mendukung
    KP = _muat("keputusan")
    mat_by = {(m["KodeJabatan"], kam[m["KodeKompetensi"]]["Nama"]): m for m in matriks if m["KodeKompetensi"] in kam}
    hapus, n_taut = set(), 0
    for (j, nm), akt in KP.SEL.items():
        m = mat_by.get((j, nm))
        if not m: continue  # sudah tidak ada di matriks (mis. data berubah)
        kd = m["KodeKompetensi"]
        if any(t["KodeKompetensi"] == kd for t in tugas_by_j[j]): continue
        if akt is None:
            hapus.add((j, kd)); temuan.append(("Perubahan: kompetensi dihapus dari matriks", j, nm, "Level %s. Tidak ada tugas di JD yang menuntut kompetensi ini." % m["RequiredLevel"], "", "DITERAPKAN")); continue
        t0 = next((t for t in tugas_by_j[j] if akt.lower() in str(t["Task"]).lower()), None)
        assert t0, "aktivitas tidak ditemukan: %s %s %s" % (j, nm, akt)
        nt = dict(t0, KodeKompetensi=kd, LevelAktivitas=str(m["RequiredLevel"]), Sumber=t0["Sumber"] + ". Kompetensi " + nm + " dipetakan ke aktivitas ini oleh L&D (31 Okt 2026)")
        nt.pop("KompetensiAsli", None); nt.pop("KompetensiAlias", None)
        task_rows.append(nt); tugas_by_j[j].append(nt); n_taut += 1
        temuan.append(("Perubahan: kompetensi ditautkan ke aktivitas JD", j, nm, "Aktivitas: " + str(t0["Task"]), "", "DITERAPKAN"))
    matriks[:] = [m for m in matriks if (m["KodeJabatan"], m["KodeKompetensi"]) not in hapus]
    lap["Sel matriks ditautkan ke aktivitas JD (keputusan L&D)"] = n_taut
    lap["Sel matriks dihapus karena tidak didukung JD (keputusan L&D)"] = len(hapus)
    n_lin = 0
    for nm, teks in KP.LINTAS_LND.items():
        m = mat_by.get(("J015", nm))
        if not m or any(t["KodeKompetensi"] == m["KodeKompetensi"] for t in tugas_by_j["J015"]): continue
        contoh = next((t for t in task_rows if t["KodeKompetensi"] == m["KodeKompetensi"] and str(t["TugasUtama"]).startswith("Lintas")), {})
        no = max(int(t["NoTugas"] or 0) for t in tugas_by_j["J015"]) + (0 if any(str(t["TugasUtama"]).startswith("Lintas") for t in tugas_by_j["J015"]) else 1)
        kelas, X = _frasa(teks)
        nt = {"KodeJabatan": "J015", "NoTugas": no, "TugasUtama": "Lintas Tugas Utama – Penggunaan Tools & Teknologi", "Task": teks, "KodeKompetensi": m["KodeKompetensi"],
              "SubProses": "", "SubSubProses": "", "Pengetahuan": contoh.get("Pengetahuan", ""), "StandarKinerja": contoh.get("StandarKinerja", ""), "SubStandar": contoh.get("SubStandar", ""),
              "KSA": contoh.get("KSA", ""), "LevelAktivitas": str(m["RequiredLevel"]), "BuktiPenilaian": "Dokumen kerja yang dihasilkan dengan tools ini (file, laporan, materi); observasi langsung atasan",
              "Sumber": "Baris lintas tugas ditambahkan L&D 31 Okt 2026 mengikuti pola master Finance; pengetahuan, standar, dan KSA mengikuti baris Tools master Finance"}
        task_rows.append(nt); tugas_by_j["J015"].append(nt); n_lin += 1
    lap["Baris Lintas Tugas Tools ditambahkan ke master L&D"] = n_lin
    ada = {(t["KodeJabatan"], t["KodeKompetensi"]) for t in task_rows if t["KodeKompetensi"]}
    ditaut, ditandai = 0, 0
    for m in matriks:
        key = (m["KodeJabatan"], m["KodeKompetensi"]); k = kam.get(m["KodeKompetensi"], {})
        if key in ada and "TIDAK DIDUKUNG TASK" in str(m.get("Flag") or ""):
            m["Flag"] = "; ".join(f for f in str(m["Flag"]).split("; ") if f and f != "TIDAK DIDUKUNG TASK")
        if k.get("Kategori") != "Technical" or key in ada: continue
        mj = jab.get(m["KodeJabatan"], {}); master = str(mj.get("Versi")) == "MASTER"
        kt = _tok(k["Nama"]) | _tok(k.get("Definisi")) | set().union(*[_tok(k.get("L%d" % n)) for n in range(2, 6)])
        calon = {}
        for t in tugas_by_j.get(m["KodeJabatan"], []):
            if t.get("_lead") or ARAH.search(str(t["Task"])) or KEMBANG.search(str(t["Task"])): continue  # aktivitas memimpin tim bukan dasar kompetensi teknis
            s = len(_tok(t["Task"]) & kt)
            if s and (t["Task"] not in calon or s > calon[t["Task"]][0]): calon[t["Task"]] = (s, t)
        best = max(calon.values(), key=lambda x: x[0]) if calon else None
        if not master and best and best[0] >= 2:
            t0 = best[1]
            nt = dict(t0, KodeKompetensi=m["KodeKompetensi"], LevelAktivitas=str(m["RequiredLevel"]),
                      Sumber=t0["Sumber"] + ". Kompetensi " + k["Nama"] + " ditautkan ke aktivitas ini karena kesamaan kata (keterlacakan matriks, DRAFT_AI)")
            nt.pop("KompetensiAsli", None); nt.pop("KompetensiAlias", None)
            task_rows.append(nt); ada.add(key); ditaut += 1
            temuan.append(("Perubahan: kompetensi ditautkan ke aktivitas JD", m["KodeJabatan"], k["Nama"], "Aktivitas: " + str(t0["Task"]) + " (kemiripan kata)", "", "DITERAPKAN"))
            m["Flag"] = "; ".join(f for f in str(m.get("Flag") or "").split("; ") if f and f != "TIDAK DIDUKUNG TASK")
        else:
            fl = [f for f in str(m.get("Flag") or "").split("; ") if f]
            if "TIDAK DIDUKUNG TASK" not in fl: fl.append("TIDAK DIDUKUNG TASK")
            m["Flag"] = "; ".join(fl); ditandai += 1
            temuan.append(("Matriks: sel tanpa tugas", m["KodeJabatan"], k.get("Nama", m["KodeKompetensi"]),
                           "Level %s dipersyaratkan, tetapi tidak ada tugas di uraian jabatan yang membutuhkannya." % m["RequiredLevel"],
                           ("Tambahkan tugas pendukung di JD/master, atau hapus kompetensi ini dari matriks" + (". Kandidat aktivitas: " + best[1]["Task"][:120] if best else "")),
                           "MASTER: KEPUTUSAN PEMILIK" if master else "DRAFT: REVIEW DEPT HEAD"))
    # urutkan agar baris tautan berada di dekat tugasnya
    task_rows.sort(key=lambda t: (t["KodeJabatan"], int(t["NoTugas"] or 0)))
    lap["Sel matriks teknis ditautkan ke tugas JD"] = ditaut
    lap["Sel matriks teknis ditandai TIDAK DIDUKUNG TASK"] = ditandai

    # ---------- Ejaan baku (KBBI) untuk isi buatan Studio saja ----------
    ej = 0
    for k in kamus:  # ejaan baku untuk seluruh kamus (keputusan user 31 Okt: tampilan rapi), makna tidak berubah
        if True:
            for f in ("Definisi", "L1", "L2", "L3", "L4", "L5"):
                b = _ejaan(k[f]); ej += b != k[f]; k[f] = b
    draf = {k["KodeKompetensi"] for k in kamus}
    for c in cek:
        if c["KodeKompetensi"] in draf:
            for f in ("C2", "C3", "C4", "C5"):
                b = _ejaan(c[f]); ej += b != c[f]; c[f] = b
    for r in indikator:
        if r["KodeKompetensi"] in draf:
            for f in ("DefinisiLevel", "Indikator"):
                b = _ejaan(r[f]); ej += b != r[f]; r[f] = b
    for t in task_rows:
        bebas = ("StandarKinerja", "SubStandar", "BuktiPenilaian") if str(t.get("SubProses") or "").strip() else ("Pengetahuan", "StandarKinerja", "SubStandar", "KSA", "BuktiPenilaian")
        if t["KodeJabatan"] in JAB_LND: bebas = ("BuktiPenilaian",)
        for f in bebas:
            b = _ejaan(t.get(f)); ej += b != t.get(f); t[f] = b
    lap["Ejaan baku pada isi buatan Studio (analisa, resiko, aktifitas, ...)"] = ej
    sisa_ej = sum(1 for r in indikator if r["KodeKompetensi"] in draf for f in ("DefinisiLevel", "Indikator") if _ejaan(r[f]) != r[f])

    # ---------- Penulisan ulang KB tidak observable + istilah pajak terkini ----------
    RW = {_norm(a1): b1 for a1, b1 in KP.REWRITE.items()}
    n_rw = 0
    def rw_baris(teks, pemisah):
        nonlocal n_rw
        out = []
        for x in str(teks or "").split(pemisah):
            b1 = RW.get(_norm(x))
            if b1: n_rw += 1; out.append(b1 + ("." if x.strip().endswith(".") else ""))
            else: out.append(x)
        return pemisah.join(out)
    for r in indikator: r["Indikator"] = rw_baris(r["Indikator"], "\n")
    for c in cek:
        for f in ("C2", "C3", "C4", "C5"): c[f] = "; ".join(rw_baris(c[f], ";").split(";")).replace(";  ", "; ")
    lap["Key behavior ditulis ulang agar bisa diamati"] = n_rw
    PAJAK = [(r"sistem e-factur DJP Online \(Direktorat Jenderal Pajak\)", "sistem Coretax DJP (Direktorat Jenderal Pajak) atau e-Faktur desktop"),
             (r"(sistem )?e-Faktur DJP Online", "Coretax DJP / e-Faktur desktop"), (r"di approve menggunakan e-factur", "di-approve melalui Coretax DJP"),
             (r"approval via e-Faktur", "approval via Coretax DJP"), (r"approval e-Faktur", "approval di Coretax DJP"), (r"prosedur e-Faktur", "prosedur Coretax DJP"),
             (r"validasi di e-Faktur", "validasi di Coretax DJP"), (r"di e-Faktur\b", "di Coretax DJP"), (r"sistem e-Faktur", "Coretax DJP"), (r"Penggunaan e-Faktur", "Penggunaan Coretax DJP / e-Faktur desktop"),
             (r"faktur pajak elektronik \(e-Faktur\)", "faktur pajak elektronik (Coretax DJP / e-Faktur desktop)"), (r"\bMembuat e-Faktur\b", "Membuat faktur pajak elektronik"),
             (r"\bmengirimkan e-Faktur\b", "mengirimkan faktur pajak elektronik"), (r"e-factur", "Coretax DJP")]
    def pajak(x):
        if not isinstance(x, str): return x
        for a1, b1 in PAJAK: x = re.sub(a1, b1, x)
        return x
    n_pj = 0
    for coll, fields in ((task_rows, ("TugasUtama", "Task", "SubProses", "SubSubProses", "Pengetahuan", "StandarKinerja", "SubStandar", "KSA", "BuktiPenilaian")),
                         (kamus, ("Definisi", "L1", "L2", "L3", "L4", "L5")), (indikator, ("DefinisiLevel", "Indikator")), (cek, ("C2", "C3", "C4", "C5"))):
        for r in coll:
            if coll is kamus and r["KodeKompetensi"] not in {m["KodeKompetensi"] for m in matriks}: continue
            for f in fields:
                b1 = pajak(r.get(f)); n_pj += b1 != r.get(f); r[f] = b1
    lap["Istilah sistem pajak dimutakhirkan ke Coretax DJP"] = n_pj

    # ---------- E. QA ----------
    kamk = set(kam)
    q = collections.OrderedDict()
    q["Q1 Tugas menyebut kompetensi di luar kamus"] = sum(1 for t in task_rows if t["KodeKompetensi"] and t["KodeKompetensi"] not in kamk)
    q["Q2 Tugas tanpa kompetensi (jabatan tanpa kompetensi teknis)"] = sum(1 for t in task_rows if not t["KodeKompetensi"])
    tk = collections.defaultdict(set)
    for t in task_rows:
        if t["KodeKompetensi"] and str(t.get("LevelAktivitas") or "").strip(): tk[(t["KodeJabatan"], t["KodeKompetensi"])].add(int(t["LevelAktivitas"]))
    req = {(m["KodeJabatan"], m["KodeKompetensi"]): m for m in matriks}
    n_lv = 0
    for k, v in tk.items():  # aturan §5.2 (keputusan user 31 Okt: "atur aja"): level syarat = level aktivitas tertinggi
        if k in req and max(v) != int(req[k]["RequiredLevel"]):
            temuan.append(("Level diselaraskan", k[0], kam[k[1]]["Nama"], "Level matriks %s diubah menjadi %d (level aktivitas tertinggi)." % (req[k]["RequiredLevel"], max(v)), "", "DITERAPKAN"))
            req[k]["RequiredLevel"] = max(v); n_lv += 1
    lap["Level matriks diselaraskan dengan level aktivitas tertinggi"] = n_lv
    beda = [(k, v, int(req[k]["RequiredLevel"])) for k, v in tk.items() if k in req and max(v) != int(req[k]["RequiredLevel"])]
    for (j, kd), v, r in beda:
        temuan.append(("Level: tugas vs matriks", j, kam[kd]["Nama"], "Level aktivitas di uraian tugas %s, level matriks %d." % ("/".join(map(str, sorted(v))), r),
                       "Samakan: level matriks = level aktivitas tertinggi yang menuntut kompetensi ini", "MASTER: KEPUTUSAN PEMILIK" if str(jab[j].get("Versi")) == "MASTER" else "DRAFT: REVIEW DEPT HEAD"))
    q["Q3 Selisih level tugas vs matriks"] = len(beda)
    q["Q4 Sel matriks teknis tanpa tugas pendukung"] = ditandai
    kurang, tdk_obs, dup = [], [], []
    for kd in dipakai:
        kd = ganti(kd)
        for n in range(1, 6):
            r = ind.get(kd, {}).get(n)
            kbs = [x for x in str((r or {}).get("Indikator", "")).split("\n") if x.strip()]
            if not r or not str(r.get("DefinisiLevel") or "").strip() or len(kbs) < 2: kurang.append((kd, n))
            for x in kbs:
                if TIDAK_OBSERVABLE.match(x.strip()): tdk_obs.append((kd, n, x))
        semua = [_norm(x) for n in range(1, 6) for x in str(ind.get(kd, {}).get(n, {}).get("Indikator", "")).split("\n") if x.strip()]
        if len(semua) != len(set(semua)): dup.append(kd)
    q["Q5 Level tanpa definisi atau kurang dari 2 key behavior"] = len(kurang)
    q["Q6 Key behavior tidak observable (memahami/mengetahui...)"] = len(tdk_obs)
    q["Q7 Kompetensi dengan key behavior kembar antar level"] = len(dup)
    mirip = []
    for kd in {ganti(x) for x in dipakai}:
        for n in range(1, 6):
            kbs = [x for x in str(ind.get(kd, {}).get(n, {}).get("Indikator", "")).split("\n") if x.strip()]
            for i in range(len(kbs)):
                for j in range(i + 1, len(kbs)):
                    if _mirip(kbs[i], kbs[j]) >= 0.45: mirip.append((kd, n, kbs[i], kbs[j]))
    q["Q7b Pasangan key behavior terlalu mirip dalam satu level (>=45% kata sama)"] = len(mirip)
    for kd, n, a1, b1 in mirip:
        temuan.append(("Kamus: key behavior terlalu mirip", kd, kam[kd]["Nama"] + " L%d" % n, a1 + " || " + b1, "Bedakan dimensi perilaku (proses vs hasil vs mutu)",
                       "MASTER: KEPUTUSAN PEMILIK" if kam[kd]["Status"] == "MASTER" else ("FINAL: KEPUTUSAN L&D" if kam[kd]["Status"] == "FINAL" else "DRAFT")))
    for kd, n, x in tdk_obs:
        temuan.append(("Kamus: key behavior tidak observable", kd, kam[kd]["Nama"] + " L%d" % n, x,
                       "Ganti kata kerja dengan yang bisa diamati (menjelaskan, menyebutkan, menunjukkan, menggunakan)",
                       "MASTER: KEPUTUSAN PEMILIK" if kam[kd]["Status"] == "MASTER" else ("FINAL: KEPUTUSAN L&D" if kam[kd]["Status"] == "FINAL" else "DRAFT")))
    for kd in dup: temuan.append(("Kamus: key behavior kembar", kd, kam[kd]["Nama"], "Ada key behavior yang sama persis di dua level.", "Bedakan perilaku per level", "PERIKSA"))
    q["Q8 Jabatan tanpa uraian tugas (JD belum ada)"] = sum(1 for j in master_jab if not tugas_by_j.get(j["KodeJabatan"]))
    for j in master_jab:
        if not tugas_by_j.get(j["KodeJabatan"]):
            temuan.append(("Jabatan tanpa uraian tugas", j["KodeJabatan"], j["JobTitle"], "JD belum tersedia sehingga tugas, standar kinerja, dan bukti tidak bisa disusun.", "Kirim JD resmi ke L&D", "DATA DIBUTUHKAN"))
    istilah = [t for t in task_rows if re.search(r"e-?fa[kc]tur", str(t["Task"]) + str(t.get("KSA")), re.I) and "Coretax" not in str(t["Task"]) + str(t.get("KSA"))]
    kj_ist = sorted({t["KodeJabatan"] for t in istilah})
    for j in kj_ist:
        temuan.append(("Istilah perlu dimutakhirkan", j, jab[j]["JobTitle"], "Uraian tugas menyebut e-Faktur. Sejak 1 Jan 2025 administrasi pajak berjalan di Coretax DJP (PMK 81/2024); SPT Masa PPN, retur, dan pembatalan faktur wajib lewat Coretax.",
                       "Perbarui teks JD/master menjadi 'Coretax DJP (dan e-Faktur desktop bila masih dipakai)'", "PERIKSA PEMILIK JD"))
    q["Q9 Jabatan dengan istilah sistem pajak lama (e-Faktur)"] = len(kj_ist)
    q["Q10 Ejaan tidak baku tersisa di kamus buatan Studio"] = sisa_ej
    return lap, q, temuan
