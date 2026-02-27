---
title: 팀 문서 협업 가이드
description: openhow 팀 협업 워크플로우 — CLI publish, 버전 추적, 권한 관리
access: team
---

# 팀 문서 협업 가이드

## 개요

openhow는 로컬 마크다운 문서를 팀원들과 함께 퍼블리시하고, 버전 이력을 추적하는 협업 워크플로우를 제공합니다.

```
팀원 A (로컬)                    팀원 B (로컬)
────────────                    ────────────
docs/ 편집                      docs/ 편집
git commit -m "API 인증 가이드"   git commit -m "배포 가이드 수정"
openhow publish                  openhow publish
       ↓                               ↓
       └──────── openhow.io ────────────┘
                     ↓
              버전 이력에 기록됨:
              v3  팀원A  "API 인증 가이드"
              v4  팀원B  "배포 가이드 수정"
```

---

## 빠른 시작

### 1단계: 팀 설정 (팀장)

```bash
# 로그인
openhow login --provider github

# 첫 퍼블리시 시 워크스페이스 자동 생성
openhow publish --workspace my-team-docs

# 팀원 초대 (editor 권한)
openhow invite alice@team.com -w my-team-docs -r editor
openhow invite bob@team.com   -w my-team-docs -r editor
```

### 2단계: 팀원 작업

```bash
# 프로젝트 클론 + 로그인 (최초 1회)
git clone <repo-url> && cd my-docs
openhow login --provider github

# 로컬 프리뷰
openhow serve

# 문서 수정 → 커밋 → 퍼블리시
vi docs/getting-started.md
git add . && git commit -m "시작하기 가이드 개선"
openhow publish
```

### 3단계: 버전 메시지 자동 기록

`openhow publish` 시 버전 메시지가 다음 우선순위로 결정됩니다:

| 우선순위 | 소스 | 예시 |
|---------|------|------|
| 1 | `--message` 옵션 | `openhow publish -m "API v2 반영"` |
| 2 | 파일별 git commit 메시지 | 해당 파일의 최신 커밋 메시지 자동 추출 |
| 3 | 프로젝트 최신 커밋 메시지 | `git log -1 --format=%s` |
| 4 | 자동 생성 | `v5: 콘텐츠 업데이트` 또는 제목 변경 감지 시 자동 메시지 |

**팁**: 의미 있는 git commit 메시지를 쓰면 버전 이력이 자동으로 깔끔해집니다.

```bash
# git 메시지 그대로 활용
git commit -m "fix: 결제 API 응답 필드명 수정"
openhow publish

# 명시적 메시지 지정 (git 메시지 무시)
openhow publish -m "2026-02 정기 업데이트: 보안 섹션 추가"
```

### 4단계: 이력 확인

```bash
# 클라우드 퍼블리시 이력
openhow versions getting-started -w my-team-docs

# 출력 예시:
#  📋 퍼블리시 이력: getting-started (my-team-docs)
#
#   v5   2026.02.26 14:30  alice
#        fix: 결제 API 응답 필드명 수정
#
#   v4   2026.02.25 09:15  bob
#        feat: 보안 인증 섹션 추가
#
#   v3   2026.02.20 11:00  alice
#        초기 문서 작성

# 로컬 git 이력
openhow history docs/getting-started.md

# 로컬 변경 확인
openhow diff docs/getting-started.md
```

### 5단계: 웹 뷰어에서 확인

문서 페이지 우측 상단 **시계 아이콘**을 클릭하면 **버전 히스토리 패널** (340px 사이드 패널)이 열립니다:

- 각 버전의 **메시지**, **퍼블리셔 이름**, **날짜** 표시
- 버전 클릭 시 해당 시점의 콘텐츠를 즉시 로드
- 상단에 "v3 보는 중" 배너 + **"최신으로 돌아가기"** 버튼으로 복귀

---

## CLI 명령어 레퍼런스

### 인증

```bash
openhow login --provider <github|google>   # OAuth 로그인 (최초 1회)
openhow logout                              # 로그아웃 (토큰 삭제)
openhow whoami                              # 현재 로그인 사용자 확인
openhow status                              # 계정 + 워크스페이스 상태
```

### 퍼블리시

```bash
openhow publish [path] [options]

옵션:
  -w, --workspace <slug>    워크스페이스 지정
  -m, --message <message>   버전 메시지 (git 커밋 메시지 대신 사용)
```

