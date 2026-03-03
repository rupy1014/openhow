---
slug: 부록-remotion-tts-render
title: "TTS · 오디오 · 렌더링"
nav: TTS · 렌더 커맨드
order: 10
---

**씬 스펙이 완성됐으면 TTS 생성하고, 타임라인 검증하고, 렌더링해.**

---

## TTS는 어떻게 생성하냐

YAML `speaker` 필드에 따라 자동으로 분기돼.

```
instructor → ElevenLabs   (고품질, 주력 음성)
student    → Fish Audio   (저렴, 짧은 대사용)
```

:::steps

### 비용 먼저 확인

```bash:터미널
npm run tts:dry ep01-ai-coding-map
```

API 한 번도 안 부르고 예상 비용만 계산해줘.

```
💰 예상 비용:
   ElevenLabs (강의자): ~$0.534  (3,200자 × $0.000167)
   Fish Audio (질문자): ~$0.012  (260자 × $0.000045)
   합계: ~$0.546
```

### TTS 생성

```bash:터미널
npm run tts ep01-ai-coding-map
```

강의자/질문자 MP3가 씬별로 생성되고 `_manifest.json`에 메타가 기록돼.

```
public/audio/ep01-ai-coding-map/
├── opening-01.mp3      ← ElevenLabs
├── opening-05.mp3      ← Fish Audio
├── ...
└── _manifest.json      ← 씬별 파일명, 추정 길이
```

### 오디오 후처리

```bash:터미널
npm run audio:polish ep01-ai-coding-map
```

3단계로 자동 처리돼.

**Phase 1** — 1.1배속 + 무음 트리밍
- TTS 엔진이 앞뒤에 붙이는 침묵 구간 제거 (-35dB 이하)
- 1.1배속 (atempo 필터, 음정 유지)
- 끝에 0.03초 여백만 남김

**Phase 2** — CPS 정규화 (강의자 씬만)
- 목표 CPS: **9.8** (글자/초)
- 9.0 미만인 씬에 추가 배속 (최대 1.3x)
- 씬마다 말하는 속도가 달라서 생기는 리듬 불균형 방지

**Phase 3** — `_manifest.json` 업데이트
- 각 씬의 실제 오디오 길이(`actual_sec`) 기록
- 이 값이 없으면 타임라인 빌드에서 프레임 계산이 틀려

:::

:::warning
**`tts:dry`로 금액 확인 후에 `tts` 실행해.**
10분짜리 에피소드 기준 ~$0.55 수준이야.
:::

### TTS 서비스 선택지

| 서비스 | 특징 | 한국어 |
|--------|------|--------|
| **ElevenLabs** | 고품질, 감정 표현 자연스러움 | 상 |
| **Fish Audio** | 저렴, 짧은 대사에 충분 | 중 |
| **수퍼톤 (Supertone)** | 국내 서비스, 한국어 특화 | 상 |
| **CLOVA Voice** | Naver, 안정적이고 저렴 | 중상 |
| **Azure TTS** | 다양한 한국어 음성 | 중상 |

---

## 타임라인은 어떻게 만들어지냐

```bash:터미널
npm run timeline ep01-ai-coding-map
```

YAML 씬 스펙 + `_manifest.json`의 `actual_sec` → `src/data/{slug}.json` 생성.
Remotion이 이 JSON을 읽어서 각 씬의 시작 프레임과 길이를 알아.

**프레임 계산 규칙:**

```
FPS: 30 | 해상도: 1920×1080

TTS 있는 씬:   round((actual_sec + 0.15) × 30) 프레임
TTS 없는 씬:   round(duration_sec × 30) 프레임
씬 간 갭:      0프레임 (무음편집, 갭 없음)
```

**자동 검증 — 이게 실패하면 렌더링 하면 안 돼:**

```yaml
치명적 (빌드 실패):
  - YAML 파일 없음
  - _manifest.json 없음

경고 (확인 필요):
  - actual_sec 누락 씬 존재
  - 오디오-타임라인 차이 1초 이상
  - BGM 없음
  - 총 길이 5분 미만 or 15분 초과
  - kling 씬에 영상 파일 없음
```

---

## /render — 렌더링 파이프라인

```bash:Claude Code
/render ep01-ai-coding-map            # 전체 렌더링
/render ep01-ai-coding-map --preview  # 앞 70초만 미리보기
/render ep01-ai-coding-map --section 본론  # 특정 섹션만
```

Claude Code가 아래 파이프라인을 순서대로 실행해줘.

:::steps

### 리소스 검증

렌더링 전에 필요한 파일이 다 있는지 먼저 확인해.

```yaml
필수:
  - video/scenes/{slug}.yaml
  - public/audio/{slug}/_manifest.json  (actual_sec 포함)
  - public/audio/{slug}/*.mp3

선택:
  - public/video/{slug}/*.mp4   (kling/립싱크 영상)
  - public/assets/...           (씬의 image 필드 참조 파일)
```

이미지가 하나라도 없으면 누락 목록을 알려주고 확인을 받아.

### 오디오 후처리 (audio:polish 안 했을 경우)

```bash:터미널
npm run audio:polish ep01-ai-coding-map
```

### 타임라인 빌드

```bash:터미널
npm run timeline ep01-ai-coding-map
```

### Remotion Studio에서 미리보기

```bash:터미널
npm run start
```

`localhost:3700`에서 프레임 단위로 확인해.

```
□ 오디오 끊기는 구간 없는지 (tts 빈 씬)
□ 이미지 에셋 404 안 나는지
□ 립싱크 영상 싱크 맞는지
□ BGM 페이드 자연스러운지
□ 씬 전환 타이밍 어색하지 않은지
```

### 최종 MP4 렌더링

```bash:터미널
npm run build
# 출력: out/ep01-ai-coding-map.mp4
# 10분짜리 기준 5~10분 소요
```

미리보기만 뽑으려면:

```bash:터미널
npx remotion render src/index.ts EpisodeVideo out/preview.mp4 --frames=0-2100
```

### SRT 자막 생성

```bash:터미널
npm run srt ep01-ai-coding-map
# 출력: out/ep01-ai-coding-map.srt + .vtt
```

tts 필드의 한글 발음을 원문으로 자동 복원해줘.
(`에이아이 → AI`, `챗지피티 → ChatGPT` 등, `term-map.json` 기준)
호흡 단위 자동 분할 (38자 / 2문장 / 4초 기준).

:::

**트러블슈팅:**

```yaml
오디오 404:
  → Audio src에 staticFile() 래핑 확인
  → public/audio/ 경로에 파일 있는지 확인

타임라인 불일치:
  → YAML 씬 ID와 manifest scene_id 일치 여부 확인
  → npm run timeline 재실행

렌더링 메모리 부족:
  → --concurrency=1 옵션 추가
  → 섹션별로 나눠서 렌더링
```

---

## YouTube에 어떻게 올리냐

`.env`에 OAuth 설정해두면 YAML `youtube` 섹션으로 자동 업로드가 가능해.

```bash:.env
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...
YOUTUBE_ACCESS_TOKEN=...
YOUTUBE_REFRESH_TOKEN=...
YOUTUBE_CHANNEL_ID=...
```

썸네일(`out/thumb-{slug}.png`)도 API로 함께 올릴 수 있어.

---

## 한 줄 정리

dry run 으로 비용 확인 → TTS → audio:polish → timeline → Studio 미리보기 → build → srt. 이 순서야.
