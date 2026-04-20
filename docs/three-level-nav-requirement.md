# 3단 계층 네비게이션 지원 요구사항

> 요약: scanner 가 서브폴더를 1단까지만 그룹으로 접고 그 아래는 평면화한다. API 문서처럼 **제품축 × 기능축** 이 교차하는 워크스페이스에선 한 섹션에 문서가 20개 넘게 쌓여 독자가 길을 잃는다. 렌더 파이프라인은 이미 재귀로 N단을 그리도록 돼 있으니, **scanner 가 서브폴더를 재귀로 따라가 `NavigationItem.items` 트리를 만들도록** 확장하는 요구.

## 배경

`bootpay-docs/developer` 워크스페이스에서 결제 API 문서를 재정돈하다 한계를 확인했다.

- top-nav `결제 SDK` 아래 문서가 19개. 그룹 6개(개요·빠른시작·클라SDK·서버API·고급)로 접어도 독자가 스캔해야 할 라벨 수가 너무 많다.
- 실제로 이 섹션은 **세 개의 독립 제품**이 섞여 있다.
  - **단건 결제** (결제위젯, SDK, 결제 요청/검증/취소)
  - **빌링 결제** (빌링키, 빌링 결제, 예약 결제)
  - **구독 결제** (계약, 회차, 조정, 해지)
- 각 제품은 다시 **기능축**(클라이언트 SDK / 서버 API / 고급 등)이 있다.
- 즉 자연스러운 구조는 `결제 SDK > 단건 결제 > 클라이언트 SDK > 위젯`처럼 **3단 트리**다.
- 지금은 이 3단을 한 줄 `group: "클라이언트 SDK"` 라벨로만 표현하고 있어서 제품 단위가 사라진다.

## 현재 한계 — scanner 가 1단까지만 그룹으로 처리

`core/packages/cli/src/scanner/index.ts` 의 `buildSidebar` 블록(대략 320~410 라인)을 보면:

- 섹션 폴더(`payment/`) 바로 아래 **직속 파일**은 `folderMeta.items` 의 `group` 라벨로 묶어 한 묶음의 `SidebarGroup[]` 생성.
- 섹션 폴더 바로 아래 **서브폴더**(`payment/billing/`) 는 별도 `SidebarGroup` 하나로 평면화. `text = subMeta.label`.
- 서브폴더 아래 **다시 서브폴더**(`payment/billing/key/`) 는 처리 로직이 없음. 파일들이 그 서브폴더 그룹으로 그냥 주워담긴다.

즉 **트리 깊이 2단 까지만** 스캐너가 이해한다.

하지만 렌더는 이미 N단 지원:

- `core/packages/types/src/navigation.ts`: `NavigationItem.items: NavigationItem[]` 재귀 타입.
- `core/packages/cli/src/ssg/buildNavigation.ts` 의 `renderItems` (L90~102): `item.items?.length ? <ul>...</ul>` 재귀.
- `core/packages/viewer/src/components/Navigation.tsx` (L144~148): 재귀 컴포넌트.

**즉 막혀 있는 지점은 scanner 하나.**

## 기대 효과 — 독자 UX

3단으로 풀어내면 독자가 묻는 질문이 메뉴 깊이마다 하나씩 해결된다.

```
결제 SDK                   ← (1단) 트랙 선택: 결제/커머스
├─ 단건 결제               ← (2단) 제품 선택: 단건/빌링/구독
│   ├─ 클라이언트 SDK      ← (3단) 기능 축: 클라/서버/고급
│   │   ├─ 위젯
│   │   ├─ 결제 요청
│   │   └─ 결과 처리
│   ├─ 서버 API
│   └─ 고급
├─ 빌링 결제
└─ 구독 결제
```

- 1단에서 "내가 결제만 붙이나, 커머스까지 하나?" 답.
- 2단에서 "단건이냐, 반복결제냐, 구독이냐?" 답.
- 3단에서 "클라에서 부르는 거냐, 서버에서 부르는 거냐?" 답.

현재는 2단 안에 6개 그룹이 평면으로 깔려 있어 이 세 질문이 동시에 쏟아진다.

## 구체 제안 — scanner 가 폴더 트리를 재귀로 따라간다

### 현재 로직 (요약)

```
scanDir/
  payment/
    foo.md                  → payment 그룹의 leaf
    billing/                → payment 아래 서브그룹 (text=billing label)
      bar.md                → billing 서브그룹의 leaf
      key/                  ← ❌ 무시됨 (또는 flatten)
        issue.md            ← ❌ billing 에 평면화됨
```

### 제안 로직

```
scanDir/
  payment/
    _meta.json              { label: "결제 SDK", order: 1 }
    billing/
      _meta.json            { label: "빌링 결제", order: 1 }
      key/
        _meta.json          { label: "빌링키", order: 0 }
        issue.md
        lookup.md
      pay/
        _meta.json          { label: "결제", order: 1 }
        request.md
      reserve/
        _meta.json          { label: "예약", order: 2 }
        reserve.md
        reserve-lookup.md
```

scanner 가 산출하는 구조:

