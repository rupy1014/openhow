#!/bin/zsh
# speed-trim.sh — TTS 오디오 1.1배속 + 무음 트리밍
# Usage: zsh scripts/tools/speed-trim.sh <slug> [--dry-run]
#
# 1. atempo=1.1 (1.1배속)
# 2. 앞뒤 무음 제거 (threshold -35dB)
# 3. 끝에 0.03초 여유 (완전 무호흡 느낌)

set -euo pipefail

SLUG="${1:?Usage: speed-trim.sh <slug> [--dry-run]}"
DRY_RUN=false
[[ "${2:-}" == "--dry-run" ]] && DRY_RUN=true

AUDIO_DIR="public/audio/${SLUG}"
BACKUP_DIR="${AUDIO_DIR}/_backup"

if [[ ! -d "$AUDIO_DIR" ]]; then
  echo "❌ 디렉토리 없음: $AUDIO_DIR"
  exit 1
fi

# MP3 파일 목록 (매니페스트 제외)
FILES=("${(@f)$(find "$AUDIO_DIR" -maxdepth 1 -name '*.mp3' -not -name '_*' | sort)}")
TOTAL=${#FILES[@]}

if [[ $TOTAL -eq 0 ]]; then
  echo "❌ MP3 파일 없음: $AUDIO_DIR"
  exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎤 Speed-Trim: ${SLUG}"
echo "   파일 수: ${TOTAL}"
echo "   배속: 1.1x"
echo "   무음 트리밍: -35dB threshold"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 총 변경량 추적
TOTAL_BEFORE=0
TOTAL_AFTER=0

if $DRY_RUN; then
  echo ""
  echo "📊 [DRY-RUN] 예상 결과:"
  echo ""
  printf "%-40s %8s → %8s  %s\n" "파일" "원본(초)" "예상(초)" "절감"
  echo "────────────────────────────────────────────────────────────────────────"

  for f in "${FILES[@]}"; do
    fname=$(basename "$f")
    dur=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$f" 2>/dev/null)

    if [[ -z "$dur" || "$dur" == "N/A" ]]; then
      printf "%-40s %8s → %8s  %s\n" "$fname" "ERR" "-" "skip"
      continue
    fi

    # 1.1배속 적용 시 예상 길이 (무음 트리밍 제외한 보수적 추정)
    estimated=$(echo "$dur / 1.1 - 0.2" | bc -l 2>/dev/null || echo "$dur")
    saved=$(echo "$dur - $estimated" | bc -l 2>/dev/null || echo "0")

    TOTAL_BEFORE=$(echo "$TOTAL_BEFORE + $dur" | bc -l)
    TOTAL_AFTER=$(echo "$TOTAL_AFTER + $estimated" | bc -l)

    printf "%-40s %8.2f → %8.2f  -%0.2fs\n" "$fname" "$dur" "$estimated" "$saved"
  done

  echo "────────────────────────────────────────────────────────────────────────"
  SAVED=$(echo "$TOTAL_BEFORE - $TOTAL_AFTER" | bc -l)
  printf "%-40s %8.1f → %8.1f  -%0.1fs\n" "합계" "$TOTAL_BEFORE" "$TOTAL_AFTER" "$SAVED"
  echo ""
  echo "📌 예상 절감: $(echo "$SAVED" | xargs printf '%.0f')초 ($(echo "$SAVED / 60" | bc -l | xargs printf '%.1f')분)"
  echo "📌 최종 길이: 약 $(echo "$TOTAL_AFTER / 60" | bc -l | xargs printf '%.1f')분"
  echo ""
  echo "실행하려면: bash scripts/tools/speed-trim.sh ${SLUG}"
  exit 0
fi

# ── 실제 처리 ──

# 백업 생성
if [[ ! -d "$BACKUP_DIR" ]]; then
  echo ""
  echo "📦 백업 생성: ${BACKUP_DIR}"
  mkdir -p "$BACKUP_DIR"
  for f in "${FILES[@]}"; do
    cp "$f" "$BACKUP_DIR/"
  done
  # 매니페스트도 백업
  [[ -f "${AUDIO_DIR}/_manifest.json" ]] && cp "${AUDIO_DIR}/_manifest.json" "$BACKUP_DIR/"
  echo "   ✅ ${TOTAL}개 파일 백업 완료"
fi

echo ""
echo "🔧 처리 중..."
echo ""

PROCESSED=0
ERRORS=0

for f in "${FILES[@]}"; do
  fname=$(basename "$f")
  dur_before=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$f" 2>/dev/null)

  if [[ -z "$dur_before" || "$dur_before" == "N/A" ]]; then
    echo "⚠️  SKIP: $fname (duration 읽기 실패)"
    ((ERRORS++)) || true
    continue
  fi

  TOTAL_BEFORE=$(echo "$TOTAL_BEFORE + $dur_before" | bc -l)

  # 임시 파일로 처리
  tmp="/tmp/speed-trim-${fname}"

  # ffmpeg 필터 체인:
  # 1. atempo=1.1 — 1.1배속 (음정 유지)
  # 2. silenceremove — 앞 무음 제거
  # 3. areverse + silenceremove + areverse — 뒤 무음 제거
  # 4. apad=pad_dur=0.03 — 끝에 0.03초 패딩 (너무 급하지 않게)
  ffmpeg -y -i "$f" \
    -af "atempo=1.1,silenceremove=start_periods=1:start_duration=0:start_threshold=-35dB,areverse,silenceremove=start_periods=1:start_duration=0:start_threshold=-35dB,areverse,apad=pad_dur=0.03" \
    -codec:a libmp3lame -q:a 2 \
    "$tmp" 2>/dev/null

  if [[ $? -eq 0 && -f "$tmp" ]]; then
    dur_after=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$tmp" 2>/dev/null)
    mv "$tmp" "$f"

    saved=$(echo "$dur_before - $dur_after" | bc -l 2>/dev/null || echo "0")
    TOTAL_AFTER=$(echo "$TOTAL_AFTER + $dur_after" | bc -l)

    printf "  ✅ %-35s %6.2fs → %6.2fs (-%0.2fs)\n" "$fname" "$dur_before" "$dur_after" "$saved"
    ((PROCESSED++)) || true
  else
    echo "  ❌ FAIL: $fname"
    ((ERRORS++)) || true
    rm -f "$tmp"
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
SAVED=$(echo "$TOTAL_BEFORE - $TOTAL_AFTER" | bc -l)
echo "✅ 처리 완료: ${PROCESSED}/${TOTAL} 파일"
[[ $ERRORS -gt 0 ]] && echo "⚠️  에러: ${ERRORS}개"
echo ""
printf "원본 합계:  %6.1fs (%0.1f분)\n" "$TOTAL_BEFORE" "$(echo "$TOTAL_BEFORE/60" | bc -l)"
printf "처리 후:    %6.1fs (%0.1f분)\n" "$TOTAL_AFTER" "$(echo "$TOTAL_AFTER/60" | bc -l)"
printf "절감:       %6.1fs (%0.1f분)\n" "$SAVED" "$(echo "$SAVED/60" | bc -l)"
echo ""
echo "📦 백업 위치: ${BACKUP_DIR}"
echo "🔄 복원: cp ${BACKUP_DIR}/*.mp3 ${AUDIO_DIR}/"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 매니페스트 업데이트 ──
MANIFEST="${AUDIO_DIR}/_manifest.json"
if [[ -f "$MANIFEST" ]]; then
  echo ""
  echo "📝 매니페스트 업데이트 중..."

  # Node.js로 매니페스트 업데이트
  node -e "
    const fs = require('fs');
    const { execSync } = require('child_process');
    const manifest = JSON.parse(fs.readFileSync('${MANIFEST}', 'utf-8'));

    let totalSec = 0;
    for (const scene of manifest.scenes) {
      const filePath = '${AUDIO_DIR}/' + scene.file;
      if (fs.existsSync(filePath)) {
        const dur = parseFloat(execSync('ffprobe -v quiet -show_entries format=duration -of csv=p=0 \"' + filePath + '\"').toString().trim());
        scene.actual_sec = Math.round(dur * 100) / 100;
        totalSec += dur;
      }
    }

    manifest.speed = 1.1;
    manifest.total_actual_sec = Math.round(totalSec * 10) / 10;
    manifest.total_actual_min = Math.round(totalSec / 60);
    manifest.post_processed = {
      atempo: 1.1,
      silence_trimmed: true,
      threshold_db: -35,
      tail_pad_sec: 0.03,
      processed_at: new Date().toISOString()
    };

    fs.writeFileSync('${MANIFEST}', JSON.stringify(manifest, null, 2));
    console.log('   ✅ 매니페스트 업데이트 완료');
    console.log('   총 길이: ' + Math.round(totalSec) + '초 (' + Math.round(totalSec/60) + '분)');
  "
fi
