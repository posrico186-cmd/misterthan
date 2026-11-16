export type Jenjang = 'SD' | 'SMP' | 'SMA' | 'SMK';

export type Kurikulum = 'Merdeka' | 'K13' | 'Nasional' | 'Lainnya';

export type BloomLevel = 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6';

export type CognitiveCategory = 'LOTS' | 'MOTS' | 'HOTS';

export type DifficultyLevel = 'Mudah' | 'Sedang' | 'Sulit';

export type QuestionForm =
  | 'Pilihan Ganda'
  | 'Pilihan Ganda Kompleks'
  | 'Benar / Salah'
  | 'Menjodohkan'
  | 'Isian Singkat'
  | 'Uraian';

export type BloomPreset = 'balanced' | 'hots' | 'lots';

export type AppTab =
  | 'dashboard'
  | 'kisi-kisi-ai'
  | 'soal-ai'
  | 'manual-builder'
  | 'kunci-pembahasan'
  | 'rubrik-penilaian'
  | 'quality-check'
  | 'bank-soal'
  | 'pengaturan';

export interface AssessmentMeta {
  sekolah: string;
  jenjang: Jenjang;
  kurikulum: Kurikulum;
  kelas: string;
  faseJurusan: string;
  semester: 'Ganjil' | 'Genap';
  tahun: string;
  mapel: string;
  materi: string;
  kompetensi: string;
  jenisAsesmen: string;
  alokasiWaktu: number;
  jumlahSoal: number;
  bentukSoalList: QuestionForm[];
}

export interface KisiKisiRow {
  no: number;
  cptp: string;
  tpipk: string;
  materi: string;
  submateri: string;
  indikator: string;
  bloom: BloomLevel;
  kategori: CognitiveCategory;
  kesulitan: DifficultyLevel;
  bentuk: QuestionForm;
}

export interface QuestionItem {
  no: number;
  bentuk: QuestionForm;
  bloom: BloomLevel;
  kategori: CognitiveCategory;
  kesulitan: DifficultyLevel;
  indikator: string;
  stimulus: string;
  pertanyaan: string;
  opsi: Record<string, string> | null;
  kunci: string;
  pembahasan: string;
  bobot: number;
  rubrik: string;
}

export type QualityStatus = 'Valid' | 'Perlu Revisi' | 'Tidak Sesuai';

export interface QualityCheckItem {
  no: number;
  status: QualityStatus;
  issues: string[];
  rekomendasi: string;
}

export interface BankItem {
  id: string;
  date: string;
  assessment: AssessmentMeta;
  kisiKisi: KisiKisiRow[];
  soalList: QuestionItem[];
  qualityChecks: QualityCheckItem[];
}

export interface TeacherSignOff {
  kota: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  namaGuru: string;
  nipGuru: string;
}

export type PresetKey = 'sma_ekonomi' | 'sd_mat' | 'smp_infor' | 'smk_tkj';
