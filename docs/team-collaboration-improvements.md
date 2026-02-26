---
title: 팀 협업 기능 개선 로드맵
description: 팀원 간 CLI publish, 버전 추적, 협업 워크플로우 가이드
access: team
---

# 팀 문서 협업 가이드

## 팀원 간 CLI Publish 워크플로우

### 기본 흐름

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

### 1단계: 팀 설정

```bash
# 워크스페이스 생성 (팀장)
openhow login --provider github
openhow publish --workspace my-team-docs

# 팀원 초대
openhow invite alice@team.com -w my-team-docs -r editor
openhow invite bob@team.com   -w my-team-docs -r editor
```

### 2단계: 팀원 각자 로컬에서 작업

```bash
# 팀원이 프로젝트 클론 후
git clone <repo-url>
cd my-docs

# 로그인 (최초 1회)
openhow login --provider github

# 로컬 프리뷰
openhow serve

# 문서 수정 → 커밋 → 퍼블리시
vi docs/getting-started.md
git add . && git commit -m "시작하기 가이드 개선"
openhow publish
```

### 3단계: 버전 메시지 자동 기록

`openhow publish` 시 버전 메시지가 자동으로 결정됩니다:

| 우선순위 | 소스 | 예시 |
|---------|------|------|
| 1 | `--message` 옵션 | `openhow publish -m "API v2 반영"` |
| 2 | 파일별 git commit 메시지 | `git log -1 --format=%s -- docs/api.md` |
| 3 | 프로젝트 최신 커밋 메시지 | `git log -1 --format=%s` |
| 4 | 자동 생성 | `v5: 콘텐츠 업데이트` |

**팁**: 의미 있는 git commit 메시지를 쓰면 버전 이력이 자동으로 깔끔해집니다.

```bash
# 좋은 예
git commit -m "fix: 결제 API 응답 필드명 수정"
openhow publish

# 명시적 메시지 지정
openhow publish -m "2026-02 정기 업데이트: 보안 섹션 추가"
```

### 4단계: 버전 이력 조회

```bash
# 클라우드 퍼블리시 이력 (누가, 언제, 무슨 메시지로 퍼블리시했는지)
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
```

### 5단계: 웹 뷰어에서 확인

문서 페이지 우측 상단 시계 아이콘을 클릭하면 **버전 히스토리 패널**이 열립니다:
- 각 버전의 **메시지**, **퍼블리셔 이름**, **날짜** 확인
- 클릭하면 해당 시점의 콘텐츠를 볼 수 있음
- "최신으로 돌아가기" 버튼으로 복귀

---

## CLI 명령어 레퍼런스

### publish (퍼블리시)

```bash
openhow publish [path] [options]

옵션:
  -w, --workspace <slug>    워크스페이스 지정
  -m, --message <message>   버전 메시지 (git 커밋 메시지 대신 사용)
```

### versions (클라우드 버전 이력)

```bash
openhow versions <slug> [options]

필수:
  <slug>                    문서 slug (예: getting-started, api/auth)
  -w, --workspace <slug>    워크스페이스 지정

옵션:
  -n, --count <count>       표시할 버전 수 (기본: 20)
```

### history (로컬 git 이력)

```bash
openhow history [file] [options]

옵션:
  -n, --count <count>       표시할 커밋 수 (기본: 20)
```

### 차이점: versions vs history

| | `openhow versions` | `openhow history` |
|---|---|---|
| 데이터 소스 | 클라우드 (openhow.io) | 로컬 git |
| 표시 정보 | 퍼블리셔, 메시지, 날짜 | 커밋해시, 날짜, 메시지 |
| 용도 | "이 문서 누가 마지막에 올렸지?" | "로컬에서 뭐가 바뀌었지?" |

---

## 권한 모델

| 역할 | publish | 초대 | 설정 변경 | 문서 삭제 |
|------|---------|------|----------|----------|
| **owner** | O | O | O | O |
| **admin** | O | O | O | O |
| **editor** | O | X | X | 본인 문서만 |
| **viewer** | X | X | X | X |

팀원에게는 보통 `editor` 권한을 부여합니다. `viewer`는 읽기 전용입니다.

---

## 버전 관리 구조

```
document_version 테이블:
┌─────────┬───────────────────────┬──────────────────────┬──────────┐
│ version │ message               │ publisherName        │ 날짜      │
├─────────┼───────────────────────┼──────────────────────┼──────────┤
│ v5      │ fix: API 필드명 수정   │ alice                │ 02.26    │
│ v4      │ feat: 보안 섹션 추가   │ bob                  │ 02.25    │
│ v3      │ 초기 문서 작성          │ alice                │ 02.20    │
└─────────┴───────────────────────┴──────────────────────┴──────────┘
```

각 퍼블리시 시 이전 콘텐츠가 R2에 스냅샷으로 보존되며, 웹 뷰어에서 과거 버전 콘텐츠를 열람할 수 있습니다.

---

## 구현 상태

### 완료

- [x] 버전 메시지 저장 (DB `message` 컬럼 + 마이그레이션)
- [x] git commit 메시지 자동 추출 → 버전 메시지로 전달
- [x] `publish --message` 옵션으로 명시적 메시지 지정
- [x] 버전 API에 퍼블리셔 정보 (이름, 이메일) JOIN 반환
- [x] `openhow versions` 클라우드 버전 이력 조회 명령
- [x] 뷰어 버전 패널에 메시지 + 퍼블리셔 이름 표시

### 예정

- [ ] 댓글/리뷰 시스템
- [ ] 알림 (새 문서 퍼블리시, 댓글)
- [ ] 문서 상태 워크플로우 (draft → review → approved)
- [ ] 활동 피드 (대시보드)
- [ ] Slack/Discord 웹훅 연동
