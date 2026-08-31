---
slug: more/codex-at-7000-won
title: Codex 월 7,000원에 쓰는 법
nav: Codex 월 7,000원
description: 약 월 7,000원 수준으로 Codex를 쓰는 영상과, 여러 계정을 슬롯에 나눠 담아 알아서 갈아 끼우는 codex-auth 스킬을 제공한다.
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
    ↓
터미널 창마다 다른 계정
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

## 터미널에서 `codex`만 쳐도 되나요?

돼요. 아래 설정을 한 번 해두면 `codex`라고 칠 때마다 계정을 알아서 골라줘요.

`~/.zshrc` 파일 맨 끝에 아래 블록을 붙여넣어요. bash를 쓴다면 `~/.bashrc`에 넣어요.

:::code-group
```bash [Codex]
# omj:begin codex-auth
codex() {
	local launcher="$HOME/.codex/skills/codex-auth/scripts/dscodex.sh"
	if [[ -n "${CODEX_PLAIN:-}" || ! -x "$launcher" ]]; then
		command codex "$@"
	else
		"$launcher" "$@"
	fi
}
dscodex() { codex "$@"; }
# omj:end codex-auth
```

```bash [Claude Code]
# omj:begin codex-auth
codex() {
	local launcher="$HOME/.claude/skills/codex-auth/scripts/dscodex.sh"
	if [[ -n "${CODEX_PLAIN:-}" || ! -x "$launcher" ]]; then
		command codex "$@"
	else
		"$launcher" "$@"
	fi
}
dscodex() { codex "$@"; }
# omj:end codex-auth
```
:::

붙여넣은 다음 `exec $SHELL -l`을 치면 새 설정이 적용돼요.

이제 `codex`를 치면 세 가지가 자동으로 돼요.

1. 계정 현황 표를 먼저 보여줘요. 저장해 둔 값을 읽는 거라 인터넷을 쓰지 않고 바로 떠요.
2. 지금 계정 한도가 바닥이면 남아 있는 계정으로 바꿔서 띄워요.
3. 쓰다가 한도에 걸려 꺼지면 계정을 바꾼 뒤 **하던 대화를 이어서** 다시 띄워요.

```text
계정 11개 — 쓸 수 있는 것 6개
  * gracie24              100%
    bayzqfga2              80%  다른 세션이 사용 중
    donnie7                 0%  리셋 오후 06:47
    deangelobhwi6           -   인증 폐기 — 재로그인 필요
  계정을 직접 고르려면: CODEX_SLOT=bayzqfga2 codex
```

### 계정을 직접 고르고 싶다면?

표에 나온 슬롯 이름을 앞에 붙이면 돼요.

| 이렇게 치면 | 이렇게 돼요 |
| --- | --- |
| `codex` | 남은 한도를 보고 알아서 골라요 |
| `CODEX_SLOT=donnie7 codex` | 그 계정으로 고정해요. 한도가 없어도 안 바꿔요 |
| `command codex` | 원래 Codex 그대로 떠요 |
| `CODEX_AUTH_NO_PREFLIGHT=1 codex` | 점검 없이 바로 띄워요 |

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
| `$S adopt` | 지금 로그인해 둔 계정을 슬롯으로 등록해요 |
| `$S list` | 저장한 슬롯과 현재 계정을 봐요 |
| `$S quota` | 계정마다 남은 한도와 리셋 시각을 봐요 |
| `$S usage` | 계정마다 그동안 쓴 양을 봐요 |
| `$S next` | 남은 한도가 가장 많은 슬롯으로 바꿔요 |
| `$S use <슬롯명>` | 원하는 슬롯으로 직접 바꿔요 |
| `$S sync` | 갱신된 로그인 정보를 현재 슬롯에 되돌려 써요 |
| `$S check` | 설정과 파일이 안전하게 맞는지 검사해요 |
| `$S preflight` | Codex를 열기 전에 현재 계정과 한도를 점검해요 |
| `$S lane list` | 어느 터미널 창이 어느 계정을 쓰는지 봐요 |
| `$S remove <슬롯명>` | 슬롯 파일만 지워요. 로그인 자체는 그대로예요 |

슬롯 이름은 이메일 전체가 아니라 `@` 앞부분처럼 알아보기 쉬운 이름을 쓰면 돼요.

```bash
$S add myaccount
$S quota
$S next
```

이미 `codex login`으로 쓰던 계정이 있다면 `add` 대신 `adopt`를 쓰면 다시 로그인하지 않고 그대로 슬롯에 담을 수 있어요.

