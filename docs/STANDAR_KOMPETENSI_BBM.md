# Standar Kompetensi BBM v1.0

Berlaku mulai 31 Okt 2026. Pemilik: L&D Dept Head. Berlaku untuk semua dokumen jabatan, kamus, dan matriks kompetensi di BBLC TNA Engine dan dokumen turunannya.

Dokumen ini menetapkan **satu format** untuk semua jabatan. Format ini menggabungkan kelebihan dua master yang sudah ada: struktur tugas dari master L&D Section Head (MASTER_4) dan kamus serta matriks multi-jabatan dari master Finance Division (MASTER_5). Setiap aturan di bawah punya dasar rujukan (lihat bagian 9). Bagian yang merupakan keputusan BBM sendiri, bukan dari rujukan, ditandai **[Keputusan BBM]**.

---

## 1. Empat komponen wajib per jabatan

| No | Komponen | Isi | Asal format |
|---|---|---|---|
| 1 | Uraian tugas & KSA | Tugas utama → aktivitas → pengetahuan, standar kinerja, bila tidak terpenuhi, bukti penilaian, KSA, kompetensi, level | Master L&D + kolom Sub-Proses Finance + kolom Bukti (pola SKKNI) |
| 2 | Kamus kompetensi | Definisi kompetensi + 5 level, tiap level: definisi level + minimal 2 key behavior | Master Finance |
| 3 | Skala level | 5 level, definisi umum dan panduan penilaian | Skala BBM (bagian 3) |
| 4 | Matriks kompetensi | Level syarat per jabatan, beberapa jabatan berdampingan | Master Finance |
| + | Blok validasi | Nama, jabatan, tanggal persetujuan, versi | Master L&D |

## 2. Komponen 1: uraian tugas

Kolom wajib, berurutan:

| Kolom | Aturan |
|---|---|
| Tugas Utama | Ditulis **verbatim dari JD**. Tidak boleh diparafrasekan. |
| Proses Kerja / Aktivitas | Verbatim dari JD bila tersedia. Rincian analitis ditaruh di Sub-Proses. |
| Sub-Proses (opsional) | Breakdown analitis. Wajib ditandai sebagai analisis di kolom Sumber. |
| Pengetahuan (K) | Pengetahuan yang dibutuhkan untuk aktivitas itu. |
| Standar Kinerja | Hasil yang dianggap memenuhi standar. Padanan *kriteria unjuk kerja* SKKNI. |
| Bila Tidak Terpenuhi | Dampak bila standar tidak tercapai. Menjelaskan kenapa standar penting. |
| Bukti Penilaian | Dokumen, data, atau observasi yang dicek atasan saat menilai. Padanan *panduan penilaian* SKKNI. |
| KSA | Minimal satu baris K, S, dan A. |
| Kompetensi | **Harus nama yang ada di kamus.** Satu aktivitas boleh menuntut lebih dari satu kompetensi. |
| Level | Level yang dituntut aktivitas itu. |
| Sumber | Asal setiap isi: JD verbatim, master, atau draf L&D Studio (DRAFT_AI). Disimpan di Sheet (tab Task), tidak dicetak di dokumen jabatan supaya dokumen sama untuk semua peran. |

Kompetensi Tools & Technology yang dipakai di semua tugas boleh ditulis sebagai baris **"Lintas Tugas Utama"** yang menyebut di proses mana tools itu dipakai (pola master Finance).

## 3. Komponen 3: skala level

| Level | Label | Status | Ciri utama | Padanan rujukan (pendekatan, bukan setara resmi) |
|---|---|---|---|---|
| 1 | Awareness | Belum mandiri | Tahu konsep dan istilah; bekerja dengan bimbingan penuh | Dreyfus: novice · SFIA L1 Follow |
| 2 | Basic | Perlu bimbingan | Tugas rutin dengan panduan; hasil direview | SFIA L2 Assist · IES Foundation |
| 3 | Intermediate | Mandiri | Mandiri pada situasi bervariasi; hasil dapat diandalkan | SFIA L3 Apply · IES Intermediate |
| 4 | Advanced | Mahir dan rujukan | Menangani kasus kompleks; memastikan mutu kerja orang lain; membimbing | SFIA L4 Enable · IES Advanced |
| 5 | Expert | Inovator | Menetapkan sistem, kebijakan, atau metode baru; rujukan perusahaan | SFIA L5 Ensure/advise ke atas |

