import React from 'react';
import type { TeacherSignOff } from '../types/assessment';

interface SettingsViewProps {
  signOff: TeacherSignOff;
  onChangeSignOff: (next: TeacherSignOff) => void;
  onSaveSignOff: () => void;
  onResetAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  signOff,
  onChangeSignOff,
  onSaveSignOff,
  onResetAllData,
}) => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Profil Penandatangan Dokumen Resmi (A4 &amp; Word)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Data ini ditampilkan otomatis pada bagian lembar pengesahan saat mencetak PDF atau
            mengunduh dokumen Word.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSaveSignOff();
          }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs"
        >
          <div className="sm:col-span-2">
            <label htmlFor="cfg-kota" className="block font-semibold text-slate-700 mb-1">
              Kota / Kabupaten Penetapan
            </label>
            <input
              id="cfg-kota"
              type="text"
              value={signOff.kota}
              onChange={(e) => onChangeSignOff({ ...signOff, kota: e.target.value })}
              placeholder="Contoh: Malang"
              className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500/30"
            />
          </div>

          <div>
            <label htmlFor="cfg-kepsek" className="block font-semibold text-slate-700 mb-1">
              Nama Kepala Sekolah
            </label>
            <input
              id="cfg-kepsek"
              type="text"
              value={signOff.namaKepalaSekolah}
              onChange={(e) =>
                onChangeSignOff({ ...signOff, namaKepalaSekolah: e.target.value })
              }
              placeholder="Opsional (kosongkan untuk garis titik-titik)"
              className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500/30"
            />
          </div>

          <div>
            <label htmlFor="cfg-nip-kepsek" className="block font-semibold text-slate-700 mb-1">
              NIP Kepala Sekolah
            </label>
            <input
              id="cfg-nip-kepsek"
              type="text"
              value={signOff.nipKepalaSekolah}
              onChange={(e) =>
                onChangeSignOff({ ...signOff, nipKepalaSekolah: e.target.value })
              }
              placeholder="Contoh: 19750412 200003 1 002"
              className="w-full p-2.5 border border-slate-300 rounded-lg outline-none font-mono focus:ring-2 focus:ring-sky-500/30"
            />
          </div>

          <div>
            <label htmlFor="cfg-guru" className="block font-semibold text-slate-700 mb-1">
              Nama Guru Mata Pelajaran
            </label>
            <input
              id="cfg-guru"
              type="text"
              value={signOff.namaGuru}
              onChange={(e) => onChangeSignOff({ ...signOff, namaGuru: e.target.value })}
              placeholder="Opsional (kosongkan untuk garis titik-titik)"
              className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500/30"
            />
          </div>

          <div>
            <label htmlFor="cfg-nip-guru" className="block font-semibold text-slate-700 mb-1">
              NIP Guru Mata Pelajaran
            </label>
            <input
              id="cfg-nip-guru"
              type="text"
              value={signOff.nipGuru}
              onChange={(e) => onChangeSignOff({ ...signOff, nipGuru: e.target.value })}
              placeholder="Contoh: 19860815 201001 2 005"
              className="w-full p-2.5 border border-slate-300 rounded-lg outline-none font-mono focus:ring-2 focus:ring-sky-500/30"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-brand-navy hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors"
            >
              Simpan Profil Penandatangan
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div>
          <strong className="text-slate-900 text-sm block">
            Reset Seluruh Penyimpanan Aplikasi
          </strong>
          <p className="text-slate-500 mt-0.5">
            Hapus seluruh bank soal dan pengaturan lokal yang tersimpan di browser ini.
          </p>
        </div>
        <button
          type="button"
          onClick={onResetAllData}
          className="px-4 py-2 bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 font-semibold rounded-lg whitespace-nowrap"
        >
          Hapus Semua Data
        </button>
      </div>
    </div>
  );
};
