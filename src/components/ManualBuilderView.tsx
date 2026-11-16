import React, { useEffect, useState } from 'react';
import type {
  AssessmentMeta,
  BloomLevel,
  DifficultyLevel,
  KisiKisiRow,
  QuestionForm,
} from '../types/assessment';
import { ALL_QUESTION_FORMS, getCognitiveCategory } from '../utils/assessmentEngine';

interface ManualBuilderViewProps {
  assessment: AssessmentMeta;
  editingRow: { index: number; data: KisiKisiRow } | null;
  onSaveRow: (row: KisiKisiRow, editIndex: number | null) => void;
  onCancel: () => void;
}

export const ManualBuilderView: React.FC<ManualBuilderViewProps> = ({
  assessment,
  editingRow,
  onSaveRow,
  onCancel,
}) => {
  const [cptp, setCptp] = useState(assessment.kompetensi);
  const [tpipk, setTpipk] = useState('');
  const [materi, setMateri] = useState(assessment.materi);
  const [submateri, setSubmateri] = useState('');
  const [indikator, setIndikator] = useState('');
  const [bloom, setBloom] = useState<BloomLevel>('C4');
  const [kesulitan, setKesulitan] = useState<DifficultyLevel>('Sedang');
  const [bentuk, setBentuk] = useState<QuestionForm>('Pilihan Ganda');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editingRow) {
      setCptp(editingRow.data.cptp);
      setTpipk(editingRow.data.tpipk);
      setMateri(editingRow.data.materi);
      setSubmateri(editingRow.data.submateri);
      setIndikator(editingRow.data.indikator);
      setBloom(editingRow.data.bloom);
      setKesulitan(editingRow.data.kesulitan);
      setBentuk(editingRow.data.bentuk);
    } else {
      setCptp(assessment.kompetensi);
      setTpipk('');
      setMateri(assessment.materi);
      setSubmateri('');
      setIndikator('');
      setBloom('C4');
      setKesulitan('Sedang');
      setBentuk('Pilihan Ganda');
    }
    setErrorMsg(null);
  }, [editingRow, assessment.kompetensi, assessment.materi]);

  const kategori = getCognitiveCategory(bloom);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!indikator.trim()) {
      setErrorMsg('Indikator soal wajib diisi.');
      return;
    }

    onSaveRow(
      {
        no: editingRow ? editingRow.data.no : 1,
        cptp: cptp.trim() || assessment.kompetensi,
        tpipk: tpipk.trim() || 'Menganalisis konsep terkait',
        materi: materi.trim() || assessment.materi,
        submateri: submateri.trim() || 'Materi Pokok',
        indikator: indikator.trim(),
        bloom,
        kategori,
        kesulitan,
        bentuk,
      },
      editingRow ? editingRow.index : null
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5 max-w-4xl">
      <div>
        <h3 className="text-base font-bold text-slate-900">
          {editingRow
            ? `Edit Baris Kisi-Kisi Nomor ${editingRow.data.no}`
            : 'Tambah Baris Kisi-Kisi Manual'}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Tambah atau perbaiki baris kisi-kisi satu per satu dengan kendali penuh.
        </p>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800"
        >
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="md:col-span-2">
          <label htmlFor="m-cptp" className="font-semibold text-slate-700 block mb-1">
            Capaian Pembelajaran (CP) / Kompetensi Dasar (KD)
          </label>
          <textarea
            id="m-cptp"
            rows={2}
            value={cptp}
            onChange={(e) => setCptp(e.target.value)}
            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 outline-none"
            placeholder="Rumusan CP atau KD..."
          />
        </div>

        <div>
          <label htmlFor="m-tpipk" className="font-semibold text-slate-700 block mb-1">
            Tujuan Pembelajaran (TP) / IPK
          </label>
          <textarea
            id="m-tpipk"
            rows={2}
            value={tpipk}
            onChange={(e) => setTpipk(e.target.value)}
            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 outline-none"
            placeholder="Rumusan TP atau IPK..."
          />
        </div>

        <div>
          <label htmlFor="m-indikator" className="font-semibold text-slate-700 block mb-1">
            Indikator Soal (Gunakan KKO) *
          </label>
          <textarea
            id="m-indikator"
            rows={2}
            value={indikator}
            onChange={(e) => {
              setIndikator(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 outline-none"
            placeholder="Disajikan data/kasus, peserta didik mampu..."
          />
        </div>

        <div>
          <label htmlFor="m-materi" className="font-semibold text-slate-700 block mb-1">
            Materi Pokok
          </label>
          <input
            id="m-materi"
            type="text"
            value={materi}
            onChange={(e) => setMateri(e.target.value)}
            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 outline-none"
            placeholder="Contoh: Kebijakan Moneter"
          />
        </div>

        <div>
          <label htmlFor="m-submateri" className="font-semibold text-slate-700 block mb-1">
            Submateri
          </label>
          <input
            id="m-submateri"
            type="text"
            value={submateri}
            onChange={(e) => setSubmateri(e.target.value)}
            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 outline-none"
            placeholder="Contoh: Operasi Pasar Terbuka"
          />
        </div>

        <div>
          <label htmlFor="m-bloom" className="font-semibold text-slate-700 block mb-1">
            Level Kognitif
          </label>
          <select
            id="m-bloom"
            value={bloom}
            onChange={(e) => setBloom(e.target.value as BloomLevel)}
            className="w-full p-2.5 border border-slate-300 rounded-lg bg-white outline-none"
          >
            <option value="C1">C1 - Mengingat</option>
            <option value="C2">C2 - Memahami</option>
            <option value="C3">C3 - Menerapkan</option>
            <option value="C4">C4 - Menganalisis</option>
            <option value="C5">C5 - Mengevaluasi</option>
            <option value="C6">C6 - Menciptakan</option>
          </select>
        </div>

        <div>
          <label htmlFor="m-kategori" className="font-semibold text-slate-700 block mb-1">
            Kategori Kognitif
          </label>
          <input
            id="m-kategori"
            type="text"
            value={kategori}
            readOnly
            className="w-full p-2.5 bg-slate-100 border border-slate-300 rounded-lg outline-none font-bold text-slate-800"
          />
        </div>

        <div>
          <label htmlFor="m-kesulitan" className="font-semibold text-slate-700 block mb-1">
            Tingkat Kesulitan
          </label>
          <select
            id="m-kesulitan"
            value={kesulitan}
            onChange={(e) => setKesulitan(e.target.value as DifficultyLevel)}
            className="w-full p-2.5 border border-slate-300 rounded-lg bg-white outline-none"
          >
            <option value="Mudah">Mudah</option>
            <option value="Sedang">Sedang</option>
            <option value="Sulit">Sulit</option>
          </select>
        </div>

        <div>
          <label htmlFor="m-bentuk" className="font-semibold text-slate-700 block mb-1">
            Bentuk Soal
          </label>
          <select
            id="m-bentuk"
            value={bentuk}
            onChange={(e) => setBentuk(e.target.value as QuestionForm)}
            className="w-full p-2.5 border border-slate-300 rounded-lg bg-white outline-none"
          >
            {ALL_QUESTION_FORMS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition-colors"
          >
            Simpan Baris Kisi-Kisi
          </button>
        </div>
      </form>
    </div>
  );
};
