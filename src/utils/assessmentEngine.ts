import type {
  AssessmentMeta,
  BankItem,
  BloomLevel,
  BloomPreset,
  CognitiveCategory,
  DifficultyLevel,
  Jenjang,
  KisiKisiRow,
  PresetKey,
  QualityCheckItem,
  QualityStatus,
  QuestionForm,
  QuestionItem,
} from '../types/assessment';

export const MAPEL_OPTIONS: Record<Jenjang, string[]> = {
  SD: [
    'Pendidikan Agama dan Budi Pekerti',
    'Pendidikan Pancasila',
    'Bahasa Indonesia',
    'Matematika',
    'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    'PJOK',
    'Seni Musik',
    'Seni Rupa',
    'Seni Teater',
    'Bahasa Inggris',
    'Muatan Lokal / Bahasa Daerah',
  ],
  SMP: [
    'Pendidikan Agama dan Budi Pekerti',
    'Pendidikan Pancasila',
    'Bahasa Indonesia',
    'Matematika',
    'Ilmu Pengetahuan Alam (IPA)',
    'Ilmu Pengetahuan Sosial (IPS)',
    'Informatika',
    'Bahasa Inggris',
    'PJOK',
    'Seni Budaya',
    'Prakarya',
    'Bahasa Daerah',
  ],
  SMA: [
    'Pendidikan Agama dan Budi Pekerti',
    'Pendidikan Pancasila',
    'Bahasa Indonesia',
    'Matematika (Umum)',
    'Matematika Tingkat Lanjut',
    'Bahasa Inggris',
    'Sejarah',
    'Ekonomi',
    'Geografi',
    'Sosiologi',
    'Fisika',
    'Kimia',
    'Biologi',
    'Informatika',
  ],
  SMK: [
    'Pendidikan Agama dan Budi Pekerti',
    'Pendidikan Pancasila',
    'Bahasa Indonesia',
    'Matematika Terapan',
    'Bahasa Inggris & Komunikasi Bisnis',
    'Informatika',
    'Dasar-Dasar Teknik Jaringan Komputer & Telekomunikasi (TJKT)',
    'Dasar-Dasar Rekayasa Perangkat Lunak (RPL)',
    'Dasar-Dasar Akuntansi & Keuangan Lembaga (AKL)',
    'Dasar-Dasar Manajemen Perkantoran (MPLB)',
    'Dasar-Dasar Teknik Otomotif (TO)',
    'Konsentrasi Kejuruan Spesifik',
  ],
};

export const KELAS_OPTIONS: Record<Jenjang, string[]> = {
  SD: ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'],
  SMP: ['Kelas 7', 'Kelas 8', 'Kelas 9'],
  SMA: ['Kelas 10', 'Kelas 11', 'Kelas 12'],
  SMK: ['Kelas 10', 'Kelas 11', 'Kelas 12'],
};

export const ALL_QUESTION_FORMS: QuestionForm[] = [
  'Pilihan Ganda',
  'Pilihan Ganda Kompleks',
  'Benar / Salah',
  'Menjodohkan',
  'Isian Singkat',
  'Uraian',
];

export function getDefaultFaseByJenjang(jenjang: Jenjang): {
  label: string;
  defaultValue: string;
} {
  switch (jenjang) {
    case 'SD':
      return { label: 'Fase Perkembangan (Fase A/B/C)', defaultValue: 'Fase C' };
    case 'SMP':
      return { label: 'Fase Perkembangan', defaultValue: 'Fase D' };
    case 'SMA':
      return { label: 'Fase Perkembangan (Fase E/F)', defaultValue: 'Fase F' };
    case 'SMK':
      return {
        label: 'Konsentrasi Keahlian / Jurusan',
        defaultValue: 'Teknik Jaringan Komputer & Telekomunikasi',
      };
  }
}

export function getCognitiveCategory(bloom: BloomLevel): CognitiveCategory {
  if (bloom === 'C1' || bloom === 'C2') return 'LOTS';
  if (bloom === 'C3') return 'MOTS';
  return 'HOTS';
}

