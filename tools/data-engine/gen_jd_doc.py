"""Dokumen JD resmi (Word) untuk 5 jabatan yang JD-nya disusun L&D 31 Okt 2026. Isi tugas sama dengan sistem (jd_disusun_ld.py);
standar kinerja, bukti, dan kompetensi diambil dari paket import yang sudah lolos QA. Tidak ada data karyawan (hanya jabatan)."""
import openpyxl, collections
from docx import Document
from docx.shared import Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

X = {}
exec(open("jd_disusun_ld.py").read())
wb = openpyxl.load_workbook("TNA2027_Import.xlsx", read_only=True)
def T(n):
    r = list(wb[n].iter_rows(values_only=True)); return [dict(zip(r[0], x)) for x in r[1:]]
MJ = {j["KodeJabatan"]: j for j in T("MasterJabatan")}
KAM = {k["KodeKompetensi"]: k for k in T("Kamus")}
MAT = collections.defaultdict(list)
for m in T("Matriks"): MAT[m["KodeJabatan"]].append(m)
TASK = collections.defaultdict(list)
for t in T("Task"): TASK[t["KodeJabatan"]].append(t)
LV = ["", "Awareness", "Basic", "Intermediate", "Advanced", "Expert"]

INFO = {
 "J019": dict(tujuan="Memastikan waktu, agenda, korespondensi, dan administrasi pimpinan tertata sehingga pimpinan dapat fokus pada keputusan dan prioritas bisnis.",
   wewenang=["Mengatur dan mengubah jadwal pimpinan sesuai prioritas yang disepakati", "Menyaring tamu, telepon, dan korespondensi yang ditujukan kepada pimpinan", "Mengajukan biaya operasional pimpinan sesuai kebijakan perusahaan"],
   internal="Direksi, para Division Head dan Dept Head, Sekretaris, GA, Finance", eksternal="Mitra bisnis dan tamu pimpinan, agen perjalanan, penyedia akomodasi",
   pendidikan="D3/S1 Sekretari, Administrasi Bisnis, atau bidang terkait", pengalaman="Minimal 2 tahun sebagai personal assistant atau sekretaris pimpinan",
   kpi=["Ketepatan agenda pimpinan (tanpa jadwal bentrok)", "Tindak lanjut hasil rapat terpantau dan dilaporkan tepat waktu", "Ketepatan waktu penyelesaian pertanggungjawaban biaya", "Kerahasiaan dokumen pimpinan terjaga (nol insiden)"]),
 "J023": dict(tujuan="Memastikan program pelatihan berjalan sesuai rencana, berkualitas, terdokumentasi, dan terukur dampaknya bagi kompetensi karyawan.",
   wewenang=["Menetapkan jadwal pelaksanaan pelatihan dalam rencana yang disetujui", "Menolak pelaksanaan pelatihan yang tidak memenuhi kesiapan sarana atau instruktur", "Mengusulkan perbaikan program berdasarkan hasil evaluasi"],
   internal="L&D Dept Head, L&D Section Head, Instructor, Dept Head dan Kacab, Finance, GA", eksternal="Vendor pelatihan, konsultan, Mitsubishi Dealer Trainer (APM)",
   pendidikan="S1 Psikologi, Manajemen SDM, Pendidikan, atau bidang terkait", pengalaman="Minimal 2 tahun di bidang pelatihan atau pengembangan SDM",
   kpi=["Realisasi pelatihan terhadap rencana bulanan", "Skor evaluasi reaksi dan kenaikan nilai post-test", "Ketepatan waktu laporan realisasi pelatihan", "Rekam training karyawan lengkap dan mutakhir"]),
 "J060": dict(tujuan="Memastikan sistem dan infrastruktur TI perusahaan andal, aman, dan selaras dengan kebutuhan bisnis HO dan seluruh cabang.",
   wewenang=["Menetapkan kebijakan, standar, dan prioritas pengembangan TI", "Menyetujui pengadaan perangkat dan layanan TI sesuai anggaran", "Menetapkan hak akses sistem dan tindakan saat insiden keamanan"],
   internal="Direksi, seluruh Division Head dan Dept Head, Finance, HC (HRIS), pengguna BAMS di cabang", eksternal="Vendor aplikasi dan perangkat, penyedia jaringan, APM terkait integrasi sistem",
   pendidikan="S1 Teknik Informatika, Sistem Informasi, atau bidang terkait", pengalaman="Minimal 7 tahun di bidang TI, termasuk 3 tahun sebagai pimpinan unit TI",
   kpi=["Ketersediaan sistem utama (BAMS, HRIS, email, jaringan)", "Penyelesaian proyek TI tepat waktu dan sesuai anggaran", "Insiden keamanan tertangani sesuai prosedur", "Realisasi anggaran TI terhadap rencana"]),
 "J061": dict(tujuan="Memastikan layanan dukungan TI harian, pemeliharaan infrastruktur, dan perubahan sistem berjalan tepat waktu dan terkendali.",
   wewenang=["Membagi dan memprioritaskan tiket gangguan kepada tim support", "Menjadwalkan pemeliharaan dan perubahan sistem yang sudah disetujui", "Mengatur hak akses pengguna sesuai persetujuan"],
   internal="IT & Dev System Dept Head, tim support, pengguna HO dan cabang", eksternal="Vendor aplikasi dan perangkat, penyedia jaringan",
   pendidikan="S1 Teknik Informatika, Sistem Informasi, atau bidang terkait", pengalaman="Minimal 4 tahun di bidang TI, termasuk pengalaman memimpin tim",
   kpi=["Tiket gangguan selesai sesuai SLA", "Pemeliharaan berkala terlaksana sesuai jadwal", "Backup data berjalan dan lolos uji pemulihan", "Perubahan sistem terdokumentasi dan diuji sebelum diterapkan"]),
 "J062": dict(tujuan="Memastikan pengguna di HO dan cabang dapat bekerja tanpa hambatan perangkat, aplikasi, dan jaringan.",
   wewenang=["Menangani dan menutup tiket gangguan sesuai prosedur", "Menyiapkan dan memasang perangkat untuk pengguna", "Membuat dan menonaktifkan akun sesuai persetujuan"],
   internal="IT & Dev System Section Head, pengguna HO dan cabang, GA (inventaris)", eksternal="Vendor perangkat dan servis",
   pendidikan="D3/S1 Teknik Informatika, Teknik Komputer, atau bidang terkait", pengalaman="Minimal 1 tahun di bidang dukungan TI (fresh graduate dengan sertifikasi dipertimbangkan)",
   kpi=["Tiket gangguan selesai sesuai SLA", "Kepuasan pengguna atas layanan TI", "Data inventaris perangkat akurat", "Backup dan pembaruan keamanan berjalan sesuai jadwal"]),
}
NAVY = RGBColor(0x0B, 0x1F, 0x33)

