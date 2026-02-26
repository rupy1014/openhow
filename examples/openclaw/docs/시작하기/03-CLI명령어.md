---
slug: 시작하기-CLI명령어
title: "CLI 명령어"
nav: CLI 명령어
order: 3
---

*검증 기준일: 2026-02-26 (공식 문서·릴리즈 기준)*

**자주 쓰는 명령어만 모았어.**

전부 외울 필요 없어. 이 페이지 북마크해두고 필요할 때 찾아봐.
`openclaw 2026.2.24` 기준으로 확인했어.

---

## 기본

```bash
openclaw status             # 전체 상태 확인
openclaw doctor             # 문제 진단
openclaw doctor --fix       # 자동 수리
openclaw logs --follow      # 실시간 로그
```

---

## Gateway (핵심)

```bash
openclaw gateway status     # 게이트웨이 상태
openclaw gateway restart    # 재시작 (설정 변경 후 필수!)
openclaw gateway --verbose  # 디버그 모드
```

---

## 설정

```bash
openclaw config get agent.model          # 현재 모델 확인
openclaw config set agent.model "..."    # 모델 변경
openclaw config unset agent.model         # 설정 키 제거
openclaw configure                       # 대화형 설정
```

---

## 대화

```bash
openclaw agent --message "안녕"  # 단일 요청
openclaw tui                     # 터미널 UI (풀스크린)
openclaw dashboard               # 대시보드 열기
```

---

## 채널 & 페어링

```bash
openclaw channels status --probe         # 채널 연결 상태
openclaw pairing list telegram           # 대기 중인 페어링
openclaw pairing approve telegram ABC    # 페어링 승인
```

---

## 스킬 (확장 기능)

```bash
openclaw skills list                            # 스킬 목록
openclaw skills info coding-agent               # 스킬 상세
openclaw skills check                           # 실행 가능 여부 점검
clawhub search "git"                            # ClawHub 검색
clawhub install 스킬이름                        # ClawHub에서 설치
clawhub update --all                            # 전체 업데이트
```

---

## 크론 (예약 작업)

```bash
openclaw cron add --name "이름" --cron "0 7 * * *" --message "할 일"
openclaw cron list                              # 등록된 작업
openclaw cron rm 작업ID                          # 삭제 (remove도 가능)
```

---

## 보안

```bash
openclaw security audit          # 보안 점검
openclaw security audit --deep   # 심층 점검
openclaw security audit --fix    # 자동 수정
```

---

## 브라우저

```bash
openclaw browser status          # 브라우저 상태
openclaw browser start           # 브라우저 시작
```

---

## 한 줄 정리

`openclaw doctor`로 진단, `openclaw gateway restart`로 적용. 이 두 개만 기억해.