export function validateAssessmentMeta(meta: AssessmentMeta): string | null {
  if (!meta.sekolah.trim()) return 'Nama Satuan Pendidikan wajib diisi.';
  if (!meta.mapel.trim()) return 'Mata Pelajaran wajib diisi.';
  if (!meta.materi.trim()) return 'Materi Pokok pembelajaran wajib diisi.';
  if (!meta.kompetensi.trim()) {
    return "CP / TP / KD belum diisi. Klik 'Buatkan Usulan AI' untuk bantuan.";
  }
  if (!Number.isFinite(meta.jumlahSoal) || meta.jumlahSoal < 1 || meta.jumlahSoal > 50) {
    return 'Jumlah butir soal harus berada di antara 1 sampai 50 butir.';
  }
  if (!meta.bentukSoalList || meta.bentukSoalList.length === 0) {
    return 'Pilih minimal satu bentuk soal (Pilihan Ganda, Uraian, dll.).';
  }
  return null;
}

export function normalizeKisiAndSoal(
  kisiKisi: KisiKisiRow[],
  soalList: QuestionItem[],
  metaForMissing?: AssessmentMeta
): { kisiKisi: KisiKisiRow[]; soalList: QuestionItem[] } {
  const normalizedKisi = kisiKisi.map((row, idx) => ({
    ...row,
    no: idx + 1,
    kategori: getCognitiveCategory(row.bloom),
  }));

  const normalizedSoal = soalList.map((soal, idx) => {
    const matchingKisi = normalizedKisi[idx];
    if (!matchingKisi) {
      return {
        ...soal,
        no: idx + 1,
        kategori: getCognitiveCategory(soal.bloom),
      };
    }

    const bentukChanged = soal.bentuk !== matchingKisi.bentuk;
    if (bentukChanged && metaForMissing) {
      const regenerated = generateFallbackSoalList(metaForMissing, [matchingKisi])[0];
      return {
        ...regenerated,
        no: idx + 1,
      };
    }

    const requiresNoOpsi =
      matchingKisi.bentuk === 'Uraian' || matchingKisi.bentuk === 'Isian Singkat';

    return {
      ...soal,
      no: idx + 1,
      indikator: matchingKisi.indikator,
      bloom: matchingKisi.bloom,
      kategori: matchingKisi.kategori,
      kesulitan: matchingKisi.kesulitan,
      bentuk: matchingKisi.bentuk,
      opsi: requiresNoOpsi ? null : soal.opsi,
    };
  });

  return { kisiKisi: normalizedKisi, soalList: normalizedSoal };
}

export function computeBloomDistribution(kisiKisi: KisiKisiRow[]): {
  lotsPct: number;
  motsPct: number;
  hotsPct: number;
  lotsCount: number;
  motsCount: number;
  hotsCount: number;
} {
  const total = kisiKisi.length;
  if (total === 0) {
    return {
      lotsPct: 0,
      motsPct: 0,
      hotsPct: 0,
      lotsCount: 0,
      motsCount: 0,
      hotsCount: 0,
    };
  }
  const lotsCount = kisiKisi.filter((k) => k.kategori === 'LOTS').length;
  const motsCount = kisiKisi.filter((k) => k.kategori === 'MOTS').length;
  const hotsCount = kisiKisi.filter((k) => k.kategori === 'HOTS').length;

  return {
    lotsPct: Math.round((lotsCount / total) * 100),
    motsPct: Math.round((motsCount / total) * 100),
    hotsPct: Math.round((hotsCount / total) * 100),
    lotsCount,
    motsCount,
    hotsCount,
  };
}

export function computeRubrikSummary(soalList: QuestionItem[]): {
  totalBobot: number;
  bobotPG: number;
  bobotLainnya: number;
  pctPG: number;
  pctLainnya: number;
} {
  let totalBobot = 0;
  let bobotPG = 0;
  let bobotLainnya = 0;

  for (const s of soalList) {
    const b = Number.isFinite(s.bobot) && s.bobot > 0 ? s.bobot : 10;
    totalBobot += b;
    if (s.bentuk === 'Pilihan Ganda') {
      bobotPG += b;
    } else {
      bobotLainnya += b;
    }
  }

  const pctPG = totalBobot > 0 ? Math.round((bobotPG / totalBobot) * 100) : 0;
  const pctLainnya = totalBobot > 0 ? 100 - pctPG : 0;

  return { totalBobot, bobotPG, bobotLainnya, pctPG, pctLainnya };
}

