import React from 'react';
import {
  Copy,
  Edit3,
  FileSpreadsheet,
  Info,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Wand2,
} from 'lucide-react';
import type {
  AssessmentMeta,
  BloomPreset,
  Jenjang,
  KisiKisiRow,
  Kurikulum,
  QuestionForm,
} from '../types/assessment';
import {
  ALL_QUESTION_FORMS,
  getDefaultFaseByJenjang,
  KELAS_OPTIONS,
  MAPEL_OPTIONS,
} from '../utils/assessmentEngine';

interface KisiKisiViewProps {
  assessment: AssessmentMeta;
  kisiKisi: KisiKisiRow[];
  bloomPreset: BloomPreset;
  isGeneratingKisi: boolean;
  isGeneratingSoal: boolean;
  isDraftingCpTp: boolean;
  showAiDraftNote: boolean;
  onChangeAssessment: (next: AssessmentMeta) => void;
  onChangeBloomPreset: (preset: BloomPreset) => void;
  onDraftCpTp: () => void;
  onResetForm: () => void;
  onGenerateKisi: () => void;
  onGenerateSoal: () => void;
  onExportExcel: () => void;
  onAddNewRow: () => void;
  onEditRow: (index: number) => void;
  onDuplicateRow: (index: number) => void;
  onDeleteRow: (index: number) => void;
}