Catatan rujukan: SFIA punya 7 tingkat dan Dreyfus 5 tahap; padanan di atas adalah pemetaan pendekatan oleh L&D untuk memberi dasar, bukan kesetaraan yang ditetapkan pemilik kerangka tersebut. Model Dreyfus juga dikritik karena bukti empiris tahapannya terbatas (Gobet & Chassy, 2009), sehingga skala ini dipakai sebagai panduan perilaku, bukan klaim psikometrik.

## 4. Komponen 2: kamus kompetensi

1. Setiap kompetensi punya **definisi** satu kalimat, **5 level**, dan setiap level punya **definisi level** + **minimal 2 key behavior**.
2. **Key behavior harus bisa diamati** (pola BARS, Smith & Kendall, 1963). Kata kerja pembuka yang dilarang: *memahami, mengetahui, mengerti, mengenal, menyadari*. Pakai kata kerja tindakan sesuai tingkat (Anderson & Krathwohl, 2001): L1 menyebutkan, menjelaskan, mengikuti; L2-L3 menerapkan, menyusun, memeriksa; L4 menganalisis, membimbing, memastikan mutu; L5 merancang, menetapkan, mengevaluasi dampak.
3. **Dua key behavior dalam satu level harus mengukur dua hal berbeda** (mis. proses vs hasil, atau keterampilan vs tanggung jawab). Batas pemeriksaan: kemiripan kata di bawah 45%. **[Keputusan BBM]**
4. Dimensi pembeda per level mengikuti atribut generik SFIA: L2 bekerja dalam arahan, L3 menangani variasi secara mandiri, L4 memastikan mutu kerja orang lain, L5 dampak dan tata kelola.
5. Key behavior yang dipakai di form asesmen (checklist Level 2-5, skor Guttman) adalah key behavior pertama tiap level. Mengubahnya berarti mengubah alat ukur, sehingga harus lewat persetujuan L&D.
6. **Kode kompetensi unik di seluruh BBM**, berawalan rumpun: `TC-FIN-` Finance, `TC-LND-` L&D, `TC-TL-` Tools & Technology lintas fungsi, `TK-` kompetensi teknis draf dari JD, `CB` perilaku, `LD-`/`SL-` kepemimpinan.
7. **Tools & Technology satu set untuk seluruh BBM** (TC-TL-01..07: Excel, Word, PowerPoint, Business System & Application, Digital Communication, AI-Assisted Productivity, Continuous Improvement). Satu kompetensi tidak boleh punya dua definisi di dua divisi. **[Keputusan BBM]**
8. Ejaan mengikuti KBBI (analisis, risiko, aktivitas, efektivitas, utang).

## 5. Komponen 4: matriks dan keterlacakan

1. **Setiap sel matriks teknis didukung minimal satu aktivitas di uraian tugas** (Campion dkk., 2011; Schippmann dkk., 2000: model kompetensi berangkat dari analisis jabatan). Sel yang belum didukung ditandai `TIDAK DIDUKUNG TASK` dan tampil di aplikasi sebagai "Belum didukung tugas JD".
2. **Level syarat = level aktivitas tertinggi** yang menuntut kompetensi itu di jabatan tersebut.
3. Level Tools & Technology ditentukan oleh tugas, sama seperti kompetensi lain. Tidak ada level minimum per jenjang yang ditetapkan rujukan; usulan penyesuaian level Tools dicatat sebagai butir review, bukan diubah sepihak. **[Keputusan BBM]**

## 6. Tata kelola dan status

Pola ISO 10015:2019: kompetensi dikelola sebagai sistem yang punya pemilik, persetujuan, versi, dan tinjauan berkala.

| Status | Arti | Siapa yang boleh mengubah |
|---|---|---|
| DRAFT_AI | Disusun L&D Studio dari JD. Wajib direview. | L&D, atas masukan Dept Head |
| MASTER | Disusun pemilik fungsi (mis. Finance, L&D). | Pemilik master. Studio hanya menandai temuan. |
| FINAL | Kamus perilaku perusahaan. | L&D Dept Head |
| Disetujui | Matriks jabatan disetujui di Panel Admin TNA. | Admin L&D |

Aturan: isi buatan AI tidak pernah dianggap final sebelum direview manusia. Isi master dan FINAL tidak diubah sepihak; temuan QA dicatat dengan usulan perbaikan. Tinjauan penuh minimal setahun sekali, sebelum siklus TNA.

