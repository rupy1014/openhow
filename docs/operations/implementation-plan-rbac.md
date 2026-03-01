---
title: Openhow CLI RBAC 구현 계획
status: draft
version: 1
date: 2026-03-01
owner: 잡돌쌤
---

# Openhow CLI RBAC 구현 계획

## 목표
관리자/운영진/기수생 권한을 CLI에서 명시적으로 분리해 운영 사고를 줄인다.

## Sprint 1 (빠른 적용)

### 범위
- `whoami --permissions`
- `cohort init` 권한 게이트
- `promote` 권한 게이트
- `publish` 스코프별 권한 게이트

### 완료 기준
- member가 `promote` 실행 시 차단
- admin이 `publish --scope core` 성공
- 모든 차단 케이스에 표준 에러 메시지 노출

## Sprint 2 (운영 안정화)

### 범위
- `workspace create/settings` 권한 게이트
- `invite` 권한 게이트
- 감사 로그 필드 표준화

### 완료 기준
- 권한 변경/승격/발행 이벤트 감사로그 확인 가능

## Sprint 3 (정책 외부화)

### 범위
- `openhow.policy.json` 읽기
- 워크스페이스별 정책 오버라이드

### 완료 기준
- 기본 정책 + 프로젝트 정책 덮어쓰기 동작 확인

## 리스크
- 실제 역할 소스(계정/워크스페이스)의 단일 진실원천 미정
- publish 스코프 정의 불일치 가능

## 대응
- 우선 기본 역할 매핑 고정
- 문서/CLI 헬프에 권한 요구사항 명시
