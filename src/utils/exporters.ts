import type {
  AssessmentMeta,
  BankItem,
  KisiKisiRow,
  QuestionItem,
  TeacherSignOff,
} from '../types/assessment';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAssessmentToWord(
  meta: AssessmentMeta,
  kisiKisi: KisiKisiRow[],
  soalList: QuestionItem[],
  signOff: TeacherSignOff
): void {
  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${escapeHtml(meta.mapel)}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.35; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; }
        th, td { border: 1px solid #000; padding: 5px; font-size: 10pt; vertical-align: top; }
        th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
        .kop-title { font-size: 14pt; font-weight: bold; text-transform: uppercase; }
        .section-title { font-size: 12pt; font-weight: bold; margin-top: 20px; background-color: #e6e6e6; padding: 4px; }
        .soal-item { margin-bottom: 15px; }
        .stimulus { font-style: italic; background-color: #f9f9f9; padding: 6px; border-left: 3px solid #666; margin-bottom: 5px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="kop-title">${escapeHtml(meta.sekolah)}</div>
        <div style="font-size: 13pt; font-weight: bold;">PERANGKAT ASESMEN PEMBELAJARAN TERSTANDAR</div>
        <div style="font-size: 10pt;">ASSESSMENT PRO AI by I'mLibrary - Digital Learning Hub</div>
      </div>

      <table style="border: none; margin-bottom: 15px;">
        <tr style="border: none;">
          <td style="border: none; width: 50%;"><strong>Mata Pelajaran:</strong> ${escapeHtml(meta.mapel)}</td>
          <td style="border: none; width: 50%;"><strong>Kurikulum:</strong> Kurikulum ${escapeHtml(meta.kurikulum)}</td>
        </tr>
        <tr style="border: none;">
          <td style="border: none;"><strong>Jenjang / Kelas:</strong> ${escapeHtml(meta.jenjang)} / ${escapeHtml(meta.kelas)} (${escapeHtml(meta.faseJurusan)})</td>
          <td style="border: none;"><strong>Semester / TA:</strong> ${escapeHtml(meta.semester)} / ${escapeHtml(meta.tahun)}</td>
        </tr>
        <tr style="border: none;">
          <td style="border: none;"><strong>Materi Pokok:</strong> ${escapeHtml(meta.materi)}</td>
          <td style="border: none;"><strong>Alokasi Waktu:</strong> ${meta.alokasiWaktu} Menit</td>
        </tr>
      </table>

      <div class="section-title">I. KISI-KISI PENULISAN SOAL ASESMEN</div>
      <table>
        <thead>
          <tr>
            <th style="width: 30px;">No</th>
            <th>Capaian / Kompetensi</th>
            <th>Tujuan Pembelajaran</th>
            <th>Materi Pokok</th>
            <th>Indikator Soal</th>
            <th style="width: 45px;">Level</th>
            <th style="width: 50px;">Bentuk</th>
            <th style="width: 35px;">No</th>
          </tr>
        </thead>
        <tbody>
          ${kisiKisi
            .map(
              (k) => `
            <tr>
              <td style="text-align: center;">${k.no}</td>
              <td>${escapeHtml(k.cptp)}</td>
              <td>${escapeHtml(k.tpipk)}</td>
              <td>${escapeHtml(k.materi)}</td>
              <td>${escapeHtml(k.indikator)}</td>
              <td style="text-align: center;">${k.bloom}</td>
              <td style="text-align: center;">${escapeHtml(k.bentuk)}</td>
              <td style="text-align: center; font-weight: bold;">${k.no}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <div style="page-break-before: always;"></div>
      <div class="section-title">II. NASKAH BUTIR SOAL</div>
      <div style="margin-top: 10px;">
        ${soalList
          .map((s) => {
            let opsiHtml = '';
            if (s.opsi) {
              opsiHtml = '<div style="margin-left: 20px; margin-top: 5px;">';
              for (const [k, v] of Object.entries(s.opsi)) {
                opsiHtml += `<div><strong>${escapeHtml(k)}.</strong> ${escapeHtml(v)}</div>`;
              }
              opsiHtml += '</div>';
            }
            return `
              <div class="soal-item">
                <div><strong>Nomor ${s.no}.</strong> (${escapeHtml(s.bentuk)} - ${s.bloom})</div>
                ${s.stimulus ? `<div class="stimulus">${escapeHtml(s.stimulus)}</div>` : ''}
                <div>${escapeHtml(s.pertanyaan)}</div>
                ${opsiHtml}
              </div>
            `;
          })
          .join('')}
      </div>

      <div style="page-break-before: always;"></div>
      <div class="section-title">III. KUNCI JAWABAN & PEMBAHASAN</div>
      <div style="margin-top: 10px;">
        ${soalList
          .map(
            (s) => `
          <div style="margin-bottom: 10px; border-bottom: 1px dotted #ccc; padding-bottom: 5px;">
            <strong>Soal No. ${s.no}</strong> | Kunci: <span style="color: green; font-weight: bold;">${escapeHtml(s.kunci)}</span> (Bobot: ${s.bobot || 10})<br>
            <em>Pembahasan:</em> ${escapeHtml(s.pembahasan)}
          </div>
        `
          )
          .join('')}
      </div>

      <div style="margin-top: 40px;">
        <table style="border: none;">
          <tr style="border: none; text-align: center;">
            <td style="border: none; width: 50%;">
              Mengetahui,<br>Kepala Sekolah<br><br><br><br>
              <strong>${escapeHtml(signOff.namaKepalaSekolah || '( .................................................... )')}</strong><br>
              NIP. ${escapeHtml(signOff.nipKepalaSekolah || '.................................................')}
            </td>
            <td style="border: none; width: 50%;">
              ${escapeHtml(signOff.kota || 'Indonesia')}, ${new Date().toLocaleDateString('id-ID')}<br>Guru Mata Pelajaran<br><br><br><br>
              <strong>${escapeHtml(signOff.namaGuru || '( .................................................... )')}</strong><br>
              NIP. ${escapeHtml(signOff.nipGuru || '.................................................')}
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
  const safeMapel = meta.mapel.replace(/\s+/g, '_');
  triggerBlobDownload(blob, `Asesmen-${safeMapel}-${meta.kelas}.doc`);
}

export function exportKisiKisiToExcel(meta: AssessmentMeta, kisiKisi: KisiKisiRow[]): void {
  const tableContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="UTF-8"></head>
    <body>
      <table border="1">
        <tr style="background-color: #0A192F; color: #FFFFFF; font-weight: bold;">
          <th>No</th>
          <th>Capaian / KD</th>
          <th>Tujuan Pembelajaran</th>
          <th>Materi Pokok</th>
          <th>Submateri</th>
          <th>Indikator Soal</th>
          <th>Level Kognitif</th>
          <th>Kategori</th>
          <th>Tingkat Kesulitan</th>
          <th>Bentuk Soal</th>
          <th>Nomor Soal</th>
        </tr>
        ${kisiKisi
          .map(
            (r) => `
          <tr>
            <td>${r.no}</td>
            <td>${escapeHtml(r.cptp)}</td>
            <td>${escapeHtml(r.tpipk)}</td>
            <td>${escapeHtml(r.materi)}</td>
            <td>${escapeHtml(r.submateri)}</td>
            <td>${escapeHtml(r.indikator)}</td>
            <td style="text-align: center;">${r.bloom}</td>
            <td style="text-align: center;">${r.kategori}</td>
            <td>${r.kesulitan}</td>
            <td>${escapeHtml(r.bentuk)}</td>
            <td style="text-align: center; font-weight: bold;">${r.no}</td>
          </tr>
        `
          )
          .join('')}
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', tableContent], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });
  triggerBlobDownload(blob, `Kisi-Kisi-${meta.mapel.replace(/\s+/g, '_')}.xls`);
}

export function exportKisiKisiToCsv(meta: AssessmentMeta, kisiKisi: KisiKisiRow[]): void {
  let csv =
    'No,CP/KD,Tujuan Pembelajaran,Materi Pokok,Submateri,Indikator Soal,Level Kognitif,Kategori,Tingkat Kesulitan,Bentuk Soal,Nomor Soal\n';
  for (const r of kisiKisi) {
    const q = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;
    csv += `${r.no},${q(r.cptp)},${q(r.tpipk)},${q(r.materi)},${q(r.submateri)},${q(r.indikator)},${r.bloom},${r.kategori},${r.kesulitan},${q(r.bentuk)},${r.no}\n`;
  }
  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
  triggerBlobDownload(blob, `Kisi-Kisi-${meta.mapel.replace(/\s+/g, '_')}.csv`);
}

export function exportBackupJson(payload: {
  currentAssessment: AssessmentMeta;
  kisiKisi: KisiKisiRow[];
  soalList: QuestionItem[];
  bankSoal: BankItem[];
}): void {
  const full = {
    app: "ASSESSMENT PRO AI by I'mLibrary",
    exportedAt: new Date().toISOString(),
    ...payload,
  };
  const blob = new Blob([JSON.stringify(full, null, 2)], { type: 'application/json' });
  triggerBlobDownload(blob, `Backup-AssessmentPro-${Date.now()}.json`);
}
