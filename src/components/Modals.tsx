import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Edit,
  FileSpreadsheet,
  FileText,
  Printer,
  X,
} from 'lucide-react';
import type {
  AssessmentMeta,
  KisiKisiRow,
  QuestionItem,
  TeacherSignOff,
} from '../types/assessment';

interface PrintPreviewModalProps {
  open: boolean;
  assessment: AssessmentMeta;
  kisiKisi: KisiKisiRow[];
  soalList: QuestionItem[];
  signOff: TeacherSignOff;
  initialKunciOnly?: boolean;
  onClose: () => void;
  onExportWord: () => void;
  onExportExcel: () => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  open,
  assessment,
  kisiKisi,
  soalList,
  signOff,
  initialKunciOnly = false,
  onClose,
  onExportWord,
  onExportExcel,
}) => {
  const [showKisi, setShowKisi] = useState(true);
  const [showSoal, setShowSoal] = useState(true);
  const [showKunci, setShowKunci] = useState(true);
  const [showRubrik, setShowRubrik] = useState(true);

  useEffect(() => {
    if (open) {
      if (initialKunciOnly) {
        setShowKisi(false);
        setShowSoal(false);
        setShowKunci(true);
        setShowRubrik(false);
      } else {
        setShowKisi(true);
        setShowSoal(true);
        setShowKunci(true);
        setShowRubrik(true);
      }
    }
  }, [open, initialKunciOnly]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Pratinjau Dokumen Asesmen Siap Cetak"
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-4 px-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-brand-navy" />
            <h3 className="font-bold text-slate-900 text-sm">
              Pratinjau Dokumen Asesmen Siap Cetak (A4)
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onExportWord}
              className="px-3 py-1.5 text-xs font-semibold bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 rounded-lg inline-flex items-center gap-1 whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Unduh Word (.doc)</span>
            </button>
            <button
              type="button"
              onClick={onExportExcel}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-lg inline-flex items-center gap-1 whitespace-nowrap"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ekspor Excel (.xls)</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-1.5 text-xs font-bold bg-brand-navy hover:bg-slate-800 text-white rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5 text-brand-cyan" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup pratinjau cetak"
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700 no-print">
          <span>Tampilkan dalam Dokumen:</span>
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showKisi}
              onChange={(e) => setShowKisi(e.target.checked)}
              className="rounded text-sky-600"
            />
            <span>Kisi-Kisi Soal</span>
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showSoal}
              onChange={(e) => setShowSoal(e.target.checked)}
              className="rounded text-sky-600"
            />
            <span>Naskah Butir Soal</span>
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showKunci}
              onChange={(e) => setShowKunci(e.target.checked)}
              className="rounded text-sky-600"
            />
            <span>Kunci &amp; Pembahasan</span>
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showRubrik}
              onChange={(e) => setShowRubrik(e.target.checked)}
              className="rounded text-sky-600"
            />
            <span>Rubrik Penilaian</span>
          </label>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-200/60">
          <div
            id="printable-area"
            className="bg-white p-8 max-w-[210mm] mx-auto rounded-lg text-slate-900 border border-slate-300 text-xs"
          >
            <div className="border-b-2 border-slate-900 pb-3 mb-5 text-center">
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="w-12 h-12 border-2 border-slate-800 p-1 flex items-center justify-center font-bold font-mono shrink-0">
                  IM
                </div>
                <div className="flex-1">
                  <h1 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
                    {assessment.sekolah}
                  </h1>
                  <h2 className="text-base font-black uppercase text-slate-900 tracking-wider">
                    PERANGKAT ASESMEN PEMBELAJARAN TERSTANDAR
                  </h2>
                  <p className="text-[10px] text-slate-600">
                    ASSESSMENT PRO AI by I'mLibrary - Digital Learning Hub
                  </p>
                </div>
                <div className="text-right text-[10px] text-slate-500 font-mono shrink-0">
                  STANDAR A4
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-left text-[11px] pt-2 border-t border-slate-300">
                <div>
                  <strong>Mata Pelajaran:</strong> {assessment.mapel}
                </div>
                <div>
                  <strong>Kurikulum Acuan:</strong> Kurikulum {assessment.kurikulum}
                </div>
                <div>
                  <strong>Jenjang / Kelas:</strong> {assessment.jenjang} / {assessment.kelas} (
                  {assessment.faseJurusan})
                </div>
                <div>
                  <strong>Semester / Tahun:</strong> {assessment.semester} / {assessment.tahun}
                </div>
                <div>
                  <strong>Materi Pokok:</strong> {assessment.materi}
                </div>
                <div className="tabular-nums">
                  <strong>Alokasi Waktu:</strong> {assessment.alokasiWaktu} Menit
                </div>
              </div>
            </div>

            {showKisi && kisiKisi.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-2 bg-slate-100 p-1.5 border border-slate-300">
                  I. KISI-KISI PENULISAN SOAL ASESMEN
                </h3>
                <table className="w-full border-collapse border border-slate-400 text-[10px]">
                  <thead className="bg-slate-200">
                    <tr>
                      <th className="border border-slate-400 p-1 w-6 text-center">No</th>
                      <th className="border border-slate-400 p-1 w-32">
                        {assessment.kurikulum === 'K13'
                          ? 'Kompetensi Dasar'
                          : 'Capaian Pembelajaran'}
                      </th>
                      <th className="border border-slate-400 p-1 w-36">Tujuan Pembelajaran</th>
                      <th className="border border-slate-400 p-1 w-28">Materi Pokok</th>
                      <th className="border border-slate-400 p-1">Indikator Soal</th>
                      <th className="border border-slate-400 p-1 w-12 text-center">Level</th>
                      <th className="border border-slate-400 p-1 w-12 text-center">Kat</th>
                      <th className="border border-slate-400 p-1 w-16 text-center">Bentuk</th>
                      <th className="border border-slate-400 p-1 w-8 text-center">No</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kisiKisi.map((r) => (
                      <tr key={r.no}>
                        <td className="border border-slate-400 p-1 text-center font-bold tabular-nums">
                          {r.no}
                        </td>
                        <td className="border border-slate-400 p-1">{r.cptp}</td>
                        <td className="border border-slate-400 p-1">{r.tpipk}</td>
                        <td className="border border-slate-400 p-1">{r.materi}</td>
                        <td className="border border-slate-400 p-1 italic">{r.indikator}</td>
                        <td className="border border-slate-400 p-1 text-center font-bold">
                          {r.bloom}
                        </td>
                        <td className="border border-slate-400 p-1 text-center">{r.kategori}</td>
                        <td className="border border-slate-400 p-1 text-center">{r.bentuk}</td>
                        <td className="border border-slate-400 p-1 text-center font-bold tabular-nums">
                          {r.no}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="page-break" />
              </div>
            )}

            {showSoal && soalList.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-3 bg-slate-100 p-1.5 border border-slate-300">
                  II. NASKAH BUTIR SOAL ASESMEN
                </h3>
                <div className="space-y-4">
                  {soalList.map((s) => (
                    <div key={s.no} className="border-b border-slate-200 pb-3 text-[11px]">
                      <div className="flex items-center justify-between mb-1 text-[10px] text-slate-500">
                        <span>
                          <strong>Nomor {s.no}</strong> · Bentuk: {s.bentuk}
                        </span>
                        <span>
                          Level: {s.bloom} ({s.kategori})
                        </span>
                      </div>
                      {s.stimulus && (
                        <p className="italic bg-slate-50 p-2 border border-slate-200 mb-1.5 leading-relaxed">
                          {s.stimulus}
                        </p>
                      )}
                      <p className="font-medium text-slate-900 leading-relaxed">{s.pertanyaan}</p>
                      {s.opsi && (
                        <div className="pl-4 pt-1 space-y-0.5">
                          {Object.entries(s.opsi).map(([k, v]) => (
                            <div key={k}>
                              <strong>{k}.</strong> {v}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="page-break" />
              </div>
            )}

            {showKunci && soalList.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-2 bg-slate-100 p-1.5 border border-slate-300">
                  III. KUNCI JAWABAN DAN PEMBAHASAN
                </h3>
                <div className="space-y-2 text-[10px]">
                  {soalList.map((s) => (
                    <div key={s.no} className="p-2 border border-slate-200 rounded">
                      <div className="flex justify-between font-bold">
                        <span>Soal Nomor {s.no}</span>
                        <span className="text-emerald-800">Kunci: {s.kunci}</span>
                      </div>
                      <p className="mt-1 text-slate-700">
                        <strong>Pembahasan:</strong> {s.pembahasan}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showRubrik && soalList.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-2 bg-slate-100 p-1.5 border border-slate-300">
                  IV. RUBRIK DAN PEDOMAN PENSKORAN
                </h3>
                <div className="space-y-2 text-[10px]">
                  {soalList.map((s) => (
                    <div key={s.no} className="p-2 border border-slate-200 rounded">
                      <div className="flex justify-between font-semibold">
                        <span>
                          Butir No. {s.no} ({s.bentuk})
                        </span>
                        <span className="tabular-nums">Bobot: {s.bobot || 10}</span>
                      </div>
                      <pre className="font-sans whitespace-pre-line text-slate-700 mt-1">
                        {s.rubrik || 'Benar skor penuh, salah skor 0.'}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-6 mt-6 border-t border-slate-300 grid grid-cols-2 text-center text-[11px]">
              <div>
                <p>Mengetahui,</p>
                <p className="font-bold">Kepala Sekolah</p>
                <div className="h-16" />
                <p className="font-bold underline">
                  {signOff.namaKepalaSekolah ||
                    '( .................................................... )'}
                </p>
                <p className="text-[9px]">
                  NIP.{' '}
                  {signOff.nipKepalaSekolah || '.................................................'}
                </p>
              </div>
              <div>
                <p>
                  {signOff.kota || 'Indonesia'}, {new Date().toLocaleDateString('id-ID')}
                </p>
                <p className="font-bold">Guru Mata Pelajaran</p>
                <div className="h-16" />
                <p className="font-bold underline">
                  {signOff.namaGuru || '( .................................................... )'}
                </p>
                <p className="text-[9px]">
                  NIP. {signOff.nipGuru || '.................................................'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface EditSoalModalProps {
  soal: QuestionItem | null;
  onClose: () => void;
  onSave: (updated: QuestionItem) => void;
}

export const EditSoalModal: React.FC<EditSoalModalProps> = ({ soal, onClose, onSave }) => {
  const [stimulus, setStimulus] = useState('');
  const [pertanyaan, setPertanyaan] = useState('');
  const [kunci, setKunci] = useState('');
  const [bobot, setBobot] = useState(10);
  const [pembahasan, setPembahasan] = useState('');
  const [opsi, setOpsi] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    if (soal) {
      setStimulus(soal.stimulus || '');
      setPertanyaan(soal.pertanyaan || '');
      setKunci(soal.kunci || '');
      setBobot(soal.bobot || 10);
      setPembahasan(soal.pembahasan || '');
      setOpsi(soal.opsi ? { ...soal.opsi } : null);
    }
  }, [soal]);

  if (!soal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pertanyaan.trim() || !kunci.trim() || !pembahasan.trim()) return;
    onSave({
      ...soal,
      stimulus: stimulus.trim(),
      pertanyaan: pertanyaan.trim(),
      kunci: kunci.trim(),
      bobot: Math.max(1, Math.min(100, Number(bobot) || 10)),
      pembahasan: pembahasan.trim(),
      opsi,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Edit Butir Soal Nomor ${soal.no}`}
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Edit Butir Soal Nomor {soal.no} ({soal.bentuk})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup editor soal"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label htmlFor="edit-stimulus" className="block font-semibold text-slate-700 mb-1">
              Stimulus / Konteks Permasalahan (Opsional)
            </label>
            <textarea
              id="edit-stimulus"
              rows={3}
              value={stimulus}
              onChange={(e) => setStimulus(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500/30"
            />
          </div>

          <div>
            <label htmlFor="edit-pertanyaan" className="block font-semibold text-slate-700 mb-1">
              Pertanyaan / Pokok Soal *
            </label>
            <textarea
              id="edit-pertanyaan"
              rows={3}
              required
              value={pertanyaan}
              onChange={(e) => setPertanyaan(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500/30"
            />
          </div>

          {opsi && (
            <div className="space-y-2">
              <span className="block font-semibold text-slate-700">Pilihan Jawaban</span>
              <div className="space-y-1.5">
                {Object.entries(opsi).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2">
                    <span className="min-w-8 font-bold text-slate-700">{k}:</span>
                    <input
                      type="text"
                      aria-label={`Opsi ${k}`}
                      value={v}
                      onChange={(e) =>
                        setOpsi((prev) => (prev ? { ...prev, [k]: e.target.value } : prev))
                      }
                      className="flex-1 p-2 border border-slate-300 rounded-lg outline-none text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-kunci" className="block font-semibold text-slate-700 mb-1">
                Kunci Jawaban *
              </label>
              <input
                id="edit-kunci"
                type="text"
                required
                value={kunci}
                onChange={(e) => setKunci(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500/30"
              />
            </div>
            <div>
              <label htmlFor="edit-bobot" className="block font-semibold text-slate-700 mb-1">
                Bobot Skor
              </label>
              <input
                id="edit-bobot"
                type="number"
                min={1}
                max={100}
                value={bobot}
                onChange={(e) => setBobot(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg outline-none tabular-nums focus:ring-2 focus:ring-sky-500/30"
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-pembahasan" className="block font-semibold text-slate-700 mb-1">
              Pembahasan &amp; Penalaran *
            </label>
            <textarea
              id="edit-pembahasan"
              rows={3}
              required
              value={pembahasan}
              onChange={(e) => setPembahasan(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500/30"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-blue hover:bg-sky-700 text-white font-bold rounded-lg"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 id="confirm-modal-title" className="font-bold text-slate-900 text-sm">
              {title}
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-semibold bg-rose-700 hover:bg-rose-800 text-white rounded-lg"
          >
            Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
};
