import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { QuestionItem } from '../types/assessment';

interface SoalViewProps {
  soalList: QuestionItem[];
  isGeneratingSoal: boolean;
  regeneratingIndex: number | null;
  onRegenerateAll: () => void;
  onRunQualityCheck: () => void;
  onEditSoal: (index: number) => void;
  onRegenerateSingle: (index: number) => void;
  onGoToKisiKisi: () => void;
}

export const SoalView: React.FC<SoalViewProps> = ({
  soalList,
  isGeneratingSoal,
  regeneratingIndex,
  onRegenerateAll,
  onRunQualityCheck,
  onEditSoal,
  onRegenerateSingle,
  onGoToKisiKisi,
}) => {
  const [openPembahasan, setOpenPembahasan] = useState<Record<number, boolean>>({});

  const togglePembahasan = (no: number) => {
    setOpenPembahasan((prev) => ({ ...prev, [no]: !prev[no] }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Naskah Butir Soal Terintegrasi</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Soal disinkronkan langsung dari tabel kisi-kisi dengan stimulus kontekstual.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onRegenerateAll}
            disabled={isGeneratingSoal}
            className="px-4 py-2 bg-brand-blue hover:bg-sky-700 disabled:opacity-60 text-white font-semibold text-xs rounded-lg inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            {isGeneratingSoal ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>{isGeneratingSoal ? 'Membuat Ulang...' : 'Regenerate Seluruh Soal'}</span>
          </button>
          <button
            type="button"
            onClick={onRunQualityCheck}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Jalankan Quality Check</span>
          </button>
        </div>
      </div>

      {soalList.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-300 space-y-3">
          <Sparkles className="w-9 h-9 mx-auto text-amber-500" />
          <h4 className="text-sm font-bold text-slate-800">Soal Belum Dibuat</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Susun kisi-kisi terlebih dahulu di menu <strong>Generator Kisi-Kisi</strong>, lalu
            tekan tombol <em>Generate Soal dari Kisi-Kisi</em>.
          </p>
          <button
            type="button"
            onClick={onGoToKisiKisi}
            className="px-4 py-2 bg-brand-blue hover:bg-sky-700 text-white text-xs font-semibold rounded-lg"
          >
            Buka Generator Kisi-Kisi
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {soalList.map((soal, idx) => {
            const isExpanded = Boolean(openPembahasan[soal.no]);
            const isRegeneratingThis = regeneratingIndex === idx;
            return (
              <article
                key={`${soal.no}-${idx}`}
                className="bg-white p-6 rounded-xl border border-slate-200 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="w-7 h-7 rounded-lg bg-brand-navy text-brand-cyan flex items-center justify-center font-bold tabular-nums">
                      {soal.no}
                    </span>
                    <span className="font-bold text-slate-900">{soal.bentuk}</span>
                    <span aria-hidden="true" className="text-slate-300">
                      ·
                    </span>
                    <span className="font-mono font-semibold text-slate-600">
                      {soal.bloom} / {soal.kategori}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">
                      ·
                    </span>
                    <span className="text-slate-600 tabular-nums">Bobot {soal.bobot || 10}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEditSoal(idx)}
                      aria-label={`Edit butir soal nomor ${soal.no}`}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 rounded-lg border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Edit className="w-3.5 h-3.5 text-sky-600" />
                      <span>Edit Soal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onRegenerateSingle(idx)}
                      disabled={isRegeneratingThis}
                      aria-label={`Buat variasi baru soal nomor ${soal.no}`}
                      className="px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 rounded-lg border border-amber-200 inline-flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
                    >
                      {isRegeneratingThis ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5" />
                      )}
                      <span>Variasi AI</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <strong className="text-slate-800">Indikator:</strong> {soal.indikator}
                </p>

                {soal.stimulus && (
                  <div className="p-3.5 bg-sky-50/50 rounded-lg border border-sky-200/80 text-xs text-slate-800 leading-relaxed space-y-1">
                    <span className="font-bold text-sky-900 block">Stimulus Kontekstual</span>
                    <p>{soal.stimulus}</p>
                  </div>
                )}

                <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                  {soal.pertanyaan}
                </p>

                {soal.opsi && Object.keys(soal.opsi).length > 0 && (
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {Object.entries(soal.opsi).map(([k, v]) => {
                      const isCorrect =
                        soal.kunci === k ||
                        soal.kunci
                          .split(/[\s,|]+/)
                          .map((part) => part.trim())
                          .includes(k);
                      return (
                        <div
                          key={k}
                          className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                            isCorrect
                              ? 'border-emerald-300 bg-emerald-50/50 text-emerald-950 font-medium'
                              : 'border-slate-200 bg-slate-50/40 text-slate-700'
                          }`}
                        >
                          <span
                            className={`min-w-6 h-6 px-1.5 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                              isCorrect
                                ? 'bg-emerald-700 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {k}
                          </span>
                          <span className="flex-1 pt-0.5">{v}</span>
                          {isCorrect && (
                            <span className="text-xs font-bold text-emerald-800 shrink-0 pt-0.5">
                              Kunci
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="text-slate-700">
                    <strong className="text-emerald-800">Kunci Jawaban:</strong>{' '}
                    <span className="font-bold text-slate-900">{soal.kunci}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePembahasan(soal.no)}
                    aria-expanded={isExpanded}
                    className="text-sky-700 hover:text-sky-800 font-semibold text-xs inline-flex items-center gap-1"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                    <span>{isExpanded ? 'Tutup Pembahasan' : 'Lihat Pembahasan'}</span>
                  </button>
                </div>

                {isExpanded && (
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
                    <strong className="text-slate-900 block">
                      Pembahasan Lengkap &amp; Penalaran
                    </strong>
                    <p className="leading-relaxed">{soal.pembahasan}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
