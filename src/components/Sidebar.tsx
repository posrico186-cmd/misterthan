import React from 'react';
import {
  Award,
  BrainCircuit,
  Database,
  FileCheck2,
  LayoutDashboard,
  PenTool,
  Settings,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import type { AppTab } from '../types/assessment';

interface SidebarProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  bankCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: Array<{
  id: AppTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, iconColor: 'text-sky-400' },
  {
    id: 'kisi-kisi-ai',
    label: 'Generator Kisi-Kisi',
    icon: BrainCircuit,
    iconColor: 'text-cyan-300',
  },
  { id: 'soal-ai', label: 'Generator Soal', icon: Sparkles, iconColor: 'text-amber-400' },
  {
    id: 'manual-builder',
    label: 'Editor Manual Kisi-Kisi',
    icon: PenTool,
    iconColor: 'text-emerald-400',
  },
  {
    id: 'kunci-pembahasan',
    label: 'Kunci & Pembahasan',
    icon: FileCheck2,
    iconColor: 'text-indigo-400',
  },
  { id: 'rubrik-penilaian', label: 'Rubrik Penilaian', icon: Award, iconColor: 'text-rose-400' },
  {
    id: 'quality-check',
    label: 'Quality Check',
    icon: ShieldCheck,
    iconColor: 'text-teal-400',
  },
  {
    id: 'bank-soal',
    label: 'Bank Soal & Riwayat',
    icon: Database,
    iconColor: 'text-blue-400',
  },
  {
    id: 'pengaturan',
    label: 'Profil & Pengaturan',
    icon: Settings,
    iconColor: 'text-slate-400',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  bankCount,
  mobileOpen,
  onCloseMobile,
}) => {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/60 md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-brand-dark text-slate-200 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 md:static md:translate-x-0 shrink-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navigasi Utama"
      >
        <div>
          <div className="p-5 border-b border-slate-800 bg-brand-navy/70 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl border-2 border-brand-cyan bg-brand-dark flex items-center justify-center p-1 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
                  <rect
                    x="5"
                    y="5"
                    width="90"
                    height="90"
                    fill="none"
                    stroke="#00F0FF"
                    strokeWidth="7"
                    rx="6"
                  />
                  <rect x="25" y="24" width="10" height="10" fill="#00F0FF" />
                  <rect x="25" y="42" width="10" height="34" fill="#00F0FF" />
                  <path
                    d="M47 76 V 28 L 62 55 L 77 28 V 76"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold tracking-wider text-brand-cyan block truncate">
                  I'M LIBRARY
                </span>
                <h1 className="font-bold text-sm tracking-tight text-white truncate">
                  ASSESSMENT PRO AI
                </h1>
                <p className="text-xs text-slate-400 truncate">Digital Learning Hub</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Tutup menu navigasi"
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-5 py-3 bg-slate-900/80 border-b border-slate-800/80">
            <p className="text-xs leading-snug text-slate-300">
              Solusi cerdas menyusun kisi-kisi dan butir soal terstandar.
            </p>
          </div>

          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-cyan' : item.iconColor}`}
                  />
                  <span className="truncate">{item.label}</span>
                  {item.id === 'bank-soal' && (
                    <span className="ml-auto text-xs font-mono tabular-nums text-slate-400">
                      {bankCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 text-xs text-slate-400 bg-brand-dark">
          <p className="truncate">Standar Evaluasi Kurikulum Merdeka & K13</p>
        </div>
      </aside>
    </>
  );
};