## 창을 여러 개 띄워도 되나요?

돼요. 터미널 창마다 다른 계정을 쓰도록 나눠줘요.

예전에는 창을 세 개 띄워도 계정이 하나라서, 그 계정 한도가 끝나면 세 개가 한꺼번에 멈췄어요. 지금은 창마다 계정이 달라서 하나가 멈춰도 나머지는 그대로 돌아가요.

같은 계정을 두 창이 동시에 쓰는 건 막아요. 두 창이 같은 로그인 정보를 각자 갱신하면 그 계정이 통째로 잠길 수 있거든요.

쓸 수 있는 계정이 하나도 안 남았을 때만, 이미 작업이 끝난 창이 붙잡고 있던 계정을 되찾아 써요. 누가 무엇을 쓰고 있는지는 `$S lane list`로 볼 수 있어요.

## 계정을 여럿이 같이 쓰고 있는지 알 수 있나요?

`$S usage`로 짐작할 수 있어요. 계정마다 날짜별로 얼마나 썼는지 보여줘요.

```bash
$S usage --days 7
```

**내가 안 쓴 날에 사용량이 찍혀 있다면** 그 계정을 다른 사람이나 다른 컴퓨터가 같이 쓰고 있다는 뜻이에요. 공유형 계정을 샀다면 여기서 티가 나요.

## 윈도우에서도 되나요?

윈도우에서는 WSL2 안에서 쓰세요. 윈도우에서 그냥 쓰면 안전장치 하나가 조용히 꺼져서, 잘 도는 것처럼 보이다가 계정을 잃을 수 있어요.

무엇이 왜 그런지는 ZIP 안 `WINDOWS.md`에 정리해 뒀어요.

## 꼭 알아야 할 점은 뭔가요?

### Codex가 돌고 있을 때 바꿔도 되나요?

`codex exec`로 여러 작업을 한꺼번에 돌리는 중이라면 바꾸면 안 돼요. 로그인 파일을 갈아 끼우는 순간 돌고 있던 작업들이 인증을 잃고 같이 죽어요. 스크립트가 이 경우를 막아줘요.

평소 대화창은 막지 않아요. 다만 이미 떠 있는 창은 **다시 켜기 전까지 예전 계정을 계속 써요.**

작업이 끝난 뒤 `$S check`로 상태를 확인하고 `$S next`를 실행해요.

### 한도 오류와 로그인 오류는 뭐가 다른가요?

메시지를 보고 갈라요. 대처가 정반대예요.

| 나오는 메시지 | 뜻 | 할 일 |
| --- | --- | --- |
| `usage limit`, `try again at ...` | 이번 시간대 한도를 다 썼어요 | 남은 계정으로 바꾸거나 리셋 시각까지 기다려요 |
| `refresh token was revoked` | 로그인이 풀렸어요 | 계정을 바꾸지 말고 그 슬롯에 다시 로그인해요 |

로그인이 풀린 건 다른 계정으로 바꿔도 안 풀려요. 오히려 멀쩡한 계정까지 헝클어져요. 이때는 같은 슬롯 이름으로 다시 로그인해요.

```bash
$S add <슬롯명> --force
```

### 로그인 파일을 복사해도 안전한가요?

슬롯에는 로그인 토큰이 평문 파일로 저장돼요. 스크립트가 파일 권한을 소유자만 읽을 수 있는 `0600`으로 맞추지만, 슬롯 폴더를 클라우드 드라이브나 Git에 올리면 안 돼요.

**같은 로그인 파일을 두 컴퓨터에 두고 양쪽에서 쓰는 것도 안 돼요.** 한쪽이 로그인 정보를 갱신하는 순간 다른 쪽 사본이 죽어요. 컴퓨터마다 다른 계정을 쓰는 편이 안전해요.

회사 코드나 민감한 자료를 다룬다면 공유 계정을 쓰지 않는 편이 안전해요. 계정 공유와 재판매는 서비스 약관에 어긋날 수 있으니 계정 제공 방식과 약관을 직접 확인해야 해요.

### 왜 `sync`가 필요한가요?

Codex는 로그인 토큰을 가끔 새것으로 바꿔요. 예전 복사본으로 되돌리면 인증이 폐기될 수 있어요.

`use`와 `next`는 나가는 슬롯을 먼저 갱신해 이 문제를 막아요. 오래 실행한 뒤 상태가 이상하면 `$S check`부터 실행해요.
