# 영상 씬 스펙 생성

사용자 요청: $ARGUMENTS

## 개요

`/scene`은 대본(docs/youtube/scripts/{slug}.md)을 기반으로 YAML 씬 스펙을 생성합니다.
각 씬은 영상의 한 장면에 대응하며, TTS 대본과 화면 타입을 정의합니다.

```
/scene payment-practical               # 대본 → YAML 씬 스펙 생성
/scene payment-practical --edit 정산    # 특정 섹션만 수정
```

---

## 실행 파이프라인

```
┌──────────────────────────────────────────────┐
│ 1. 대본 로드                                   │
│   - docs/youtube/scripts/{slug}.md            │
│   - 없으면 에러                                │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│ 2. 대본 파싱                                   │
│   - 섹션별 분리 (훅, 인트로, 본론, 정리, CTA)    │
│   - **태섭**: 대사 → tts + display_text 추출    │
│   - **[화면: ...]** → 씬 타입 결정              │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│ 3. TTS 발음 변환                               │
│   - docs/youtube/term-map.json 기준            │
│   - 영어 → 한글 발음 (PG → 피지)                │
│   - 숫자 → 한글 (3.3% → 삼점삼퍼센트)            │
│   - display_text는 원문 유지                    │
│   ⚠️ 대본이 이미 한글 발음으로 되어있으면 그대로!   │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│ 4. YAML 씬 스펙 생성                           │
│   - video/scenes/{slug}.yaml 출력              │
│   - meta + bgm + scenes 구조                   │
│   - 씬 ID: {섹션}-{번호} (예: hook-01)          │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│ 5. 검증                                       │
│   - 모든 씬에 tts 있는지 (kling 제외)            │
│   - display_text에 한글 발음이 섞이지 않았는지     │
│   - tts에 영문/아라비아 숫자가 남아있지 않은지      │
│   - 씬 ID 중복 없는지                           │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│ 6. 결과 보고                                   │
│   - 총 씬 수, 섹션별 씬 수                      │
│   - 총 글자 수, 예상 비용                       │
│   - 다음 단계 안내                              │
└──────────────────────────────────────────────┘
```

---

## 씬 스펙 구조

```yaml
# video/scenes/{slug}.yaml
meta:
  id: "EP02"
  slug: "payment-practical"
  title: "결제, 개발팀한테 넘기기 전에 정리할 것들"
  created: "2026-03-23"

youtube:
  tags: [...]
  description: |
    ...
  thumbnail_text: "..."

bgm:
  - section: "hook"
    src: "/audio/bgm/tension-build.mp3"
    volume: 0.25
    fade_in_sec: 0.5
    fade_out_sec: 1.5
  - section: "outro"
    src: "/audio/bgm/warm-ending.mp3"
    volume: 0.25
    fade_in_sec: 1.0
    fade_out_sec: 2.0

scenes:
  - id: hook-01
    section: 훅
    type: narration
    speaker: narrator
    tts: "고객이 돈 돌려달라고 했는데,"
    display_text: "고객이 돈 돌려달라고 했는데,"
```

---

## 씬 타입 (Bootpay 영상용)

```yaml
# 1인 설명 전용 — speaker는 항상 "narrator"

narration:        # 기본 설명 (가장 많이 사용)
  필드: tts, display_text, highlight, image(선택)
  용도: 설명 음성 + 자막

stats:            # 수치 강조
  필드: tts, stat, detail
  용도: 금액, 비율 등

comparison:       # 비교표
  필드: tts, items[]
  용도: 결제수단 비교, 직가맹 vs 리셀 등

flow:             # 프로세스/단계
  필드: tts, steps[]
  용도: 결제 흐름, 취소/환불 프로세스

chart:            # 데이터 차트
  필드: tts, chart_title, chart_data[], source
  용도: 수수료, 정산 주기 비교

screenshot:       # 화면 캡처
  필드: tts, image, caption
  용도: 부트페이 관리자 화면 등

quote:            # 인용/강조 문구 (삽질 포인트)
  필드: tts, source
  용도: 핵심 문장 강조

greeting:         # 캐릭터 인사
  필드: tts, display_text, image, lipsync
  용도: 인트로/아웃트로 캐릭터 인사
```

