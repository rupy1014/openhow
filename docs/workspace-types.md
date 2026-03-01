# Workspace Types

openhow 워크스페이스는 **목적별 프리셋(타입)**을 통해 최적의 기본값을 자동 적용합니다.

## 왜 타입이 필요한가?

API 문서, 유료 강의, 팀 내부 스펙, 블로그 — 모두 다른 접근 제어와 구조가 필요합니다.
타입을 선택하면 `joinPolicy`, `defaultAccessLevel`, `navigationMode`, 테마까지 한 번에 세팅됩니다.

```bash
openhow init --type team
# → joinPolicy: invite_only, defaultAccessLevel: team, theme: green
```

---

## 6가지 워크스페이스 타입

### 📘 `docs` — API/개발자 문서

| 항목 | 값 |
|------|---|
| 페르소나 | 개발자, 테크니컬 라이터 |
| 용도 | API 문서, SDK 가이드, 프레임워크 레퍼런스 |
| 실제 사례 | Bootpay API, OpenClaw 가이드 |

### 🎓 `course` — 온라인 강의

| 항목 | 값 |
|------|---|
| 페르소나 | 강사, 교육 크리에이터 |
| 용도 | 순차적 강의, 유료 챕터, 코딩 부트캠프 |
| 실제 사례 | AI Vibe Coding Book, clauders.ai |

### 👥 `team` — 팀 내부 지식베이스

| 항목 | 값 |
|------|---|
| 페르소나 | 개발 리드, PM, 팀장 |
| 용도 | 내부 스펙, 설계 문서, 의사결정 기록, 런북 |
| 실제 사례 | 기능 스펙 → 리뷰 → 컨펌 워크플로우 |

### 📝 `blog` — 블로그/아카이브

| 항목 | 값 |
|------|---|
| 페르소나 | 커뮤니티 리더, 뉴스레터 작가 |
| 용도 | 시간순 포스트, 주간 뉴스레터, 설교 아카이브 |
| 실제 사례 | Slow Church |

### 🌐 `wiki` — 커뮤니티 위키

| 항목 | 값 |
|------|---|
| 페르소나 | 오픈소스 메인테이너, 커뮤니티 |
| 용도 | 다수 기여자 협업 문서, 오픈 기여 |
| 실제 사례 | 오픈소스 프로젝트 위키 |

### 🔨 `project` — 스펙 기반 협업 (A2A 지원)

| 항목 | 값 |
|------|---|
| 페르소나 | 외주 개발자, PM, 도메인 전문가, AI Agent |
| 용도 | 실행 가능한 스펙 문서, 피드백→버전업→구현 사이클, Agent-to-Agent 협업 |
| 실제 사례 | 외주개발 스펙 협업, 사주서비스 콘텐츠 전문가 피드백, AI Agent 멀티스텝 구현 |

---

## 타입별 기본값

| 설정 | `docs` | `course` | `team` | `blog` | `wiki` | `project` |
|------|--------|----------|--------|--------|--------|-----------|
| joinPolicy | open | open | invite_only | open | approval | invite_only |
| defaultAccessLevel | public | public | team | public | public | team |
| navigationMode | two-panel | sidebar | sidebar | sidebar | two-panel | sidebar |
| defaultFreeSections | 전체 공개 | 2 | 전체 공개 | 전체 공개 | 전체 공개 | 전체 공개 |
| theme.preset | blue | purple | green | red | blue | orange |

---

## 타입별 init 스캐폴드

### `docs` (기본)

```
docs/
├── guide/
│   └── getting-started.md
├── api/
│   └── reference.md
├── _meta.json
└── videos/
    └── .gitkeep
```

two-panel 네비게이션: 좌측 메인 메뉴(Guide, API) + 우측 서브 메뉴.

### `course`

```
docs/
├── 01-introduction.md
├── 02-getting-started.md
└── videos/
    └── .gitkeep
```

순차적 번호 prefix. `defaultFreeSections: 2`로 처음 2개 챕터 무료 공개.

