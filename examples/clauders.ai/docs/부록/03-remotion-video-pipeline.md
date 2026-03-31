---
slug: 부록-remotion-video-pipeline
title: "Remotion 영상 파이프라인"
nav: Remotion 영상 파이프라인
order: 2
---

**Claude Code에게 주제 주면 대본부터 YAML 씬 스펙까지 다 써줘.**

그다음은 TTS 생성하고, 캐릭터 있으면 립싱크 붙이고, 타임라인 스튜디오에서 확인하고, 렌더링하면 끝이야.

실제 이 시리즈에서 쓰는 캐릭터들이야.

| 강의자 (instructor) | 질문자 (student) |
|---|---|
| ![강의자](./images/instructor-01.png) | ![질문자](./images/student-01.png) |

---

## 뭘 하는 거냐

:::canvas-flow
{
  "nodes": [
    {"id": "write",    "label": "대본 작성\n/write",           "col": 0, "row": 0, "type": "default"},
    {"id": "scene",    "label": "씬 스펙\n/scene",             "col": 1, "row": 0, "type": "default"},
    {"id": "tts",      "label": "TTS 생성\nnpm run tts",       "col": 2, "row": 0, "type": "process"},
    {"id": "lipsync",  "label": "립싱크\n(캐릭터 있으면)",       "col": 3, "row": 0, "type": "process"},
    {"id": "check",    "label": "타임라인 확인\nRemotionStudio","col": 4, "row": 0, "type": "warning"},
    {"id": "render",   "label": "렌더링\nnpm run build",       "col": 5, "row": 0, "type": "success"}
  ],
  "edges": [
    {"from": "write",   "to": "scene"},
    {"from": "scene",   "to": "tts"},
    {"from": "tts",     "to": "lipsync"},
    {"from": "lipsync", "to": "check"},
    {"from": "check",   "to": "render"}
  ],
  "direction": "LR",
  "cols": 6,
  "rows": 1
}
:::

앞 두 단계(대본 → 씬 스펙)는 Claude Code가 처리해.
나머지는 명령어 한 줄씩이야.

---

## 대본을 어떻게 쓰냐

```bash:Claude Code
/write ep01-ai-coding-map
/write "Cursor vs Claude Code"
```

주제나 에피소드 번호 주면 Claude가 알아서 써줘.
로컬 문서 + 웹 리서치 + 이전 에피소드 톤 참조해서 초안 작성하고, 퇴고까지 한 번에 돌아가.

퇴고에서 하는 일:

- TTS 발음 검수 (AI → 에이아이, 39% → 삼십구퍼센트 등 영문/숫자를 한글 발음으로)
- 학습 연속성 체크 (질문자가 모르는 용어를 설명 없이 쓰진 않았는지)
- 이미지 소싱 (공식 스크린샷, 다이어그램 찾아서 대본에 삽입)

```
📝 대본 완성!
파일: scripts/part1/ep01-ai-coding-map.md
분량: 2,847자 (약 12분)
이미지: 4개 소싱됨
TTS 위반: 0건
```

퇴고만 따로 돌리고 싶으면:

```bash:Claude Code
/proofread ep01-ai-coding-map
```

---

## 씬 스펙은 어떻게 만드냐

```bash:Claude Code
/scene ep01-ai-coding-map
```

대본을 YAML 씬 스펙으로 변환해.
각 대사가 어떤 화면 타입으로 보일지, BGM은 어디에 깔릴지, YouTube 메타데이터까지 한 번에 정의돼.

```yaml:video/scenes/ep01-ai-coding-map.yaml
youtube:
  tags: ["AI코딩", "Claude Code", "바이브코딩"]
  thumbnail_text: "AI 입문"

bgm:
  - section: "인트로"
    src: "audio/bgm/upbeat-tech.mp3"
    volume: 0.25
    duration_sec: 20

scenes:
  - id: "stats-1"
    type: "stats"
    speaker: "instructor"
    tts: "작년 에이아이 코딩 시장이 팔조 원을 넘었어요."
    display_text: "작년 AI 코딩 시장이 8조 원을 넘었어요."
    stat: "8조 원"
```