export function evaluateQualityChecks(soalList: QuestionItem[]): {
  items: QualityCheckItem[];
  validCount: number;
  revisiCount: number;
  invalidCount: number;
  overallScore: number;
} {
  if (soalList.length === 0) {
    return {
      items: [],
      validCount: 0,
      revisiCount: 0,
      invalidCount: 0,
      overallScore: 0,
    };
  }

  let validCount = 0;
  let revisiCount = 0;
  let invalidCount = 0;

  const items: QualityCheckItem[] = soalList.map((soal) => {
    const issues: string[] = [];
    let status: QualityStatus = 'Valid';

    if (!soal.stimulus || soal.stimulus.trim().length < 15) {
      status = 'Perlu Revisi';
      issues.push('Stimulus butir soal terlalu singkat atau kurang kontekstual.');
    }
    if (!soal.indikator.toLowerCase().includes('peserta didik')) {
      if (status === 'Valid') status = 'Perlu Revisi';
      issues.push("Rumusan indikator disarankan menggunakan subjek baku 'peserta didik'.");
    }
    if (soal.kategori === 'HOTS' && (soal.bloom === 'C1' || soal.bloom === 'C2')) {
      status = 'Perlu Revisi';
      issues.push(
        'Ketidaksesuaian Level: Soal berlabel HOTS namun level kognitif terdaftar C1/C2 (LOTS).'
      );
    }
    if (
      soal.bentuk === 'Pilihan Ganda' &&
      (!soal.opsi || Object.keys(soal.opsi).length < 4)
    ) {
      status = 'Tidak Sesuai';
      issues.push('Jumlah pilihan jawaban kurang dari 4 opsi standar.');
    }
    if (!soal.kunci || soal.kunci.trim() === '') {
      status = 'Tidak Sesuai';
      issues.push('Kunci jawaban belum terdefinisi.');
    }

    if (status === 'Valid') validCount++;
    else if (status === 'Perlu Revisi') revisiCount++;
    else invalidCount++;

    return {
      no: soal.no,
      status,
      issues:
        issues.length > 0
          ? issues
          : ['Soal teruji memenuhi kaidah penulisan butir asesmen standar nasional.'],
      rekomendasi:
        issues.length > 0
          ? 'Perbaiki rumusan pengecoh dan perjelas kriteria penskoran.'
          : 'Pertahankan komposisi stimulus kontekstual.',
    };
  });

  const overallScore = Math.round(
    ((validCount * 1.0 + revisiCount * 0.6) / items.length) * 100
  );

  return { items, validCount, revisiCount, invalidCount, overallScore };
}

const KKO_MAP: Record<BloomLevel, string> = {
  C1: 'mengidentifikasi konsep dasar',
  C2: 'menguraikan hubungan kausalitas',
  C3: 'menerapkan formula atau prosedur',
  C4: 'menganalisis permasalahan kontekstual',
  C5: 'mengevaluasi efektivitas opsi penyelesaian',
  C6: 'merancang solusi atau strategi alternatif',
};

