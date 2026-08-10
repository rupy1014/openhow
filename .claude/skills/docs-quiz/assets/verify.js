#!/usr/bin/env node
/**
 * docs-quiz 검증 스크립트.
 *
 *   NODE_PATH=/opt/homebrew/lib/node_modules node verify.js <퀴즈-html-절대경로>
 *
 * playwright는 전역(brew)에만 설치돼 있어서 NODE_PATH가 필요하다.
 * 전부 통과하면 exit 0, 하나라도 실패하면 사유를 찍고 exit 1.
 */

const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const target = process.argv[2];

if (!target) {
  console.error('usage: node verify.js <퀴즈-html-절대경로>');
  process.exit(2);
}

const abs = path.resolve(target);

if (!fs.existsSync(abs)) {
  console.error(`파일 없음: ${abs}`);
  process.exit(2);
}

const failures = [];

function check(ok, message) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${message}`);
  if (!ok) failures.push(message);
}

/** 주기 2~6의 반복 패턴이면 그 주기를 반환, 없으면 null. */
function findPeriod(spread) {
  for (let period = 2; period <= 6; period++) {
    if (spread.length <= period * 2) continue;
    let periodic = true;
    for (let i = period; i < spread.length; i++) {
      if (spread[i] !== spread[i - period]) {
        periodic = false;
        break;
      }
    }
    if (periodic) return period;
  }
  return null;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });

  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  await page.goto(`file://${abs}`, { waitUntil: 'networkidle', timeout: 15000 });

  const data = await page.evaluate(() => ({
    total: CHAPTERS.reduce((s, c) => s + c.questions.length, 0),
    chapters: CHAPTERS.map((c) => ({ tag: c.tag, title: c.title, count: c.questions.length })),
    questions: CHAPTERS.flatMap((c) =>
      c.questions.map((q) => ({ optionCount: q.options.length, answer: q.answer }))
    ),
  }));

  const cardCount = await page.$$eval('.quiz-card', (els) => els.length);

  console.log(`대상: ${abs}`);
  console.log(`챕터: ${data.chapters.map((c) => `${c.tag}(${c.count})`).join(' ')}`);
  console.log('');

  check(cardCount === data.total, `카드 수 ${cardCount} = 문항 수 ${data.total}`);
  check(
    data.total >= 10 && data.total <= 15,
    `문항 수 ${data.total}개가 권장 범위(10~15) 안`
  );

  const badOptions = data.questions
    .map((q, i) => ({ i: i + 1, n: q.optionCount }))
    .filter((q) => q.n !== 4);
  check(
    badOptions.length === 0,
    `모든 문항이 보기 4개${badOptions.length ? ` — 위반: ${badOptions.map((q) => `Q${q.i}=${q.n}개`).join(', ')}` : ''}`
  );

  const badAnswers = data.questions
    .map((q, i) => ({ i: i + 1, a: q.answer, n: q.optionCount }))
    .filter((q) => !Number.isInteger(q.a) || q.a < 0 || q.a >= q.n);
  check(
    badAnswers.length === 0,
    `answer 인덱스가 전부 유효${badAnswers.length ? ` — 위반: ${badAnswers.map((q) => `Q${q.i}=${q.a}`).join(', ')}` : ''}`
  );

  const spread = data.questions.map((q) => 'ABCD'[q.answer] ?? '?').join('');
  const counts = {};
  for (const ch of spread) counts[ch] = (counts[ch] || 0) + 1;
  const maxShare = Math.max(...['A', 'B', 'C', 'D'].map((k) => counts[k] || 0));

  console.log(`정답 분포: ${spread}  ${JSON.stringify(counts)}`);

  const period = findPeriod(spread);
  check(period === null, `정답 위치에 주기적 패턴 없음${period ? ` — 주기 ${period} 반복 발견` : ''}`);
  check(
    maxShare <= Math.ceil(data.total / 2),
    `한 위치(A~D)에 정답이 몰리지 않음 (최다 ${maxShare}개 / ${data.total}문항)`
  );

  // 전 문항 정답 클릭
  const cards = await page.$$('.quiz-card');
  for (let i = 0; i < cards.length; i++) {
    const opts = await cards[i].$$('.opt');
    await opts[data.questions[i].answer].click();
  }
  await page.waitForTimeout(600);

  const finalScore = Number(await page.textContent('#score'));
  const progress = (await page.textContent('#progress')).trim();
  const resultOpen = await page.$eval('#result', (el) => el.classList.contains('open'));
  const resultTitle = (await page.textContent('#result-title')).trim();
  const fill = await page.evaluate(() => {
    const f = document.getElementById('fill');
    return {
      fillPx: Math.round(f.getBoundingClientRect().width),
      trackPx: Math.round(f.parentElement.getBoundingClientRect().width),
    };
  });

  check(finalScore === data.total, `전 문항 정답 클릭 시 만점 (${progress}, 정답 ${finalScore})`);
  check(resultOpen, `완료 시 결과 카드 노출 — "${resultTitle}"`);
  check(fill.fillPx === fill.trackPx, `progress bar 100% 도달 (${fill.fillPx}/${fill.trackPx}px)`);
  check(pageErrors.length === 0, `JS 런타임 에러 없음${pageErrors.length ? ` — ${pageErrors.join(' | ')}` : ''}`);

  await browser.close();

  console.log('');
  if (failures.length) {
    console.log(`실패 ${failures.length}건:`);
    failures.forEach((f) => console.log(`  - ${f}`));
    process.exit(1);
  }
  console.log('전부 통과.');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