### `team`

```
docs/
├── specs/
│   └── template.md
├── decisions/
│   └── template.md
├── runbooks/
│   └── template.md
└── videos/
    └── .gitkeep
```

내부 전용(`defaultAccessLevel: team`). 초대 기반 접근(`joinPolicy: invite_only`).

### `blog`

```
docs/
├── 2026-02-27-first-post.md
└── videos/
    └── .gitkeep
```

날짜 prefix 패턴. 시간순 정렬.

### `wiki`

```
docs/
├── getting-started.md
├── _glossary.md
└── videos/
    └── .gitkeep
```

멀티 토픽 폴더 + 용어 사전 템플릿.

### `project`

```
docs/
├── specs/
│   └── overview.md
├── feedback/
│   └── _template.md
├── changelog/
│   └── v0.1.md
└── videos/
    └── .gitkeep
```

스펙 중심 구조. `specs/`에 구현 명세, `feedback/`에 리뷰 기록, `changelog/`에 버전 변경 이력.

---

## CLI 워크플로우

### 초기화

```bash
# 인터랙티브 (타입 선택 위저드)
openhow init

# 비대화형 (CI/CD 등)
openhow init --type docs
openhow init --type course
openhow init --type team
```

### 설정 변경

```bash
# 워크스페이스 레벨 (openhow.json에 기록)
openhow config set type team
openhow config set joinPolicy invite_only
openhow config set defaultAccessLevel team
openhow config set defaultFreeSections 3

# 글로벌 레벨 (기존 동작 유지)
openhow config set server https://openhow.io
```

### 퍼블리시

```bash
openhow publish
# → openhow.json의 type, joinPolicy 등이 서버에 자동 싱크
```

---

## "문서 기반 개발" 워크플로우 (team 타입)

```
개발자 A: 기능 스펙 작성 → openhow publish (team 접근)
    ↓
팀원 B, C: 뷰어에서 검토 → 피드백
    ↓
개발자 A: 수정 → openhow publish -m "리뷰 반영: 인증 로직 변경"
    ↓
팀장: 컨펌 (버전 이력으로 추적)
    ↓
이슈 발생: 수정 → openhow publish -m "hotfix: 세션 만료 처리 추가"
    ↓
openhow versions <slug> 로 전체 변경 이력 추적
```

### 핵심 가치

- **소스 코드와 문서가 같은 리포에** — 코드 리뷰 = 문서 리뷰
- **git commit = 문서 버전** — `openhow publish`가 커밋 메시지를 버전 메모로 자동 연결
- **접근 제어가 기본** — `team` 타입은 멤버만 열람 가능

---

## openhow.json 예시

### docs 타입

```json
{
  "title": "Bootpay API Reference",
  "type": "docs",
  "content": "./docs",
  "theme": {
    "preset": "blue",
    "dark": true
  },
  "navigation": {
    "mode": "two-panel"
  }
}
```

### team 타입

```json
{
  "title": "Acme Engineering Specs",
  "type": "team",
  "joinPolicy": "invite_only",
  "defaultAccessLevel": "team",
  "content": "./docs",
  "theme": {
    "preset": "green",
    "dark": true
  }
}
```

### course 타입

```json
{
  "title": "AI Vibe Coding Book",
  "type": "course",
  "defaultFreeSections": 2,
  "content": "./docs",
  "theme": {
    "preset": "purple",
    "dark": true
  }
}
```

### project 타입

```json
{
  "title": "사주서비스 v2",
  "type": "project",
  "joinPolicy": "invite_only",
  "defaultAccessLevel": "team",
  "content": "./docs",
  "theme": {
    "preset": "orange",
    "dark": true
  },
  "project": {
    "roles": ["owner", "reviewer", "agent"],
    "statuses": ["draft", "review", "approved", "implemented"],
    "webhook": "https://example.com/hooks/spec-changed"
  }
}
```

---

## `project` 타입 상세 스펙

### 핵심 개념: 문서 = 실행 가능한 명세 (Living Spec)

