---
title: Openhow 운영 방안
status: draft
version: 1
date: 2026-03-01
owner: 잡돌쌤
---

# Openhow 운영 방안

## 1) 목적
- Openhow를 기본 문서 작성/공유 도구로 운영하되, 워크스페이스 구조를 통해 기수 운영/위키 축적/아카이브 확장을 동시에 달성한다.
- 사용자 UX는 단순하게(자기 기수 중심), 운영 구조는 확장 가능하게(코어/아카이브 분리) 설계한다.

## 2) 운영 원칙
1. 문서 작성은 자유, 공식 지식 반영은 검수 후 반영
2. 기수 활동 공간과 공식 위키 공간을 분리
3. 민감정보/내부 운영 로그는 공개 문서에 노출 금지
4. 문서 메타데이터 표준(frontmatter) 강제
5. 주간 검수 루프와 월간 정리 루프를 고정 운영

## 3) 워크스페이스 구조
### 3.1 Core Workspace (`clauders-core`)
- 용도: 운영진 강의 원본, 공식 위키, 운영 플레이북
- 권한: 운영진 중심(편집), 일반 멤버 읽기 제한 또는 공개 섹션 분리

### 3.2 Cohort Workspace (`clauders-{cohort}`)
- 용도: 기수별 실습/질문/자기소개/회고
- 권한: 해당 기수 멤버 편집
- 원칙: 멤버는 기본적으로 자기 기수 워크스페이스만 사용

### 3.3 Archive Workspace (`clauders-archive`)
- 용도: 종료 기수의 검수 완료 문서 열람
- 권한: 읽기 중심

## 4) 정보 구조 (기수 공통)
- `00-notice/` : 공지/운영 안내
- `01-introductions/` : 자기소개
- `02-qna/` : 질문/해결
- `03-build-log/` : 실습 구현 로그
- `04-retros/` : 회고
- `05-best-practices/` : 검증 패턴

## 5) 문서 수명주기 (Draft -> Reviewed -> Canonical)
1. Draft: 기수 내 작성/토론
2. Reviewed: 운영진 검수 통과
3. Canonical: Core Wiki 반영(공식 문서)

승격 대상은 다음 기준 충족 시 반영:
- 재현 가능성
- 정확성
- 보안 적합성
- 일반화 가능성

## 6) 메타데이터 표준 (frontmatter)
```yaml
cohort: 3rd
topic: openclaw
status: draft | reviewed | canonical
visibility: team | public
owner: @username
updatedAt: YYYY-MM-DD
```

## 7) 운영 루프
### 주간 루프 (매주)
1. Q&A/Build-log 수집
2. 승격 후보 선별
3. 운영진 30분 검수
4. Core/Archive 반영

### 월간 루프 (매월)
1. 중복 문서 병합
2. 오래된 문서 정리
3. 검색 태그/분류 재정비

## 8) 역할 정의
- 운영진: 구조/품질/보안/승격 책임
- 기수 리더: 기수 문서 활성화/정리
- 멤버: 작성/질문/사례 공유

## 9) 자동화/도구
- 스타터 생성: `scripts/create-cohort-starter.sh`
- 템플릿 위치: `docs/clauders/templates/`
- 운영 가이드: `docs/clauders/README.md`

## 10) 도입 로드맵
### Phase 1 (1~2주)
- 기수 워크스페이스 템플릿 정착
- 자기소개/Q&A/빌드로그 작성 습관화

### Phase 2 (3~6주)
- 위키 승격 루프 운영
- 아카이브 공개 범위 확정

### Phase 3 (7주+)
- 분기별 운영 리포트
- 공용 검색/탐색 UX 개선

## 11) 리스크와 대응
- 리스크: 문서만 쌓이고 승격이 멈춤
  - 대응: 주간 검수 회의 고정
- 리스크: 기수별 문서 형식 불일치
  - 대응: 템플릿 강제 + 초기 온보딩
- 리스크: 민감정보 유출
  - 대응: 공개 전 보안 체크리스트

## 12) KPI
- 기수별 주간 문서 생성 수
- Q&A 해결률
- Draft -> Reviewed 전환율
- Reviewed -> Canonical 전환율
- 재방문/검색 사용률

## 13) 즉시 실행 체크리스트
- [ ] 기수 워크스페이스 생성
- [ ] 템플릿/스타터 배포
- [ ] 주간 검수 시간 고정
- [ ] 승격 기준 공지
- [ ] 아카이브 공개 정책 확정
- [ ] CLI RBAC 명세 반영 (`docs/operations/cli-rbac-spec.md`)
- [ ] RBAC 구현 스프린트 시작 (`docs/operations/implementation-plan-rbac.md`)