## 7. Pemeriksaan QA otomatis

Dijalankan setiap paket data import dibangun. Target semua butir adalah 0, kecuali Q2.

| Kode | Pemeriksaan |
|---|---|
| Q1 | Tugas yang menyebut kompetensi di luar kamus |
| Q2 | Tugas tanpa kompetensi (hanya boleh untuk jabatan berstatus DIKECUALIKAN) |
| Q3 | Selisih level aktivitas vs level matriks |
| Q4 | Sel matriks teknis tanpa tugas pendukung |
| Q5 | Level tanpa definisi atau kurang dari 2 key behavior |
| Q6 | Key behavior tidak observable |
| Q7 | Key behavior kembar antar level; Q7b terlalu mirip dalam satu level |
| Q8 | Jabatan tanpa uraian tugas (JD belum ada) |
| Q9 | Istilah sistem yang sudah tidak berlaku (contoh: e-Faktur sebagai saluran SPT Masa PPN sejak Coretax DJP, PMK 81/2024) |
| Q10 | Ejaan tidak baku pada isi buatan Studio |

## 8. Hasil penerapan (31 Okt 2026)

- Semua kompetensi yang dipakai di 101 jabatan memenuhi Q5 (5 level, definisi level, minimal 2 key behavior).
- Tools Finance dan L&D digabung menjadi satu set TC-TL-01..07.
- Semua baris tugas punya Bukti Penilaian dan Sumber; 5 jabatan yang belum punya JD resmi mendapat JD susunan L&D.
- QA Q1 dan Q3-Q10 = 0. Q2 = 17 baris tugas Direksi (jabatan DIKECUALIKAN, memang tanpa kompetensi teknis).
- Rincian perubahan per jabatan ada di catatan admin yang dibagikan terpisah (tidak disimpan di repo).

## 9. Rujukan (dicek 31 Okt 2026)

1. Campion, M.A., Fink, A.A., Ruggeberg, B.J., Carr, L., Phillips, G.M., & Odman, R.B. (2011). Doing competencies well: Best practices in competency modeling. *Personnel Psychology*, 64(1), 225-262.
2. Schippmann, J.S., dkk. (2000). The practice of competency modeling. *Personnel Psychology*, 53(3), 703-740. doi:10.1111/j.1744-6570.2000.tb00220.x
3. Smith, P.C., & Kendall, L.M. (1963). Retranslation of expectations: An approach to the construction of unambiguous anchors for rating scales. *Journal of Applied Psychology*, 47(2), 149-155. doi:10.1037/h0047060
4. Permenaker No. 2 Tahun 2016 tentang Sistem Standardisasi Kompetensi Kerja Nasional, dan Permenaker No. 3 Tahun 2016 tentang Tata Cara Penetapan SKKNI (struktur unit kompetensi: elemen, kriteria unjuk kerja, batasan variabel, panduan penilaian).
5. ISO 10015:2019 Quality management — Guidelines for competence management and people development (edisi 2, dikonfirmasi ulang 2025). https://www.iso.org/standard/69459.html
6. Dreyfus, S.E., & Dreyfus, H.L. (1980). *A Five-Stage Model of the Mental Activities Involved in Directed Skill Acquisition*. UC Berkeley ORC 80-2. https://apps.dtic.mil/sti/pdfs/ADA084551.pdf
7. SFIA Foundation. SFIA 9, Levels of responsibility. https://sfia-online.org/en/lor/9/4
8. Anderson, L.W., & Krathwohl, D.R. (2001). *A Taxonomy for Learning, Teaching, and Assessing: A Revision of Bloom's Taxonomy of Educational Objectives*. Longman.
9. European Commission JRC. DigComp 2.2 (2022), pembanding skala kemahiran digital.
10. IFAC/IAESB. IES 2, Initial Professional Development — Technical Competence (tingkat Foundation, Intermediate, Advanced). https://education.ifac.org/part/ies-2
11. ATD. Talent Development Capability Model (3 domain, 23 kapabilitas), pembanding cakupan L&D.
12. PMK 81 Tahun 2024 (Coretax DJP, berlaku 1 Jan 2025) dan KEP-54/PJ/2025 (e-Faktur desktop untuk pembuatan faktur).
13. IAI. Perubahan penomoran PSAK/ISAK, berlaku 1 Jan 2024 (mis. PSAK 1 menjadi PSAK 201).
