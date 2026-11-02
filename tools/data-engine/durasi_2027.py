"""Aturan durasi training 2027 (keputusan user 28 Okt 2026), diterapkan pada katalog yang DurasiJam-nya kosong.
 1) Modul ATPM/APM: durasi default dari training record BBLC 2025-2026 (nilai terbanyak per KodeTNA); baku nasional.
 2) Non-ATPM: hanya dua pilihan, 3 jam (half day) atau 6 jam (full day). Yang tadinya dicatat 4 jam jadi 3 jam; sisanya 6 jam dulu.
 Durasi yang sudah terisi di katalog tidak diubah."""
ATPM_REKAM = {  # nilai terbanyak di RekamTraining (jam)
    "W-STEP1": 66, "W-STEP2": 60, "W-STEP3": 60, "W-FSTEP1": 60,  # FSTEP1: 12 dan 60 sama banyak (19:19), dipakai 60 = median
    "W-MSA1": 30, "W-FSA1": 30, "W-HK": 2, "D-PKMMKSI": 2, "D-PKKTB": 2,
}
ATPM_TANPA_REKAM = {"W-EST1", "W-EST2", "W-EST3", "W-INSTR"}  # ATPM tetapi belum ada record: dibiarkan kosong (keputusan user: skip dulu)
IKUT_PENYELENGGARA = {"W-BREVET", "W-GADA", "W-SERTGA"}  # durasi mengikuti aturan lembaga penyelenggara: dibiarkan kosong
TIGA_JAM = {"U-TK-072", "U-TK-029", "U-TK-094", "U-TK-077", "W-TFT", "D-STS"}   # 4 jam sebelumnya, ditambah ToT dan Sales Talk (keputusan user 28 Okt)
def terapkan(katalog):
    ubah = {}
    for c in katalog:
        k = c["KodeTraining"]
        if c["DurasiJam"] not in ("", None): continue
        if k in ATPM_REKAM: c["DurasiJam"] = ATPM_REKAM[k]
        elif k in ATPM_TANPA_REKAM or k in IKUT_PENYELENGGARA: continue
        else: c["DurasiJam"] = 3 if k in TIGA_JAM else 6
        ubah[k] = c["DurasiJam"]
    return ubah