export const KisiKisiView: React.FC<KisiKisiViewProps> = ({
  assessment,
  kisiKisi,
  bloomPreset,
  isGeneratingKisi,
  isGeneratingSoal,
  isDraftingCpTp,
  showAiDraftNote,
  onChangeAssessment,
  onChangeBloomPreset,
  onDraftCpTp,
  onResetForm,
  onGenerateKisi,
  onGenerateSoal,
  onExportExcel,
  onAddNewRow,
  onEditRow,
  onDuplicateRow,
  onDeleteRow,
}) => {
  const mapelList = MAPEL_OPTIONS[assessment.jenjang];
  const isCustomMapel = !mapelList.includes(assessment.mapel);
  const faseInfo = getDefaultFaseByJenjang(assessment.jenjang);

  const handleJenjangChange = (jenjang: Jenjang) => {
    const kelasList = KELAS_OPTIONS[jenjang];
    const newMapelList = MAPEL_OPTIONS[jenjang];
    const { defaultValue } = getDefaultFaseByJenjang(jenjang);
    onChangeAssessment({
      ...assessment,
      jenjang,
      kelas: kelasList[0] ?? 'Kelas 1',
      mapel: newMapelList[0] ?? assessment.mapel,
      faseJurusan: defaultValue,
    });
  };

  const handleToggleForm = (form: QuestionForm) => {
    const exists = assessment.bentukSoalList.includes(form);
    const next = exists
      ? assessment.bentukSoalList.filter((f) => f !== form)
      : [...assessment.bentukSoalList, form];
    onChangeAssessment({ ...assessment, bentukSoalList: next });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Formulir Identitas &amp; Parameter Asesmen
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Lengkapi identitas kurikulum untuk menyusun rancangan kisi-kisi terukur.
            </p>
          </div>
          <button
            type="button"
            onClick={onResetForm}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Reset Form
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onGenerateKisi();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="inp-sekolah"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Nama Satuan Pendidikan
              </label>
              <input
                id="inp-sekolah"
                type="text"
                value={assessment.sekolah}
                onChange={(e) =>
                  onChangeAssessment({ ...assessment, sekolah: e.target.value })
                }
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 outline-none"
                placeholder="Contoh: SMP Negeri 2 Kota"
              />
            </div>

            <div>
              <label
                htmlFor="inp-jenjang"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Jenjang Pendidikan
              </label>
              <select
                id="inp-jenjang"
                value={assessment.jenjang}
                onChange={(e) => handleJenjangChange(e.target.value as Jenjang)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 outline-none bg-white"
              >
                <option value="SD">SD / MI (Sekolah Dasar)</option>
                <option value="SMP">SMP / MTs (Sekolah Menengah Pertama)</option>
                <option value="SMA">SMA / MA (Sekolah Menengah Atas)</option>
                <option value="SMK">SMK / MAK (Kejuruan)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="inp-kurikulum"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Kurikulum Acuan
              </label>
              <select
                id="inp-kurikulum"
                value={assessment.kurikulum}
                onChange={(e) =>
                  onChangeAssessment({
                    ...assessment,
                    kurikulum: e.target.value as Kurikulum,
                  })
                }
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 outline-none bg-white"
              >
                <option value="Merdeka">Kurikulum Merdeka</option>
                <option value="K13">Kurikulum 2013 (K-13 Revisi)</option>
                <option value="Nasional">Kurikulum Nasional Terstandar</option>
                <option value="Lainnya">Kurikulum Khusus / Lainnya</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="inp-kelas"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Kelas
              </label>
              <select
                id="inp-kelas"
                value={assessment.kelas}
                onChange={(e) =>
                  onChangeAssessment({ ...assessment, kelas: e.target.value })
                }
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 outline-none bg-white"
              >
                {KELAS_OPTIONS[assessment.jenjang].map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="inp-fase-jurusan"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                {faseInfo.label}
              </label>
              <input
                id="inp-fase-jurusan"
                type="text"
                value={assessment.faseJurusan}
                onChange={(e) =>
                  onChangeAssessment({ ...assessment, faseJurusan: e.target.value })
                }
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 outline-none"
                placeholder="Fase A-F atau Konsentrasi Keahlian"
              />
            </div>

            <div>
              <label
                htmlFor="inp-semester"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Semester &amp; Tahun Ajaran
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  id="inp-semester"
                  value={assessment.semester}
                  onChange={(e) =>
                    onChangeAssessment({
                      ...assessment,
                      semester: e.target.value as 'Ganjil' | 'Genap',
                    })
                  }
                  className="text-xs px-2.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 outline-none bg-white"
                >
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
                <input
                  id="inp-tahun"
                  aria-label="Tahun Ajaran"
                  type="text"
                  value={assessment.tahun}
                  onChange={(e) =>
                    onChangeAssessment({ ...assessment, tahun: e.target.value })
                  }
                  className="text-xs px-2.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 outline-none tabular-nums"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="inp-mapel"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Mata Pelajaran
              </label>
              <div className="space-y-1.5">
                <select
                  id="inp-mapel"
                  value={isCustomMapel ? '__custom__' : assessment.mapel}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__custom__') {
                      onChangeAssessment({ ...assessment, mapel: '' });
                    } else {
                      onChangeAssessment({ ...assessment, mapel: val });
                    }
                  }}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 outline-none bg-white"
                >
                  {mapelList.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                  <option value="__custom__">+ Input Mapel Manual / Khusus...</option>
                </select>
                {isCustomMapel && (
                  <input
                    id="inp-mapel-custom"
                    aria-label="Nama mata pelajaran khusus"
                    type="text"
                    value={assessment.mapel}
                    onChange={(e) =>
                      onChangeAssessment({ ...assessment, mapel: e.target.value })
                    }
                    placeholder="Ketik nama mata pelajaran..."
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 outline-none"
                  />
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="inp-jenis-asesmen"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Jenis Asesmen
              </label>
              <select
                id="inp-jenis-asesmen"
                value={assessment.jenisAsesmen}
                onChange={(e) =>
                  onChangeAssessment({ ...assessment, jenisAsesmen: e.target.value })
                }
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 outline-none bg-white"
              >
                <option value="Sumatif Akhir Semester (SAS)">
                  Sumatif Akhir Semester (SAS / PAS)
                </option>
                <option value="Sumatif Tengah Semester (STS)">
                  Sumatif Tengah Semester (STS / PTS)
                </option>
                <option value="Asesmen Formatif / Ulangan Harian">
                  Asesmen Formatif / Harian
                </option>
                <option value="Ujian Sekolah / Ujian Akhir Jenjang">
                  Ujian Sekolah / Akhir Jenjang
                </option>
                <option value="Asesmen Diagnostik Awal">Asesmen Diagnostik Awal</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="inp-alokasi"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Alokasi Waktu (Menit)
              </label>
              <input
                id="inp-alokasi"
                type="number"
                min={15}
                max={240}
                value={assessment.alokasiWaktu}
                onChange={(e) =>
                  onChangeAssessment({
                    ...assessment,
                    alokasiWaktu: Number(e.target.value) || 90,
                  })
                }
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 outline-none tabular-nums"
              />
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <label
                htmlFor="inp-materi"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Materi Pokok / Topik Pembelajaran
              </label>
              <input
                id="inp-materi"
                type="text"
                value={assessment.materi}
                onChange={(e) =>
                  onChangeAssessment({ ...assessment, materi: e.target.value })
                }
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 outline-none"
                placeholder="Tuliskan materi pokok bahasan..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <label
                  htmlFor="inp-kompetensi"
                  className="block text-xs font-semibold text-slate-700"
                >
                  {assessment.kurikulum === 'K13'
                    ? 'Kompetensi Dasar (KD)'
                    : 'Capaian Pembelajaran (CP) / Tujuan Pembelajaran (TP)'}
                </label>
                <button
                  type="button"
                  onClick={onDraftCpTp}
                  disabled={isDraftingCpTp}
                  className="text-xs text-sky-700 hover:text-sky-800 font-semibold inline-flex items-center gap-1 disabled:opacity-50"
                >
                  {isDraftingCpTp ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5" />
                  )}
                  <span>Buatkan Usulan AI</span>
                </button>
              </div>
              <textarea
                id="inp-kompetensi"
                rows={2}
                value={assessment.kompetensi}
                onChange={(e) =>
                  onChangeAssessment({ ...assessment, kompetensi: e.target.value })
                }
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 outline-none"
                placeholder="Masukkan rumusan CP/TP atau klik 'Buatkan Usulan AI'..."
              />
              {showAiDraftNote && (
                <p className="text-xs text-slate-500 mt-1">
                  Usulan AI perlu diverifikasi guru sesuai dokumen kurikulum sekolah.
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
            <div>
              <label
                htmlFor="inp-jumlah-soal"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Jumlah Butir Soal
              </label>
              <input
                id="inp-jumlah-soal"
                type="number"
                min={1}
                max={50}
                value={assessment.jumlahSoal}
                onChange={(e) =>
                  onChangeAssessment({
                    ...assessment,
                    jumlahSoal: Number(e.target.value),
                  })
                }
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 outline-none tabular-nums"
              />
            </div>

            <div className="md:col-span-2">
              <span className="block text-xs font-semibold text-slate-700 mb-1">
                Bentuk Soal yang Diinginkan
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {ALL_QUESTION_FORMS.map((form) => {
                  const checked = assessment.bentukSoalList.includes(form);
                  return (
                    <label
                      key={form}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                        checked
                          ? 'bg-sky-50 border-sky-300 text-sky-900 font-medium'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleForm(form)}
                        className="rounded text-sky-600"
                      />
                      <span className="whitespace-nowrap">{form}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="inp-bloom-preset"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Komposisi Kategori Bloom
              </label>
              <select
                id="inp-bloom-preset"
                value={bloomPreset}
                onChange={(e) => onChangeBloomPreset(e.target.value as BloomPreset)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 outline-none bg-white"
              >
                <option value="balanced">Seimbang (30/40/30)</option>
                <option value="hots">Dominan HOTS (10/30/60)</option>
                <option value="lots">Dominan LOTS (60/30/10)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Indikator soal disusun dengan kata kerja operasional baku (C1–C6).</span>
            </div>
            <button
              type="submit"
              disabled={isGeneratingKisi}
              className="px-5 py-2.5 bg-brand-blue hover:bg-sky-700 disabled:opacity-60 text-white font-bold text-xs rounded-lg inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
            >
              {isGeneratingKisi ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-brand-cyan" />
              )}
              <span>{isGeneratingKisi ? 'Memproses Kisi-Kisi...' : 'Generate Kisi-Kisi AI'}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Tabel Kisi-Kisi Soal Asesmen</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Format standar 11 atribut butir asesmen.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onExportExcel}
              className="px-3 py-2 text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg border border-emerald-200 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ekspor Excel</span>
            </button>
            <button
              type="button"
              onClick={onAddNewRow}
              className="px-3 py-2 text-xs font-semibold bg-sky-50 text-sky-800 hover:bg-sky-100 rounded-lg border border-sky-200 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Baris</span>
            </button>
            <button
              type="button"
              onClick={onGenerateSoal}
              disabled={isGeneratingSoal}
              className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              {isGeneratingSoal ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>
                {isGeneratingSoal ? 'Menyusun Soal...' : 'Generate Soal dari Kisi-Kisi'}
              </span>
            </button>
          </div>
        </div>

        {kisiKisi.length === 0 ? (
          <div className="p-8 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl space-y-2">
            <p className="text-xs">
              Belum ada baris kisi-kisi. Klik <strong>Generate Kisi-Kisi AI</strong> atau{' '}
              <strong>Tambah Baris</strong>.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl custom-scrollbar">
            <table className="w-full text-left text-xs text-slate-700 border-collapse min-w-[1000px]">
              <thead className="bg-slate-100 text-slate-700 text-xs font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5 text-center w-12 border-r border-slate-200">No</th>
                  <th className="p-2.5 w-44 border-r border-slate-200">
                    {assessment.kurikulum === 'K13' ? 'Kompetensi Dasar' : 'Capaian Pembelajaran'}
                  </th>
                  <th className="p-2.5 w-44 border-r border-slate-200">
                    {assessment.kurikulum === 'K13' ? 'IPK' : 'Tujuan Pembelajaran'}
                  </th>
                  <th className="p-2.5 w-32 border-r border-slate-200">Materi Pokok</th>
                  <th className="p-2.5 w-28 border-r border-slate-200">Submateri</th>
                  <th className="p-2.5 w-52 border-r border-slate-200">Indikator Soal</th>
                  <th className="p-2.5 text-center w-20 border-r border-slate-200">Level</th>
                  <th className="p-2.5 text-center w-20 border-r border-slate-200">Kategori</th>
                  <th className="p-2.5 text-center w-20 border-r border-slate-200">Kesulitan</th>
                  <th className="p-2.5 text-center w-28 border-r border-slate-200">Bentuk Soal</th>
                  <th className="p-2.5 text-center w-16 border-r border-slate-200">No Soal</th>
                  <th className="p-2.5 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {kisiKisi.map((row, idx) => (
                  <tr key={`${row.no}-${idx}`} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2.5 text-center font-bold text-slate-600 border-r border-slate-200 tabular-nums">
                      {row.no}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 text-slate-800">{row.cptp}</td>
                    <td className="p-2.5 border-r border-slate-200 text-slate-700">{row.tpipk}</td>
                    <td className="p-2.5 border-r border-slate-200 font-medium text-slate-800">
                      {row.materi}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 text-slate-600">
                      {row.submateri}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 text-slate-700">
                      {row.indikator}
                    </td>
                    <td className="p-2.5 text-center border-r border-slate-200 font-bold text-sky-700 font-mono">
                      {row.bloom}
                    </td>
                    <td className="p-2.5 text-center border-r border-slate-200 font-semibold text-slate-700">
                      {row.kategori}
                    </td>
                    <td className="p-2.5 text-center border-r border-slate-200 text-slate-600">
                      {row.kesulitan}
                    </td>
                    <td className="p-2.5 text-center border-r border-slate-200 font-medium text-slate-800">
                      {row.bentuk}
                    </td>
                    <td className="p-2.5 text-center border-r border-slate-200 font-bold text-slate-900 tabular-nums">
                      {row.no}
                    </td>
                    <td className="p-2.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditRow(idx)}
                          aria-label={`Edit baris kisi-kisi nomor ${row.no}`}
                          className="p-1.5 text-slate-500 hover:text-sky-700 rounded hover:bg-sky-50"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicateRow(idx)}
                          aria-label={`Duplikasi baris kisi-kisi nomor ${row.no}`}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 rounded hover:bg-emerald-50"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRow(idx)}
                          aria-label={`Hapus baris kisi-kisi nomor ${row.no}`}
                          className="p-1.5 text-slate-500 hover:text-rose-700 rounded hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
