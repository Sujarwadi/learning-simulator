#!/usr/bin/env python3
"""Mengubah Training Plan 2027 (hasil kerja L&D di luar aplikasi) menjadi paket JSON yang diunggah admin
lewat Panel Admin > "Impor Training Plan" (TNA Engine v4.2, tnaImporPlan).

MASUKAN (semua di luar repo; berisi data karyawan, jangan di-commit):
  --kelas   kelas JSON: {"kelas":[{id,kode,jenis,mode,bulan,tgl:[yyyy-mm-dd],jam,ps:[[NIK,...],...]}], "tunda":[...]}
  --baris   baris per orang x program (NIK, Kode, Judul, Asal, Kompetensi, ...), dipakai untuk judul, kategori, kompetensi, alasan
  --paket   TNA2027_Import.xlsx (hasil build_import.py): Karyawan, Katalog, Kamus, Matriks
  --judul-xlsx (opsional) Training_Plan_Kalender_Budget_*.xlsx: sumber judul program yang tidak ada di --baris (mis. modul ATPM mekanik), dari sheet "Peserta per Kelas"
  --matriks-koreksi (opsional) JSON [{KodeJabatan,KodeKompetensi,RequiredLevel,Bobot?}] koreksi sel matriks oleh L&D
KELUARAN: satu JSON (PlanITP, PlanBatch, Katalog, Matriks, ringkas, laporan). Rekonsiliasi jam dicek di sini dan di backend.

Aturan: kursi tanpa NIK sungguhan (placeholder seperti "-") tidak diimpor; IHT dan BST tidak ada di Plan (disusun mesin aplikasi).
"""
import argparse, json, re, sys, collections, datetime
import openpyxl

BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
LOKASI = {"Online": "ONLINE", "Offline HO": "HO", "Offline Makassar": "MAKASSAR", "Offline Jakarta": "JAKARTA"}
KOLOM_ITP = ["NIK", "KodeTraining", "Judul", "Kategori", "KodeKompetensi", "Bulan", "BatchID", "Jam", "Status", "Alasan"]
KOLOM_BATCH = ["BatchID", "KodeTraining", "Judul", "Kategori", "Metode", "Bulan", "Minggu", "TanggalMulai", "TanggalSelesai", "Lokasi",
               "JmlPeserta", "PesertaProyeksi", "DurasiJam", "TotalJam", "Catatan"]
KOLOM_KATALOG = ["KodeTraining", "Judul", "Kategori", "KodeKompetensi", "LevelTarget", "Metode", "DurasiJam", "SumberFile", "Link", "Status", "SasaranJabatan"]
KOLOM_MATRIKS = ["KodeJabatan", "KodeKompetensi", "RequiredLevel", "Bobot", "Sumber", "Flag"]


def alasan_dan_kategori(asal, komp_nama):
    """Alasan yang ramah karyawan; catatan proses internal (nomor rework, 'keputusan user') tidak pernah ikut."""
    a = (asal or "").lower()
    if a.startswith("gap kompetensi"):
        return "WajibGap", "Mengembangkan kompetensi " + komp_nama if komp_nama else "Mengembangkan kompetensi jabatan Anda"
    if a.startswith("wajib korporat"):
        return "Wajib", "Program wajib korporat"
    if a.startswith("wajib"):
        return "Wajib", "Program wajib untuk jabatan Anda"
    if "sales academy" in a or "learning path" in a:
        return "Wajib", "Jalur pengembangan (learning path) untuk jabatan Anda"
    if "penerapan" in a:
        return "Wajib", "Review penerapan setelah training teknikal"
    return "Wajib", "Program prioritas 2027 untuk jabatan Anda"


def baca(ws):
    rows = list(ws.iter_rows(values_only=True))
    h = [str(x) for x in rows[0]]
    return [dict(zip(h, r)) for r in rows[1:] if any(v not in (None, "") for v in r)]


def judul_dari_plan(xlsx):
    wb = openpyxl.load_workbook(xlsx, read_only=True, data_only=True); out = {}
    for ws in wb:
        if "Peserta per Kelas" not in ws.title: continue
        kolom = None
        for r in ws.iter_rows(values_only=True):
            if kolom is None:
                if r and "KODE" in r and "TRAINING" in r: kolom = (r.index("KODE"), r.index("TRAINING"))
                continue
            if r[kolom[0]] and r[kolom[1]]: out.setdefault(str(r[kolom[0]]), str(r[kolom[1]]))
    return out


