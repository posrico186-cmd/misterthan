import React from 'react';
import type { QuestionItem } from '../types/assessment';
import { computeRubrikSummary } from '../utils/assessmentEngine';

interface RubrikViewProps {
  soalList: QuestionItem[];
}

export const RubrikView: React.FC<RubrikViewProps> = ({ soalList }) => {
  const summary = computeRubrikSummary(soalList);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Pedoman Penskoran &amp; Rubrik Penilaian
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Standar objektivitas penilaian berbasis kriteria dan konversi skor 100.
          </p>
        </div>
        <div className="bg-sky-50 text-sky-900 border border-sky-200 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold">
          Nilai = (Skor Perolehan / Skor Maksimal) × 100
        </div>
      </div>

      {soalList.length === 0 ? (
        <p className="text-xs text-slate-500 py-6 text-center">
          Belum ada instrumen rubrik penilaian. Generate soal terlebih dahulu.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500">Total Skor Maksimal Instrumen</span>
              <p className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
                {summary.totalBobot} Poin
              </p>
            </div>
            <div>
              <span className="text-slate-500">Bobot Pilihan Ganda</span>
              <p className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
                {summary.pctPG}% ({summary.bobotPG} Poin)
              </p>
            </div>
            <div>
              <span className="text-slate-500">Bobot Uraian / Kompleks</span>
              <p className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
                {summary.pctLainnya}% ({summary.bobotLainnya} Poin)
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {soalList.map((soal) => (
              <div
                key={soal.no}
                className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-slate-900 tabular-nums">
                    Soal Nomor {soal.no} · {soal.bentuk}
                  </strong>
                  <span className="text-xs font-bold text-rose-700 tabular-nums">
                    Maks: {soal.bobot || 10} Skor
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-slate-700 whitespace-pre-line border border-slate-200 leading-relaxed font-mono text-xs">
                  {soal.rubrik || 'Pilihan Ganda: Benar skor penuh, salah skor 0.'}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
