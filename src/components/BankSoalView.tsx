import React, { useState } from 'react';
import { Download, FolderOpen, Inbox, Trash2, Upload } from 'lucide-react';
import type { BankItem } from '../types/assessment';
import { filterBankItems } from '../utils/assessmentEngine';

interface BankSoalViewProps {
  bankSoal: BankItem[];
  onSaveCurrentSession: () => void;
  onRestoreItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
}

export const BankSoalView: React.FC<BankSoalViewProps> = ({
  bankSoal,
  onSaveCurrentSession,
  onRestoreItem,
  onDeleteItem,
  onExportJson,
  onImportJson,
}) => {
  const [keyword, setKeyword] = useState('');
  const [jenjangFilter, setJenjangFilter] = useState('');
  const [kurikulumFilter, setKurikulumFilter] = useState('');

  const filtered = filterBankItems(bankSoal, keyword, jenjangFilter, kurikulumFilter);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Bank Soal &amp; Riwayat Asesmen
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Arsip paket asesmen yang tersimpan secara persisten di perangkat Anda.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSaveCurrentSession}
            className="px-3.5 py-2 text-xs font-semibold bg-brand-navy hover:bg-slate-800 text-white rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>Simpan Sesi Aktif</span>
          </button>
          <button
            type="button"
            onClick={onExportJson}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup JSON</span>
          </button>
          <label className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
            <Upload className="w-3.5 h-3.5" />
            <span>Restore JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImportJson(file);
                e.currentTarget.value = '';
              }}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <input
          type="text"
          aria-label="Cari berdasarkan mata pelajaran atau materi"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Cari berdasarkan mapel / materi..."
          className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500/30"
        />
        <select
          aria-label="Filter berdasarkan jenjang"
          value={jenjangFilter}
          onChange={(e) => setJenjangFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white"
        >
          <option value="">Semua Jenjang</option>
          <option value="SD">SD</option>
          <option value="SMP">SMP</option>
          <option value="SMA">SMA</option>
          <option value="SMK">SMK</option>
        </select>
        <select
          aria-label="Filter berdasarkan kurikulum"
          value={kurikulumFilter}
          onChange={(e) => setKurikulumFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white"
        >
          <option value="">Semua Kurikulum</option>
          <option value="Merdeka">Kurikulum Merdeka</option>
          <option value="K13">Kurikulum 2013</option>
          <option value="Nasional">Kurikulum Nasional</option>
        </select>
      </div>

      {bankSoal.length === 0 ? (
        <div className="p-10 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl space-y-2">
          <Inbox className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-xs">
            Bank soal masih kosong. Klik tombol <strong>Simpan Sesi</strong> di bagian atas untuk
            mengarsipkan paket asesmen aktif.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl">
          <p className="text-xs">Tidak ada arsip yang cocok dengan filter pencarian.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-sky-300 transition-colors flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-slate-900 text-sm">
                    {item.assessment.mapel} — {item.assessment.kelas}
                  </strong>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span className="text-slate-600">{item.assessment.jenjang}</span>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span className="font-semibold text-sky-800">
                    Kurikulum {item.assessment.kurikulum}
                  </span>
                </div>
                <p className="text-slate-600">{item.assessment.materi}</p>
                <p className="text-xs text-slate-400 font-mono tabular-nums">
                  {item.date} · {item.kisiKisi.length} Kisi-kisi · {item.soalList.length} Soal
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onRestoreItem(item.id)}
                  aria-label={`Buka arsip ${item.assessment.mapel} ${item.assessment.kelas}`}
                  className="px-3.5 py-2 bg-brand-navy hover:bg-slate-800 text-white font-semibold rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>Buka</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteItem(item.id)}
                  aria-label={`Hapus arsip ${item.assessment.mapel} ${item.assessment.kelas}`}
                  className="p-2 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
