---
slug: 부록-remotion-write-scene
title: "/write · /scene 커맨드"
nav: /write · /scene
order: 3
---

**대본 쓰는 것부터 YAML 씬 스펙까지 Claude Code 커맨드 두 개로 끝나.**

---

## /write — 대본을 어떻게 쓰냐

```bash:Claude Code
/write ep01-ai-coding-map         # 에피소드 번호로
/write "Cursor vs Claude Code"    # 주제로
/write part1 ep03                 # 파트 + 에피소드 지정
```

실행하면 Claude가 내부적으로 이 순서로 일해.

:::steps

### 학습 상태 분석

`src/data/learner-state.json`을 먼저 읽어.
질문자가 지금까지 뭘 배웠는지, 어떤 용어를 알고 있는지 파악하고 — 이번 에피소드에서 어떤 용어를 새로 소개할지, 이전 에피소드와 어떻게 연결할지 전략을 세워.

### 콘텐츠 수집

로컬 문서 (`contents/clauders/`, `contents/vibe-coding-book/`) 스캔 + 웹 리서치를 병행해.
공식 사이트 가격, 최신 버전, Reddit/X 반응도 같이 가져와.

### 대본 집필 (episode-writer 에이전트)

강의자/질문자 2인 대화 형식으로 대본을 작성해.
파일: `scripts/part{N}/ep{NN}-{slug}.md`

**TTS 발음 표기 규칙** — 대사 텍스트는 TTS가 읽는 그대로 한글 발음으로:

```
AI          → 에이아이
Claude Code → 클로드 코드
8조 원      → 팔조 원
24%         → 이십사 퍼센트
$15         → 십오달러
```

화면 지시 `[화면: ...]` 안의 텍스트는 영문 원문 그대로 써도 돼.
(`src/data/term-map.json`에 전체 용어 발음 매핑이 있어.)

### 퇴고 (episode-proofreader 에이전트)

집필 완료 후 자동으로 이어서 돌아가.

- **TTS 발음 검수** — 영어/숫자가 한글로 변환 안 된 곳 수정
- **학습 연속성 검수** — 질문자가 모르는 용어를 설명 없이 쓰진 않는지, 갑자기 전문가처럼 말하진 않는지
- **이미지 소싱** — 공식 스크린샷, 다이어그램 찾아서 대본에 삽입
- 분량 체크 (2,000~3,500자), 문장 길이 체크 (60자 이내)

### 학습 상태 업데이트

`learner-state.json`에 새 용어, 감정 상태, 다음 에피소드용 콜백 씨앗 기록.

:::

퇴고만 다시 돌리고 싶으면:

```bash:Claude Code
/proofread ep02-cursor-vs-claude-code
/proofread                              # 가장 최근 대본
```

---

## /scene — 씬 스펙은 어떻게 만드냐

```bash:Claude Code
/scene ep01-ai-coding-map
/scene ep01-ai-coding-map --edit 인트로   # 특정 섹션만 수정
```

대본 → YAML 씬 스펙으로 변환해. 파일: `video/scenes/{slug}.yaml`

### YAML 구조

```yaml:video/scenes/ep01-ai-coding-map.yaml
meta:
  id: "ep01"
  slug: "ep01-ai-coding-map"
  title: "2026 AI 코딩 지도"
  part: 1
  episode: 1

youtube:
  tags: ["AI코딩", "Claude Code", "바이브코딩"]
  description: |
    AI 코딩 도구의 큰 그림을 잡아드립니다.
  thumbnail_text: "AI 입문"          # 메인 타이틀 (2~6자)
  thumbnail_sub: '"해줘"라고 하면 진짜 해줘요'

bgm:
  - section: "인트로"
    src: "audio/bgm/bright-morning.mp3"
    volume: 0.3
    fade_in_sec: 1.0
    fade_out_sec: 2.0
  - section: "아웃트로"
    src: "audio/bgm/warm-ending.mp3"
    volume: 0.25
    fade_in_sec: 2.0
    fade_out_sec: 3.0

scenes:
  - id: kling-intro
    section: 인트로
    type: kling
    mode: cinematic
    duration_sec: 5
    video_prompt: "선생님 - 아침 거리를 걸어가며 이어폰 끼는 모습"

  - id: video-call-1
    section: 인트로
    type: video-call
    speaker: instructor
    tts: "오, 접속했네요! 안녕하세요~"
    display_text: "오, 접속했네요! 안녕하세요~"

  - id: stats-1
    section: 본론
    type: stats
    speaker: instructor
    tts: "작년 에이아이 코딩 시장이 팔조 원을 넘었어요."
    display_text: "작년 AI 코딩 시장이 8조 원을 넘었어요."
    stat: "8조 원"
    detail: "AI 코딩 시장 규모 (2025)"
```

