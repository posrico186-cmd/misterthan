import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = 'gemini-4-hydrogen';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.post('/api/ai/draft-cptp', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY_NOT_CONFIGURED' });
    }

    const { jenjang, kelas, kurikulum, mapel, materi } = req.body ?? {};
    if (!mapel || !materi) {
      return res.status(400).json({ error: 'Mapel dan materi wajib diisi.' });
    }

    try {
      const prompt = `Bertindak sebagai ahli kurikulum ${kurikulum || 'Merdeka'} di Indonesia. Rumuskan Capaian Pembelajaran (CP) atau Kompetensi Dasar (KD) beserta Tujuan Pembelajaran yang baku dan spesifik untuk jenjang ${jenjang || 'SMA'} (${kelas || 'Kelas 11'}), mata pelajaran ${mapel}, dengan materi pokok "${materi}". Berikan 2-3 kalimat ringkas dan langsung tanpa kata pengantar.`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction:
            'Anda adalah pakar kurikulum pendidikan nasional Indonesia. Gunakan bahasa Indonesia akademik yang baku dan terukur.',
        },
      });

      const text = (response.text ?? '').trim();
      if (!text) {
        return res.status(502).json({ error: 'Respon AI kosong.' });
      }
      return res.json({ text });
    } catch (error) {
      console.error('Error /api/ai/draft-cptp:', error);
      return res.status(500).json({ error: 'Gagal menghasilkan usulan CP/TP dari Gemini API.' });
    }
  });

  app.post('/api/ai/kisi-kisi', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY_NOT_CONFIGURED' });
    }

    const { assessment, bloomPreset } = req.body ?? {};
    if (!assessment?.materi || !assessment?.mapel) {
      return res.status(400).json({ error: 'Data asesmen tidak lengkap.' });
    }

    const presetDesc =
      bloomPreset === 'hots'
        ? 'Dominan HOTS (sekitar 10% LOTS C1-C2, 30% MOTS C3, 60% HOTS C4-C6)'
        : bloomPreset === 'lots'
          ? 'Dominan LOTS/Dasar (sekitar 60% LOTS C1-C2, 30% MOTS C3, 10% HOTS C4-C6)'
          : 'Seimbang (sekitar 30% LOTS C1-C2, 40% MOTS C3, 30% HOTS C4-C6)';

    try {
      const prompt = `Buatkan rancangan tabel kisi-kisi soal asesmen sebanyak tepat ${assessment.jumlahSoal} butir dengan rincian:
- Satuan Pendidikan: ${assessment.sekolah}
- Jenjang: ${assessment.jenjang} (${assessment.kelas}, ${assessment.faseJurusan})
- Kurikulum: ${assessment.kurikulum}
- Mata Pelajaran: ${assessment.mapel}
- Materi Pokok: ${assessment.materi}
- Kompetensi / CP / KD: ${assessment.kompetensi}
- Pilihan Bentuk Soal: ${(assessment.bentukSoalList || ['Pilihan Ganda']).join(', ')}
- Komposisi Taksonomi Bloom: ${presetDesc}

Setiap indikator soal wajib menggunakan Kata Kerja Operasional (KKO) baku dan diawali pola "Disajikan ..., peserta didik mampu ...".`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction:
            'Anda adalah pakar evaluasi pendidikan Indonesia dan Taksonomi Bloom revisi. Hasilkan JSON terstruktur yang akurat.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                no: { type: Type.INTEGER },
                cptp: { type: Type.STRING },
                tpipk: { type: Type.STRING },
                materi: { type: Type.STRING },
                submateri: { type: Type.STRING },
                indikator: { type: Type.STRING },
                bloom: { type: Type.STRING },
                kategori: { type: Type.STRING },
                kesulitan: { type: Type.STRING },
                bentuk: { type: Type.STRING },
              },
              required: [
                'no',
                'cptp',
                'tpipk',
                'materi',
                'submateri',
                'indikator',
                'bloom',
                'kategori',
                'kesulitan',
                'bentuk',
              ],
            },
          },
        },
      });

      const raw = (response.text ?? '[]').trim();
      const rows = JSON.parse(raw);
      return res.json({ rows });
    } catch (error) {
      console.error('Error /api/ai/kisi-kisi:', error);
      return res.status(500).json({ error: 'Gagal menyusun kisi-kisi melalui Gemini API.' });
    }
  });

  app.post('/api/ai/soal', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY_NOT_CONFIGURED' });
    }

    const { assessment, kisiKisi } = req.body ?? {};
    if (!Array.isArray(kisiKisi) || kisiKisi.length === 0) {
      return res.status(400).json({ error: 'Tabel kisi-kisi tidak boleh kosong.' });
    }

    try {
      const prompt = `Buatkan butir soal lengkap, kunci jawaban, pembahasan mendalam, dan rubrik penilaian persis berdasarkan kisi-kisi untuk jenjang ${assessment?.jenjang || 'SMA'} mata pelajaran ${assessment?.mapel || 'Umum'} berikut:
${JSON.stringify(kisiKisi, null, 2)}

Aturan penulisan:
1. Setiap soal wajib menyertakan stimulus kontekstual (kasus nyata, data singkat, atau bacaan).
2. Jika bentuk "Pilihan Ganda", sediakan opsi A-D (SD/SMP) atau A-E (SMA/SMK) dalam array "opsiList" berbentuk { key, text } dengan pengecoh logis.
3. Jika bentuk "Pilihan Ganda Kompleks" atau "Benar / Salah" atau "Menjodohkan", sertakan pernyataan/opsi dalam "opsiList".
4. Jika bentuk "Uraian" atau "Isian Singkat", "opsiList" dikosongkan (array kosong).
5. Jelaskan alasan jawaban benar serta rasional kesalahan pengecoh di field "pembahasan".`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction:
            'Anda adalah Master Evaluator Soal Pendidikan Indonesia. Hasilkan naskah soal HOTS/MOTS/LOTS yang valid secara pedagogis.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                no: { type: Type.INTEGER },
                bentuk: { type: Type.STRING },
                bloom: { type: Type.STRING },
                kategori: { type: Type.STRING },
                kesulitan: { type: Type.STRING },
                indikator: { type: Type.STRING },
                stimulus: { type: Type.STRING },
                pertanyaan: { type: Type.STRING },
                opsiList: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      key: { type: Type.STRING },
                      text: { type: Type.STRING },
                    },
                    required: ['key', 'text'],
                  },
                },
                kunci: { type: Type.STRING },
                pembahasan: { type: Type.STRING },
                bobot: { type: Type.INTEGER },
                rubrik: { type: Type.STRING },
              },
              required: [
                'no',
                'bentuk',
                'bloom',
                'kategori',
                'indikator',
                'stimulus',
                'pertanyaan',
                'kunci',
                'pembahasan',
                'bobot',
                'rubrik',
              ],
            },
          },
        },
      });

      const raw = (response.text ?? '[]').trim();
      const parsed = JSON.parse(raw);
      const questions = parsed.map((q: Record<string, unknown>) => {
        const opsiArr = Array.isArray(q.opsiList) ? q.opsiList : [];
        let opsi: Record<string, string> | null = null;
        if (opsiArr.length > 0) {
          opsi = {};
          for (const item of opsiArr) {
            if (item && typeof item.key === 'string' && typeof item.text === 'string') {
              opsi[item.key] = item.text;
            }
          }
        }
        return {
          no: Number(q.no) || 1,
          bentuk: q.bentuk,
          bloom: q.bloom,
          kategori: q.kategori,
          kesulitan: q.kesulitan || 'Sedang',
          indikator: q.indikator,
          stimulus: q.stimulus,
          pertanyaan: q.pertanyaan,
          opsi,
          kunci: q.kunci,
          pembahasan: q.pembahasan,
          bobot: Number(q.bobot) || 10,
          rubrik: q.rubrik,
        };
      });

      return res.json({ questions });
    } catch (error) {
      console.error('Error /api/ai/soal:', error);
      return res.status(500).json({ error: 'Gagal menyusun soal melalui Gemini API.' });
    }
  });

  app.post('/api/ai/regenerate-soal', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY_NOT_CONFIGURED' });
    }

    const { assessment, soal } = req.body ?? {};
    if (!soal) {
      return res.status(400).json({ error: 'Data soal wajib disertakan.' });
    }

    try {
      const prompt = `Buatkan satu variasi soal BARU untuk jenjang ${assessment?.jenjang || 'SMA'} mapel ${assessment?.mapel || 'Umum'} nomor ${soal.no} dengan indikator "${soal.indikator}", level kognitif ${soal.bloom} (${soal.kategori}), bentuk ${soal.bentuk}. Pastikan stimulus berbeda dari sebelumnya dan tetap relevan.`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction:
            'Anda adalah Master Evaluator Soal Pendidikan Indonesia. Berikan variasi butir soal baru yang berkualitas.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              stimulus: { type: Type.STRING },
              pertanyaan: { type: Type.STRING },
              opsiList: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    key: { type: Type.STRING },
                    text: { type: Type.STRING },
                  },
                  required: ['key', 'text'],
                },
              },
              kunci: { type: Type.STRING },
              pembahasan: { type: Type.STRING },
              rubrik: { type: Type.STRING },
            },
            required: ['stimulus', 'pertanyaan', 'kunci', 'pembahasan', 'rubrik'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      const opsiArr = Array.isArray(parsed.opsiList) ? parsed.opsiList : [];
      let opsi: Record<string, string> | null = soal.opsi ?? null;
      if (opsiArr.length > 0) {
        opsi = {};
        for (const item of opsiArr) {
          if (item && typeof item.key === 'string' && typeof item.text === 'string') {
            opsi[item.key] = item.text;
          }
        }
      }

      return res.json({
        question: {
          ...soal,
          stimulus: parsed.stimulus || soal.stimulus,
          pertanyaan: parsed.pertanyaan || soal.pertanyaan,
          opsi,
          kunci: parsed.kunci || soal.kunci,
          pembahasan: parsed.pembahasan || soal.pembahasan,
          rubrik: parsed.rubrik || soal.rubrik,
        },
      });
    } catch (error) {
      console.error('Error /api/ai/regenerate-soal:', error);
      return res.status(500).json({ error: 'Gagal me-regenerate soal.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distDir, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
