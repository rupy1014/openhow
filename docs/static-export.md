# Static Export (`openhow export`)

## 배경

`openhow publish`는 콘텐츠를 Worker + R2로 퍼블리시한다. 공개 콘텐츠만 있는 워크스페이스(예: blog.bootpay.ai)는 Worker 의존 없이 **완전한 정적 사이트**로 배포할 수 있어야 한다.

## 목표

```bash
openhow export [path]
```

로컬 마크다운 → 정적 HTML + CSS + JS + JSON + 이미지를 `dist/` 폴더에 출력.
Cloudflare Pages, Vercel, Netlify, GitHub Pages 등 어디든 배포 가능.

## publish와의 차이

| | `publish` | `export` |
|---|---|---|
| 출력 | Worker API → R2 | 로컬 `dist/` 폴더 |
| 인증 | OAuth 토큰 필요 | 불필요 |
| 이미지 | R2 업로드 (`/api/assets/...`) | 로컬 복사 (`/assets/...`) |
| 동영상 | Cloudflare Stream UID 변환 | 스킵 (warning) |
| 유료/비공개 콘텐츠 | paywall, 접근 제어 | 지원 안 함 (공개 전용) |
| SSG HTML | R2에 저장 | `dist/` 에 `.html` 파일로 출력 |
| JSON 데이터 | R2 `_data/` | `dist/_data/` |

## CLI 인터페이스

```bash
openhow export [path]           # 기본: dist/ 에 출력
openhow export . -o build       # 출력 디렉토리 지정
openhow export . --base-url /blog  # 서브패스 배포 시
openhow export . --clean        # dist/ 정리 후 생성
```

### 옵션

| 옵션 | 기본값 | 설명 |
|------|--------|------|
| `-o, --output <dir>` | `dist` | 출력 디렉토리 |
| `--base-url <url>` | `/` | 사이트 base URL |
| `--clean` | `false` | 출력 디렉토리 초기화 |
| `--no-optimize` | (최적화 ON) | 이미지 최적화 스킵 |

## 출력 구조

```
dist/
├── index.html                            # 워크스페이스 인덱스
├── getting-started/
│   └── payment-getting-started/
│       └── index.html                    # clean URL 지원
├── assets/
│   ├── css/
│   │   ├── ssg.css
│   │   └── custom.css                    # style.css 있으면
│   ├── js/
│   │   └── hydrate.js
│   └── images/
│       └── *.png / *.webp                # 원본 또는 최적화
└── _data/
    └── {workspace}/
        ├── manifest.json
        └── {slug}.json                   # 문서별 데이터
```

### URL 매핑

| 슬러그 | 파일 경로 | URL |
|--------|----------|-----|
| `index` | `dist/index.html` | `/` |
| `getting-started/foo` | `dist/getting-started/foo/index.html` | `/getting-started/foo` |

## 재사용 코드

publish 커맨드의 다음 인프라를 그대로 사용:

- `scanProject()` — 마크다운 스캐닝
- `buildWorkspaceHtml()` — SSG HTML 생성
- `SSG_CSS`, `HYDRATE_JS` — 스타일/하이드레이션
- `parseAssetTarget()`, `toWorkspaceAssetPath()` — 이미지 경로 파싱
- `optimizeImageBuffer()` — 이미지 최적화 (sharp)

**달라지는 것**: 이미지 경로를 `/api/assets/...` 대신 `/assets/...`로 리라이트.

## 제한사항

- **공개 콘텐츠 전용** — 인증/paywall 필요한 문서는 export 불가
- **동영상 미지원** — `:::video` 디렉티브는 스킵 (Cloudflare Stream 의존)
- **검색** — manifest.json 기반 클라이언트 사이드 검색만 가능