```json
{
  "sidebar": {
    "/payment/": [
      {
        "text": "빌링 결제",
        "items": [
          {
            "text": "빌링키",
            "items": [
              { "text": "빌링키 발급", "link": "/payment/billing/key/issue" },
              { "text": "빌링키 조회", "link": "/payment/billing/key/lookup" }
            ]
          },
          {
            "text": "결제",
            "items": [
              { "text": "빌링 결제 요청", "link": "/payment/billing/pay/request" }
            ]
          },
          {
            "text": "예약",
            "items": [ ... ]
          }
        ]
      }
    ]
  }
}
```

- `SidebarGroup.items` 안에 다시 `NavigationItem.items` 재귀 트리가 들어감.
- 타입은 이미 지원. 렌더도 이미 지원. **scanner 만 재귀 수정**.

### scanner 변경 지점 (예상)

- `buildSidebar` 내부 서브폴더 처리 블록을 재귀 함수로 교체.
- 서브폴더를 발견하면:
  1. 해당 폴더의 `_meta.json` 읽어 label/order 확인
  2. 그 폴더의 직속 파일 + 더 깊은 서브폴더를 재귀 호출
  3. 반환값을 현재 `NavigationItem.items` 배열에 푸시
- 기존 `parts.length > 2` 분기, `nestNumericChildren` 유틸은 재귀 기반으로 통합.
- top-nav 생성 로직은 건드리지 않음 (섹션 폴더 = top-nav 1단 그대로).

### 하위 호환

- 기존 워크스페이스 대부분은 1단 서브폴더까지만 사용 → 확장 후에도 동일한 트리가 나와야 함.
- 테스트: `bootpay-developer`, `bootpay blog`, `clauders.ai`, `jobdori` 등 현재 워크스페이스의 `project.json` 스냅샷 비교로 회귀 검증.

### URL 깊이 정책 — 제안

3단 구조에서 URL을 어떻게 둘지 결정 필요. 두 옵션:

| 옵션 | 예시 | 장점 | 단점 |
| --- | --- | --- | --- |
| A. 경로 그대로 | `/payment/billing/key/issue` | 계층이 URL에도 반영 — 공식 레퍼런스다움. Stripe·토스페이먼츠 방식. | URL 길어짐. |
| B. flat slug | `/payment/issue` | 짧음. 공유 친화. | URL만 봐서는 그룹 판독 불가. 구조 변경 시 slug 충돌 가능. |

**A안 권장.** 개발자 문서는 "이 API가 어느 영역 소속인지" 가 URL에 드러나야 가치가 있다. 현재 scanner 는 이미 파일 경로 기반 slug 를 쓰므로 A안이 기본 동작.

### 빵부스러기·prev-next

- breadcrumb: 3단 계층을 그대로 노출. "결제 SDK > 빌링 결제 > 빌링키 > 빌링키 발급".
- prev-next: `buildOrderedProjectPageSlugs` (`core/packages/types/src/project-order.ts`) 는 이미 `collectLinks` 재귀라 영향 없음.

## 영향 범위 (예상)

| 패키지 | 영향 |
| --- | --- |
| `@openhow/cli` scanner | **핵심 변경**. 서브폴더 재귀로 `NavigationItem.items` 트리 생성. |
| `@openhow/cli` ssg/buildNavigation | 이미 재귀 렌더. 확인만 필요. |
| `@openhow/viewer` | 이미 재귀 컴포넌트. 스타일 점검(들여쓰기 계층별 여백). |
| `@openhow/types` | 변경 없음. |
| 기존 워크스페이스 | 회귀 없음을 보장해야 함. 스냅샷 테스트 추천. |

## 참고 레퍼런스 (3단 이상 쓰는 공식 문서)

- **Stripe docs** — Products > Payments > Accept online payments > Web > Integration. 4단.
- **토스페이먼츠 개발자 문서** — 카테고리 > 결제/간편결제/빌링 > 클라이언트·서버 > 개별 API. 3~4단.
- **AWS docs** — Service > Category > Feature > API. 깊게는 5단까지.
- **Cloudflare docs** — Product > Section > Topic > Page. 3~4단.

공통 패턴: 최상위는 "제품 트랙", 중간은 "제품", 마지막은 "기능 축 / 개별 API". 현재 openhow 는 여기에 한 단 부족한 상태.

## 의도 요약

- openhow 가 **단순 블로그·가이드뿐 아니라 공식 개발자 레퍼런스** 를 담는 데도 쓰이려면 3단 계층이 필수.
- 렌더 파이프라인은 이미 준비됨. 스캐너만 재귀로 확장하면 됨.
- 구체 동기는 `bootpay-docs/developer` 의 결제 SDK 재정돈 (단건·빌링·구독 × 클라/서버/고급 매트릭스). 관련 계획은 `channels/bootpay-docs/ia-plan.md`.
- 이 요구는 2단 구조가 충분한 워크스페이스에는 아무 영향 없이, 깊은 계층이 필요한 곳에서만 발현되어야 한다.

## 다음 단계 제안

1. 이 문서 검토·확정.
2. scanner 재귀 확장 PR 초안 (테스트 스냅샷 포함).
3. viewer 사이드바 들여쓰기·활성상태 하이라이트 시안 확인.
4. `bootpay-docs/developer` 폴더 구조 재배치와 동기화 (별도 PR).