씬 타입은 `narration`, `stats`, `comparison`, `flow`, `quote`, `screenshot`, `diagram`, `chart`, `code`, `greeting`, `video-call`, `kling`, `stage-clear` 13종이야.

썸네일도 씬 스펙에서 바로 뽑아.

```bash:Claude Code
/thumbnail ep01-ai-coding-map
```

---

## TTS는 어떻게 생성하냐

YAML `speaker` 필드에 `instructor` / `student`만 지정하면 자동으로 분기돼.

```
instructor (강의자) → ElevenLabs   : 고품질, 주력 음성
student   (질문자) → Fish Audio    : 저렴, 짧은 대사에 충분
```

:::steps

### 비용 먼저 확인

```bash:터미널
npm run tts:dry ep01-ai-coding-map
```

API 한 번도 안 부르고 예상 비용만 계산해줘.

```
💰 예상 비용:
   ElevenLabs (강의자): ~$0.534
   Fish Audio (질문자): ~$0.012
   합계: ~$0.546
```

### 실제 생성

```bash:터미널
npm run tts ep01-ai-coding-map
npm run audio:polish ep01-ai-coding-map
```

`audio:polish`는 1.1배속 + 무음 트리밍 + CPS 정규화를 자동으로 해줘.
이걸 안 돌리면 TTS 속도가 강의용으로 느리고 앞뒤 침묵 구간이 남아.

:::

:::warning
**`tts:dry`로 금액 확인 후에 `tts` 실행해.**
10분짜리 에피소드 기준 ~$0.55 수준이야.
:::

### TTS 서비스 선택지

| 서비스 | 특징 | 한국어 품질 |
|--------|------|-------------|
| **ElevenLabs** | 고품질, 자연스러운 감정 표현 | 상 |
| **Fish Audio** | 저렴, 짧은 대사용 | 중 |
| **수퍼톤 (Supertone)** | 국내 서비스, 한국어 특화 | 상 |
| **CLOVA Voice** | Naver, 저렴하고 안정적 | 중상 |
| **Azure TTS** | 다양한 한국어 음성 제공 | 중상 |

서비스 교체는 `generate-tts.ts`의 provider 분기만 바꾸면 돼.

---

## 립싱크는 언제 쓰냐

`greeting` 타입 씬 — 캐릭터가 인사하는 장면 — 에만 선택적으로 써.
입 모양이 오디오에 맞게 움직이는 영상을 별도로 생성해서 붙이는 거야.

YAML에서 `lipsync: true`로 지정한 씬만 대상이야.

```yaml
- id: "opening-greeting"
  type: "greeting"
  speaker: "instructor"
  tts: "안녕하세요, 이번 에피소드에서는..."
  lipsync: true
```

생성된 MP4를 `/public/video/{slug}/{scene-id}.mp4`에 놓으면 타임라인 빌드 시 자동 연결돼.

> [!TIP]
> Remotion에서 재생할 때 **H.264 코덱 필수**. H.265(HEVC)로 나오면 ffmpeg로 변환해야 해.
> 내부 오디오도 제거해야 해 (`-an`). Remotion이 TTS 오디오를 따로 붙이기 때문이야.

### 립싱크 서비스 선택지

| 서비스 | 방식 | 단가 | 특징 |
|--------|------|------|------|
| **Kie.ai InfiniTalk** | 이미지 + 오디오 → 영상 | $0.015/초 (480p) | 현재 사용 중 |
| **HeyGen** | 아바타 기반 | 구독제 | UI 편리, 다양한 아바타 |
| **D-ID** | 이미지 + 오디오 → 영상 | API 과금 | 빠른 처리 |
| **Sync.so (SyncLabs)** | 영상 + 오디오 → 립싱크 | API 과금 | 기존 영상에 립싱크 |
| **Hedra** | 텍스트/오디오 → 아바타 | 크레딧제 | 고품질 |