`project` 타입은 기존 타입들과 근본적으로 다릅니다.

| | 기존 타입 (docs, team 등) | `project` |
|---|---|---|
| 문서의 역할 | 읽히기 위한 기록 | **구현을 트리거하는 명세** |
| 변경의 의미 | 내용 갱신 | **액션 발생** (구현, 피드백 반영) |
| 참여자 | 사람 (작성자, 독자) | 사람 + **AI Agent** |
| 피드백 | 선택적 | **핵심 워크플로우** |
| 버전 관리 | 히스토리 열람 | **diff 기반 변경 추적 + 상태 머신** |

### team 타입과의 관계

`team`은 "내부 지식 공유"에 집중합니다. `project`는 `team`의 접근 제어를 계승하면서, **피드백 루프**와 **Agent 연동**이 추가됩니다.

```
team  = 지식 기록 + 내부 접근 제어
project = team + 피드백 루프 + 문서 상태 머신 + Agent API + A2A
```

---

### 역할 모델

| 역할 | 설명 | 할 수 있는 것 |
|------|------|-------------|
| `owner` | 프로젝트 소유자 (개발자, PM) | 문서 CRUD, 멤버 관리, 상태 변경, 배포 |
| `reviewer` | 피드백 제공자 (클라이언트, 전문가) | 문서 열람, 인라인 코멘트, 승인/반려 |
| `agent` | AI 에이전트 | API로 문서 읽기/쓰기, 상태 변경, webhook 수신 |

**기존 member 역할과의 관계**: `owner`는 기존 workspace owner, `reviewer`는 member에 코멘트 권한 추가, `agent`는 API 토큰 기반 접근.

---

### 문서 상태 머신

```
draft ──→ review ──→ approved ──→ implemented
  ↑          │           │              │
  └──────────┘           └──────────────┘
  (피드백 반영)          (스펙 변경 필요)
```

| 상태 | 의미 | 트리거 |
|------|------|--------|
| `draft` | 작성 중 | 최초 생성, 또는 피드백 반영 중 |
| `review` | 리뷰 요청 | owner가 리뷰 요청 |
| `approved` | 승인됨 | reviewer가 승인 → **webhook 발송** |
| `implemented` | 구현 완료 | agent 또는 owner가 구현 완료 표시 |

**상태는 문서(섹션) 단위로 관리됩니다.** 하나의 워크스페이스에서 `specs/auth.md`는 approved, `specs/payment.md`는 draft일 수 있습니다.

---

### 인라인 피드백 시스템

reviewer가 문서의 특정 부분에 코멘트를 남깁니다.

```markdown
## 운세 해석 로직          ← 이 섹션에 피드백

현재: 천간 기준으로 해석
                            💬 전문가: "지지도 같이 봐야 합니다.
                                        천간만으로는 정확도가 떨어져요."
                                        [상태: open]
```

| 코멘트 상태 | 의미 |
|------------|------|
| `open` | 미해결 피드백 |
| `resolved` | 반영 완료 |
| `wontfix` | 의도적 미반영 (사유 기록) |

**모든 open 코멘트가 resolved 되어야 문서 상태를 `approved`로 변경 가능.**

---

### A2A (Agent-to-Agent) 연동

`project` 타입의 가장 핵심적인 차별점입니다. **문서가 에이전트 간 통신 채널 역할**을 합니다.

#### 왜 문서가 A2A 프로토콜이 되는가

기존 A2A 방식:
```
Agent A ──JSON RPC──→ Agent B
         (직접 통신, 전용 프로토콜 필요)
```

openhow project 방식:
```
Agent A ──문서 작성──→ openhow ──webhook──→ Agent B
Agent B ──문서 수정──→ openhow ──webhook──→ Agent A
                 (문서가 공유 컨텍스트)
```

**장점:**
- 사람이 중간에 개입 가능 (reviewer 역할)
- 모든 소통이 문서로 남음 (추적 가능)
- 에이전트 교체가 자유로움 (인터페이스 = 문서)
- 비동기 협업에 자연스러움

