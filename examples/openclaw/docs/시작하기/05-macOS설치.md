---
slug: 시작하기-macOS설치
title: "macOS 설치"
nav: macOS 설치
order: 5
---

*검증 기준일: 2026-03-03 (공식 문서·릴리즈 기준)*

**macOS는 터미널 CLI가 제일 빨라. 앱 온보딩도 있어.**

---

## A안: CLI 설치 (권장)

**Step 1.** 터미널 열기

`Cmd + Space` → "터미널" 검색 → 실행

**Step 2.** OpenClaw 설치

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

Node.js 22+와 Git을 자동으로 확인하고 없으면 설치해.
끝나면 **터미널을 닫고 다시 열어야** `openclaw` 명령어가 인식돼.

**Step 3.** 온보딩

```bash
openclaw onboard --install-daemon
```

macOS에서는 LaunchAgent로 데몬이 설치돼.
재부팅해도 자동 실행돼.

**Step 4.** 대시보드 열기

```bash
openclaw dashboard
```

또는 브라우저에서 직접: `http://127.0.0.1:18789/`

브라우저에서 대시보드(Control UI)가 열리면 설치 완료야.

---

## B안: macOS 앱 온보딩 (GUI 방식)

터미널이 무서우면 앱으로도 할 수 있어.
GUI로 온보딩을 진행하는 방식이야.

### 앱 온보딩 단계

**Step 1.** 첫 실행 시 macOS 경고 승인

"확인되지 않은 개발자" 경고가 뜨면:
시스템 설정 → 개인정보 보호 및 보안 → **허용** 클릭

**Step 2.** 로컬 네트워크 접근 허용

팝업에서 "허용" 클릭

**Step 3.** 보안 안내 확인

기본은 "개인용 1인 운영자" 모델이야.
여러 명이 쓰는 환경에서는 추가 락다운 설정이 필요해.

**Step 4.** Local vs Remote 선택

Gateway를 이 Mac에 둘지, 원격 서버에 둘지 선택해.
처음이면 Local로 시작해.

**Step 5.** 권한 요청 허용

Automation, Notifications, Accessibility 등 필요한 권한을 허용해.

---

## macOS에서 자주 나는 오류

### sharp 빌드 오류 (Homebrew libvips 충돌)

Homebrew로 libvips가 설치돼 있으면 sharp 패키지 빌드가 충돌해.

```bash
SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install -g openclaw@latest
```

prebuilt 바이너리를 강제로 쓰게 하면 해결돼.

---

### sudo 권한 문제

```bash
sudo npm install -g openclaw@latest
```

그래도 안 되면 nvm으로 Node.js를 다시 깔아봐.

---

## 한 줄 정리

macOS는 `curl` 한 줄이면 끝. 터미널이 싫으면 앱 온보딩도 있어.