def bangun(kelas_json, baris, paket_xlsx, koreksi=None, versi="Plan", judul_plan=None):
    wb = openpyxl.load_workbook(paket_xlsx, read_only=True, data_only=True)
    karyawan = {str(r["NIK"]) for r in baca(wb["Karyawan"])}
    katalog = {str(r["KodeTraining"]): r for r in baca(wb["Katalog"])}
    kamus = {str(r["KodeKompetensi"]): r["Nama"] for r in baca(wb["Kamus"])}
    matriks = {(str(r["KodeJabatan"]), str(r["KodeKompetensi"])): r for r in baca(wb["Matriks"])}
    info = {(str(b["NIK"]), str(b["Kode"])): b for b in baris}
    judul = {}
    for b in baris: judul.setdefault(str(b["Kode"]), b["Judul"])
    for kd, jd in (judul_plan or {}).items(): judul.setdefault(kd, jd)

    itp, batch, jam_total = [], [], 0.0
    placeholder = tidak_di_master = 0
    kompetensi_kode = collections.defaultdict(collections.Counter)
    kategori_kode = collections.defaultdict(collections.Counter)
    ids = set()
    for k in kelas_json["kelas"]:
        assert k["id"] not in ids, "ID kelas ganda: " + k["id"]
        ids.add(k["id"])
        kode, tgl, jam = str(k["kode"]), sorted(k.get("tgl") or []), float(k["jam"])
        bln = int(tgl[0][5:7]) if tgl else int(k["bulan"])
        peserta = []
        for p in k["ps"]:
            nik = str(p[0])
            if not re.fullmatch(r"[A-Za-z0-9]{3,}", nik):
                placeholder += 1; continue
            if nik not in karyawan:
                tidak_di_master += 1; continue
            peserta.append(nik)
        for nik in peserta:
            b = info.get((nik, kode)) or {}
            komp = str(b.get("Kompetensi") or "")
            kat, alasan = alasan_dan_kategori(b.get("Asal"), kamus.get(komp, ""))
            if kat == "WajibGap" and not komp: kat = "Wajib"
            itp.append(dict(NIK=nik, KodeTraining=kode, Judul=b.get("Judul") or judul.get(kode, kode), Kategori=kat, KodeKompetensi=komp if kat == "WajibGap" else "",
                            Bulan=BULAN[bln - 1], BatchID=k["id"], Jam=jam, Status="PLANNED", Alasan=alasan))
            if komp: kompetensi_kode[kode][komp] += 1
            kategori_kode[kode][kat] += 1
            jam_total += jam
        if not peserta: continue
        dominan = kategori_kode_batch = collections.Counter(i["Kategori"] for i in itp if i["BatchID"] == k["id"]).most_common(1)[0][0]
        batch.append(dict(BatchID=k["id"], KodeTraining=kode, Judul=judul.get(kode, kode), Kategori=dominan, Metode="ONLINE" if k["mode"] == "Online" else "KLASIKAL",
                          Bulan=BULAN[bln - 1], Minggu=((int(tgl[0][8:10]) - 1) // 7 + 1) if tgl else 1, TanggalMulai=tgl[0] if tgl else "", TanggalSelesai=tgl[-1] if len(tgl) > 1 else "",
                          Lokasi=LOKASI.get(k["mode"], "ONLINE"), JmlPeserta=len(peserta), PesertaProyeksi=0, DurasiJam=jam, TotalJam=jam * len(peserta),
                          Catatan="" if tgl else "Jadwal mengikuti penyelenggara"))
    # Katalog: hanya kode yang belum ada; semua berstatus USULAN_PENGADAAN sampai materinya siap
    baru = []
    for kode in sorted({b["KodeTraining"] for b in batch} - set(katalog)):
        kat = "Wajib" if kategori_kode[kode].get("Wajib", 0) >= kategori_kode[kode].get("WajibGap", 0) else "Dianjurkan"
        komp = ",".join(sorted(kompetensi_kode[kode])) if kat == "Dianjurkan" else ""
        b0 = next(b for b in batch if b["KodeTraining"] == kode)
        baru.append(dict(KodeTraining=kode, Judul=b0["Judul"], Kategori=kat, KodeKompetensi=komp, LevelTarget="", Metode=b0["Metode"], DurasiJam=b0["DurasiJam"],
                         SumberFile="Training Plan 2027", Link="", Status="USULAN_PENGADAAN", SasaranJabatan=""))
    # Matriks: koreksi sel oleh L&D
    mat, lapor_mat = [], []
    for c in koreksi or []:
        j, kk, lv = str(c["KodeJabatan"]), str(c["KodeKompetensi"]), int(c["RequiredLevel"])
        lama = matriks.get((j, kk))
        if lama is not None and int(lama["RequiredLevel"]) == lv: continue
        bobot = c.get("Bobot") or (lama["Bobot"] if lama is not None else None)
        if bobot is None:
            bs = [r["Bobot"] for (jj, _), r in matriks.items() if jj == j and r["Bobot"]]
            bobot = round(sum(bs) / len(bs)) if bs else 2
        mat.append(dict(KodeJabatan=j, KodeKompetensi=kk, RequiredLevel=lv, Bobot=bobot, Sumber="KOREKSI_LD_12NOV2026", Flag="KOREKSI_LD"))
        lapor_mat.append("%s %s: %s" % (j, kk, ("level %s -> %s" % (lama["RequiredLevel"], lv)) if lama is not None else "sel baru level %s" % lv))
    jam_batch = sum(b["TotalJam"] for b in batch)
    assert abs(jam_total - jam_batch) < 0.01, ("Rekonsiliasi jam Plan gagal", jam_total, jam_batch)
    per_bulan = collections.Counter()
    for r in itp: per_bulan[r["Bulan"]] += r["Jam"]
    def tabel(kolom, rows): return {"kolom": kolom, "rows": [[r[k] for k in kolom] for r in rows]}
    return {
        "versi": versi, "dibuat": datetime.date.today().isoformat(),
        "PlanITP": tabel(KOLOM_ITP, itp), "PlanBatch": tabel(KOLOM_BATCH, batch), "Katalog": tabel(KOLOM_KATALOG, baru), "Matriks": tabel(KOLOM_MATRIKS, mat),
        "ringkas": {"itp": len(itp), "batch": len(batch), "jam": round(jam_total, 2)},
        "laporan": {"kursiPlaceholder": placeholder, "nikTidakDiMaster": tidak_di_master, "programBaruKatalog": len(baru), "koreksiMatriks": lapor_mat,
                    "jamPerBulan": {b: round(per_bulan[b], 1) for b in BULAN}, "programDitunda": len(kelas_json.get("tunda", [])), "tanpaJudul": sorted({b["KodeTraining"] for b in batch if b["Judul"] == b["KodeTraining"]})},
    }


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--kelas", required=True); ap.add_argument("--baris", required=True); ap.add_argument("--paket", required=True)
    ap.add_argument("--matriks-koreksi"); ap.add_argument("--judul-xlsx"); ap.add_argument("--versi", default="Training Plan 2027"); ap.add_argument("--out", required=True)
    a = ap.parse_args()
    hasil = bangun(json.load(open(a.kelas, encoding="utf-8")), json.load(open(a.baris, encoding="utf-8")), a.paket,
                   json.load(open(a.matriks_koreksi, encoding="utf-8")) if a.matriks_koreksi else None, a.versi,
                   judul_dari_plan(a.judul_xlsx) if a.judul_xlsx else None)
    json.dump(hasil, open(a.out, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    L = hasil["laporan"]
    print("Program tanpa judul (judul = kode): %s" % (", ".join(L["tanpaJudul"]) or "tidak ada"))
    print("ITP %d baris, batch %d, jam %.1f; program baru Katalog %d; koreksi matriks %d; kursi placeholder %d; NIK di luar master %d; program ditunda (tidak diimpor) %d"
          % (hasil["ringkas"]["itp"], hasil["ringkas"]["batch"], hasil["ringkas"]["jam"], L["programBaruKatalog"], len(L["koreksiMatriks"]), L["kursiPlaceholder"], L["nikTidakDiMaster"], L["programDitunda"]))

if __name__ == "__main__":
    main()
