import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import type {
  AppTab,
  AssessmentMeta,
  BankItem,
  BloomPreset,
  KisiKisiRow,
  PresetKey,
  QuestionItem,
  TeacherSignOff,
} from './types/assessment';
import {
  evaluateQualityChecks,
  generateFallbackSoalList,
  getSamplePreset,
  normalizeKisiAndSoal,
  validateAssessmentMeta,
} from './utils/assessmentEngine';
import {
  exportAssessmentToWord,
  exportBackupJson,
  exportKisiKisiToExcel,
} from './utils/exporters';
import {
  requestDraftCpTp,
  requestGenerateKisiKisi,
  requestGenerateSoal,
  requestRegenerateSingleSoal,
} from './services/aiService';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/DashboardView';
import { KisiKisiView } from './components/KisiKisiView';
import { SoalView } from './components/SoalView';
import { ManualBuilderView } from './components/ManualBuilderView';
import { KunciView } from './components/KunciView';
import { RubrikView } from './components/RubrikView';
import { QualityCheckView } from './components/QualityCheckView';
import { BankSoalView } from './components/BankSoalView';
import { SettingsView } from './components/SettingsView';
import { ConfirmModal, EditSoalModal, PrintPreviewModal } from './components/Modals';

interface ToastMessage {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
}

const STORAGE_CURRENT_KEY = 'assessment_pro_current';
const STORAGE_BANK_KEY = 'assessment_pro_bank';
const STORAGE_SIGNOFF_KEY = 'assessment_pro_signoff';

const DEFAULT_SIGNOFF: TeacherSignOff = {
  kota: 'Malang',
  namaKepalaSekolah: '',
  nipKepalaSekolah: '',
  namaGuru: '',
  nipGuru: '',
};

function loadInitialState() {
  const defaultPreset = getSamplePreset('sma_ekonomi');
  let assessment = defaultPreset.assessment;
  let kisiKisi = defaultPreset.kisiKisi;
  let soalList = defaultPreset.soalList;
  let bankSoal: BankItem[] = [];
  let signOff: TeacherSignOff = DEFAULT_SIGNOFF;

  try {
    const rawCurrent = localStorage.getItem(STORAGE_CURRENT_KEY);
    if (rawCurrent) {
      const parsed = JSON.parse(rawCurrent);
      if (parsed.assessment) assessment = parsed.assessment;
      if (Array.isArray(parsed.kisiKisi)) kisiKisi = parsed.kisiKisi;
      if (Array.isArray(parsed.soalList)) soalList = parsed.soalList;
    }

    const rawBank = localStorage.getItem(STORAGE_BANK_KEY);
    if (rawBank) {
      const parsedBank = JSON.parse(rawBank);
      if (Array.isArray(parsedBank)) bankSoal = parsedBank;
    }

    const rawSignOff = localStorage.getItem(STORAGE_SIGNOFF_KEY);
    if (rawSignOff) {
      signOff = { ...DEFAULT_SIGNOFF, ...JSON.parse(rawSignOff) };
    }
  } catch {
    // Fallback cleanly to default preset
  }

  const normalized = normalizeKisiAndSoal(kisiKisi, soalList);
  return {
    assessment,
    kisiKisi: normalized.kisiKisi,
    soalList: normalized.soalList,
    bankSoal,
    signOff,
  };
}