#### Agent API 엔드포인트

```
# 문서 읽기
GET  /api/project/:workspace/:doc
     → { content, status, comments, version, diff_from_prev }

# 문서 쓰기/수정
PUT  /api/project/:workspace/:doc
     → { content, status_change?, comment? }

# 피드백 남기기
POST /api/project/:workspace/:doc/comments
     → { line_range, content, action: "open"|"resolve" }

# 상태 변경
PATCH /api/project/:workspace/:doc/status
      → { status: "draft"|"review"|"approved"|"implemented" }

# 변경 이력
GET  /api/project/:workspace/:doc/history
     → [{ version, diff, author, timestamp, status_change }]
```

**인증**: Agent는 workspace별 API 토큰으로 접근합니다.

```bash
openhow agent add my-dev-agent --role agent
# → API token: openhow_agent_xxxx
```

#### Webhook 스펙

문서 상태가 변경되면 등록된 webhook URL로 POST 요청을 보냅니다.

```json
{
  "event": "document.status_changed",
  "workspace": "saju-service-v2",
  "document": "specs/fortune-report.md",
  "from_status": "review",
  "to_status": "approved",
  "changed_by": {
    "role": "reviewer",
    "name": "김전문가"
  },
  "diff_summary": "운세 해석 로직: 천간 → 천간+지지 변경",
  "api_url": "https://openhow.io/api/project/saju-service-v2/specs/fortune-report.md",
  "version": 3,
  "timestamp": "2026-02-27T14:30:00Z"
}
```

| 이벤트 | 발생 시점 |
|--------|---------|
| `document.created` | 새 스펙 문서 생성 |
| `document.updated` | 문서 내용 변경 |
| `document.status_changed` | 상태 전이 (draft→review 등) |
| `comment.created` | 새 피드백 코멘트 |
| `comment.resolved` | 코멘트 해결 |

---

### 시나리오별 워크플로우

#### 시나리오 1: 외주개발 스펙 협업

```
PM(owner)           클라이언트(reviewer)        개발자(agent)
    │                       │                       │
    ├─ 스펙 문서 작성 ──────→│                       │
    │   status: draft       │                       │
    │                       │                       │
    ├─ 리뷰 요청 ──────────→│                       │
    │   status: review      │                       │
    │                       ├─ 인라인 피드백 ────────→│
    │                       │  "결제 플로우 변경 필요" │
    │                       │                       │
    ├─ 피드백 반영 ─────────→│                       │
    │   comment: resolved   │                       │
    │   status: review      │                       │
    │                       │                       │
    │                       ├─ 승인 ─────────────────→│
    │                       │   status: approved     │
    │                       │                       │
    │                       │          webhook ─────→│
    │                       │                       ├─ diff 읽고 구현
    │                       │                       ├─ status: implemented
    │                       │                       │
```

#### 시나리오 2: 도메인 전문가 + AI Agent

```
개발자(owner)        사주 전문가(reviewer)       AI Agent(agent)
    │                       │                       │
    ├─ 레포트 스펙 작성 ────→│                       │
    │   "천간 기준 해석"     │                       │
    │   status: review      │                       │
    │                       │                       │
    │                       ├─ 피드백                │
    │                       │  "지지도 같이 봐야 함" │
    │                       │  "12운성 해석 추가"    │
    │                       │                       │
    ├─ 스펙 수정 ───────────→│                       │
    │   피드백 반영           │                       │
    │                       │                       │
    │                       ├─ 승인 ────────────────→│
    │                       │   status: approved     │
    │                       │                       │
    │                       │          webhook ─────→│
    │                       │                       ├─ 스펙 diff 읽기
    │                       │                       ├─ 코드 구현 (해석 로직 변경)
    │                       │                       ├─ status: implemented
```

#### 시나리오 3: 순수 A2A (Agent-to-Agent)

사람 개입 없이 에이전트끼리 문서를 매개로 협업합니다.

