# openhow B2B 코스 기능 현황 및 남은 갭

> 기준: 현재 `core/packages/worker` 및 관련 라우트 구현 상태
> 목적: 이미 구현된 범위와 실제로 남은 작업만 다시 정리
> 참고 기획: `/Users/taesupyoon/sideProjects/clauders.ai/docs/b2b-training.md`

## 1. 배경

- `openhow`는 이미 워크스페이스, 문서/영상 콘텐츠, 권한, 결제, 코스/레슨, 평가, 코호트 운영 기능을 갖추고 있다.
- 따라서 B2B 코스 기능의 본체는 새로 시작하는 상태가 아니라, 이미 구현된 학습 운영 기능 위에 관리용 집계와 자동화 레이어를 추가하는 단계다.
- 이 문서는 현재 코드에서 실제로 동작 중인 범위와, 아직 비어 있는 갭만 분리해서 기록한다.

## 2. 현재 구현 완료 항목

### 2.1 코스 생성, 상세 조회, 수강 등록, 학생 진도 조회

| 항목 | 실제 DB 테이블 | 실제 API 경로 |
| --- | --- | --- |
| 코스 생성/수정/목록 | `course`, `course_module`, `lesson` | `GET /api/courses`, `POST /api/courses`, `PUT /api/courses/:courseId`, `PUT /api/courses/:courseId/curriculum` |
| 코스 상세 + 레슨 목록 + 내 진도 요약 | `course`, `course_module`, `lesson`, `enrollment`, `lesson_progress`, `subscription_plan`, `subscription`, `payment` | `GET /api/courses/:workspaceSlug/:courseSlug` |
| 수강 등록 | `enrollment` | `POST /api/courses/:workspaceSlug/:courseSlug/enroll` |
| 내 수강 상태 조회 | `enrollment`, `lesson_progress`, `lesson` | `GET /api/courses/:workspaceSlug/:courseSlug/me` |
| 학생 목록 + 진도율 조회 | `enrollment`, `lesson_progress`, `lesson`, `user` | `GET /api/courses/:workspaceSlug/:courseSlug/students` |

현재 상태 메모:
- 수강 등록은 이미 `enrollment` 테이블에 저장된다.
- 학생별 진도율은 이미 `lesson_progress`를 기준으로 계산되어 `GET /api/courses/:workspaceSlug/:courseSlug/students`에서 반환된다.
- 따라서 "수강 이력 추적" 자체는 미구현 항목이 아니다.

### 2.2 레슨 플레이어와 진도 추적

| 항목 | 실제 DB 테이블 | 실제 API 경로 |
| --- | --- | --- |
| 레슨 상세 조회 | `lesson`, `course`, `workspace`, `document`, `video`, `enrollment`, `lesson_progress` | `GET /api/lessons/:lessonId` |
| 진도 퍼센트 업데이트 | `lesson_progress` | `POST /api/lessons/:lessonId/progress` |
| 레슨 완료 처리 | `lesson_progress`, `enrollment` | `POST /api/lessons/:lessonId/complete` |

현재 상태 메모:
- `lesson_progress`는 실제 테이블명 `lesson_progress`로 존재한다.
- 상태값 `not_started / in_progress / completed`, 퍼센트, 마지막 열람 시각, 완료 시각이 모두 저장된다.
- 필수 레슨을 모두 완료하면 `enrollment.status`를 `completed`로 갱신하는 로직도 이미 있다.

### 2.3 과제 CRUD, 제출, 채점

| 항목 | 실제 DB 테이블 | 실제 API 경로 |
| --- | --- | --- |
| 과제 목록 | `assignment` | `GET /api/assessments/assignments?courseId=:courseId` |
| 과제 생성/수정/삭제 | `assignment` | `POST /api/assessments/assignments`, `PUT /api/assessments/assignments/:id`, `DELETE /api/assessments/assignments/:id` |
| 과제 제출 목록 조회 | `assignment_submission`, `user` | `GET /api/assessments/assignments/:id/submissions` |
| 과제 제출 | `assignment_submission` | `POST /api/assessments/assignments/:id/submit` |
| 과제 채점 | `assignment_submission` | `POST /api/assessments/submissions/:id/grade` |