def shade(cell, hexcolor):
    tcPr = cell._tc.get_or_add_tcPr(); sh = OxmlElement("w:shd"); sh.set(qn("w:val"), "clear"); sh.set(qn("w:color"), "auto"); sh.set(qn("w:fill"), hexcolor); tcPr.append(sh)

def tabel(doc, header, rows, lebar):
    t = doc.add_table(rows=1, cols=len(header)); t.style = "Table Grid"; t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, h in enumerate(header):
        c = t.rows[0].cells[i]; c.text = ""; r = c.paragraphs[0].add_run(h); r.bold = True; r.font.size = Pt(9); r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF); shade(c, "0B1F33")
    for row in rows:
        cs = t.add_row().cells
        for i, v in enumerate(row):
            cs[i].text = ""; r = cs[i].paragraphs[0].add_run(str(v)); r.font.size = Pt(9)
    t.autofit = False
    tblW = t._tbl.tblPr.find(qn("w:tblLayout"))
    lay = OxmlElement("w:tblLayout"); lay.set(qn("w:type"), "fixed"); t._tbl.tblPr.append(lay)
    grid = t._tbl.tblGrid
    for i, gc in enumerate(grid.findall(qn("w:gridCol"))): gc.set(qn("w:w"), str(int(lebar[i] * 567)))
    for i, w in enumerate(lebar): t.columns[i].width = Cm(w)
    for row in t.rows:
        for i, w in enumerate(lebar): row.cells[i].width = Cm(w)
    return t