export function generateRuleBasedKisiKisi(
  meta: AssessmentMeta,
  bloomPreset: BloomPreset = 'balanced'
): KisiKisiRow[] {
  const total = Math.max(1, Math.min(50, Math.round(meta.jumlahSoal) || 5));
  const bentukList: QuestionForm[] =
    meta.bentukSoalList.length > 0 ? meta.bentukSoalList : ['Pilihan Ganda'];

  let bloomsPattern: BloomLevel[];
  if (bloomPreset === 'hots') {
    bloomsPattern = ['C4', 'C5', 'C4', 'C6', 'C3', 'C5'];
  } else if (bloomPreset === 'lots') {
    bloomsPattern = ['C1', 'C2', 'C1', 'C3', 'C2', 'C2'];
  } else {
    bloomsPattern = ['C2', 'C3', 'C4', 'C3', 'C5', 'C1', 'C4', 'C6'];
  }

  const rows: KisiKisiRow[] = [];
  for (let i = 1; i <= total; i++) {
    const bloom = bloomsPattern[(i - 1) % bloomsPattern.length];
    const kategori = getCognitiveCategory(bloom);
    const kesulitan: DifficultyLevel =
      kategori === 'LOTS' ? 'Mudah' : kategori === 'MOTS' ? 'Sedang' : 'Sulit';
    const bentuk = bentukList[(i - 1) % bentukList.length];

    rows.push({
      no: i,
      cptp: meta.kompetensi,
      tpipk: `Memahami serta ${KKO_MAP[bloom]} terkait aspek ke-${i} dari topik ${meta.materi}`,
      materi: meta.materi,
      submateri: `Sub-komponen Aspek ${i}`,
      indikator: `Disajikan ilustrasi permasalahan kontekstual ${meta.mapel}, peserta didik mampu ${KKO_MAP[bloom]} dengan tepat.`,
      bloom,
      kategori,
      kesulitan,
      bentuk,
    });
  }
  return rows;
}

