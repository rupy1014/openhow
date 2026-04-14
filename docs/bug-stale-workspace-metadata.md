# Bug: publish가 openhow.json에서 제거된 workspace 메타데이터를 서버에서 리셋하지 않는다

## 증상

`openhow serve`에서는 sidebar가 1개(single-panel)인데, `openhow publish` 후 배포된 사이트에서는 sidebar가 2개(two-panel)로 나온다.

## 재현 경로

1. `openhow.json`에 `"navigation": { "mode": "two-panel" }`을 설정하고 `openhow publish`
2. 배포 사이트에서 two-panel 레이아웃 확인 → 정상
3. `openhow.json`에서 `navigation` 필드를 제거
4. `openhow serve` → single-panel (정상)
5. `openhow publish` → 배포 사이트는 여전히 two-panel (**버그**)

## 근본 원인

`publish.ts` 807-809줄:

```ts
if (structure.config.navigation?.mode) {
    metaUpdates.navigationMode = structure.config.navigation.mode
}
```

`navigation.mode`가 없으면 `metaUpdates`에 `navigationMode`를 포함하지 않는다. 서버의 기존 값(`"two-panel"`)이 그대로 남는다.

동일한 패턴이 여러 필드에 적용되어 있다:

| 필드 | 없을 때 null 전송 | 상태 |
|------|-------------------|------|
| `mainNav` | ✅ (line 817-818) | 정상 |
| `sidebarConfig` | ✅ (line 822-823) | 정상 |
| `sidebarBadges` | ✅ (line 812-813) | 정상 |
| **`navigationMode`** | ❌ (line 807-809) | **버그** |
| **`footer`** | ❌ (line 825-826) | **버그** |
| **`themeJson`** | ❌ (line 828-829) | **버그** |
| **`logo`** | ❌ (line 831-832) | **버그** |
| **`sort`** | ❌ (line 834-835) | **버그** |

## 수정 방향

`mainNav`/`sidebarConfig`/`sidebarBadges`처럼 else 절에서 null을 명시적으로 전송한다:

```ts
// 수정 전
if (structure.config.navigation?.mode) {
    metaUpdates.navigationMode = structure.config.navigation.mode
}

// 수정 후
metaUpdates.navigationMode = structure.config.navigation?.mode || null
```

같은 패턴을 `footer`, `themeJson`, `logo`, `sort`에도 적용한다:

```ts
metaUpdates.navigationMode = structure.config.navigation?.mode || null
metaUpdates.footer = structure.config.footer || null
metaUpdates.themeJson = structure.config.theme || null
metaUpdates.logo = structure.config.logo || null
metaUpdates.sort = structure.config.sort || null
```

## 파일 위치

- `core/packages/cli/src/commands/publish.ts` — 807-836줄
- viewer 쪽은 수정 불필요 (`BlogLayout.tsx`가 `workspaceNavigationMode`를 서버에서 정상적으로 읽고 있다)

## 임시 해결 (workaround)

서버의 stale 값을 덮어쓰려면, `openhow.json`에 명시적으로 기본값을 넣고 publish한다:

```json
{
  "navigation": { "mode": "default" }
}
```

publish 후 다시 제거해도 된다. 하지만 근본 수정이 필요하다.

## 영향 범위

- bootpay 블로그 (`blog.bootpay.ai`) — `navigationMode: "two-panel"`이 서버에 남아있어 publish 후 sidebar가 2개로 나온다
- openhow.json에서 한 번이라도 `navigation.mode`, `footer`, `theme`, `logo`, `sort`를 설정했다가 제거한 모든 workspace에 동일한 문제가 발생할 수 있다
