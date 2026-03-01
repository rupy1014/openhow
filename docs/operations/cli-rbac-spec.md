---
title: Openhow CLI 권한 모델(RBAC) 명세
status: draft
version: 1
date: 2026-03-01
owner: 잡돌쌤
---

# Openhow CLI RBAC 명세

## 1) 역할 정의

- `owner` : 플랫폼 최고 관리자
- `admin` : 워크스페이스/기수 운영 관리자
- `editor` : 문서 편집/승격 요청 가능
- `member` : 문서 작성/조회
- `viewer` : 조회 전용

## 2) 권한 계층
`owner > admin > editor > member > viewer`

## 3) 명령별 최소 권한

| CLI 명령 | 최소 권한 | 비고 |
|---|---:|---|
| `openhow workspace create` | admin | owner 포함 |
| `openhow workspace settings` | admin | 정책 변경 |
| `openhow invite` | admin | 멤버 초대 |
| `openhow cohort init` | admin | 기수 스타터 생성/배포 |
| `openhow promote` | admin | reviewed/canonical 승격 |
| `openhow publish --scope core` | admin | 공식 위키 반영 |
| `openhow publish --scope cohort` | editor | 기수 문서 반영 |
| `openhow publish --scope personal` | member | 개인 문서 반영 |
| `openhow doc create/edit` | member | viewer 제외 |
| `openhow whoami --permissions` | viewer | 전 역할 허용 |

## 4) 정책 파일(제안)

`openhow.policy.json`

```json
{
  "roles": ["owner", "admin", "editor", "member", "viewer"],
  "commandPermissions": {
    "workspace:create": "admin",
    "workspace:settings": "admin",
    "invite": "admin",
    "cohort:init": "admin",
    "promote": "admin",
    "publish:core": "admin",
    "publish:cohort": "editor",
    "publish:personal": "member",
    "doc:write": "member",
    "whoami:permissions": "viewer"
  }
}
```

## 5) 에러 메시지 표준

권한 부족 시:

```text
Permission denied: command 'promote' requires role >= admin.
Current role: member
```

## 6) 감사 로그 포맷

승격/권한변경/발행 이벤트는 최소 아래 필드 기록:
- actor
- role
- command
- targetWorkspace
- targetDoc
- timestamp
- result(success|deny|fail)

## 7) 도입 순서

1. `whoami --permissions` 구현
2. `cohort init`, `promote`, `publish` 권한 게이트 우선 적용
3. `workspace`, `invite` 권한 게이트 적용
4. 정책파일 커스터마이즈 지원
