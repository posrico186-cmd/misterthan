import React from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw, XCircle } from 'lucide-react';
import type { QualityCheckItem } from '../types/assessment';

interface QualityCheckViewProps {
  items: QualityCheckItem[];
  validCount: number;
  revisiCount: number;
  invalidCount: number;
  overallScore: number;
  onRevalidate: () => void;
}

export const QualityCheckView: React.FC<QualityCheckViewProps> = ({
  items,
  validCount,
  revisiCount,
  invalidCount,
  overallScore,
  onRevalidate,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Quality Check &amp; Validasi Butir Asesmen
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pemeriksaan kualitas terhadap stimulus, kata kerja operasional, opsi, dan kesesuaian
            level kognitif.
          </p>
        </div>
        <button
          type="button"
          onClick={onRevalidate}
          className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Uji Ulang Kualitas</span>
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-slate-500 py-8 text-center">
          Belum ada butir soal untuk diperiksa. Buat atau muat soal terlebih dahulu.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-950">
              <span className="text-xs font-semibold">Skor Kelayakan</span>
              <p className="text-2xl font-bold mt-1 tabular-nums">{overallScore} / 100</p>
              <p className="text-xs text-teal-800 mt-1">
                {overallScore >= 85 ? 'Status: Siap Digunakan' : 'Status: Perlu Tinjauan'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
              <span className="text-xs font-semibold">Butir Valid</span>
              <p className="text-2xl font-bold mt-1 tabular-nums">{validCount}</p>
              <p className="text-xs text-emerald-800 mt-1">Sesuai Indikator &amp; KKO</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950">
              <span className="text-xs font-semibold">Perlu Revisi Kecil</span>
              <p className="text-2xl font-bold mt-1 tabular-nums">{revisiCount}</p>
              <p className="text-xs text-amber-800 mt-1">Rekomendasi stimulus/KKO</p>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950">
              <span className="text-xs font-semibold">Tidak Sesuai</span>
              <p className="text-2xl font-bold mt-1 tabular-nums">{invalidCount}</p>
              <p className="text-xs text-rose-800 mt-1">Opsi atau kunci kurang</p>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <strong>Catatan Penjaminan Mutu Pendidik:</strong>
              <p className="mt-0.5 text-amber-800">
                Pemeriksaan kualitas otomatis bertindak sebagai alat bantu telaah butir soal.
                Validitas isi akhir tetap berada di bawah telaah profesional guru mata pelajaran.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {items.map((qc) => {
              const StatusIcon =
                qc.status === 'Valid'
                  ? CheckCircle2
                  : qc.status === 'Perlu Revisi'
                    ? AlertTriangle
                    : XCircle;
              const statusStyle =
                qc.status === 'Valid'
                  ? 'text-emerald-800'
                  : qc.status === 'Perlu Revisi'
                    ? 'text-amber-800'
                    : 'text-rose-800';

              return (
                <div
                  key={qc.no}
                  className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900 tabular-nums">
                      Telaah Butir Soal Nomor {qc.no}
                    </span>
                    <span className={`inline-flex items-center gap-1 font-bold ${statusStyle}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{qc.status}</span>
                    </span>
                  </div>
                  <div className="space-y-1">
                    <strong className="text-slate-700">Analisis Kualitas:</strong>
                    <ul className="list-disc pl-5 text-slate-600 space-y-0.5">
                      {qc.issues.map((iss, i) => (
                        <li key={i}>{iss}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-1 text-xs text-teal-800">
                    <strong>Rekomendasi:</strong> {qc.rekomendasi}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