export function generateFallbackSoalList(
  meta: AssessmentMeta,
  kisiKisi: KisiKisiRow[]
): QuestionItem[] {
  const isJenjangTinggi = meta.jenjang === 'SMA' || meta.jenjang === 'SMK';
  const mapelLower = meta.mapel.toLowerCase();

  return kisiKisi.map((row) => {
    let opsi: Record<string, string> | null = null;
    let kunci = '';
    let rubrik = '';
    let stimulus = '';
    let pertanyaan = '';
    let pembahasan = '';

    if (meta.jenjang === 'SD' && mapelLower.includes('matematika')) {
      stimulus = `Ibu memiliki 3/4 kg tepung terigu. Sebanyak 1/2 kg digunakan untuk membuat kue bolu. Kemudian Ibu membeli lagi 1/4 kg tepung untuk persediaan di dapur.`;
      pertanyaan = `Berdasarkan keterangan di atas, hitunglah sisa total tepung terigu yang dimiliki Ibu saat ini!`;
      if (row.bentuk === 'Pilihan Ganda') {
        opsi = { A: '1/2 kg', B: '3/4 kg', C: '1/4 kg', D: '1 kg' };
        kunci = 'A';
        pembahasan =
          'Perhitungan sisa tepung: (3/4 - 1/2) + 1/4 = (3/4 - 2/4) + 1/4 = 1/4 + 1/4 = 2/4 = 1/2 kg. Opsi lain keliru saat menyamakan penyebut pecahan.';
        rubrik = 'Skor 10: Memilih A secara tepat. Skor 0 jika jawaban salah.';
      } else {
        kunci = '1/2 kg (atau 0,5 kg)';
        pembahasan =
          'Langkah pengerjaan menyamakan penyebut menjadi 4: (3/4 - 2/4) + 1/4 = 2/4 = 1/2 kg.';
        rubrik =
          'Skor 20: Langkah perhitungan runut dan hasil akhir 1/2 kg tepat.\nSkor 10: Langkah benar namun perhitungan akhir keliru.\nSkor 0: Tidak menjawab atau langkah salah.';
      }
    } else if (mapelLower.includes('informatika')) {
      stimulus = `Dalam sebuah sistem otomasi gerbang pintar, gerbang hanya akan terbuka jika sensor mendeteksi kartu identitas aktif ATAU sensor biometrik wajah mengenali pengguna terdaftar, DAN sensor halangan inframerah menunjukkan jalur dalam kondisi aman (True).`;
      pertanyaan = `Analisis kombinasi kondisi logika tersebut! Jika kartu identitas tidak aktif (False), biometrik terverifikasi (True), dan jalur terhalang (False), apakah gerbang terbuka?`;
      if (row.bentuk === 'Pilihan Ganda') {
        opsi = {
          A: 'Tidak terbuka, karena kondisi sensor keamanan jalur bernilai False',
          B: 'Terbuka, karena biometrik wajah sudah bernilai True',
          C: 'Terbuka parsial karena gerbang logika OR mendominasi',
          D: 'Sistem mengalami error komputasi percabangan',
        };
        kunci = 'A';
        pembahasan =
          'Rumusan logika: (Kartu OR Wajah) AND Jalur_Aman. Sub-ekspresi (False OR True) menghasilkan True, namun operasi AND dengan Jalur_Aman (False) menghasilkan False sehingga gerbang tetap tertutup.';
        rubrik = 'Skor 15: Memilih A dengan penalaran logika boolean yang valid.';
      } else if (row.bentuk === 'Pilihan Ganda Kompleks') {
        opsi = {
          A: 'Operasi (Kartu OR Wajah) bernilai True karena biometrik valid',
          B: 'Operasi akhir AND menghasilkan True walaupun jalur terhalang',
          C: 'Gerbang tidak akan terbuka demi keamanan jalur yang bernilai False',
          D: 'Gerbang tetap terbuka selama salah satu input bernilai True',
        };
        kunci = 'A dan C';
        pembahasan =
          'Pernyataan A benar karena operator OR bernilai True jika salah satu operand True. Pernyataan C benar karena operator AND mewajibkan kedua sisi bernilai True.';
        rubrik = 'Skor 20: Memilih A dan C. Skor 10: Memilih satu pernyataan benar.';
      } else {
        kunci = 'Tidak terbuka, karena (False OR True) AND False = False.';
        pembahasan =
          'Evaluasi operator prioritas dalam tanda kurung menghasilkan True, lalu dikombinasikan dengan AND False menjadi False.';
        rubrik = 'Skor 20: Evaluasi boolean runut dan kesimpulan tepat.';
      }
    } else {
      stimulus = `Di suatu wilayah, terjadi kenaikan laju permasalahan pada aspek ${row.submateri} dalam topik ${meta.materi}. Data lapangan menunjukkan perlunya keputusan terukur agar keseimbangan sistem tetap terjaga dan indikator kinerja mencapai target optimal.`;
      pertanyaan = `Berdasarkan indikator "${row.indikator}", tentukan analisis atau langkah penyelesaian yang paling tepat dan terukur!`;

      if (row.bentuk === 'Pilihan Ganda') {
        opsi = {
          A: 'Menerapkan kebijakan atau strategi terpadu yang berbasis evaluasi data lapangan secara terukur',
          B: 'Mengambil langkah ekstrem jangka pendek tanpa memperhitungkan dampak sistemik',
          C: 'Mengabaikan indikator utama dan hanya berfokus pada gejala permukaan',
          D: 'Menunda seluruh penyesuaian teknis hingga kondisi berubah secara alami',
        };
        if (isJenjangTinggi) {
          opsi.E =
            'Menghapus seluruh regulasi pengendalian agar mekanisme berjalan tanpa pengawasan';
        }
        kunci = 'A';
        pembahasan = `Pendekatan yang tepat untuk butir nomor ${row.no} adalah opsi A karena selaras dengan prinsip pengendalian sistem pada topik ${meta.materi}. Opsi lainnya berisiko memperburuk ketidakseimbangan.`;
        rubrik = `Skor ${row.kesulitan === 'Sulit' ? 20 : 10}: Menjawab A secara akurat. Skor 0 jika salah.`;
      } else if (row.bentuk === 'Pilihan Ganda Kompleks') {
        opsi = {
          A: `Identifikasi akar masalah pada ${row.submateri} menjadi langkah awal yang krusial`,
          B: 'Evaluasi indikator keberhasilan dapat diabaikan selama proses berjalan cepat',
          C: `Penerapan instrumen terukur dalam ${meta.materi} membantu menjaga stabilitas`,
          D: 'Data historis tidak memiliki relevansi terhadap pengambilan keputusan strategis',
        };
        kunci = 'A dan C';
        pembahasan =
          'Pernyataan A dan C benar secara konseptual dan prosedural. Pernyataan B dan D keliru karena evaluasi dan data historis merupakan komponen penting pengambilan keputusan.';
        rubrik = 'Skor 20: Memilih A dan C. Skor 10: Memilih satu pernyataan benar.';
      } else if (row.bentuk === 'Benar / Salah') {
        opsi = {
          'Pernyataan 1': `Analisis kausalitas pada ${row.submateri} membantu menentukan intervensi yang akurat.`,
          'Pernyataan 2': `Pengambilan keputusan tanpa mengacu pada data konteks ${meta.materi} selalu menghasilkan solusi optimal.`,
        };
        kunci = 'Pernyataan 1: Benar | Pernyataan 2: Salah';
        pembahasan =
          'Pernyataan 1 Benar karena analisis kausalitas menjadi landasan solusi. Pernyataan 2 Salah karena keputusan tanpa data berisiko tinggi meleset dari sasaran.';
        rubrik = 'Skor 10: Kedua pernyataan benar. Skor 5: Satu pernyataan benar.';
      } else if (row.bentuk === 'Menjodohkan') {
        opsi = {
          'Premis A': `Identifikasi masalah ${row.submateri}`,
          'Premis B': `Evaluasi dampak kebijakan ${meta.materi}`,
          'Pasangan 1': 'Tahap analisis awal berbasis data',
          'Pasangan 2': 'Tahap pengukuran efektivitas hasil',
        };
        kunci = 'Premis A -> Pasangan 1 | Premis B -> Pasangan 2';
        pembahasan =
          'Identifikasi masalah berpasangan dengan tahap analisis awal, sedangkan evaluasi dampak berpasangan dengan pengukuran efektivitas hasil.';
        rubrik = 'Skor 10: Kedua pasangan tepat. Skor 5: Satu pasangan tepat.';
      } else if (row.bentuk === 'Isian Singkat') {
        kunci = `Analisis terukur pada ${row.submateri}`;
        pembahasan = `Jawaban singkat menekankan prinsip inti ${row.submateri} dalam lingkup ${meta.materi}.`;
        rubrik = 'Skor 10: Kata kunci jawaban tepat. Skor 5: Jawaban mendekati konsep.';
      } else {
        kunci = `Langkah penyelesaian: 1) Analisis kausalitas dampak; 2) Penerapan strategi terintegrasi pada ${row.submateri}; 3) Evaluasi berkala terhadap indikator keberhasilan.`;
        pembahasan = `Jawaban uraian harus menguraikan 3 tahapan sistematis sesuai indikator dengan argumentasi logis berbasis konteks ${meta.materi}.`;
        rubrik = `Kriteria Uraian:\n- Skor 25: Jawaban runtut, mencakup 3 aspek pemecahan masalah dengan argumentasi kuat.\n- Skor 15: Menjelaskan 2 aspek secara memadai.\n- Skor 5: Hanya menyebutkan definisi tanpa analisis konseptual.`;
      }
    }

    const bobot =
      row.bentuk === 'Uraian'
        ? 25
        : row.bentuk === 'Pilihan Ganda Kompleks'
          ? 20
          : row.kesulitan === 'Sulit'
            ? 15
            : 10;

    return {
      no: row.no,
      bentuk: row.bentuk,
      bloom: row.bloom,
      kategori: row.kategori,
      kesulitan: row.kesulitan,
      indikator: row.indikator,
      stimulus,
      pertanyaan,
      opsi,
      kunci,
      pembahasan,
      bobot,
      rubrik,
    };
  });
}

