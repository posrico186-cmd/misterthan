import React from 'react';
import {
  Archive,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  FileSpreadsheet,
  ListChecks,
  PlayCircle,
} from 'lucide-react';
import type { AssessmentMeta, KisiKisiRow, PresetKey } from '../types/assessment';
import { computeBloomDistribution } from '../utils/assessmentEngine';

interface DashboardViewProps {
  assessment: AssessmentMeta;
  kisiKisi: KisiKisiRow[];
  soalCount: number;
  qcOverallScore: number;
  bankCount: number;
  onNavigateTab: (tab: 'kisi-kisi-ai' | 'soal-ai' | 'quality-check' | 'bank-soal') => void;
  onLoadPreset: (preset: PresetKey) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  assessment,
  kisiKisi,
  soalCount,
  qcOverallScore,
  bankCount,
  onNavigateTab,
  onLoadPreset,
}) => {
  const dist = computeBloomDistribution(kisiKisi);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-brand-dark via-brand-navy to-sky-950 p-6 sm:p-8 text-white border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-3">
          <p className="text-xs font-semibold text-brand-cyan tracking-wide">
            Kurikulum Merdeka &amp; K-13 · Taksonomi Bloom Revisi
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-balance">
            Penyusunan Asesmen Berkualitas Tinggi, Terukur &amp; Otomatis
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Membantu pendidik jenjang SD, SMP, SMA, dan SMK merumuskan kisi-kisi terstandar, soal
            LOTS/MOTS/HOTS, kunci jawaban akurat, serta rubrik penilaian dalam satu alur kerja
            terintegrasi.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigateTab('kisi-kisi-ai')}
              className="px-4 py-2.5 bg-brand-cyan text-brand-dark font-bold text-xs rounded-lg hover:bg-cyan-300 transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Buat Kisi-Kisi Baru</span>
            </button>
            <button
              type="button"
              onClick={() => onLoadPreset('sma_ekonomi')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg border border-white/20 transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <PlayCircle className="w-4 h-4 text-sky-300" />
              <span>Muat Contoh SMA Ekonomi</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Baris Kisi-Kisi</p>
            <p className="text-xl font-bold text-slate-900 tabular-nums" data-testid="stat-kisi">
              {kisiKisi.length}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <ListChecks className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Soal Tersedia</p>
            <p className="text-xl font-bold text-slate-900 tabular-nums" data-testid="stat-soal">
              {soalCount}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Kelayakan Soal</p>
            <p className="text-xl font-bold text-slate-900 tabular-nums" data-testid="stat-qc">
              {soalCount > 0 ? `${qcOverallScore}%` : '-'}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Bank Tersimpan</p>
            <p className="text-xl font-bold text-slate-900 tabular-nums" data-testid="stat-bank">
              {bankCount}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Identitas Asesmen Aktif</h3>
              <span className="text-xs font-semibold text-sky-700">
                Kurikulum {assessment.kurikulum}
              </span>
            </div>
            <dl className="space-y-2.5 text-xs">
              <div className="flex justify-between gap-3 py-1 border-b border-slate-100">
                <dt className="text-slate-500 shrink-0">Satuan Pendidikan</dt>
                <dd className="font-semibold text-slate-900 text-right truncate">
                  {assessment.sekolah}
                </dd>
              </div>
              <div className="flex justify-between gap-3 py-1 border-b border-slate-100">
                <dt className="text-slate-500 shrink-0">Jenjang / Kelas</dt>
                <dd className="font-semibold text-slate-900 text-right truncate">
                  {assessment.jenjang} / {assessment.kelas} ({assessment.faseJurusan})
                </dd>
              </div>
              <div className="flex justify-between gap-3 py-1 border-b border-slate-100">
                <dt className="text-slate-500 shrink-0">Mata Pelajaran</dt>
                <dd className="font-semibold text-slate-900 text-right truncate">
                  {assessment.mapel}
                </dd>
              </div>
              <div className="flex justify-between gap-3 py-1 border-b border-slate-100">
                <dt className="text-slate-500 shrink-0">Materi Pokok</dt>
                <dd className="font-semibold text-slate-900 text-right truncate">
                  {assessment.materi}
                </dd>
              </div>
              <div className="flex justify-between gap-3 py-1">
                <dt className="text-slate-500 shrink-0">Jenis Asesmen</dt>
                <dd className="font-semibold text-slate-900 text-right truncate">
                  {assessment.jenisAsesmen}
                </dd>
              </div>
            </dl>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('kisi-kisi-ai')}
            className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
          >
            Ubah Parameter Asesmen
          </button>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">
                Distribusi Kognitif Bloom (C1–C6)
              </h3>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                {kisiKisi.length} Butir
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="font-medium text-slate-700">LOTS (C1 Mengingat, C2 Memahami)</span>
                  <span className="font-bold text-slate-900 tabular-nums">{dist.lotsPct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all"
                    style={{ width: `${dist.lotsPct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="font-medium text-slate-700">MOTS (C3 Menerapkan)</span>
                  <span className="font-bold text-slate-900 tabular-nums">{dist.motsPct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-sky-600 h-2 rounded-full transition-all"
                    style={{ width: `${dist.motsPct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="font-medium text-slate-700">
                    HOTS (C4 Analisis, C5 Evaluasi, C6 Kreasi)
                  </span>
                  <span className="font-bold text-slate-900 tabular-nums">{dist.hotsPct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${dist.hotsPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Distribusi menyesuaikan taksonomi Bloom pada setiap baris kisi-kisi aktif.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
            Preset Skenario Contoh
          </h3>
          <p className="text-xs text-slate-500">
            Muat langsung perangkat asesmen lengkap untuk jenjang berbeda:
          </p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => onLoadPreset('sd_mat')}
              className="w-full p-3 rounded-lg border border-slate-200 text-left hover:border-sky-400 hover:bg-sky-50/40 transition-colors flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <span className="font-bold text-xs text-slate-900 block">
                  SD Kelas 5 - Matematika
                </span>
                <span className="text-xs text-slate-500 block truncate">
                  Pecahan &amp; Desimal (Literasi Numerasi)
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => onLoadPreset('smp_infor')}
              className="w-full p-3 rounded-lg border border-slate-200 text-left hover:border-sky-400 hover:bg-sky-50/40 transition-colors flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <span className="font-bold text-xs text-slate-900 block">
                  SMP Kelas 8 - Informatika
                </span>
                <span className="text-xs text-slate-500 block truncate">
                  Berpikir Komputasional &amp; Algoritma
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => onLoadPreset('smk_tkj')}
              className="w-full p-3 rounded-lg border border-slate-200 text-left hover:border-sky-400 hover:bg-sky-50/40 transition-colors flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <span className="font-bold text-xs text-slate-900 block">
                  SMK Kelas 11 - Kejuruan TJKT
                </span>
                <span className="text-xs text-slate-500 block truncate">
                  Administrasi Jaringan &amp; Subnetting
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