### 씬 타입 13종

| 타입 | 주요 필드 | 용도 |
|------|-----------|------|
| `narration` | tts, display_text, highlight, image(선택) | 설명 자막 (가장 많이 씀) |
| `stats` | tts, stat, detail | 수치/통계 강조 |
| `comparison` | tts, items[] | 도구/서비스 비교표 |
| `diagram` | tts, diagram_type | 개념 다이어그램 |
| `flow` | tts, steps[] | 단계별 흐름도 |
| `quote` | tts, source | 인용구/핵심 문장 |
| `chart` | tts, chart_title, chart_data[], source | IR 스타일 차트 |
| `screenshot` | tts, image | 실제 화면 캡처 |
| `code` | tts, code, language | 코드 블록 |
| `greeting` | tts, display_text, image, lipsync | 캐릭터 인사 (립싱크 가능) |
| `video-call` | tts, display_text | 화상통화 UI |
| `kling` | video_prompt, duration_sec | Kling AI 시네마틱 (인트로/아웃트로) |
| `stage-clear` | stage_number, skill_name, exp | 스테이지 클리어 이펙트 |

### 오디오 연속성 규칙 — 이거 중요해

**`kling`과 `stage-clear` 빼고 모든 씬에 tts가 있어야 해.**
tts가 비어 있으면 그 구간 오디오가 뚝 끊겨.

```yaml
# ❌ 금지 — 이미지 씬에 tts 없음
- id: "big3-logos"
  type: "diagram"
  tts: ""
  image: "assets/big3-logos.png"

# ✅ 올바름 — 로고 이름이라도 읽어줘
- id: "big3-logos"
  type: "diagram"
  tts: "오픈에이아이, 앤트로픽, 구글."
  display_text: "OpenAI, Anthropic, Google"
  image: "assets/big3-logos.png"
```

### 레이어 시스템 — 화면이 어떻게 구성되냐

```
레이어 1 (배경): 강의자 씬
  → instructor 씬은 다음 instructor 씬이 시작할 때까지 화면 유지
  → 질문자가 말하는 동안 강의 자료가 그대로 남아 있는 이유

레이어 2 (오버레이): 질문자 씬
  → student 씬은 말풍선만 강의 자료 위에 오버레이로 표시
  → 씬 끝나면 말풍선 즉시 사라짐
```

```
시간 흐름 →

강의자 씬 A ──────────────────── 강의자 씬 B
              [질문자 말풍선]
결과: A 배경 위에 말풍선 → B 배경으로 전환
```

### 썸네일은 어떻게 만드냐

```bash:Claude Code
/thumbnail ep01-ai-coding-map
```

`youtube.thumbnail_text` / `thumbnail_sub`을 읽어서 Remotion Still로 뽑아.

```bash:터미널
npx remotion still thumb-ep01-ai-coding-map out/thumb-ep01.png
```

썸네일 타이틀 폰트 크기는 글자 수에 따라 자동 조절돼.

| 글자 수 | 폰트 크기 | 예시 |
|---------|-----------|------|
| 2자 | 260px | "입문" |
| 4자 | 170px | "AI 입문" |
| 5자 | 140px | "바이브코딩" |
| 6자+ | 110px | "클로드코드" |

---

## 한 줄 정리

대본 → 씬 스펙 변환은 Claude Code가 다 해줘. tts 필드는 한글 발음, display_text는 원문 — 이 구분만 지키면 돼.