Kie.ai는 Kling AI 시네마틱 영상(인트로/아웃트로용)도 같은 백엔드로 제공해.

---

## 타임라인 확인은 어떻게 하냐

렌더링 전에 반드시 Remotion Studio에서 직접 확인해.

```bash:터미널
npm run timeline ep01-ai-coding-map   # YAML → JSON 빌드
npm run start                          # localhost:3700 에서 스튜디오 열기
```

![Claude Code 터미널 화면](./images/claude-code-terminal.png)

프레임 단위 슬라이더로 확인할 것들:

```
□ 오디오가 끊기는 구간 없는지 (tts가 빈 씬)
□ 이미지 에셋이 404 안 나는지
□ 립싱크 영상이 오디오랑 싱크 맞는지
□ BGM 페이드인/아웃 자연스러운지
□ 씬 전환 타이밍이 어색하지 않은지
```

특정 구간만 뽑아서 빠르게 확인할 수 있어.

```bash:터미널
npx remotion render EpisodeVideo out/preview.mp4 --frames=0-2100
```

앞 70초만 먼저 확인하는 거야.

---

## 렌더링하고 올리는 방법

:::steps

### 최종 MP4 렌더링

```bash:터미널
npm run build
```

`out/ep01-ai-coding-map.mp4` 생성돼. 10분짜리 기준 5~10분.

### SRT 자막 생성

```bash:터미널
npm run srt ep01-ai-coding-map
```

한글 발음으로 썼던 tts 텍스트를 원문으로 자동 복원해서 자막으로 뽑아줘.
`에이아이 → AI`, `챗지피티 → ChatGPT` 등.

### YouTube 업로드

`.env`에 OAuth 설정해두면 YAML `youtube` 섹션 메타데이터로 자동 업로드 가능해.
썸네일도 함께 올릴 수 있어.

:::

---

## 수정하면 얼마나 달라지냐

캡컷이나 프리미어였으면 대사 한 줄 수정에 30분~1시간이야.
클립 찾아서 교체하고, 앞뒤 타이밍 재조정하고, 자막도 따로 수정해야 하니까.

여기서는:

```bash:터미널
# YAML tts 한 줄 수정 후
npm run tts ep01-ai-coding-map --only=scene-id
npm run audio:polish ep01-ai-coding-map
npm run timeline ep01-ai-coding-map
npm run build
# 총 5~10분
```

대본 수준 수정은 Claude Code에게 맡겨.

```bash:Claude Code
/write ep01-ai-coding-map --edit 인트로
/scene ep01-ai-coding-map --edit 인트로
```

---

## 한 줄 정리

| 단계 | 내가 하는 일 | 비용 |
|------|-------------|------|
| 대본 작성 | `/write` 주제 입력 | 무료 |
| 씬 스펙 | `/scene` 에피소드명 | 무료 |
| TTS | `npm run tts` (dry 먼저) | ~$0.55/편 |
| 립싱크 (선택) | Kie.ai InfiniTalk, 수동 | $0.015/초 |
| 타임라인 확인 | `npm run start`, 스튜디오 체크 | 무료 |
| 렌더링 | `npm run build` | 무료 |
| YouTube | Data API 자동 업로드 | 무료 |

[Remotion](https://github.com/remotion-dev/remotion)이 React로 영상을 찍는 거야. Claude Code가 기획부터 씬 스펙까지 쓰고, 나머지는 명령어 한 줄씩이야.

각 단계 상세 레퍼런스 →
- [/write · /scene 커맨드](./03-1-write-scene) — 대본 집필, 퇴고, 씬 타입 13종, YAML 구조
- [TTS · 렌더 커맨드](./03-2-tts-render) — TTS 생성, audio:polish, 타임라인 빌드, /render 파이프라인