현재 상태 메모:
- 과제 자체는 이미 `assignment` 테이블에 구현되어 있다.
- 제출과 채점도 이미 `assignment_submission` 테이블과 라우트로 구현되어 있다.
- 따라서 "과제 제출 기능" 자체를 새로 만든다고 적으면 현재 코드와 어긋난다.

### 2.4 퀴즈 CRUD, 문항 관리, 응시, 채점

| 항목 | 실제 DB 테이블 | 실제 API 경로 |
| --- | --- | --- |
| 퀴즈 목록 | `quiz` | `GET /api/assessments/quizzes?courseId=:courseId` |
| 퀴즈 생성 | `quiz` | `POST /api/assessments/quizzes` |
| 퀴즈 상세 + 문항 조회 | `quiz`, `quiz_question` | `GET /api/assessments/quizzes/:quizId` |
| 문항 추가 | `quiz_question` | `POST /api/assessments/quizzes/:quizId/questions` |
| 퀴즈 응시 및 자동 채점 | `quiz_attempt`, `quiz_question` | `POST /api/assessments/quizzes/:quizId/attempt` |
| 퀴즈 응시 이력 조회 | `quiz_attempt`, `user` | `GET /api/assessments/quizzes/:quizId/attempts` |

현재 상태 메모:
- 퀴즈는 이미 네이티브 테이블과 API가 있다.
- `quiz_attempt.score`, `passed`, `startedAt`, `completedAt`까지 저장되므로, "퀴즈는 아직 Google Forms 단계"라는 기술은 현재 코드 기준으로 틀리다.

### 2.5 코호트, 멤버, 라이브 세션, 출결

| 항목 | 실제 DB 테이블 | 실제 API 경로 |
| --- | --- | --- |
| 코호트 CRUD | `cohort` | `GET /api/cohorts?workspace=:slug`, `POST /api/cohorts`, `GET /api/cohorts/:cohortId`, `PUT /api/cohorts/:cohortId`, `DELETE /api/cohorts/:cohortId` |
| 코호트 멤버 관리 | `cohort_member`, `user` | `GET /api/cohorts/:cohortId/members`, `POST /api/cohorts/:cohortId/members`, `PUT /api/cohorts/:cohortId/members/:memberId`, `DELETE /api/cohorts/:cohortId/members/:memberId` |
| 라이브 세션 관리 | `live_session` | `GET /api/cohorts/:cohortId/sessions`, `POST /api/cohorts/:cohortId/sessions`, `PUT /api/cohorts/:cohortId/sessions/:sessionId`, `DELETE /api/cohorts/:cohortId/sessions/:sessionId` |
| 출결 기록 | `attendance_record`, `cohort_member`, `user` | `GET /api/cohorts/:cohortId/sessions/:sessionId/attendance`, `POST /api/cohorts/:cohortId/sessions/:sessionId/attendance` |

현재 상태 메모:
- B2B 운영에 필요한 코호트 단위 관리와 출결 저장은 이미 구현되어 있다.
- `attendance_record`는 실제 테이블명이며, 상태값 `present / late / absent / excused`가 저장된다.

### 2.6 수료증 템플릿, 발급, 검증

| 항목 | 실제 DB 테이블 | 실제 API 경로 |
| --- | --- | --- |
| 템플릿 CRUD | `certificate_template` | `GET /api/certificates/templates?workspace=:slug`, `POST /api/certificates/templates`, `PUT /api/certificates/templates/:templateId`, `DELETE /api/certificates/templates/:templateId` |
| 수료증 발급/회수 | `certificate_issue` | `GET /api/certificates/issues?workspace=:slug`, `POST /api/certificates/issue`, `POST /api/certificates/revoke/:issueId` |
| 공개 검증/내 수료증 | `certificate_issue`, `certificate_template` | `GET /api/certificates/verify/:code`, `GET /api/certificates/my?workspace=:slug` |