export default function App() {
  const initial = useMemo(() => loadInitialState(), []);

  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [assessment, setAssessment] = useState<AssessmentMeta>(initial.assessment);
  const [kisiKisi, setKisiKisi] = useState<KisiKisiRow[]>(initial.kisiKisi);
  const [soalList, setSoalList] = useState<QuestionItem[]>(initial.soalList);
  const [bankSoal, setBankSoal] = useState<BankItem[]>(initial.bankSoal);
  const [signOff, setSignOff] = useState<TeacherSignOff>(initial.signOff);
  const [bloomPreset, setBloomPreset] = useState<BloomPreset>('balanced');

  const [isDraftingCpTp, setIsDraftingCpTp] = useState(false);
  const [showAiDraftNote, setShowAiDraftNote] = useState(false);
  const [isGeneratingKisi, setIsGeneratingKisi] = useState(false);
  const [isGeneratingSoal, setIsGeneratingSoal] = useState(false);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);

  const [editingRow, setEditingRow] = useState<{ index: number; data: KisiKisiRow } | null>(null);
  const [editingSoalIndex, setEditingSoalIndex] = useState<number | null>(null);

  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printKunciOnly, setPrintKunciOnly] = useState(false);

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: (() => void) | null;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (message: string, type: 'info' | 'success' | 'error' = 'info') => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const qualityReport = useMemo(() => evaluateQualityChecks(soalList), [soalList]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_CURRENT_KEY,
        JSON.stringify({ assessment, kisiKisi, soalList })
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [assessment, kisiKisi, soalList]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_BANK_KEY, JSON.stringify(bankSoal));
    } catch {
      // Ignore storage quota errors
    }
  }, [bankSoal]);

  const handleLoadPreset = (presetKey: PresetKey) => {
    const preset = getSamplePreset(presetKey);
    const normalized = normalizeKisiAndSoal(preset.kisiKisi, preset.soalList);
    setAssessment(preset.assessment);
    setKisiKisi(normalized.kisiKisi);
    setSoalList(normalized.soalList);
    setShowAiDraftNote(false);
    showToast(
      `Template ${preset.assessment.jenjang} (${preset.assessment.mapel}) berhasil dimuat.`,
      'success'
    );
  };

  const handleResetForm = () => {
    const defaultPreset = getSamplePreset('sma_ekonomi');
    setAssessment({
      ...defaultPreset.assessment,
      materi: '',
      kompetensi: '',
    });
    setShowAiDraftNote(false);
    showToast('Formulir direset. Silakan isi materi dan kompetensi baru.', 'info');
  };

  const handleDraftCpTp = async () => {
    if (!assessment.materi.trim()) {
      showToast('Isi Materi Pokok terlebih dahulu sebelum meminta usulan CP/TP.', 'error');
      return;
    }
    setIsDraftingCpTp(true);
    const result = await requestDraftCpTp(assessment);
    setAssessment((prev) => ({ ...prev, kompetensi: result.data }));
    setShowAiDraftNote(true);
    setIsDraftingCpTp(false);
    showToast(
      result.source === 'gemini'
        ? 'Usulan CP/TP disusun oleh Gemini AI.'
        : 'Usulan CP/TP disusun via mesin standar kurikulum.',
      'success'
    );
  };

  const handleGenerateKisi = async () => {
    const validationError = validateAssessmentMeta(assessment);
    if (validationError) {
      showToast(validationError, 'error');
      return;
    }

    setIsGeneratingKisi(true);
    const result = await requestGenerateKisiKisi(assessment, bloomPreset);
    const normalized = normalizeKisiAndSoal(result.data, soalList, assessment);
    setKisiKisi(normalized.kisiKisi);
    setSoalList(normalized.soalList);
    setIsGeneratingKisi(false);
    showToast(
      `Berhasil menyusun ${normalized.kisiKisi.length} baris kisi-kisi (${
        result.source === 'gemini' ? 'Gemini AI' : 'Mesin Standar Bloom'
      }).`,
      'success'
    );
  };

  const handleGenerateSoal = async () => {
    if (kisiKisi.length === 0) {
      showToast('Tabel kisi-kisi masih kosong. Buat kisi-kisi terlebih dahulu.', 'error');
      setActiveTab('kisi-kisi-ai');
      return;
    }

    setIsGeneratingSoal(true);
    setActiveTab('soal-ai');
    const result = await requestGenerateSoal(assessment, kisiKisi);
    const normalized = normalizeKisiAndSoal(kisiKisi, result.data, assessment);
    setKisiKisi(normalized.kisiKisi);
    setSoalList(normalized.soalList);
    setIsGeneratingSoal(false);
    showToast(
      `Berhasil menyusun ${normalized.soalList.length} butir soal lengkap.`,
      'success'
    );
  };

  const handleRegenerateSingleSoal = async (index: number) => {
    const target = soalList[index];
    if (!target) return;

    setRegeneratingIndex(index);
    const result = await requestRegenerateSingleSoal(assessment, target);
    setSoalList((prev) => {
      const next = [...prev];
      next[index] = result.data;
      return normalizeKisiAndSoal(kisiKisi, next, assessment).soalList;
    });
    setRegeneratingIndex(null);
    showToast(`Variasi baru untuk soal nomor ${target.no} siap.`, 'success');
  };

  const handleSaveManualRow = (row: KisiKisiRow, editIndex: number | null) => {
    const nextKisi = [...kisiKisi];
    const nextSoal = [...soalList];
    if (editIndex !== null && editIndex >= 0 && editIndex < nextKisi.length) {
      nextKisi[editIndex] = row;
      showToast('Baris kisi-kisi berhasil diperbarui.', 'success');
    } else {
      nextKisi.push(row);
      if (nextSoal.length > 0) {
        const generated = generateFallbackSoalList(assessment, [row])[0];
        if (generated) nextSoal.push(generated);
      }
      showToast('Baris kisi-kisi baru berhasil ditambahkan.', 'success');
    }
    const normalized = normalizeKisiAndSoal(nextKisi, nextSoal, assessment);
    setKisiKisi(normalized.kisiKisi);
    setSoalList(normalized.soalList);
    setEditingRow(null);
    setActiveTab('kisi-kisi-ai');
  };

  const handleDuplicateKisiRow = (index: number) => {
    const original = kisiKisi[index];
    if (!original) return;
    const nextKisi = [...kisiKisi];
    nextKisi.splice(index + 1, 0, { ...original });

    const nextSoal = [...soalList];
    if (nextSoal[index]) {
      nextSoal.splice(index + 1, 0, structuredClone(nextSoal[index]));
    } else if (nextSoal.length > 0) {
      const generated = generateFallbackSoalList(assessment, [original])[0];
      if (generated) nextSoal.splice(index + 1, 0, generated);
    }

    const normalized = normalizeKisiAndSoal(nextKisi, nextSoal, assessment);
    setKisiKisi(normalized.kisiKisi);
    setSoalList(normalized.soalList);
    showToast('Baris kisi-kisi berhasil diduplikasi.', 'info');
  };

  const handleDeleteKisiRow = (index: number) => {
    setConfirmState({
      open: true,
      title: 'Hapus Baris Kisi-Kisi',
      message: `Hapus butir kisi-kisi nomor ${index + 1}? Penomoran akan disesuaikan otomatis.`,
      onConfirm: () => {
        const nextKisi = kisiKisi.filter((_, i) => i !== index);
        const nextSoal = soalList.filter((_, i) => i !== index);
        const normalized = normalizeKisiAndSoal(nextKisi, nextSoal);
        setKisiKisi(normalized.kisiKisi);
        setSoalList(normalized.soalList);
        showToast('Baris kisi-kisi dihapus.', 'info');
      },
    });
  };

  const handleSaveEditedSoal = (updated: QuestionItem) => {
    if (editingSoalIndex === null) return;
    setSoalList((prev) => {
      const next = [...prev];
      next[editingSoalIndex] = updated;
      return normalizeKisiAndSoal(kisiKisi, next).soalList;
    });
    setEditingSoalIndex(null);
    showToast(`Soal nomor ${updated.no} berhasil diperbarui.`, 'success');
  };

  const handleSaveSessionToBank = () => {
    if (kisiKisi.length === 0 && soalList.length === 0) {
      showToast('Belum ada materi kisi-kisi atau soal untuk disimpan.', 'error');
      return;
    }

    const newItem: BankItem = {
      id: `SAS-${Date.now()}`,
      date: new Date().toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      assessment: structuredClone(assessment),
      kisiKisi: structuredClone(kisiKisi),
      soalList: structuredClone(soalList),
      qualityChecks: structuredClone(qualityReport.items),
    };

    setBankSoal((prev) => [newItem, ...prev]);
    showToast('Sesi asesmen berhasil disimpan ke Bank Soal.', 'success');
  };

  const handleRestoreBankItem = (id: string) => {
    const target = bankSoal.find((item) => item.id === id);
    if (!target) return;

    setConfirmState({
      open: true,
      title: 'Buka Arsip Asesmen',
      message: `Buka paket "${target.assessment.mapel} (${target.assessment.kelas})"? Data aktif saat ini akan diganti.`,
      onConfirm: () => {
        const normalized = normalizeKisiAndSoal(target.kisiKisi, target.soalList);
        setAssessment(structuredClone(target.assessment));
        setKisiKisi(normalized.kisiKisi);
        setSoalList(normalized.soalList);
        setActiveTab('dashboard');
        showToast('Arsip asesmen berhasil dimuat.', 'success');
      },
    });
  };

  const handleDeleteBankItem = (id: string) => {
    setConfirmState({
      open: true,
      title: 'Hapus Arsip',
      message: 'Hapus arsip paket asesmen ini secara permanen dari Bank Soal?',
      onConfirm: () => {
        setBankSoal((prev) => prev.filter((item) => item.id !== id));
        showToast('Arsip dihapus dari Bank Soal.', 'info');
      },
    });
  };

  const handleImportJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(String(ev.target?.result ?? '{}'));
        if (Array.isArray(parsed.bankSoal)) setBankSoal(parsed.bankSoal);
        if (parsed.currentAssessment) setAssessment(parsed.currentAssessment);
        if (Array.isArray(parsed.kisiKisi) && Array.isArray(parsed.soalList)) {
          const normalized = normalizeKisiAndSoal(parsed.kisiKisi, parsed.soalList);
          setKisiKisi(normalized.kisiKisi);
          setSoalList(normalized.soalList);
        }
        showToast('Data JSON berhasil di-restore.', 'success');
      } catch {
        showToast('File JSON tidak valid atau rusak.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleExportWord = () => {
    if (kisiKisi.length === 0 && soalList.length === 0) {
      showToast('Belum ada konten kisi-kisi atau soal untuk diunduh.', 'error');
      return;
    }
    exportAssessmentToWord(assessment, kisiKisi, soalList, signOff);
    showToast('Dokumen Word (.doc) berhasil diunduh.', 'success');
  };

  const handleExportExcel = () => {
    if (kisiKisi.length === 0) {
      showToast('Tabel kisi-kisi masih kosong.', 'error');
      return;
    }
    exportKisiKisiToExcel(assessment, kisiKisi);
    showToast('Spreadsheet Excel (.xls) berhasil diunduh.', 'success');
  };

  const handleSaveSignOff = () => {
    try {
      localStorage.setItem(STORAGE_SIGNOFF_KEY, JSON.stringify(signOff));
    } catch {
      // Ignore storage error
    }
    showToast('Profil penandatangan dokumen berhasil disimpan.', 'success');
  };

  const handleResetAllData = () => {
    setConfirmState({
      open: true,
      title: 'Reset Seluruh Data',
      message:
        'Tindakan ini akan menghapus seluruh bank soal dan pengaturan lokal, lalu mengembalikan contoh bawaan. Lanjutkan?',
      onConfirm: () => {
        localStorage.removeItem(STORAGE_CURRENT_KEY);
        localStorage.removeItem(STORAGE_BANK_KEY);
        localStorage.removeItem(STORAGE_SIGNOFF_KEY);
        const preset = getSamplePreset('sma_ekonomi');
        setAssessment(preset.assessment);
        setKisiKisi(preset.kisiKisi);
        setSoalList(preset.soalList);
        setBankSoal([]);
        setSignOff(DEFAULT_SIGNOFF);
        showToast('Seluruh data lokal berhasil direset.', 'info');
      },
    });
  };

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'manual-builder' && activeTab !== 'manual-builder') {
            setEditingRow(null);
          }
          setActiveTab(tab);
        }}
        bankCount={bankSoal.length}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopHeader
          activeTab={activeTab}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onSaveSession={handleSaveSessionToBank}
          onExportWord={handleExportWord}
          onOpenPrintModal={() => {
            setPrintKunciOnly(false);
            setPrintModalOpen(true);
          }}
        />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              assessment={assessment}
              kisiKisi={kisiKisi}
              soalCount={soalList.length}
              qcOverallScore={qualityReport.overallScore}
              bankCount={bankSoal.length}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onLoadPreset={handleLoadPreset}
            />
          )}

          {activeTab === 'kisi-kisi-ai' && (
            <KisiKisiView
              assessment={assessment}
              kisiKisi={kisiKisi}
              bloomPreset={bloomPreset}
              isGeneratingKisi={isGeneratingKisi}
              isGeneratingSoal={isGeneratingSoal}
              isDraftingCpTp={isDraftingCpTp}
              showAiDraftNote={showAiDraftNote}
              onChangeAssessment={setAssessment}
              onChangeBloomPreset={setBloomPreset}
              onDraftCpTp={handleDraftCpTp}
              onResetForm={handleResetForm}
              onGenerateKisi={handleGenerateKisi}
              onGenerateSoal={handleGenerateSoal}
              onExportExcel={handleExportExcel}
              onAddNewRow={() => {
                setEditingRow(null);
                setActiveTab('manual-builder');
              }}
              onEditRow={(idx) => {
                const target = kisiKisi[idx];
                if (!target) return;
                setEditingRow({ index: idx, data: target });
                setActiveTab('manual-builder');
              }}
              onDuplicateRow={handleDuplicateKisiRow}
              onDeleteRow={handleDeleteKisiRow}
            />
          )}

          {activeTab === 'soal-ai' && (
            <SoalView
              soalList={soalList}
              isGeneratingSoal={isGeneratingSoal}
              regeneratingIndex={regeneratingIndex}
              onRegenerateAll={handleGenerateSoal}
              onRunQualityCheck={() => {
                setActiveTab('quality-check');
                showToast('Hasil Quality Check ditampilkan.', 'success');
              }}
              onEditSoal={(idx) => setEditingSoalIndex(idx)}
              onRegenerateSingle={handleRegenerateSingleSoal}
              onGoToKisiKisi={() => setActiveTab('kisi-kisi-ai')}
            />
          )}

          {activeTab === 'manual-builder' && (
            <ManualBuilderView
              assessment={assessment}
              editingRow={editingRow}
              onSaveRow={handleSaveManualRow}
              onCancel={() => {
                setEditingRow(null);
                setActiveTab('kisi-kisi-ai');
              }}
            />
          )}

          {activeTab === 'kunci-pembahasan' && (
            <KunciView
              soalList={soalList}
              onPrintKunciOnly={() => {
                setPrintKunciOnly(true);
                setPrintModalOpen(true);
              }}
            />
          )}

          {activeTab === 'rubrik-penilaian' && <RubrikView soalList={soalList} />}

          {activeTab === 'quality-check' && (
            <QualityCheckView
              items={qualityReport.items}
              validCount={qualityReport.validCount}
              revisiCount={qualityReport.revisiCount}
              invalidCount={qualityReport.invalidCount}
              overallScore={qualityReport.overallScore}
              onRevalidate={() =>
                showToast('Pemeriksaan kualitas butir soal diperbarui.', 'success')
              }
            />
          )}

          {activeTab === 'bank-soal' && (
            <BankSoalView
              bankSoal={bankSoal}
              onSaveCurrentSession={handleSaveSessionToBank}
              onRestoreItem={handleRestoreBankItem}
              onDeleteItem={handleDeleteBankItem}
              onExportJson={() => {
                exportBackupJson({
                  currentAssessment: assessment,
                  kisiKisi,
                  soalList,
                  bankSoal,
                });
                showToast('Data asesmen diekspor ke format JSON.', 'success');
              }}
              onImportJson={handleImportJson}
            />
          )}

          {activeTab === 'pengaturan' && (
            <SettingsView
              signOff={signOff}
              onChangeSignOff={setSignOff}
              onSaveSignOff={handleSaveSignOff}
              onResetAllData={handleResetAllData}
            />
          )}
        </main>
      </div>

      <PrintPreviewModal
        open={printModalOpen}
        assessment={assessment}
        kisiKisi={kisiKisi}
        soalList={soalList}
        signOff={signOff}
        initialKunciOnly={printKunciOnly}
        onClose={() => setPrintModalOpen(false)}
        onExportWord={handleExportWord}
        onExportExcel={handleExportExcel}
      />

      <EditSoalModal
        soal={editingSoalIndex !== null ? soalList[editingSoalIndex] ?? null : null}
        onClose={() => setEditingSoalIndex(null)}
        onSave={handleSaveEditedSoal}
      />

      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        onCancel={() => setConfirmState((prev) => ({ ...prev, open: false }))}
        onConfirm={() => {
          const cb = confirmState.onConfirm;
          setConfirmState((prev) => ({ ...prev, open: false, onConfirm: null }));
          cb?.();
        }}
      />

      <div
        className="fixed bottom-5 right-5 z-50 space-y-2 pointer-events-none max-w-sm"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const ToastIcon =
            toast.type === 'success'
              ? CheckCircle2
              : toast.type === 'error'
                ? AlertCircle
                : Info;
          const colors =
            toast.type === 'success'
              ? 'bg-emerald-800 text-white'
              : toast.type === 'error'
                ? 'bg-rose-800 text-white'
                : 'bg-slate-900 text-slate-100';

          return (
            <div
              key={toast.id}
              className={`${colors} px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium flex items-center gap-2 pointer-events-auto`}
            >
              <ToastIcon className="w-4 h-4 shrink-0" />
              <span>{toast.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
