# Static Export (`openhow export`)

## 결론: 프로덕션 배포는 `publish`, export는 보조 도구

프로덕션 배포는 `openhow publish`가 담당한다. publish는 이미 SSG HTML + 정적 JSON을 R2에 생성하며, Worker는 R2 프록시 역할만 한다. 커스텀 도메인, 인증, paywall 등 운영 기능은 모두 Worker가 처리하므로 별도 정적 호스팅을 두면 도메인/인프라가 이중 관리된다.

`openhow export`는 다음 용도로 사용한다:

- **로컬 프리뷰** — publish 전에 결과물을 로컬에서 확인 (`npx serve dist`)
- **백업/아카이브** — 워크스페이스를 HTML 파일로 보존
- **외부 호스팅** — openhow 인프라 밖에서 독립 배포가 필요한 특수한 경우

---

## 배경

`openhow publish`는 콘텐츠를 Worker + R2로 퍼블리시한다. 공개 콘텐츠만 있는 워크스페이스는 Worker 의존 없이 완전한 정적 사이트로 뽑아볼 수 있어야 한다.

## publish와의 관계

| | `publish` (프로덕션) | `export` (보조) |
|---|---|---|
| 출력 | Worker API → R2 | 로컬 `dist/` 폴더 |
| 커스텀 도메인 | Worker가 자동 처리 | 직접 설정 필요 |
| 인증/paywall | 지원 | 미지원 (공개 전용) |
| 이미지 | R2 업로드 + CDN | 로컬 복사 |
| 동영상 | Cloudflare Stream | 미지원 |

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

## 재사용 코드

publish 커맨드의 다음 인프라를 그대로 사용:

- `scanProject()` — 마크다운 스캐닝
- `buildWorkspaceHtml()` — SSG HTML 생성
- `SSG_CSS`, `HYDRATE_JS` — 스타일/하이드레이션
- `parseAssetTarget()`, `toWorkspaceAssetPath()` — 이미지 경로 파싱
- `optimizeImageBuffer()` — 이미지 최적화 (sharp)

이미지 경로만 `/api/assets/...` 대신 `/assets/...`로 리라이트.

## 제한사항

- **공개 콘텐츠 전용** — 인증/paywall 필요한 문서는 export 불가
- **동영상 미지원** — `:::video` 디렉티브는 스킵 (Cloudflare Stream 의존)
- **검색** — manifest.json 기반 클라이언트 사이드 검색만 가능
- **프로덕션 배포용이 아님** — 커스텀 도메인은 `publish` + Worker가 처리
