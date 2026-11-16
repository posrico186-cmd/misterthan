import React from 'react';
import { FileText, Menu, Printer, Save } from 'lucide-react';
import type { AppTab } from '../types/assessment';

interface TopHeaderProps {
  activeTab: AppTab;
  onOpenMobileMenu: () => void;
  onSaveSession: () => void;
  onExportWord: () => void;
  onOpenPrintModal: () => void;
}

const TAB_TITLES: Record<AppTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard Asesmen',
    subtitle: 'Pusat kendali perangkat asesmen terstandar nasional',
  },
  'kisi-kisi-ai': {
    title: 'Generator Kisi-Kisi',
    subtitle: 'Penyusunan tabel rancangan asesmen kurikulum terpadu',
  },
  'soal-ai': {
    title: 'Generator Butir Soal',
    subtitle: 'Penyusunan naskah butir soal lengkap dengan stimulus kontekstual',
  },
  'manual-builder': {
    title: 'Editor Manual Kisi-Kisi',
    subtitle: 'Tambah dan sesuaikan baris kisi-kisi butir per butir',
  },
  'kunci-pembahasan': {
    title: 'Kunci & Pembahasan',
    subtitle: 'Analisis jawaban benar, penalaran pengecoh, dan bobot skor',
  },
  'rubrik-penilaian': {
    title: 'Rubrik Penilaian & Pedoman Penskoran',
    subtitle: 'Instrumen penilaian objektivitas butir pilihan dan uraian',
  },
  'quality-check': {
    title: 'Quality Check Butir Soal',
    subtitle: 'Pemeriksaan kepatuhan asesmen terhadap kaidah evaluasi pendidikan',
  },
  'bank-soal': {
    title: 'Bank Soal & Riwayat Arsip',
    subtitle: 'Penyimpanan persisten seluruh bundel asesmen',
  },
  pengaturan: {
    title: 'Profil Sekolah & Pengaturan',
    subtitle: 'Identitas penandatangan dokumen resmi dan manajemen data lokal',
  },
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  onSaveSession,
  onExportWord,
  onOpenPrintModal,
}) => {
  const { title, subtitle } = TAB_TITLES[activeTab];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Buka menu navigasi"
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
            {title}
          </h2>
          <p className="text-xs text-slate-500 truncate hidden sm:block">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onSaveSession}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
        >
          <Save className="w-3.5 h-3.5 text-slate-600" />
          <span>Simpan Sesi</span>
        </button>
        <button
          type="button"
          onClick={onExportWord}
          className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Unduh Word</span>
        </button>
        <button
          type="button"
          onClick={onOpenPrintModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-brand-navy hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <Printer className="w-3.5 h-3.5 text-brand-cyan" />
          <span>Cetak / PDF</span>
        </button>
      </div>
    </header>
  );
};