doc = Document()
st = doc.styles["Normal"]; st.font.name = "Arial"; st.font.size = Pt(10); st.element.rPr.rFonts.set(qn("w:eastAsia"), "Arial")
for s in doc.sections: s.left_margin = s.right_margin = Cm(2); s.top_margin = s.bottom_margin = Cm(1.8)
p = doc.add_paragraph(); r = p.add_run("URAIAN JABATAN"); r.bold = True; r.font.size = Pt(22); r.font.color.rgb = NAVY
p = doc.add_paragraph(); r = p.add_run("5 Jabatan · Disusun L&D · 31 Oktober 2026 · v1"); r.font.size = Pt(11); r.font.color.rgb = RGBColor(0xB3, 0x12, 0x1E)
doc.add_paragraph("Personal Assistant · Training Supervisor · IT & Development System Department Head · IT & Development System Section Head · IT & Development System Support")
h = doc.add_paragraph(); r = h.add_run("Dasar penyusunan"); r.bold = True; r.font.color.rgb = NAVY
doc.add_paragraph("Kelima jabatan ini belum memiliki JD resmi. Tugas disusun dari rujukan uraian jabatan internasional (O*NET OnLine: 43-6011.00, 13-1151.00, 11-3021.00, 15-1244.00, 15-1232.00) dan praktik layanan TI ITIL 4, lalu disesuaikan dengan konteks BBM (HO, jaringan dealer, BAMS, HRIS) dan gaya penulisan JD BBM. Kompetensi, level, standar kinerja, dan bukti penilaian mengikuti Standar Kompetensi BBM v1.0. Kualifikasi dan KPI bersifat usulan untuk disahkan pimpinan.")
for kj in ("J019", "J023", "J060", "J061", "J062"):
    v, mj, inf = X[kj], MJ[kj], INFO[kj]
    doc.add_page_break()
    p = doc.add_paragraph(); r = p.add_run(v["jd"]); r.bold = True; r.font.size = Pt(16); r.font.color.rgb = NAVY
    tabel(doc, ["Identitas jabatan", "Keterangan"], [["Departemen", mj["Dept"]], ["Lokasi", mj["Lokasi"]], ["Atasan langsung", v["atasan"]], ["Bawahan langsung", v["bawahan"] or "-"], ["Jenjang", v["tier"]]], [5, 12])
    for judul, isi in (("1. Tujuan Jabatan", inf["tujuan"]),):
        p = doc.add_paragraph(); r = p.add_run(judul); r.bold = True; r.font.color.rgb = NAVY; doc.add_paragraph(isi)
    p = doc.add_paragraph(); r = p.add_run("2. Tugas Utama, Standar Kinerja, dan Bukti"); r.bold = True; r.font.color.rgb = NAVY
    baris, seen = [], set()
    tby = collections.OrderedDict()
    for t in TASK[kj]:
        k = (t["TugasUtama"], t["Task"])
        tby.setdefault(k, {"t": t, "komp": []})
        nm = KAM.get(t["KodeKompetensi"], {}).get("Nama")
        if nm and nm not in tby[k]["komp"]: tby[k]["komp"].append(nm)
    no, last = 0, None
    for (tu, ak), d in tby.items():
        if tu != last: no += 1; last = tu; baris.append([str(no), tu, "", "", ""])
        baris.append(["", ak, d["t"]["StandarKinerja"], d["t"]["BuktiPenilaian"].replace("; observasi langsung atasan", ""), ", ".join(d["komp"])])
    t = tabel(doc, ["No", "Tugas utama / aktivitas", "Standar kinerja", "Bukti penilaian", "Kompetensi"], baris, [1.0, 4.8, 4.8, 4, 2.6])
    for row in t.rows[1:]:
        if row.cells[0].text:
            tu = row.cells[1].text
            m = row.cells[1].merge(row.cells[4]); m.text = ""; rr = m.paragraphs[0].add_run(tu); rr.bold = True; rr.font.size = Pt(9)
            shade(row.cells[0], "DDEBF7"); shade(m, "DDEBF7")
    p = doc.add_paragraph(); r = p.add_run("3. Wewenang"); r.bold = True; r.font.color.rgb = NAVY
    for w in inf["wewenang"]: doc.add_paragraph(w, style="List Bullet")
    p = doc.add_paragraph(); r = p.add_run("4. Hubungan Kerja"); r.bold = True; r.font.color.rgb = NAVY
    tabel(doc, ["Internal", "Eksternal"], [[inf["internal"], inf["eksternal"]]], [8.5, 8.5])
    p = doc.add_paragraph(); r = p.add_run("5. Kualifikasi (usulan)"); r.bold = True; r.font.color.rgb = NAVY
    tabel(doc, ["Pendidikan", "Pengalaman"], [[inf["pendidikan"], inf["pengalaman"]]], [8.5, 8.5])
    p = doc.add_paragraph(); r = p.add_run("6. Kompetensi dan Level Syarat"); r.bold = True; r.font.color.rgb = NAVY
    ms = sorted(MAT[kj], key=lambda m: ({"Technical": 0, "Leadership": 1, "Behavioral": 2}.get(KAM[m["KodeKompetensi"]]["Kategori"], 3), m["KodeKompetensi"]))
    tabel(doc, ["Kategori", "Kompetensi", "Level", "Gambaran perilaku di level syarat"],
          [[{"Technical": "Teknis", "Leadership": "Kepemimpinan", "Behavioral": "Perilaku"}[KAM[m["KodeKompetensi"]]["Kategori"]], KAM[m["KodeKompetensi"]]["Nama"], "%s · %s" % (m["RequiredLevel"], LV[int(m["RequiredLevel"])]), KAM[m["KodeKompetensi"]]["L%d" % int(m["RequiredLevel"])]] for m in ms], [2.5, 4.5, 2.5, 7.7])
    p = doc.add_paragraph(); r = p.add_run("7. Indikator Kinerja Utama (usulan)"); r.bold = True; r.font.color.rgb = NAVY
    for k in inf["kpi"]: doc.add_paragraph(k, style="List Bullet")
    p = doc.add_paragraph(); r = p.add_run("Pengesahan"); r.bold = True; r.font.color.rgb = NAVY
    tabel(doc, ["Disusun", "Diperiksa", "Disetujui"], [["L&D Dept Head\n\n\n\nTanggal:", "Atasan langsung\n\n\n\nTanggal:", "HC & GA Division Head\n\n\n\nTanggal:"]], [5.7, 5.7, 5.7])
doc.add_page_break()
p = doc.add_paragraph(); r = p.add_run("Rujukan"); r.bold = True; r.font.color.rgb = NAVY
for x in ["O*NET OnLine 43-6011.00 Executive Secretaries and Executive Administrative Assistants (onetonline.org)", "O*NET OnLine 13-1151.00 Training and Development Specialists",
          "O*NET OnLine 11-3021.00 Computer and Information Systems Managers", "O*NET OnLine 15-1244.00 Network and Computer Systems Administrators",
          "O*NET OnLine 15-1232.00 Computer User Support Specialists", "ITIL 4 (incident, service request, problem management, change enablement)",
          "Standar Kompetensi BBM v1.0 (L&D BBM, 31 Okt 2026)"]:
    doc.add_paragraph(x, style="List Bullet")
doc.save("JD_5_Jabatan_Disusun_LD_v1.docx")
print("OK")
