import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeBloomDistribution,
  computeRubrikSummary,
  evaluateQualityChecks,
  filterBankItems,
  generateFallbackSoalList,
  generateRuleBasedKisiKisi,
  getCognitiveCategory,
  getSamplePreset,
  normalizeKisiAndSoal,
  validateAssessmentMeta,
} from './assessmentEngine';
import type { BankItem } from '../types/assessment';

test('getCognitiveCategory maps C1-C6 to LOTS, MOTS, and HOTS', () => {
  assert.equal(getCognitiveCategory('C1'), 'LOTS');
  assert.equal(getCognitiveCategory('C2'), 'LOTS');
  assert.equal(getCognitiveCategory('C3'), 'MOTS');
  assert.equal(getCognitiveCategory('C4'), 'HOTS');
  assert.equal(getCognitiveCategory('C5'), 'HOTS');
  assert.equal(getCognitiveCategory('C6'), 'HOTS');
});

test('validateAssessmentMeta rejects missing required fields and invalid counts', () => {
  const base = getSamplePreset('sma_ekonomi').assessment;
  assert.equal(validateAssessmentMeta(base), null);

  assert.ok(validateAssessmentMeta({ ...base, sekolah: '' }));
  assert.ok(validateAssessmentMeta({ ...base, materi: '   ' }));
  assert.ok(validateAssessmentMeta({ ...base, kompetensi: '' }));
  assert.ok(validateAssessmentMeta({ ...base, jumlahSoal: 0 }));
  assert.ok(validateAssessmentMeta({ ...base, jumlahSoal: 51 }));
  assert.ok(validateAssessmentMeta({ ...base, bentukSoalList: [] }));
});

test('generateRuleBasedKisiKisi creates requested count and respects HOTS preset', () => {
  const meta = { ...getSamplePreset('sma_ekonomi').assessment, jumlahSoal: 6 };
  const rows = generateRuleBasedKisiKisi(meta, 'hots');
  assert.equal(rows.length, 6);
  assert.equal(rows[0].no, 1);
  assert.equal(rows[5].no, 6);
  const dist = computeBloomDistribution(rows);
  assert.ok(dist.hotsPct >= 50);
  assert.equal(dist.lotsCount + dist.motsCount + dist.hotsCount, 6);
});

test('normalizeKisiAndSoal keeps sequential numbers and syncs metadata from kisi-kisi', () => {
  const preset = getSamplePreset('sma_ekonomi');
  const modifiedKisi = [
    { ...preset.kisiKisi[0], no: 99, bloom: 'C6' as const },
    { ...preset.kisiKisi[2], no: 42, bloom: 'C1' as const },
  ];
  const modifiedSoal = [
    { ...preset.soalList[0], no: 88, bloom: 'C1' as const },
    { ...preset.soalList[2], no: 77, bloom: 'C6' as const },
  ];

  const { kisiKisi, soalList } = normalizeKisiAndSoal(modifiedKisi, modifiedSoal);
  assert.equal(kisiKisi[0].no, 1);
  assert.equal(kisiKisi[1].no, 2);
  assert.equal(kisiKisi[0].kategori, 'HOTS');
  assert.equal(kisiKisi[1].kategori, 'LOTS');

  assert.equal(soalList[0].no, 1);
  assert.equal(soalList[0].bloom, 'C6');
  assert.equal(soalList[0].kategori, 'HOTS');
  assert.equal(soalList[1].no, 2);
  assert.equal(soalList[1].bloom, 'C1');
  assert.equal(soalList[1].kategori, 'LOTS');

  const changedShape = normalizeKisiAndSoal(
    [{ ...preset.kisiKisi[0], bentuk: 'Uraian' }],
    [{ ...preset.soalList[0], bentuk: 'Pilihan Ganda' }],
    preset.assessment
  );
  assert.equal(changedShape.soalList[0].bentuk, 'Uraian');
  assert.equal(changedShape.soalList[0].opsi, null);
});

test('computeRubrikSummary sums total points and splits PG vs other forms accurately', () => {
  const preset = getSamplePreset('sd_mat');
  const summary = computeRubrikSummary(preset.soalList);
  assert.ok(summary.totalBobot > 0);
  assert.equal(summary.bobotPG + summary.bobotLainnya, summary.totalBobot);
  assert.equal(summary.pctPG + summary.pctLainnya, 100);
});

test('evaluateQualityChecks detects missing keys and short stimuli', () => {
  const preset = getSamplePreset('smp_infor');
  const validQc = evaluateQualityChecks(preset.soalList);
  assert.equal(validQc.items.length, preset.soalList.length);
  assert.equal(validQc.overallScore, 100);

  const broken = generateFallbackSoalList(preset.assessment, preset.kisiKisi);
  broken[0] = { ...broken[0], kunci: '', stimulus: 'pendek' };
  const brokenQc = evaluateQualityChecks(broken);
  assert.equal(brokenQc.items[0].status, 'Tidak Sesuai');
  assert.equal(brokenQc.invalidCount, 1);
});

test('filterBankItems filters by keyword, jenjang, and kurikulum', () => {
  const sma = getSamplePreset('sma_ekonomi');
  const sd = getSamplePreset('sd_mat');
  const bank: BankItem[] = [
    {
      id: '1',
      date: '2026-11-15',
      assessment: sma.assessment,
      kisiKisi: sma.kisiKisi,
      soalList: sma.soalList,
      qualityChecks: [],
    },
    {
      id: '2',
      date: '2026-11-15',
      assessment: { ...sd.assessment, kurikulum: 'K13' },
      kisiKisi: sd.kisiKisi,
      soalList: sd.soalList,
      qualityChecks: [],
    },
  ];

  assert.equal(filterBankItems(bank, 'ekonomi', '', '').length, 1);
  assert.equal(filterBankItems(bank, '', 'SD', '').length, 1);
  assert.equal(filterBankItems(bank, '', '', 'K13').length, 1);
  assert.equal(filterBankItems(bank, 'fisika', '', '').length, 0);
});
