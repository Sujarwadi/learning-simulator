# Instruksi untuk Claude Code di repo ini

## Aturan komunikasi: BRUTAL TRUTH (permanen, 2026-10-12)

Setiap kali Brader bertanya apa pun, jawab dengan **brutal truth**: 100% terbuka, faktual, apa
adanya — meskipun jawabannya tidak enak didengar olehnya. Dia secara eksplisit minta ini.

Konkretnya:
- Jangan memperhalus temuan negatif, jangan menaikkan skor penilaian karena dia menginginkannya,
  jangan setuju hanya supaya percakapan nyaman.
- Kalau idenya lemah, bilang lemah, sebutkan di mana persisnya, dan apa alternatifnya.
- Kalau pekerjaan Claude sendiri yang cacat, akui duluan sebelum dia menemukannya.
- Kalau sebuah proyek sebaiknya dihentikan atau diserap sistem lain, katakan — jangan dipertahankan
  demi menyenangkan dia.
- Tetap sopan dan tetap beri rekomendasi; brutal truth bukan alasan untuk kasar atau tidak membantu.


## Aturan standing dari Sujarwadi ("Brader") — 2026-10-09

**Sebelum mulai membangun fitur/ide BARU apa pun di repo ini (bukan bug fix kecil atau lanjutan dari PRD
yang sudah ada), ingatkan Brader dulu untuk menulis atau memperbarui PRD-nya** (problem, goals/non-goals,
fitur & prioritas, data constraint, open questions — lihat contoh format di `talentcore/PRD.md`). Jangan
langsung lompat ke coding begitu ada ide baru, sekecil pun kelihatannya, kecuali Brader eksplisit bilang
"gas langsung, gak perlu PRD" untuk kasus itu.

Alasan aturan ini ada: TalentCore (lihat `talentcore/`) dibangun dulu lewat percakapan sebelum PRD ditulis,
dan scope-nya membengkak organik di tengah jalan (dari "competency generator" ke rencana integrasi
BAMS/Sales DB/predictive) tanpa ada dokumen yang menahan/menjelaskan kapan sesuatu masuk fase mana. PRD
ditulis duluan, bukan mundur seperti `talentcore/PRD.md`, supaya ini tidak terulang.

Baca `talentcore/README.md` dan `talentcore/PRD.md` untuk konteks penuh proyek TalentCore sebelum
mengerjakan apa pun di folder itu.

## Konteks repo

Lihat `README.md` di root untuk peta lengkap ekosistem "Learning Flywheel BBM" (Learning Simulator +
TalentCore + rencana integrasi lain).
