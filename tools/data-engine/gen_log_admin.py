"""Catatan perubahan & QA khusus admin/L&D (tampilan user tetap bersih). Hanya data jabatan, tanpa data karyawan."""
import json, re, collections, openpyxl, importlib.util
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

q = json.load(open("qa_standar.json"))
wb_in = openpyxl.load_workbook("TNA2027_Import.xlsx", read_only=True)
def T(n):
    r = list(wb_in[n].iter_rows(values_only=True)); return [dict(zip(r[0], x)) for x in r[1:]]
J = {j["KodeJabatan"]: j for j in T("MasterJabatan")}; K = {k["KodeKompetensi"]: k for k in T("Kamus")}
sp = importlib.util.spec_from_file_location("kp", "std/keputusan.py"); KP = importlib.util.module_from_spec(sp); sp.loader.exec_module(KP)

NAVY = "1F4E79"; thin = Side(style="thin", color="BFBFBF"); BD = Border(left=thin, right=thin, top=thin, bottom=thin)
wb = openpyxl.Workbook(); wb.remove(wb.active)
def sheet(nama, judul, sub, header, lebar):
    ws = wb.create_sheet(nama); ws.append([judul]); ws.append([sub]); ws.append(header)
    ws["A1"].font = Font(b=True, sz=13, color="FFFFFF", name="Arial"); ws["A1"].fill = PatternFill("solid", fgColor=NAVY); ws["A2"].font = Font(i=True, sz=9, color="595959", name="Arial")
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=len(header)); ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=len(header))
    for i, w in enumerate(lebar, 1):
        c = ws.cell(row=3, column=i); c.font = Font(b=True, color="FFFFFF", sz=10, name="Arial"); c.fill = PatternFill("solid", fgColor=NAVY); c.alignment = Alignment(wrap_text=True, vertical="center"); c.border = BD
        ws.column_dimensions[openpyxl.utils.get_column_letter(i)].width = w
    ws.freeze_panes = "A4"; return ws
def baris(ws, row):
    ws.append(row)
    for i in range(1, len(row) + 1):
        c = ws.cell(row=ws.max_row, column=i); c.alignment = Alignment(wrap_text=True, vertical="top"); c.border = BD; c.font = Font(sz=9, name="Arial")
jt = lambda j: J[j]["JobTitle"].title() if j in J else j

ws = sheet("1. Ringkasan", "CATATAN PERUBAHAN & QA STANDAR KOMPETENSI | 31 Okt 2026", "Khusus admin dan tim L&D. Pengguna lain tidak melihat catatan ini di aplikasi maupun di dokumen jabatan.", ["Bagian", "Hasil", "Keterangan"], [52, 10, 70])
for k, v in q["qa"].items(): baris(ws, ["QA " + k, v, "Target 0" + (" (17 baris tugas Direksi yang memang tanpa kompetensi teknis)" if k.startswith("Q2") else "")])
for k, v in q["lap"].items(): baris(ws, [k, v if not isinstance(v, str) else "", v if isinstance(v, str) else ""])

ws = sheet("2. Perubahan Matriks", "PERUBAHAN MATRIKS JABATAN", "Aturan: setiap kompetensi di matriks harus didukung minimal satu tugas JD; level syarat = level aktivitas tertinggi.", ["No", "Kode", "Jabatan", "Kompetensi", "Perubahan", "Rincian"], [5, 8, 34, 32, 30, 70])
i = 0
for t in sorted([t for t in q["temuan"] if t[0].startswith("Perubahan") or t[0] == "Level diselaraskan"], key=lambda t: (t[1], t[0])):
    i += 1; baris(ws, [i, t[1], jt(t[1]), t[2], t[0].replace("Perubahan: ", ""), t[3]])

ws = sheet("3. Pemetaan Aktivitas", "AKTIVITAS YANG DIPETAKAN ULANG", "Aktivitas yang sebelumnya terpetakan ke kompetensi tanpa kaitan isi (mis. aktivitas memimpin tim ke kompetensi teknis) dipindah ke kompetensi yang sesuai.", ["No", "Kode", "Jabatan", "Aktivitas", "Kompetensi sekarang", "Keterangan"], [5, 8, 30, 50, 30, 60])
i = 0
for t in T("Task"):
    s = str(t.get("Sumber") or "")
    m = re.search(r"(Kompetensi dipindah dari [^.]*|Aktivitas memimpin tim dipetakan ke kompetensi kepemimpinan)", s)
    if m: i += 1; baris(ws, [i, t["KodeJabatan"], jt(t["KodeJabatan"]), t["Task"], K[t["KodeKompetensi"]]["Nama"], m.group(1)])

ws = sheet("4. Penulisan Ulang KB", "KEY BEHAVIOR YANG DITULIS ULANG", "Kalimat diawali 'mengetahui/memahami' tidak bisa diamati atasan, sehingga diganti kata kerja tindakan (pola BARS).", ["No", "Sebelum", "Sesudah"], [5, 70, 70])
for i, (a, b) in enumerate(KP.REWRITE.items(), 1): baris(ws, [i, a, b])

ws = sheet("5. JD Disusun L&D", "JABATAN DENGAN JD DISUSUN L&D", "Dokumen lengkap: JD_5_Jabatan_Disusun_LD_v1.docx. Perlu pengesahan atasan langsung dan HC & GA Division Head.", ["Kode", "Jabatan", "Jumlah karyawan", "Acuan"], [8, 40, 14, 70])
for kj in ("J019", "J023", "J060", "J061", "J062"):
    baris(ws, [kj, jt(kj), J[kj]["JmlIncumbent"], {"J019": "O*NET 43-6011.00", "J023": "O*NET 13-1151.00", "J060": "O*NET 11-3021.00, ITIL 4", "J061": "O*NET 15-1244.00, ITIL 4", "J062": "O*NET 15-1232.00, ITIL 4"}[kj]])

ws = sheet("6. Catatan Lain", "CATATAN LAIN UNTUK L&D", "", ["Topik", "Catatan"], [30, 100])
baris(ws, ["JD acuan terdekat", "8 jabatan memakai JD jabatan terdekat (mis. Sales Supervisor, Secretary Chief Executive). Isinya sudah lolos QA standar; minta JD resmi saat revisi JD berikutnya."])
baris(ws, ["Istilah pajak", "Uraian tugas dan kamus pajak dimutakhirkan ke Coretax DJP (PMK 81/2024). e-Faktur desktop disebut sebagai alternatif pembuatan faktur (KEP-54/PJ/2025)."])
baris(ws, ["Tools & Technology", "Set Tools Finance dan L&D digabung menjadi TC-TL-01..07 (satu definisi untuk seluruh BBM)."])
baris(ws, ["Asal setiap isi", "Kolom Sumber di tab Task (Sheet) mencatat asal setiap baris: JD verbatim, master, atau susunan L&D. Tidak dicetak di dokumen jabatan."])
for w in wb.worksheets: w.sheet_view.zoomScale = 90
wb.save("Catatan_Perubahan_QA_Admin_v1.xlsx"); print("ok", {w.title: w.max_row - 3 for w in wb.worksheets})
