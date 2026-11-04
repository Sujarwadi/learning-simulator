"""Generator silabus modul yang belum punya silabus.
Isi konten tiap modul ditulis manual di sil_*.py (DATA). Bagian yang harus konsisten dengan data BBM
(judul, durasi katalog, level target, definisi/level Kamus, sasaran dari Matriks) ditarik otomatis
dari import_real.json supaya tidak ada angka karangan. Keluaran: silabus/b13_*.json dst.
Pakai:  python3 -I gen_silabus.py   (jalankan dari folder scratchpad)"""
import json, re, importlib, collections, sys, os

LV = ["", "Awareness", "Basic", "Intermediate", "Advanced", "Expert"]
d = json.load(open("import_real.json"))
tab = lambda t: [dict(zip(d[t][0], r)) for r in d[t][1:]]
KAT = {r["KodeTraining"]: r for r in tab("Katalog")}
KAM = {r["KodeKompetensi"]: r for r in tab("Kamus")}
MJ = {r["KodeJabatan"]: r for r in tab("MasterJabatan")}
MAT = collections.defaultdict(list)
for r in tab("Matriks"): MAT[r["KodeKompetensi"]].append(r)
SILABUS_ADA = {r["KodeTraining"] for r in tab("Silabus")}
for f in os.listdir("silabus"):
    if f.startswith("b") and f.endswith(".json") and not f.startswith(("b13", "b14", "b15", "b16", "b17", "b18")):
        for x in json.load(open("silabus/" + f)):
            if "Kode" in x: SILABUS_ADA.add(x["Kode"])

def sasaran_auto(kode_komp):
    ks = [k for k in re.split(r"[,\s]+", kode_komp or "") if k]
    jab = {}
    for k in ks:
        for m in MAT.get(k, []):
            j = MJ.get(m["KodeJabatan"])
            if j: jab[m["KodeJabatan"]] = j
    if not jab: return "Karyawan yang direkomendasikan atasan atau L&D"
    urut = sorted(jab.values(), key=lambda j: -(float(j["JmlIncumbent"] or 0)))
    nama = [j["JobTitle"].title() for j in urut[:4]]
    sisa = len(urut) - len(nama)
    return "Karyawan pada jabatan yang mensyaratkan kompetensi ini, antara lain " + ", ".join(nama) + (f", dan {sisa} jabatan lain" if sisa > 0 else "")

def durasi_auto(kat):
    j = kat.get("DurasiJam")
    return (f"{int(j) if float(j) == int(float(j)) else j} jam" if j not in ("", None) else "4 jam")

def eval_auto(kat, metode):
    online = str(kat.get("Metode")) == "ONLINE"
    if online:
        return "Kuis akhir (lulus 80 atau lebih); tugas aplikasi singkat di tempat kerja, ditinjau atasan dalam 30 hari"
    return ("Pre-test dan post-test (lulus 80 atau lebih; kenaikan skor dicatat); praktik atau studi kasus dinilai fasilitator; "
            "tugas aplikasi di tempat kerja ditinjau atasan dalam 30 sampai 60 hari")

def capaian(kat):
    """Kembalikan (untuk_tujuan, untuk_evaluasi)."""
    lv = kat.get("LevelTarget")
    ks = [k for k in re.split(r"[,\s]+", str(kat.get("KodeKompetensi") or "")) if k]
    if lv in ("", None) or not ks: return "", ""
    k = KAM.get(ks[0])
    if not k: return "", ""
    if int(lv) >= 5:   # katalog menandai modul sebagai penutup gap sampai level mana pun; satu modul tidak menjamin level 5
        return "", f"Naiknya level pada {k['Nama']} dibuktikan lewat penerapan di pekerjaan dan penilaian ulang, bukan hanya kehadiran"
    return f" Capaian yang dituju: Level {int(lv)} ({LV[int(lv)]}): {k['L'+str(int(lv))]}.", ""

def bangun(modul_nama, berkas):
    mod = importlib.import_module(modul_nama)
    out, seen = [], set()
    for t in mod.DATA:
        kode, rumpun, tujuan, outline, metode, rujukan = t[:6]
        opt = t[6] if len(t) > 6 else {}
        kat = KAT.get(kode, {})
        assert kode in KAT or opt.get("rumpun_baru"), "kode tidak ada di katalog: " + kode
        assert kode not in seen, "ganda: " + kode; seen.add(kode)
        assert len(rujukan) >= 2, "rujukan kurang: " + kode
        assert 4 <= len(outline) <= 9, f"outline {kode}: {len(outline)} baris"
        kk = kat.get("KodeKompetensi", opt.get("kompetensi", ""))
        cap_t, cap_e = capaian(kat) if kat else ("", "")
        ol = list(outline)
        ev = opt.get("evaluasi") or (eval_auto(kat, metode) if kat else "")
        if cap_e: ev = ev + "; " + cap_e[0].lower() + cap_e[1:]
        out.append({
            "Kode": kode, "Judul": opt.get("judul") or kat.get("Judul", ""), "Rumpun": rumpun, "KodeKompetensi": kk,
            "Sasaran": opt.get("sasaran") or sasaran_auto(kk) if kat else opt.get("sasaran", ""),
            "Tujuan": tujuan + cap_t, "Outline": "\n".join(ol), "Metode": metode,
            "Durasi": opt.get("durasi") or (durasi_auto(kat) if kat else ""),
            "Evaluasi": ev,
            "Sumber": "RUJUKAN: " + " | ".join(rujukan), "Status": "DRAF_AI"})
    json.dump(out, open("silabus/" + berkas, "w"), ensure_ascii=False, indent=1)
    print(berkas, len(out))
    return out

if __name__ == "__main__":
    sys.path.insert(0, ".")
    todo = [("sil_a", "b13_program_perilaku.json"), ("sil_b", "b14_pimpinan_pengayaan.json"),
            ("sil_c", "b15_teknis_1.json"), ("sil_d", "b16_teknis_2.json"), ("sil_e", "b17_teknis_3.json"), ("sil_f", "b18_teknis_4.json"), ("sil_g", "b19_modul_baru_2027.json")]
    semua = []
    for m, b in todo:
        if os.path.exists(m + ".py"): semua += bangun(m, b)
    # cakupan: katalog tanpa silabus
    ada = SILABUS_ADA | {x["Kode"] for x in semua}
    def tercakup(k): return k in ada or (re.match(r"^W-CB\d\d-L\d$", k) and k[:6] in ada)
    kurang = [k for k in KAT if not tercakup(k)]
    print("modul baru:", len(semua), "| katalog masih tanpa silabus:", len(kurang), kurang[:10])