```
기획 Agent(owner)     검증 Agent(reviewer)      구현 Agent(agent)
    │                       │                       │
    ├─ 스펙 자동 생성 ──────→│                       │
    │   status: review      │                       │
    │                       │                       │
    │                       ├─ 스펙 검증              │
    │                       │  일관성/완전성 체크     │
    │                       ├─ 코멘트 or 승인 ───────→│
    │                       │                       │
    │                       │          webhook ─────→│
    │                       │                       ├─ 구현
    │                       │                       ├─ 결과 문서 업데이트
    │                       │                       ├─ status: implemented
    │                       │                       │
    │  ← webhook (implemented) ─────────────────────┤
    ├─ 다음 스펙 생성...     │                       │
```

**핵심: 에이전트를 교체해도 인터페이스(문서 형식)만 유지하면 동작합니다.**

---

### DB 스키마 확장

기존 `workspace` 테이블에 project 관련 컬럼/테이블 추가:

```sql
-- workspace.type에 'project' 추가
-- ALTER TABLE workspace ... (enum 확장)

-- 문서 상태 테이블
CREATE TABLE document_status (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspace(id),
    document_path TEXT NOT NULL,       -- "specs/auth.md"
    status TEXT NOT NULL DEFAULT 'draft',  -- draft|review|approved|implemented
    updated_by TEXT NOT NULL,          -- user_id 또는 agent_id
    updated_at INTEGER NOT NULL,
    UNIQUE(workspace_id, document_path)
);

-- 인라인 코멘트 테이블
CREATE TABLE document_comment (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspace(id),
    document_path TEXT NOT NULL,
    line_start INTEGER,               -- 코멘트 대상 라인 범위
    line_end INTEGER,
    content TEXT NOT NULL,
    author_id TEXT NOT NULL,           -- user_id 또는 agent_id
    author_role TEXT NOT NULL,         -- owner|reviewer|agent
    status TEXT NOT NULL DEFAULT 'open',  -- open|resolved|wontfix
    resolved_by TEXT,
    created_at INTEGER NOT NULL,
    resolved_at INTEGER
);

-- Agent 토큰 테이블
CREATE TABLE agent_token (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspace(id),
    name TEXT NOT NULL,                -- "my-dev-agent"
    token_hash TEXT NOT NULL,          -- hashed API token
    role TEXT NOT NULL DEFAULT 'agent',
    permissions TEXT,                  -- JSON: ["read", "write", "status"]
    last_used_at INTEGER,
    created_at INTEGER NOT NULL
);

-- Webhook 등록 테이블
CREATE TABLE webhook (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspace(id),
    url TEXT NOT NULL,
    events TEXT NOT NULL,              -- JSON: ["document.status_changed", ...]
    secret TEXT,                       -- webhook signing secret
    active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL
);
```

---

### CLI 확장

```bash
# 프로젝트 초기화
openhow init --type project

# Agent 관리
openhow agent add <name> --role agent
openhow agent list
openhow agent revoke <name>

# 문서 상태 관리
openhow status specs/auth.md                    # 현재 상태 확인
openhow status specs/auth.md --set review       # 상태 변경
openhow status specs/auth.md --set approved      # 승인 (reviewer만)

# 피드백 확인
openhow comments specs/auth.md                  # 코멘트 목록
openhow comments specs/auth.md --open           # 미해결만

# Webhook 관리
openhow webhook add https://example.com/hook --events document.status_changed
openhow webhook list
openhow webhook test                             # 테스트 이벤트 발송
```

---

### `project` vs `team` 선택 가이드

| 상황 | 추천 타입 |
|------|----------|
| 팀 내부 설계 문서, 런북 공유 | `team` |
| 외부 클라이언트와 스펙 협업 | **`project`** |
| 도메인 전문가 피드백이 필요 | **`project`** |
| AI Agent가 문서 기반으로 구현 | **`project`** |
| 문서 변경 → 자동 구현 파이프라인 | **`project`** |
| Agent 간 비동기 협업 | **`project`** |
| 단순 지식 기록/공유 | `team` |
