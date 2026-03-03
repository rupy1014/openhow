---
slug: 시작하기-Windows설치
title: "Windows 설치"
nav: Windows 설치
order: 4
---

*검증 기준일: 2026-03-03 (공식 문서·릴리즈 기준)*

**Windows에서는 WSL2로 설치하는 게 제일 편해.**

PowerShell 실행 정책 이슈를 피할 수 있고 안정성이 높아.

---

## WSL2가 뭐야?

Windows 안에서 Linux를 실행하는 기능이야.
OpenClaw 공식 문서에서 Windows 사용자한테 강력 권장해.

---

## A안: WSL2로 설치 (권장)

**Step 1.** 관리자 PowerShell 열기

Windows 키 → "PowerShell" 검색 → 마우스 우클릭 → **관리자 권한으로 실행**

```powershell
wsl --install
```

설치 끝나면 **컴퓨터 재시작**해.
재시작하면 Ubuntu 터미널이 자동으로 열리고, 사용자 이름/비밀번호를 설정하라고 나와.

> 이미 WSL2가 설치돼 있으면 "이미 설치됨" 메시지가 뜨는데, 무시하고 다음으로 넘어가.

**Step 2.** Ubuntu 터미널 열기

Windows 키 → "Ubuntu" 검색 → 클릭

이제부터 모든 명령어는 이 Ubuntu 터미널에서 실행해.

**Step 3.** OpenClaw 설치

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

Node.js랑 Git이 없으면 자동으로 설치돼.
설치 끝나면 **터미널을 닫고 다시 열어야** `openclaw` 명령어가 인식돼.

**Step 4.** 온보딩 실행

```bash
openclaw onboard --install-daemon
```

마법사가 AI 모델 선택, 채널 연결, 데몬 설치를 단계별로 안내해.

끝에 "Gateway is running" 또는 "Daemon installed"가 뜨면 성공이야.

---

## B안: PowerShell 네이티브 설치

WSL2 설치가 어려운 환경(회사 PC, 보안 정책)에서만 써.
PowerShell 실행 정책 이슈가 발생할 수 있어.

**Step 1.** 관리자 PowerShell에서 실행

```powershell
iwr -useb https://openclaw.ai/install.ps1 | iex
```

**Step 2.** 온보딩

```powershell
openclaw onboard --install-daemon
```

---

## Windows에서 자주 나는 오류

### "openclaw is not recognized" — 명령어를 못 찾아

npm 전역 설치 경로가 PATH에 없는 거야.

```powershell
# 전역 설치 경로 확인
npm config get prefix
```

출력된 경로를 PATH에 추가하거나, WSL2로 전환하는 게 더 편해.

---

### "spawn git ENOENT" — Git이 없어

[git-scm.com](https://git-scm.com)에서 Git for Windows를 설치하고 PowerShell을 재시작해.

---

### "스크립트 실행이 비활성화" — npm.ps1 차단

PowerShell 실행 정책 제한이야.

**추천**: WSL2로 전환하면 이 문제가 안 생겨.

대안: 현재 사용자 범위에서만 실행 정책을 조정해 (회사 PC에서는 IT 정책에 따라 제한될 수 있어):

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 한 줄 정리

Windows는 WSL2가 정답이야. `wsl --install` → 재시작 → `curl`로 설치 → `openclaw onboard`. 끝.