현재 상태 메모:
- 수료증 발급과 검증 플로우는 이미 존재한다.
- 따라서 B2B 과정의 수료 처리 기반도 이미 마련된 상태다.

### 2.7 유료 수강, 플랜, 결제 연동

| 항목 | 실제 DB 테이블 | 실제 API 경로 |
| --- | --- | --- |
| 구독 플랜/구독 관리 | `subscription_plan`, `subscription` | `/api/subscriptions/*` |
| Bootpay 결제 및 수강/코호트 부여 | `payment`, `enrollment`, `cohort_member` | `/api/payments/*` |

현재 상태 메모:
- 문서 범위의 핵심은 코스 기능이지만, B2B 운영 관점에서 과금/권한 부여 기반도 이미 구현되어 있다.
- 상세 엔드포인트는 `subscriptions.ts`, `payments.ts`에 분리되어 있다.

## 3. 남은 갭 (구현 필요)

현재 코드 기준으로 실제로 비어 있는 것은 아래 3개다.

### 3.1 Course Dashboard API

목표:
- 관리자 전용 코스 운영 집계 API를 추가한다.
- 이미 존재하는 개별 조회 API를 다시 만드는 것이 아니라, 여러 테이블을 합쳐 한 번에 볼 수 있는 집계 뷰를 만든다.

집계 소스:
- 진도: `lesson_progress`, `enrollment`, `lesson`
- 과제: `assignment`, `assignment_submission`
- 퀴즈: `quiz`, `quiz_attempt`
- 보조 정보: `course`, `user`

권장 API 초안:

| 용도 | 제안 경로 | 비고 |
| --- | --- | --- |
| 코스 전체 대시보드 | `GET /api/courses/:workspaceSlug/:courseSlug/dashboard` | admin/editor 전용 |
| 개별 학습자 상세 | `GET /api/courses/:workspaceSlug/:courseSlug/dashboard/:userId` | 주차/레슨/과제/퀴즈 이력 |

반드시 포함할 응답:
- 코스 총 수강자 수
- 평균 진도율
- 과제 제출률, 채점 완료율
- 퀴즈 평균 점수, 통과율
- 학습자별 진도/과제/퀴즈 요약 행

주의:
- 이미 있는 `GET /api/courses/:workspaceSlug/:courseSlug/students`는 진도 중심 목록이다.
- 이번 갭은 그 API의 대체가 아니라, 과제/퀴즈까지 합친 운영용 집계 API다.

### 3.2 점수 집계

목표:
- 대시보드와 주간 리포트가 공통으로 사용할 점수 집계 규칙을 만든다.
- 집계는 기존 원천 데이터에서 계산하거나, 필요 시 별도 집계 테이블로 캐시한다.

원천 테이블:
- `lesson_progress`
- `assignment_submission`
- `quiz_attempt`
- 선택적으로 `attendance_record`

필요 결정:
- 진도 점수를 퍼센트 그대로 쓸지, 가중치로 환산할지
- 퀴즈는 최고 점수 기준인지, 최근 점수 기준인지
- 과제는 제출 여부와 채점 점수를 어떻게 합산할지
- 출결을 총점에 포함할지

권장 구현 방향:
- 1차는 별도 테이블 없이 서비스 레벨 집계 함수로 시작
- 필요 시 후속으로 `course_member_score` 같은 캐시 테이블 추가

산출물:
- 대시보드 API가 재사용하는 집계 함수
- 학습자 단위 점수 요약 DTO
- 코스 단위 평균/분포 집계

### 3.3 주간 리포트 자동 발송

목표:
- 코스 운영자 또는 기업 담당자에게 주간 학습 현황을 자동 발송한다.

입력 데이터:
- Dashboard API 결과
- 점수 집계 결과

필요 구현:
- Worker cron 엔트리
- 대상 워크스페이스/코스 선택 규칙
- Slack 또는 이메일 발송 채널
- 실패 재시도와 최소 로깅

권장 순서:
1. Dashboard API 완성
2. 점수 집계 함수 정리
3. cron에서 집계 호출 후 메시지 발송

