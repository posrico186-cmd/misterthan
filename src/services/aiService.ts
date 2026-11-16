import type {
  AssessmentMeta,
  BloomLevel,
  BloomPreset,
  DifficultyLevel,
  KisiKisiRow,
  QuestionForm,
  QuestionItem,
} from '../types/assessment';
import {
  generateFallbackSoalList,
  generateRuleBasedKisiKisi,
  getCognitiveCategory,
} from '../utils/assessmentEngine';

export interface AiGenerationResult<T> {
  data: T;
  source: 'gemini' | 'rule-engine';
}

const VALID_BLOOMS: BloomLevel[] = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'];
const VALID_DIFFS: DifficultyLevel[] = ['Mudah', 'Sedang', 'Sulit'];
const VALID_FORMS: QuestionForm[] = [
  'Pilihan Ganda',
  'Pilihan Ganda Kompleks',
  'Benar / Salah',
  'Menjodohkan',
  'Isian Singkat',
  'Uraian',
];

function sanitizeBloom(val: unknown): BloomLevel {
  return typeof val === 'string' && VALID_BLOOMS.includes(val as BloomLevel)
    ? (val as BloomLevel)
    : 'C4';
}

function sanitizeDiff(val: unknown): DifficultyLevel {
  return typeof val === 'string' && VALID_DIFFS.includes(val as DifficultyLevel)
    ? (val as DifficultyLevel)
    : 'Sedang';
}

function sanitizeForm(val: unknown): QuestionForm {
  return typeof val === 'string' && VALID_FORMS.includes(val as QuestionForm)
    ? (val as QuestionForm)
    : 'Pilihan Ganda';
}

export async function requestDraftCpTp(
  meta: AssessmentMeta
): Promise<AiGenerationResult<string>> {
  try {
    const res = await fetch('/api/ai/draft-cptp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jenjang: meta.jenjang,
        kelas: meta.kelas,
        kurikulum: meta.kurikulum,
        mapel: meta.mapel,
        materi: meta.materi,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.text && typeof json.text === 'string') {
        return { data: json.text.trim(), source: 'gemini' };
      }
    }
  } catch {
    // Fallback to deterministic rule engine below
  }

  return {
    data: `Peserta didik mampu memahami konsep esensial ${meta.materi}, menganalisis permasalahan kontekstual terkait pada jenjang ${meta.jenjang} (${meta.kelas}), serta menerapkan pemecahan masalah secara logis dan terukur.`,
    source: 'rule-engine',
  };
}

export async function requestGenerateKisiKisi(
  meta: AssessmentMeta,
  bloomPreset: BloomPreset
): Promise<AiGenerationResult<KisiKisiRow[]>> {
  try {
    const res = await fetch('/api/ai/kisi-kisi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessment: meta, bloomPreset }),
    });

    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.rows) && json.rows.length > 0) {
        const sanitized: KisiKisiRow[] = json.rows.map(
          (item: Record<string, unknown>, idx: number) => {
            const bloom = sanitizeBloom(item.bloom);
            return {
              no: idx + 1,
              cptp:
                typeof item.cptp === 'string' && item.cptp.trim()
                  ? item.cptp
                  : meta.kompetensi,
              tpipk:
                typeof item.tpipk === 'string' && item.tpipk.trim()
                  ? item.tpipk
                  : 'Menganalisis konsep terkait',
              materi:
                typeof item.materi === 'string' && item.materi.trim()
                  ? item.materi
                  : meta.materi,
              submateri:
                typeof item.submateri === 'string' && item.submateri.trim()
                  ? item.submateri
                  : `Submateri ${idx + 1}`,
              indikator:
                typeof item.indikator === 'string' && item.indikator.trim()
                  ? item.indikator
                  : 'Peserta didik mampu menganalisis permasalahan yang disajikan.',
              bloom,
              kategori: getCognitiveCategory(bloom),
              kesulitan: sanitizeDiff(item.kesulitan),
              bentuk: sanitizeForm(item.bentuk),
            };
          }
        );
        return { data: sanitized, source: 'gemini' };
      }
    }
  } catch {
    // Fallback to deterministic rule engine below
  }

  return {
    data: generateRuleBasedKisiKisi(meta, bloomPreset),
    source: 'rule-engine',
  };
}

export async function requestGenerateSoal(
  meta: AssessmentMeta,
  kisiKisi: KisiKisiRow[]
): Promise<AiGenerationResult<QuestionItem[]>> {
  try {
    const res = await fetch('/api/ai/soal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessment: meta, kisiKisi }),
    });

    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.questions) && json.questions.length > 0) {
        const sanitized: QuestionItem[] = json.questions.map(
          (q: Record<string, unknown>, idx: number) => {
            const kisi = kisiKisi[idx];
            const bloom = kisi ? kisi.bloom : sanitizeBloom(q.bloom);
            return {
              no: idx + 1,
              bentuk: kisi ? kisi.bentuk : sanitizeForm(q.bentuk),
              bloom,
              kategori: getCognitiveCategory(bloom),
              kesulitan: kisi ? kisi.kesulitan : sanitizeDiff(q.kesulitan),
              indikator: kisi
                ? kisi.indikator
                : typeof q.indikator === 'string'
                  ? q.indikator
                  : '',
              stimulus: typeof q.stimulus === 'string' ? q.stimulus : '',
              pertanyaan: typeof q.pertanyaan === 'string' ? q.pertanyaan : '',
              opsi:
                q.opsi && typeof q.opsi === 'object' && !Array.isArray(q.opsi)
                  ? (q.opsi as Record<string, string>)
                  : null,
              kunci: typeof q.kunci === 'string' ? q.kunci : '',
              pembahasan: typeof q.pembahasan === 'string' ? q.pembahasan : '',
              bobot: typeof q.bobot === 'number' && q.bobot > 0 ? q.bobot : 10,
              rubrik:
                typeof q.rubrik === 'string'
                  ? q.rubrik
                  : 'Benar skor penuh, salah skor 0.',
            };
          }
        );
        return { data: sanitized, source: 'gemini' };
      }
    }
  } catch {
    // Fallback to deterministic rule engine below
  }

  return {
    data: generateFallbackSoalList(meta, kisiKisi),
    source: 'rule-engine',
  };
}

export async function requestRegenerateSingleSoal(
  meta: AssessmentMeta,
  soal: QuestionItem
): Promise<AiGenerationResult<QuestionItem>> {
  try {
    const res = await fetch('/api/ai/regenerate-soal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessment: meta, soal }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.question && typeof json.question === 'object') {
        return {
          data: {
            ...soal,
            stimulus: json.question.stimulus || soal.stimulus,
            pertanyaan: json.question.pertanyaan || soal.pertanyaan,
            opsi: json.question.opsi ?? soal.opsi,
            kunci: json.question.kunci || soal.kunci,
            pembahasan: json.question.pembahasan || soal.pembahasan,
            rubrik: json.question.rubrik || soal.rubrik,
          },
          source: 'gemini',
        };
      }
    }
  } catch {
    // Fallback to deterministic variation below
  }

  return {
    data: {
      ...soal,
      stimulus: `${soal.stimulus} (Konteks studi kasus diperbarui untuk evaluasi ${meta.materi}.)`,
      pertanyaan: soal.pertanyaan.includes('(Variasi Alternatif)')
        ? soal.pertanyaan
        : `${soal.pertanyaan} (Variasi Alternatif)`,
    },
    source: 'rule-engine',
  };
}
