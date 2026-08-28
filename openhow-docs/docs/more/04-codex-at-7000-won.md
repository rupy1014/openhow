---
slug: more/codex-at-7000-won
title: Codex 월 7,000원에 쓰는 법
nav: Codex 월 7,000원
description: 약 월 7,000원 수준으로 Codex를 쓰는 영상과, 여러 계정을 안전하게 관리하는 codex-auth 스킬을 제공한다.
hook: 계정을 어디서 구했든, 로그인 정보를 안전하게 관리하는 방법은 따로 알아야 해요.
status: 공개됨
tags: [영상자료, Codex, ChatGPT, 비용, 계정전환, 자동화]
access: public
attachments:
  - label: codex-auth 스킬 ZIP
    href: /__content__/_downloads/codex-auth.zip
  - label: 영상 대본 원문
    href: /__content__/_downloads/codex-account-slots-video-script.md.txt
---

## 영상부터 볼까요?

:::youtube fsmEm3_Tb4M
:::

[YouTube에서 영상 보기](https://youtu.be/fsmEm3_Tb4M)

영상에서 말하는 **월 7,000원 수준**은 공유형 상품과 할인 조건을 기준으로 한 촬영 시점의 예시예요. 판매 가격, 제공 방식, 한도, 약관은 계속 바뀔 수 있으니 결제 전에 직접 확인하세요.

공유형 계정을 쓴다면 회사 코드, 개인정보, 결제 정보, 비공개 대화처럼 노출되면 곤란한 자료는 넣지 않는 편이 안전해요. 계정 공유나 재판매가 서비스 약관에 맞는지도 직접 확인해야 합니다.

## 핵심만 먼저 볼까요?

Codex는 로그인 정보를 `~/.codex/auth.json` 파일 하나에 저장해요.

`codex-auth`는 계정마다 이 파일을 별도 슬롯에 보관해요. 필요할 때 슬롯만 바꾸기 때문에 매번 로그아웃하고 다시 로그인하지 않아도 돼요.

```text
계정 여러 개
    ↓
슬롯으로 따로 보관
    ↓
남은 한도 확인
    ↓
가장 여유 있는 계정으로 전환
```

영상에서는 계정을 저렴하게 구하는 방법과 함께, **권한이 있는 여러 계정을 하나처럼 관리하는 방법**을 보여줘요. 처음이라면 장기간 결제보다 한 달 정도 써 본 뒤 내 사용 방식에 맞는지 판단하는 편이 좋아요.

## 스킬은 어떻게 받나요?

[codex-auth 스킬 ZIP 받기](/__content__/_downloads/codex-auth.zip)

압축 파일에는 현재 `codex-auth` 스킬 전체가 들어 있어요.

```text
codex-auth/
├── HISTORY.md
├── SKILL.md
├── WINDOWS.md
└── scripts/
    ├── codex-auth.mjs
    ├── dscodex.sh
    └── selftest.sh
```

별도 프로그램은 필요 없어요. Codex 명령줄 도구와 Node.js 18 이상만 있으면 돼요.

## 어떻게 설치하나요?

먼저 위 ZIP을 다운로드해요. 보통 `Downloads` 폴더에 들어가요.

:::code-group
```bash [Codex]
mkdir -p ~/.codex/skills
unzip -o ~/Downloads/codex-auth.zip -d ~/.codex/skills
chmod +x ~/.codex/skills/codex-auth/scripts/{codex-auth.mjs,dscodex.sh,selftest.sh}
grep -q 'cli_auth_credentials_store = "file"' ~/.codex/config.toml 2>/dev/null || printf '\ncli_auth_credentials_store = "file"\n' >> ~/.codex/config.toml
bash ~/.codex/skills/codex-auth/scripts/selftest.sh
```

```bash [Claude Code]
mkdir -p ~/.claude/skills
unzip -o ~/Downloads/codex-auth.zip -d ~/.claude/skills
chmod +x ~/.claude/skills/codex-auth/scripts/{codex-auth.mjs,dscodex.sh,selftest.sh}
grep -q 'cli_auth_credentials_store = "file"' ~/.codex/config.toml 2>/dev/null || printf '\ncli_auth_credentials_store = "file"\n' >> ~/.codex/config.toml
bash ~/.claude/skills/codex-auth/scripts/selftest.sh
```
:::

코드 블록 오른쪽 위의 복사 버튼을 누르고 터미널에 붙여넣으면 돼요.

설치 위치만 달라요. Codex에서 쓸 때는 `~/.codex/skills`, Claude Code에서 쓸 때는 `~/.claude/skills`에 넣어요.

## AI한테 설치를 맡기고 싶다면?

ZIP을 먼저 다운로드한 뒤 아래 `복사`를 누르고 Codex나 Claude Code에 붙여넣어요. 기존 파일이 있으면 덮어쓰기 전에 백업하고, 샌드박스 테스트까지 실행하도록 구성했어요.

:::copy-embed embeds/install-codex-auth codex-auth 설치와 검증 맡기기
:::

## 어떤 명령을 쓰나요?

경로가 길어서 먼저 `S`라는 짧은 이름을 붙여요.

:::code-group
```bash [Codex]
S=~/.codex/skills/codex-auth/scripts/codex-auth.mjs
```

```bash [Claude Code]
S=~/.claude/skills/codex-auth/scripts/codex-auth.mjs
```
:::

| 명령 | 하는 일 |
| --- | --- |
| `$S add <슬롯명>` | 새 계정을 슬롯에 넣어요 |
| `$S list` | 저장한 슬롯과 현재 계정을 봐요 |
| `$S quota` | 계정마다 남은 한도와 리셋 시각을 봐요 |
| `$S next` | 남은 한도가 가장 많은 슬롯으로 바꿔요 |
| `$S use <슬롯명>` | 원하는 슬롯으로 직접 바꿔요 |
| `$S sync` | 갱신된 로그인 정보를 현재 슬롯에 되돌려 써요 |
| `$S check` | 설정과 파일이 안전하게 맞는지 검사해요 |
| `$S preflight` | Codex를 열기 전에 현재 계정과 한도를 점검해요 |

슬롯 이름은 이메일 전체가 아니라 `@` 앞부분처럼 알아보기 쉬운 이름을 쓰면 돼요.

```bash
$S add myaccount
$S quota
$S next
```

## 꼭 알아야 할 점은 뭔가요?

### Codex가 돌고 있을 때 바꿔도 되나요?

진행 중인 `codex exec` 배치가 있거나 로그인 토큰 갱신과 겹칠 수 있을 때는 바꾸면 안 돼요. 로그인 파일을 통째로 바꾸면 실행 중인 작업이 인증을 잃을 수 있어요.

작업이 끝난 뒤 `$S check`로 상태를 확인하고 `$S next`를 실행해요. 자동 전환을 쓰기 전에도 먼저 이 동작을 이해해 두는 편이 안전해요.

### 로그인 파일을 복사해도 안전한가요?

슬롯에는 로그인 토큰이 평문 파일로 저장돼요. 스크립트가 파일 권한을 소유자만 읽을 수 있는 `0600`으로 맞추지만, 슬롯 폴더를 클라우드 드라이브나 Git에 올리면 안 돼요.

회사 코드나 민감한 자료를 다룬다면 공유 계정을 쓰지 않는 편이 안전해요. 계정 공유와 재판매는 서비스 약관에 어긋날 수 있으니 계정 제공 방식과 약관을 직접 확인해야 해요.

### 왜 `sync`가 필요한가요?

Codex는 로그인 토큰을 가끔 새것으로 바꿔요. 예전 복사본으로 되돌리면 인증이 폐기될 수 있어요.

`use`와 `next`는 나가는 슬롯을 먼저 갱신해 이 문제를 막아요. 오래 실행한 뒤 상태가 이상하면 `$S check`부터 실행해요.
