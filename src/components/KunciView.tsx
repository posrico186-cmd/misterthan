import React from 'react';
import { Printer } from 'lucide-react';
import type { QuestionItem } from '../types/assessment';

interface KunciViewProps {
  soalList: QuestionItem[];
  onPrintKunciOnly: () => void;
}

export const KunciView: React.FC<KunciViewProps> = ({ soalList, onPrintKunciOnly }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Kunci Jawaban, Pembahasan Lengkap &amp; Analisis Pengecoh
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Dilengkapi alasan jawaban benar, analisis pengecoh, dan bobot penskoran.
          </p>
        </div>
        <button
          type="button"
          onClick={onPrintKunciOnly}
          className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Cetak Kunci Saja</span>
        </button>
      </div>

      {soalList.length === 0 ? (
        <p className="text-xs text-slate-500 py-6 text-center">
          Belum ada kunci jawaban. Generate soal terlebih dahulu.
        </p>
      ) : (
        <div className="space-y-4">
          {soalList.map((soal) => (
            <div
              key={soal.no}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900 tabular-nums">
                  Nomor {soal.no} · {soal.bentuk}
                </span>
                <span className="font-mono font-bold text-emerald-800">
                  Kunci: {soal.kunci}
                </span>
              </div>
              <div>
                <strong className="text-slate-800">Alasan &amp; Pembahasan:</strong>
                <p className="text-slate-600 mt-1 leading-relaxed">{soal.pembahasan}</p>
              </div>
              <div className="text-xs text-slate-500 tabular-nums">
                <strong>Bobot Skor:</strong> {soal.bobot || 10} Poin
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