---

## 오디오 연속성 규칙 (핵심!)

**원칙: 오디오는 절대 끊기면 안 된다. 모든 씬에 tts가 있어야 한다.**

```yaml
# ❌ 잘못된 예 — tts 비어있음 (오디오 끊김)
- id: "payment-method-02"
  type: "comparison"
  tts: ""
  duration_sec: 3

# ✅ 올바른 예 — 비교표 씬에도 짧은 나레이션
- id: "payment-method-02"
  type: "comparison"
  tts: "결제수단별 특성을 비교해볼게요."
  display_text: "결제수단별 특성 비교"
  items:
    - name: "신용카드"
      desc: "기본, 할부, 취소 간편"
    - name: "간편결제"
      desc: "전환율 높음, 모바일 필수"
```

---

## TTS vs display_text 규칙

대본이 이미 한글 발음으로 작성되어 있으므로, **대본의 tts를 그대로 사용**합니다.
display_text만 원문(영어, 아라비아 숫자)으로 복원합니다.

```yaml
tts (발음용) — 대본 그대로:
  "피지사" (PG사)
  "삼점삼퍼센트" (3.3%)
  "디플러스오" (D+5)
  "씨엠에스" (CMS)
  "비투비" (B2B)

display_text (자막용) — 원문 복원:
  "PG사"
  "3.3%"
  "D+5"
  "CMS"
  "B2B"

참조: docs/youtube/term-map.json
```

### 숫자 → 한글 변환 (tts 필드)

```yaml
숫자+단위 붙여쓰기:
  "3.3%" → "삼점삼퍼센트"
  "D+5" → "디플러스오"
  "2%" → "이퍼센트"
  "1.3%p" → "일점삼퍼센트포인트"
  "3~5천만원" → "삼천만원에서 오천만원"
  "70~150만원" → "칠십만원에서 백오십만원"
  "3~7영업일" → "삼에서 칠영업일"
```

---

## 대본 → 씬 매핑 규칙

```yaml
대본 패턴 → 씬 타입:
  "**태섭**:" → narration (기본)
  "[화면: ...비교표...]" → comparison
  "[화면: ...플로우...]" → flow
  "[화면: ...타임라인...]" → flow 또는 chart
  "[화면: ...체크리스트...]" → flow
  "[화면: Bootpay 관리자...]" → screenshot
  "> 💡 **삽질 포인트**:" → quote

대사 분할 기준:
  - 한 씬의 tts는 최대 3~4문장 (10~15초)
  - 화면이 바뀌는 지점에서 씬 분할
  - [화면: ...] 지시가 나오면 새 씬
  - "---" 구분선 = 섹션 전환
```

---

## 검증 체크리스트

```yaml
치명적 (생성 실패):
  - 대본 파일 없음
  - tts 없는 씬 존재 (greeting/kling 제외)

경고:
  - tts에 영문 원문 잔류 (PG, API 등)
  - tts에 아라비아 숫자 잔류 (3.3%, D+5 등)
  - display_text에 한글 발음 혼입 (피지, 디플러스 등)
  - 씬 ID 중복
  - 한 씬 tts 20초 초과 (분할 권장)

정보:
  - 총 씬 수
  - 섹션별 씬 수
  - 총 글자 수
  - 예상 TTS 비용
```

---

## 완료 후 출력

```
📋 씬 스펙이 생성되었습니다!

**파일:** video/scenes/payment-practical.yaml

---

📊 **씬 정보:**
- 총 씬: 35개
- 훅: 4개 / 인트로: 2개 / 본론: 25개 / 정리: 3개 / CTA: 1개
- 총 글자 수: 2,800자
- 예상 TTS 비용: ~$0.47

---

✅ **검증 결과:**
- tts 공백: 없음
- 영문 잔류: 없음
- 숫자 잔류: 없음

---

🔜 **다음 단계:**
1. YAML 검토 후 수정
2. `npx tsx scripts/tools/generate-tts.ts payment-practical` — TTS 생성
3. `npx tsx scripts/tools/generate-tts.ts payment-practical --dry-run` — 비용만 확인
```
