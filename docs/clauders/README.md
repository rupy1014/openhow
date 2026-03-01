# Clauders 운영 가이드 (Openhow)

이 디렉토리는 기수 운영을 위한 기본 템플릿 모음이다.

## 목적
- 기수별 문서 형식 통일
- 운영진 검수/승격 루프 표준화
- 아카이브 이관 시 메타데이터 일관성 확보

## 권장 워크스페이스 구조
- `clauders-core` : 운영진 정본/공식 위키
- `clauders-{cohort}` : 기수 운영(공지/자기소개/Q&A/실습/회고)
- `clauders-archive` : 종료 기수 공개 아카이브

## 폴더 템플릿
- `templates/00-notice` : 공지/모집 시퀀스
- `templates/01-introductions` : 자기소개 게시판
- `templates/02-qna` : 질문/해결 기록
- `templates/03-build-log` : 실습 구현 로그
- `templates/04-retros` : 회고
- `templates/05-best-practices` : 검증된 실전 패턴

## 시작 절차 (새 기수)
1. 새 워크스페이스 생성: `clauders-{cohort}`
2. 스타터 자동 생성 실행
   - `./scripts/create-cohort-starter.sh 4th @owner`
   - 옵션: `--dry-run` (미리보기), `--force` (덮어쓰기)
3. 생성된 `docs/clauders/starter/cohort-4th`를 해당 기수 워크스페이스로 복사
4. 자기소개 게시판 오픈 공지

## 주간 운영 루프
1. Q&A/Build-log 수집
2. 운영진 30분 검수
3. 승격 대상 문서 선별
4. `clauders-core/wiki` + `clauders-archive` 반영

## 승격 기준 (간단)
- 재현 가능성: 다른 기수도 따라 할 수 있는가
- 정확성: 사실/설정 오류가 없는가
- 보안: 민감정보 노출 없는가
- 일반성: 개인 메모가 아닌 공용 지식인가

## 메타데이터 최소 규칙
```yaml
cohort: 3rd
topic: openclaw
status: draft | reviewed | canonical
visibility: team | public
owner: @username
updatedAt: YYYY-MM-DD
```
