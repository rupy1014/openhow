# blog.bootpay.ai

Bootpay 공식 블로그. "결제/구독 기획하려는데 뭐부터 해야 하나요?"에 답하는 질 좋은 가이드 콘텐츠.

- **플랫폼**: openhow blog 워크스페이스 (`bootpay`)
- **뷰어**: https://openhow.io/d/bootpay
- **ai-docs**: `~/bootpay-commerce/multi-manager/projects/ai-docs`

## 경쟁사 언급 정책

- **포트원(PortOne)은 직접 경쟁사** — 가이드 본문, CTA, 리서치 소스 등 외부 공개 콘텐츠에서 이름을 절대 언급하지 않는다
- 내부 리서치(docs/research/)에서는 분석 목적으로 사용 가능하나, 최종 가이드에 노출되면 안 됨
- PG사(토스페이먼츠, 나이스페이먼츠, KCP, 이니시스 등)와 해외 서비스(Stripe, Paddle 등)는 중립적 비교에서 언급 가능

## YouTube 채널

- 컨셉: "이런게 된다고?" — 기획자를 위한 결제 실무 채널
- 캐릭터: 태섭 (1인 설명, ai-jobdori와 동일 이미지)
- [docs/youtube/channel-concept.md](docs/youtube/channel-concept.md) — 채널 컨셉, 톤, 포맷
- [docs/youtube/term-map.json](docs/youtube/term-map.json) — TTS 발음 매핑 (결제 도메인)
- 대본: `docs/youtube/scripts/{slug}.md`
- 커맨드: `/script {주제}` — 가이드 → 영상 대본 변환

### 워크플로우

```
기존 가이드 (docs/guides/{slug}.md)
  ↓ /script {주제}
영상 대본 (docs/youtube/scripts/{slug}.md)
  ↓ 씬 스펙 → TTS → 타임라인 → 렌더링
영상 파일
```

### Remotion 프로젝트

```bash
pnpm install   # 최초 1회
pnpm start     # Remotion Studio :3710
pnpm build     # 최종 렌더링
```

- Remotion 4.0.249, React 19
- 포트: 3710 (ai-jobdori는 3700)
- 캐릭터 이미지: `public/assets/characters/narrator/` (ai-jobdori와 공유)

## 전략 문서

- [docs/blog-strategy.md](docs/blog-strategy.md) — v2 전략: 커뮤니티에서 퍼지는 4개 가이드 중심
- [docs/competitor-analysis.md](docs/competitor-analysis.md) — 경쟁사 주제별 콘텐츠 갭 분석
