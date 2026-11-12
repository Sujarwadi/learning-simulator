"""Uji plan_ke_app.py dengan data SINTETIS. Pakai: python3 test_plan_ke_app.py"""
import json, os, tempfile, openpyxl
from plan_ke_app import bangun

d = tempfile.mkdtemp()
wb = openpyxl.Workbook(); wb.remove(wb.active)
def sheet(n, h, rows):
    ws = wb.create_sheet(n); ws.append(h); [ws.append(r) for r in rows]
sheet("Karyawan", ["NIK", "Nama"], [["1001", "A"], ["1002", "B"], ["1003", "C"]])
sheet("Katalog", ["KodeTraining", "Judul", "Kategori", "KodeKompetensi", "LevelTarget", "Metode", "DurasiJam", "SumberFile", "Link", "Status", "SasaranJabatan"], [["W-AFA", "Anti Fraud", "Wajib", "", "", "ONLINE", 2, "", "", "AKTIF", ""]])
sheet("Kamus", ["KodeKompetensi", "Nama"], [["CB02", "Communication"]])
sheet("Matriks", ["KodeJabatan", "KodeKompetensi", "RequiredLevel", "Bobot", "Sumber", "Flag"], [["J1", "CB02", 2, 3, "JD", ""], ["J1", "TK-1", 3, 1, "JD", ""]])
p = os.path.join(d, "paket.xlsx"); wb.save(p)
kelas = {"kelas": [
    {"id": "K1", "kode": "W-AFA", "mode": "Offline HO", "bulan": 1, "tgl": ["2027-01-12"], "jam": 2, "ps": [["1001"], ["1002"], ["-"], ["9999"]]},
    {"id": "K2", "kode": "PLN-X", "mode": "Online", "bulan": 3, "tgl": ["2027-03-09", "2027-03-10"], "jam": 6, "ps": [["1001"], ["1003"]]},
    {"id": "K3", "kode": "VEN-Y", "mode": "Offline Jakarta", "bulan": 6, "tgl": [], "jam": 16, "ps": [["1003"]]}], "tunda": [["1001"]]}
baris = [{"NIK": "1001", "Kode": "PLN-X", "Judul": "Program X", "Asal": "Gap kompetensi", "Kompetensi": "CB02"},
         {"NIK": "1003", "Kode": "PLN-X", "Judul": "Program X", "Asal": "Rework 10: blueprint Sales Academy / Learning Path (keputusan user 8 Nov 2026)", "Kompetensi": ""},
         {"NIK": "1001", "Kode": "W-AFA", "Judul": "Anti Fraud", "Asal": "Wajib korporat: PK for Non-Sales (keputusan user 8 Nov 2026)", "Kompetensi": ""},
         {"NIK": "1003", "Kode": "VEN-Y", "Judul": "Vendor Y", "Asal": "Wajib (program/jabatan)", "Kompetensi": ""}]
h = bangun(kelas, baris, p, [{"KodeJabatan": "J1", "KodeKompetensi": "CB02", "RequiredLevel": 3}, {"KodeJabatan": "J1", "KodeKompetensi": "TK-9", "RequiredLevel": 2}, {"KodeJabatan": "J1", "KodeKompetensi": "TK-1", "RequiredLevel": 3}])
assert h["ringkas"] == {"itp": 5, "batch": 3, "jam": 2 * 2 + 6 * 2 + 16}, h["ringkas"]
assert h["laporan"]["kursiPlaceholder"] == 1 and h["laporan"]["nikTidakDiMaster"] == 1 and h["laporan"]["programDitunda"] == 1
itp = [dict(zip(h["PlanITP"]["kolom"], r)) for r in h["PlanITP"]["rows"]]
gap = [r for r in itp if r["NIK"] == "1001" and r["KodeTraining"] == "PLN-X"][0]
assert gap["Kategori"] == "WajibGap" and gap["KodeKompetensi"] == "CB02" and gap["Alasan"] == "Mengembangkan kompetensi Communication"
assert all("keputusan" not in r["Alasan"].lower() and "rework" not in r["Alasan"].lower() for r in itp), "catatan internal bocor"
assert [r for r in itp if r["NIK"] == "1003" and r["KodeTraining"] == "PLN-X"][0]["Alasan"] == "Jalur pengembangan (learning path) untuk jabatan Anda"
b = {x[0]: dict(zip(h["PlanBatch"]["kolom"], x)) for x in h["PlanBatch"]["rows"]}
assert b["K1"]["JmlPeserta"] == 2 and b["K1"]["TotalJam"] == 4 and b["K1"]["Lokasi"] == "HO" and b["K1"]["Bulan"] == "Jan"
assert b["K2"]["TanggalSelesai"] == "2027-03-10" and b["K3"]["TanggalMulai"] == "" and b["K3"]["Catatan"]
kat = [dict(zip(h["Katalog"]["kolom"], r)) for r in h["Katalog"]["rows"]]
assert sorted(x["KodeTraining"] for x in kat) == ["PLN-X", "VEN-Y"] and all(x["Status"] == "USULAN_PENGADAAN" for x in kat)
mat = {(r[0], r[1]): r for r in h["Matriks"]["rows"]}
assert mat[("J1", "CB02")][2] == 3 and mat[("J1", "CB02")][3] == 3, "bobot lama dipertahankan"
assert mat[("J1", "TK-9")][3] == 2 and ("J1", "TK-1") not in mat, "koreksi yang sama dengan nilai lama dilewati"
assert len(h["laporan"]["koreksiMatriks"]) == 2
h2 = bangun(kelas, baris, p, None, hapus=["TK-1"])
assert h2["Hapus"]["rows"] == [["TK-1"]] and h2["laporan"]["selMatriksDibuang"] == 1 and h2["laporan"]["kompetensiDibuang"] == ["TK-1"]
for salah in (dict(koreksi=[{"KodeJabatan": "J1", "KodeKompetensi": "TK-1", "RequiredLevel": 4}], hapus=["TK-1"]), dict(koreksi=None, hapus=["CB02"])):
    try: bangun(kelas, baris, p, **salah); raise SystemExit("seharusnya ditolak: " + str(salah))
    except AssertionError: pass
print("UJI PLAN_KE_APP LULUS")