export function getSamplePreset(presetKey: PresetKey): {
  assessment: AssessmentMeta;
  kisiKisi: KisiKisiRow[];
  soalList: QuestionItem[];
} {
  let assessment: AssessmentMeta;

  if (presetKey === 'sd_mat') {
    assessment = {
      sekolah: 'SD Negeri Percobaan 1',
      jenjang: 'SD',
      kurikulum: 'Merdeka',
      kelas: 'Kelas 5',
      faseJurusan: 'Fase C',
      semester: 'Ganjil',
      tahun: '2024/2025',
      mapel: 'Matematika',
      materi: 'Operasi Hitung Pecahan dan Desimal dalam Kehidupan Sehari-Hari',
      kompetensi:
        'Peserta didik mampu menyelesaikan masalah berkaitan dengan penjumlahan dan pengurangan pecahan dengan penyebut berbeda, serta penerapannya pada desimal.',
      jenisAsesmen: 'Sumatif Akhir Semester (SAS)',
      alokasiWaktu: 70,
      jumlahSoal: 4,
      bentukSoalList: ['Pilihan Ganda', 'Uraian'],
    };
  } else if (presetKey === 'smp_infor') {
    assessment = {
      sekolah: 'SMP Negeri Unggulan 2',
      jenjang: 'SMP',
      kurikulum: 'Merdeka',
      kelas: 'Kelas 8',
      faseJurusan: 'Fase D',
      semester: 'Ganjil',
      tahun: '2024/2025',
      mapel: 'Informatika',
      materi: 'Berpikir Komputasional dan Logika Algoritma Percabangan',
      kompetensi:
        'Peserta didik mampu menerapkan prinsip computational thinking untuk menyelesaikan persoalan komputasi yang mengandung struktur percabangan logis.',
      jenisAsesmen: 'Sumatif Tengah Semester (STS)',
      alokasiWaktu: 80,
      jumlahSoal: 4,
      bentukSoalList: ['Pilihan Ganda', 'Pilihan Ganda Kompleks'],
    };
  } else if (presetKey === 'smk_tkj') {
    assessment = {
      sekolah: 'SMK Negeri 1 Teknologi Kejuruan',
      jenjang: 'SMK',
      kurikulum: 'Merdeka',
      kelas: 'Kelas 11',
      faseJurusan: 'Teknik Jaringan Komputer & Telekomunikasi (TJKT)',
      semester: 'Ganjil',
      tahun: '2024/2025',
      mapel: 'Dasar-Dasar Teknik Jaringan Komputer & Telekomunikasi (TJKT)',
      materi: 'Perancangan Subnetting IPv4 Berbasis VLSM dan CIDR',
      kompetensi:
        'Peserta didik mampu menghitung pembagian network address, subnet mask, usable host, dan gateway untuk efisiensi alokasi jaringan enterprise.',
      jenisAsesmen: 'Sumatif Akhir Semester (SAS)',
      alokasiWaktu: 90,
      jumlahSoal: 5,
      bentukSoalList: ['Pilihan Ganda', 'Uraian'],
    };
  } else {
    assessment = {
      sekolah: 'SMAN 1 Teladan',
      jenjang: 'SMA',
      kurikulum: 'Merdeka',
      kelas: 'Kelas 11',
      faseJurusan: 'Fase F',
      semester: 'Ganjil',
      tahun: '2024/2025',
      mapel: 'Ekonomi',
      materi: 'Kebijakan Moneter dan Kebijakan Fiskal dalam Perekonomian',
      kompetensi:
        'Peserta didik mampu menganalisis konsep kebijakan moneter dan fiskal, instrumen penerapannya, serta dampaknya terhadap stabilitas harga dan pertumbuhan ekonomi nasional.',
      jenisAsesmen: 'Sumatif Akhir Semester (SAS)',
      alokasiWaktu: 90,
      jumlahSoal: 5,
      bentukSoalList: ['Pilihan Ganda', 'Pilihan Ganda Kompleks', 'Uraian'],
    };
  }

  const kisiKisi = generateRuleBasedKisiKisi(assessment, 'balanced');
  const soalList = generateFallbackSoalList(assessment, kisiKisi);

  return { assessment, kisiKisi, soalList };
}

export function filterBankItems(
  bank: BankItem[],
  keyword: string,
  jenjangFilter: string,
  kurikulumFilter: string
): BankItem[] {
  const q = keyword.trim().toLowerCase();
  return bank.filter((item) => {
    const matchKey =
      !q ||
      item.assessment.mapel.toLowerCase().includes(q) ||
      item.assessment.materi.toLowerCase().includes(q) ||
      item.assessment.sekolah.toLowerCase().includes(q);
    const matchJenjang = !jenjangFilter || item.assessment.jenjang === jenjangFilter;
    const matchKurikulum =
      !kurikulumFilter || item.assessment.kurikulum === kurikulumFilter;
    return matchKey && matchJenjang && matchKurikulum;
  });
}