### 팀 관리

```bash
openhow invite <email> [options]

필수:
  <email>                   초대할 팀원 이메일

옵션:
  -w, --workspace <slug>    워크스페이스 지정
  -r, --role <role>         역할 (owner | admin | editor | viewer, 기본: viewer)
```

### 버전 이력

```bash
# 클라우드 퍼블리시 이력
openhow versions <slug> [options]

필수:
  <slug>                    문서 slug (예: getting-started, api/auth)
  -w, --workspace <slug>    워크스페이스 지정

옵션:
  -n, --count <count>       표시할 버전 수 (기본: 20)

# 로컬 git 이력
openhow history [file] [options]

옵션:
  -n, --count <count>       표시할 커밋 수 (기본: 20)

# 로컬 변경 사항 확인
openhow diff [file]

# 특정 커밋 시점의 파일 내용
openhow show <file> -c <commit>
```

### versions vs history vs diff

| | `versions` | `history` | `diff` |
|---|---|---|---|
| 데이터 소스 | 클라우드 (openhow.io) | 로컬 git log | 로컬 git diff |
| 표시 정보 | 퍼블리셔, 메시지, 날짜 | 커밋해시, 날짜, 메시지 | 변경된 라인 |
| 용도 | "누가 마지막에 올렸지?" | "로컬에서 뭐가 바뀌었지?" | "아직 커밋 안 한 변경은?" |

### 로컬 프리뷰

```bash
openhow serve [path]           # 로컬 문서 뷰어 (port 3600)
openhow init                   # 설정 초기화
openhow config [get|set|reset] # 설정 관리
```

---

## 권한 모델

| 역할 | publish | 초대/멤버 관리 | 설정 변경 | 문서 삭제 |
|------|---------|--------------|----------|----------|
| **owner** | O | O | O | O |
| **admin** | O | O | O | O |
| **editor** | O | X | X | 본인 문서만 |
| **viewer** | X | X | X | X |

- 팀원에게는 보통 `editor` 권한을 부여합니다
- `viewer`는 `public`/`unlisted`/`team` 문서 읽기만 가능
- `private` 문서는 작성자 본인과 `owner`/`admin`만 접근 가능
- 문서의 `access` 레벨: `public` > `unlisted` > `team` > `private`

---

## 버전 관리 구조

```
document_version 테이블:
┌─────────┬───────────────────────┬──────────────┬──────────┐
│ version │ message               │ publishedBy  │ 날짜      │
├─────────┼───────────────────────┼──────────────┼──────────┤
│ v5      │ fix: API 필드명 수정   │ alice        │ 02.26    │
│ v4      │ feat: 보안 섹션 추가   │ bob          │ 02.25    │
│ v3      │ 초기 문서 작성          │ alice        │ 02.20    │
└─────────┴───────────────────────┴──────────────┴──────────┘
```

- 각 퍼블리시 시 이전 콘텐츠가 **R2에 스냅샷으로 보존**
- 웹 뷰어에서 과거 버전 콘텐츠를 열람 가능
- 버전 API는 `user` 테이블과 JOIN하여 `publisherName`, `publisherEmail` 반환

---

## 구현 상태

### 완료

- [x] 버전 메시지 저장 (DB `message` 컬럼 + 마이그레이션 `0019`)
- [x] git commit 메시지 자동 추출 (파일별 + 프로젝트 레벨)
- [x] `publish --message` 옵션으로 명시적 메시지 지정
- [x] 버전 API에 퍼블리셔 정보 JOIN (`publisherName`, `publisherEmail`)
- [x] `openhow versions` 클라우드 버전 이력 조회
- [x] `openhow history` / `openhow diff` / `openhow show` 로컬 이력 명령
- [x] `openhow invite` 팀원 초대 CLI
- [x] 뷰어 버전 히스토리 패널 (사이드 슬라이드, 과거 버전 열람, 최신 복귀)
- [x] 4단계 권한 모델 (owner/admin/editor/viewer) + API 접근 제어
- [x] 문서 접근 레벨 제어 (public/unlisted/team/private)
- [x] OAuth 로그인 (GitHub, Google)

### 예정

- [ ] 댓글/리뷰 시스템
- [ ] 알림 (새 문서 퍼블리시, 댓글)
- [ ] 문서 상태 워크플로우 (draft → review → approved)
- [ ] 활동 피드 (대시보드)
- [ ] Slack/Discord 웹훅 연동