현재 상태 메모:
- 현 저장소에는 `weekly-report`용 cron 구현이 없다.
- 따라서 이 항목은 실제 남은 갭으로 유지하는 것이 맞다.

## 4. Phase 5+: clauders 전용 (후순위)

이 섹션은 `openhow` 공통 B2B 코스 기능이 아니라 `clauders` 전용 확장 아이디어다. 기존 문서의 JSONL 관련 내용은 삭제하지 않고 이 후순위 섹션으로 이동한다.

### 4.1 JSONL 업로드 및 분석

기존 아이디어:
- 학습자가 과제 제출 시 결과물 URL과 함께 Claude Code JSONL 파일을 업로드
- 업로드된 JSONL을 분석해서 사용 패턴을 요약

기존 문서에서 유지해야 할 포인트:
- 업로드 저장 위치 예시: `assignments/{workspaceId}/{userId}/{week}.jsonl`
- 분석 로직 예시: `analyze-jsonl`
- 분석 결과 예시: 턴 수, 도구 사용, 요약 통계

현재 코드와의 관계:
- 일반 과제 제출 자체는 이미 `assignment_submission`으로 구현되어 있다.
- 다만 JSONL 파일 저장, 분석 실행, 분석 결과 저장은 아직 공통 제품 기능으로 구현되어 있지 않다.
- 이 기능은 `clauders` 전용 니즈가 강하므로 공통 B2B 기능보다 뒤로 미룬다.

### 4.2 AI 활용도 점수

기존 아이디어:
- JSONL 분석 결과를 바탕으로 `AI 활용도 점수`를 계산
- 예시 지표:
  - 프롬프트 구체성
  - 총 턴 수
  - 도구 다양성
  - 에러 대응 비율

현재 판단:
- 이 점수는 공통 코스 운영의 핵심 선행조건이 아니다.
- 우선순위는 `Dashboard API -> 점수 집계 -> 주간 리포트`보다 낮다.

### 4.3 전용 상세 리포트

기존 아이디어:
- 팀 평균 툴 사용 패턴
- `CLAUDE.md` 활용도
- JSONL 기반 AI 인사이트

현재 판단:
- 이것도 `clauders` 전용 확장 리포트로 보는 것이 맞다.
- 공통 B2B 대시보드의 1차 범위에는 넣지 않는다.

## 5. 파일 변경 요약

남은 갭만 기준으로 정리한다.

| 파일 | 변경 내용 | 대상 갭 |
| --- | --- | --- |
| `core/packages/worker/src/routes/courses.ts` 또는 신규 `core/packages/worker/src/routes/course-dashboard.ts` | 관리자용 코스 대시보드 API 추가 | Dashboard API |
| `core/packages/worker/src/lib/` 하위 신규 집계 모듈 | `lesson_progress`, `assignment_submission`, `quiz_attempt` 기반 점수/통계 집계 함수 추가 | 점수 집계 |
| `core/packages/worker/src/index.ts` | 대시보드 라우트 또는 신규 라우트 mount | Dashboard API |
| `core/packages/worker`의 cron 관련 엔트리 | 주간 리포트 스케줄 실행 및 발송 연결 | 주간 리포트 |

비고:
- `assignment`, `assignment_submission`, `quiz`, `quiz_attempt`, `lesson_progress` 테이블 자체를 새로 만들 필요는 없다.
- 남은 작업은 주로 "집계/자동화 레이어" 추가다.

## 6. 일정 요약

남은 갭만 기준으로 재정리한다.

| 순서 | 작업 | 예상 범위 | 선행 조건 |
| --- | --- | --- | --- |
| 1 | Dashboard API | 중 | 기존 코스/평가 테이블 재사용 |
| 2 | 점수 집계 | 중 | Dashboard API와 공유할 집계 규칙 확정 |
| 3 | 주간 리포트 자동 발송 | 소~중 | Dashboard API + 점수 집계 완료 |

권장 진행 방식:
- 1주차: Dashboard API 초안과 응답 스키마 확정
- 2주차: 점수 집계 규칙 구현 및 대시보드 응답 연결
- 3주차: cron 발송, 실패 처리, 운영 검증
