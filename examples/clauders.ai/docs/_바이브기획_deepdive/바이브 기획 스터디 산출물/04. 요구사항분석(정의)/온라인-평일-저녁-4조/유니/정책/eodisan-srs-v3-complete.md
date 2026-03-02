# 🌾 어디산 (Eodi San)
## 로컬 농산물 직거래 플랫폼 - 통합 기술 사양서 (v3.0)

**문서명:** Software Requirements Specification & System Architecture Document  
**버전:** v3.0 (완성본)  
**작성일:** 2026년 1월 15일  
**검토:** 개발팀, 보안팀, 인프라팀  
**상태:** Active (Phase 1 진행중)  
**최종 업데이트:** 2026년 1월 16일

---

## 📋 Executive Summary

어디산은 **AI 기반 부정거래 탐지**, **블록체인 원산지 추적**, **자동 정산 시스템**을 갖춘 **엔터프라이즈급 농산물 직거래 플랫폼**입니다. 마이크로서비스 아키텍처로 설계되어 월 **10,000 req/s** 처리 능력과 **99.9% 가용성**을 보장합니다.

**핵심 가치 제안:**
- 🔐 생산자 신원 검증 (POLICY-001 기반 3단계 인증)
- 📊 실시간 정산 시스템 (T+0 또는 T+1)
- 🔗 블록체인 기반 거래 기록 (Polygon/Hyperledger)
- 🤖 AI 이상거래 탐지 (Isolation Forest 기반)
- 🚀 당일 배송 지원 (콜드체인 모니터링)

---

## 📑 목차

**I. 요구사항 명세** (SRS)
1. [기능 요구사항](#1-기능-요구사항)
2. [비기능 요구사항](#2-비기능-요구사항)
3. [시스템 제약사항](#3-시스템-제약사항)

**II. 시스템 아키텍처** (SAD)
4. [솔루션 개요](#4-솔루션-개요)
5. [기술 스택](#5-기술-스택)
6. [시스템 아키텍처 설계](#6-시스템-아키텍처-설계)
7. [마이크로서비스 상세 설계](#7-마이크로서비스-상세-설계)

**III. 상세 설계** (Design)
8. [데이터 모델 및 스키마](#8-데이터-모델-및-스키마)
9. [API 계층 설계](#9-api-계층-설계)
10. [프론트엔드 아키텍처](#10-프론트엔드-아키텍처)

**IV. 운영 및 배포**
11. [보안 아키텍처](#11-보안-아키텍처)
12. [인프라 및 배포 전략](#12-인프라-및-배포-전략)
13. [성능 및 모니터링](#13-성능-및-모니터링)

**V. 프로젝트 계획**
14. [개발 로드맵](#14-개발-로드맵)
15. [위험 관리](#15-위험-관리)

---

# I. 요구사항 명세 (SRS)

## 1. 기능 요구사항

### 1.1 사용자 관리 (User Management)

#### FR-1.1.1 회원가입 및 인증
- 이메일 기반 회원가입 (본인인증 필수)
- 소셜 로그인 (Kakao, Naver, Apple)
- JWT 기반 세션 관리
- 2FA (Two-Factor Authentication) 지원

#### FR-1.1.2 역할 기반 접근 제어 (RBAC)
- 역할: Consumer, Producer, Admin
- 역할 전환 (Consumer → Producer 인증 후 가능)
- 권한 계층: Admin > Producer > Consumer

#### FR-1.1.3 프로필 관리
- 개인/사업자 정보 관리
- KYC (Know Your Customer) 인증 프로세스
- 프로필 이미지 업로드 (최대 5MB)

### 1.2 생산자 인증 시스템 (Producer Verification)

#### FR-1.2.1 3단계 인증 프로세스

**단계 1: 서류 심사 (3일)**
- 사업자등록증
- 영농민 증명 (농지원부)
- 재배면적 증명

**단계 2: 현장 검증 (7일)**
- 위성 사진 검증 (GIS)
- 현장 방문 검사
- 재배 실적 확인

**단계 3: 정기 감시 (6개월)**
- 분기별 현장 재확인
- 거래 패턴 모니터링
- 부정거래 적발 시 즉시 정지

#### FR-1.2.2 인증 상태 관리
- 상태 전이: `applied` → `reviewing` → `field_check` → `approved` → `certified`
- 인증 유효기간: 12개월 (자동 갱신)
- 거절 사유 명시 및 재신청 권리

### 1.3 상품 관리 (Product Catalog)

#### FR-1.3.1 상품 등록 및 관리
- 생산자만 상품 등록/수정 가능
- 상품 분류: 채소, 과일, 곡물, 축산물 (15개 소분류)
- 이미지 업로드 (최대 10장)
- 영양정보 입력 (제목 필수)

#### FR-1.3.2 인벤토리 관리
- 실시간 재고 추적
- 자동 품절 처리
- 재배량 대비 판매량 제한 (최대 80%)

#### FR-1.3.3 검색 및 필터링
- 풀텍스트 검색 (Elasticsearch)
- 필터: 카테고리, 가격, 별점, 거리
- 추천 알고리즘 (협업 필터링)

### 1.4 거래 시스템 (Trading & Orders)

#### FR-1.4.1 주문 생성 및 관리
- 장바구니 시스템 (Redis 기반 세션)
- 주문 생성 (다중 상품 지원)
- 주문 취소 (배송 전까지만 가능)

#### FR-1.4.2 주문 상태 추적

```
상태 흐름:
pending 
  → payment_confirmed (결제 완료)
  → preparing (준비중)
  → shipped (배송)
  → delivered (배송완료)
  → completed (완료)
  
또는:
  → cancelled (취소)
  → refunded (환불)
```

#### FR-1.4.3 결제 시스템
- 결제 수단: 신용카드, 계좌이체, 간편결제
- PCI-DSS 준수 (결제정보 미저장)
- 결제 실패 시 자동 재시도 (3회)

### 1.5 정산 시스템 (Settlement & Payouts)

#### FR-1.5.1 자동 정산
- 정산 주기: 일일(T+0) 또는 주간(T+1) 선택 가능
- 수수료: 거래액의 12% (고정)
- 정산액 계산: 총거래액 × 0.88

#### FR-1.5.2 정산 내역 조회
- 생산자별 정산 내역 조회
- 일일/월간 리포트 다운로드 (CSV)
- 정산 상태: pending → processing → completed

#### FR-1.5.3 환불 처리
- 환불 요청 시 원결제 수단으로 자동 반납
- 환불 처리 시간: 24시간 이내

### 1.6 배송 시스템 (Logistics)

#### FR-1.6.1 배송 연동
- 지원 배송사: CJ대한통운, 로젠, 우체국, 쿠팡로지스틱스
- 자동 배송사 선택 (지역별 최적화)
- 콜드체인 모니터링 (온습도, GPS)

#### FR-1.6.2 실시간 추적
- WebSocket 기반 실시간 업데이트
- 배송사 API 통합 (Ship24)
- 배송 상태 알림 (SMS, Push)

### 1.7 원산지 추적 (Blockchain Traceability)

#### FR-1.7.1 블록체인 기록
- 생산자 정보 기록 (농장 주소, 재배면적, 인증상태)
- 거래 정보 기록 (주문ID, 수량, 가격, 배송정보)
- QR 코드 생성 (상품별)

#### FR-1.7.2 소비자 조회
- QR 스캔 → 블록체인 데이터 조회 가능
- 생산자 정보, 거래 이력, 배송 경로 확인
- 공개 URL: `https://eodisan.kr/trace/{productId}`

### 1.8 분석 및 모니터링 (Analytics & Monitoring)

#### FR-1.8.1 대시보드
- 관리자 대시보드: 전체 거래액, 사용자 수, 이상거래
- 생산자 대시보드: 판매현황, 정산내역, 평가
- 실시간 업데이트 (5초 주기)

#### FR-1.8.2 AI 기반 이상거래 탐지
- Isolation Forest 알고리즘
- 감지 기준: 주문량, 가격, 배송시간, 생산자 신뢰도
- 이상거래 시 자동 보류 및 관리자 알림

#### FR-1.8.3 리포트 생성
- 일일/주간/월간 리포트
- CSV, PDF 형식 다운로드
- 스케줄 이메일 발송

---

## 2. 비기능 요구사항

### 2.1 성능 (Performance)

| 메트릭 | 목표 | 설명 |
|--------|------|------|
| **응답 시간 (P50)** | < 200ms | 평균 API 응답 시간 |
| **응답 시간 (P99)** | < 1s | 상위 1% 요청 응답 시간 |
| **처리량** | 10,000 req/s | 동시 요청 처리 능력 |
| **DB 응답시간** | < 50ms | 평균 쿼리 응답 시간 |
| **캐시 Hit Rate** | > 85% | Redis 캐시 효율성 |

### 2.2 가용성 (Availability)

**NFR-2.2.1 SLA**
- 목표 가용성: **99.9%** (월 최대 43.2분 다운타임)
- RTO (Recovery Time Objective): 30분
- RPO (Recovery Point Objective): 5분

**NFR-2.2.2 이중화 아키텍처**
- 다중 AZ (Availability Zone) 배포
- 자동 페일오버 (< 30초)
- 데이터 실시간 복제

### 2.3 확장성 (Scalability)

**NFR-2.3.1 수평 확장**
- 마이크로서비스 기반 독립 확장
- Kubernetes HPA (Horizontal Pod Autoscaler)
- 로드 밸런싱 (L7)

**NFR-2.3.2 데이터 확장**
- Database Sharding (사용자 ID 기반)
- 캐시 계층 (Redis Cluster)
- 로그 보관: 12개월 (S3 아카이브)

### 2.4 보안 (Security)

**NFR-2.4.1 인증/인가**
- JWT 기반 토큰 (Access: 1시간, Refresh: 30일)
- OAuth 2.0 지원
- 역할 기반 권한 제어 (RBAC)

**NFR-2.4.2 데이터 보호**
- 전송: TLS 1.3 (HTTPS)
- 저장: AES-256 (결제정보), bcrypt (비밀번호)
- PII 마스킹 (전화번호, 계좌번호)

**NFR-2.4.3 감시 및 로깅**
- 모든 API 호출 로깅
- PII 접근 감사 로그
- 보안 이벤트 실시간 알림

### 2.5 신뢰성 (Reliability)

**NFR-2.5.1 에러 처리**
- 자동 재시도 (지수 백오프)
- Circuit Breaker 패턴
- Graceful Degradation

**NFR-2.5.2 데이터 무결성**
- ACID 트랜잭션 (PostgreSQL)
- Idempotent API 설계
- 이벤트 소싱 (Kafka)

### 2.6 유지보수성 (Maintainability)

**NFR-2.6.1 모니터링**
- APM (DataDog): 애플리케이션 성능 추적
- 로깅 (ELK): 중앙화된 로그 수집
- 메트릭 (Prometheus): 시스템 메트릭

**NFR-2.6.2 배포**
- CI/CD 자동화 (GitHub Actions)
- Blue-Green 배포
- 자동 롤백 (배포 실패 시)

---

## 3. 시스템 제약사항

### 3.1 기술 제약
- 멀티플랫폼 지원: iOS 14+, Android 10+, 모던 브라우저
- 언어: Backend (Node.js 또는 Python), Frontend (React, Vue, Swift, Kotlin)
- 데이터베이스: PostgreSQL 15+, MongoDB 6+, Redis 7+

### 3.2 법적 제약
- GDPR, CCPA 준수 (PII 보호)
- PCI-DSS 준수 (결제정보 보안)
- 개인정보보호법 준수 (한국)

### 3.3 업무 제약
- 초기 지역 한정: 한국 (수도권 + 강원, 전라)
- 생산자 인증: 현장 방문 필수
- 거래 대금: KRW만 지원 (초기)

### 3.4 예산 제약
- 월 기술 비용: ~700만원 (인프라 + 서비스)
- 개발팀: 30명 (백엔드 10, 프론트엔드 10, DevOps 3, QA 3, PM 2, 보안 2)

---

# II. 시스템 아키텍처 (SAD)

## 4. 솔루션 개요

### 4.1 아키텍처 원칙

| 원칙 | 설명 |
|------|------|
| **느슨한 결합** | 마이크로서비스 독립 배포 |
| **높은 응집력** | 서비스별 단일 책임 |
| **확장 가능** | 수평 확장 우선 |
| **탄력성** | 부분 장애 격리 |
| **보안 우선** | 모든 계층 암호화 |

### 4.2 아키텍처 패턴

```
┌──────────────────────────────────────────────────────────────┐
│                     클라이언트 레이어 (Client Layer)           │
├──────────────┬────────────────┬──────────────┬───────────────┤
│ iOS App      │ Android App    │ Web Admin    │ Web Consumer  │
│ (Swift)      │ (Kotlin)       │ (React)      │ (Vue)         │
└──────┬───────┴────────┬───────┴──────┬───────┴────────┬──────┘
       │                │             │                │
       └────────────────┴─────────────┴────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────┐
│              API Gateway Layer (Kong / AWS API Gateway)       │
│  • Rate Limiting, Authentication, Request/Response Transform │
│  • Service Routing, Load Balancing                           │
└────────────────────┬─────────────────────────────────────────┘
                     ▼
    ┌────────────────────────────────────────────┐
    │   마이크로서비스 (Microservices)             │
    │   ┌─────────────────────────────────────┐ │
    │   │ • User Service                      │ │
    │   │ • Producer Service (Auth)           │ │
    │   │ • Product Service                   │ │
    │   │ • Order Service                     │ │
    │   │ • Payment Service                   │ │
    │   │ • Logistics Service                 │ │
    │   │ • Analytics Service                 │ │
    │   │ • Blockchain Service                │ │
    │   └─────────────────────────────────────┘ │
    └────────────────────────────────────────────┘
                     │ ▲
        ┌────────────┴─┴────────────┐
        ▼                           ▼
    ┌──────────────┐          ┌──────────────┐
    │ Message      │          │ External     │
    │ Broker       │          │ Systems      │
    │ (Kafka)      │          │              │
    │              │          │ • PG API     │
    │ • Events     │          │ • Logistics  │
    │ • Async Job  │          │ • SMS/Push   │
    └──────────────┘          │ • Blockchain │
                              └──────────────┘
        ▼
    ┌─────────────────────────────────────────┐
    │        Data Layer (Persistence)          │
    ├─────────────────────────────────────────┤
    │ • PostgreSQL (OLTP)                     │
    │ • MongoDB (Logs, Analytics)             │
    │ • Redis (Cache, Session)                │
    │ • Elasticsearch (Search)                │
    │ • S3 (Files, Images)                    │
    └─────────────────────────────────────────┘
```

---

## 5. 기술 스택

### 5.1 Backend (API Layer)

| 계층 | 기술 | 버전 | 선택 이유 |
|------|------|------|----------|
| **Runtime** | Node.js 또는 Python | 18.x / 3.11+ | 빠른 개발, 풍부한 라이브러리 |
| **Framework** | Express.js 또는 Django | 4.18 / 4.2 | 경량, 성숙한 생태계 |
| **API** | REST + GraphQL (선택) | - | REST는 필수, GraphQL은 선택사항 |
| **Async** | Bull Queue 또는 Celery | - | 비동기 작업 처리 |
| **Validation** | Joi 또는 Pydantic | - | 스키마 검증 |

### 5.2 Frontend (Client Layer)

| 플랫폼 | 기술 | 버전 | 용도 |
|--------|------|------|------|
| **Web** | React.js 또는 Vue.js | 18.x / 3.3+ | 관리자, 소비자, 생산자 웹 |
| **Mobile iOS** | Swift + SwiftUI | 5.9+ | 네이티브 iOS 앱 |
| **Mobile Android** | Kotlin + Compose | 1.9+ | 네이티브 Android 앱 |
| **상태관리** | Zustand, Redux, Pinia | - | 예측 가능한 상태 관리 |
| **HTTP Client** | Axios, Fetch API | - | API 통신 |

### 5.3 Infrastructure & DevOps

| 카테고리 | 기술 | 버전/정보 | 목적 |
|---------|------|----------|------|
| **Container** | Docker | 24.x | 마이크로서비스 컨테이너화 |
| **Orchestration** | Kubernetes | 1.28+ | 컨테이너 오케스트레이션 |
| **Cloud** | AWS 또는 Google Cloud | - | IaaS 제공 |
| **CI/CD** | GitHub Actions / GitLab CI | - | 자동 테스트/배포 |
| **Infrastructure as Code** | Terraform / CloudFormation | - | 인프라 자동화 |
| **API Gateway** | Kong 또는 AWS API Gateway | 3.0+ / - | 요청 라우팅, 인증 |
| **Message Queue** | Apache Kafka | 3.x | 이벤트 기반 아키텍처 |

### 5.4 Database & Cache

| 시스템 | 기술 | 버전 | 용도 |
|--------|------|------|------|
| **OLTP DB** | PostgreSQL | 15.x | 트랜잭션, 주요 데이터 |
| **Cache** | Redis | 7.x | 세션, 캐시, 실시간 데이터 |
| **Document DB** | MongoDB | 6.x | 로그, 분석 데이터 |
| **Search** | Elasticsearch | 8.x | 상품 검색, 로그 검색 |
| **TimeSeries DB** | InfluxDB (선택) | 2.x | 시계열 메트릭 |

### 5.5 Blockchain

| 항목 | 기술 | 선택 이유 |
|------|------|----------|
| **Layer 1** | Polygon 또는 Hyperledger Fabric | 낮은 가스비, 빠른 처리 |
| **Storage** | IPFS | 분산 파일 저장 |
| **Smart Contract** | Solidity (Polygon) 또는 Chaincode (Fabric) | 거래 기록, 원산지 증명 |
| **Web3 Library** | Web3.js 또는 Ethers.js | 블록체인 상호작용 |

### 5.6 Monitoring & Logging

| 기능 | 기술 | 버전 |
|------|------|------|
| **APM** | DataDog 또는 New Relic | - |
| **Logging** | ELK Stack (Elasticsearch, Logstash, Kibana) | 8.x |
| **Metrics** | Prometheus | 2.x |
| **Visualization** | Grafana | 10.x |
| **Error Tracking** | Sentry | - |
| **Uptime Monitoring** | Pingdom 또는 UptimeRobot | - |

---

## 6. 시스템 아키텍처 설계

### 6.1 전체 시스템 다이어그램

```
┌─────────────────────────────────────────────────────────┐
│ CDN (CloudFront) - 정적 자산 캐싱                       │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│ WAF (Web Application Firewall)                          │
│ - DDoS 방어, 악성 요청 필터링                           │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│ ALB (Application Load Balancer)                         │
│ - HTTPS/TLS 종료, 요청 라우팅, 헬스 체크               │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│ API Gateway (Kong / AWS API Gateway)                    │
│ - Rate Limiting (100 req/min/user)                      │
│ - Authentication (JWT), CORS, Logging                   │
└────────────────────┬────────────────────────────────────┘
                     ▼
    ┌────────────────────────────────────────┐
    │    마이크로서비스 (ECS/K8s)             │
    │                                        │
    │ ┌──────────────────────────────────┐  │
    │ │ User Service (3 instances)       │  │
    │ │ - 회원가입, 로그인, 프로필       │  │
    │ └──────────────────────────────────┘  │
    │                                        │
    │ ┌──────────────────────────────────┐  │
    │ │ Producer Service (3 instances)   │  │
    │ │ - 생산자 인증, 농장 정보         │  │
    │ └──────────────────────────────────┘  │
    │                                        │
    │ ┌──────────────────────────────────┐  │
    │ │ Product Service (5 instances)    │  │
    │ │ - 상품 카탈로그, 검색             │  │
    │ └──────────────────────────────────┘  │
    │                                        │
    │ ┌──────────────────────────────────┐  │
    │ │ Order Service (5 instances)      │  │
    │ │ - 주문, 주문 상태 추적           │  │
    │ └──────────────────────────────────┘  │
    │                                        │
    │ ┌──────────────────────────────────┐  │
    │ │ Payment Service (3 instances)    │  │
    │ │ - 결제, 정산, 환불               │  │
    │ └──────────────────────────────────┘  │
    │                                        │
    │ ┌──────────────────────────────────┐  │
    │ │ Logistics Service (3 instances)  │  │
    │ │ - 배송 추적, 배송사 연동         │  │
    │ └──────────────────────────────────┘  │
    │                                        │
    │ ┌──────────────────────────────────┐  │
    │ │ Analytics Service (2 instances)  │  │
    │ │ - 분석, 대시보드, 리포트         │  │
    │ └──────────────────────────────────┘  │
    │                                        │
    │ ┌──────────────────────────────────┐  │
    │ │ Blockchain Service (2 instances) │  │
    │ │ - 원산지 추적, QR 코드           │  │
    │ └──────────────────────────────────┘  │
    └────────────────────────────────────────┘
         │             │          │
    ┌────┘             │          └────┐
    ▼                  ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌───────────────┐
│ PostgreSQL   │  │ Redis        │  │ MongoDB       │
│ (Primary)    │  │ (Cluster)    │  │ (Logs, TTL)   │
│              │  │              │  │               │
│ • Users      │  │ • Sessions   │  │ • Audit Logs  │
│ • Products   │  │ • Cache      │  │ • Analytics   │
│ • Orders     │  │ • Real-time  │  │ • Events      │
│ • Payments   │  │   Data       │  │               │
└──┬───────────┘  └──────────────┘  └───────────────┘
   │ (Binary Log)
   ▼
┌──────────────┐
│ PostgreSQL   │
│ (Standby)    │
│ Multi-AZ     │
└──────────────┘
   
    ┌──────────────────────────────────┐
    │ Elasticsearch (Cluster)           │
    │ - 상품 검색, 거래 검색            │
    └──────────────────────────────────┘

    ┌──────────────────────────────────┐
    │ Apache Kafka (Event Bus)          │
    │ - Order Events, Payment Events    │
    │ - Async Processing                │
    └──────────────────────────────────┘

    ┌──────────────────────────────────┐
    │ External APIs                     │
    │ • Payment Gateway (Stripe)        │
    │ • Shipping APIs (CJ, Logen)       │
    │ • SMS/Push (Twilio, Firebase)     │
    │ • Blockchain (Polygon RPC)        │
    └──────────────────────────────────┘

    ┌──────────────────────────────────┐
    │ S3 (Object Storage)               │
    │ • Product Images                  │
    │ • User Documents                  │
    │ • Audit Logs Archive              │
    └──────────────────────────────────┘

    ┌──────────────────────────────────┐
    │ Monitoring Stack                  │
    │ • Prometheus (Metrics)            │
    │ • Grafana (Dashboards)            │
    │ • DataDog (APM)                   │
    │ • ELK Stack (Logging)             │
    │ • Sentry (Error Tracking)         │
    └──────────────────────────────────┘
```

### 6.2 배포 토폴로지 (Kubernetes)

```yaml
Kubernetes Cluster (Multi-AZ)
├── Namespace: production
│   ├── API Services (3 AZ × N replicas)
│   ├── StatefulSet: PostgreSQL (1 primary + 2 replicas)
│   ├── StatefulSet: Redis Cluster (3+ nodes)
│   └── DaemonSet: Monitoring Agents
│
├── Namespace: data
│   ├── MongoDB StatefulSet
│   ├── Elasticsearch Cluster
│   └── Kafka Brokers
│
└── Namespace: monitoring
    ├── Prometheus
    ├── Grafana
    └── Alert Manager
```

---

## 7. 마이크로서비스 상세 설계

### 7.1 User Service (사용자 관리)

**책임:**
- 회원가입/로그인/프로필 관리
- JWT 토큰 발급 및 검증
- 역할 관리 (Consumer/Producer/Admin)

**주요 API:**
```
POST   /api/v1/users/register
POST   /api/v1/users/login
POST   /api/v1/users/refresh-token
GET    /api/v1/users/{userId}/profile
PUT    /api/v1/users/{userId}/profile
DELETE /api/v1/users/{userId}
POST   /api/v1/users/{userId}/roles
```

**데이터 모델:**
```javascript
User {
  id: UUID (PK)
  email: String (UNIQUE, INDEXED)
  passwordHash: String (bcrypt)
  phone: String (마스킹됨)
  name: String
  profileImageUrl: URL
  roles: Array<'consumer' | 'producer' | 'admin'>
  kycStatus: 'pending' | 'verified' | 'rejected'
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt: DateTime (soft delete)
}
```

**의존성:** Redis (세션), Email Service (인증)

### 7.2 Producer Service (생산자 인증)

**책임:**
- 생산자 신원 검증 (3단계)
- 재배지 관리
- 인증 상태 추적

**인증 상태 머신:**
```
applied (신청)
  ↓
reviewing (서류심사 - 3일)
  ├─ rejected → 거절사유 + 재신청 가능
  ↓
field_check (현장검증 - 7일)
  ├─ rejected → 거절사유 + 재신청 불가 (30일)
  ↓
approved (승인)
  ↓
certified (인증완료 - 유효기간 12개월)
  ↓
renewal (갱신)
```

**외부 연동:**
- GIS API (위성사진 검증)
- SMS 알림 (검증 진행사항)
- Admin 포탈 (현장검증자용)

### 7.3 Product Service (상품 관리)

**책임:**
- 상품 카탈로그 관리
- 검색/필터링 (Elasticsearch)
- 재고 추적

**검색 엔진 (Elasticsearch):**
```json
{
  "index": "products",
  "mappings": {
    "properties": {
      "productName": { "type": "text", "analyzer": "korean" },
      "description": { "type": "text" },
      "category": { "type": "keyword" },
      "price": { "type": "float" },
      "rating": { "type": "float" },
      "producerId": { "type": "keyword" },
      "farmCoordinates": { "type": "geo_point" },
      "createdAt": { "type": "date" }
    }
  }
}
```

### 7.4 Order Service (주문 관리)

**책임:**
- 주문 생성/관리
- 주문 상태 추적
- 이벤트 발행 (Kafka)

**주문 생성 플로우:**
```
1. 주문 생성 (Order Created)
   → Kafka: order.created
   
2. 결제 처리 (Payment Processing)
   → Payment Service로 위임
   → Kafka: payment.confirmed
   
3. 주문 준비 (Order Preparing)
   → Producer에 알림
   → Kafka: order.preparing
   
4. 배송 (Shipping)
   → Logistics Service 호출
   → Kafka: shipment.created
   
5. 배송 완료 (Delivery Complete)
   → Kafka: delivery.completed
   
6. 주문 완료 (Order Completed)
   → 생산자 정산 대기
   → Kafka: order.completed
```

### 7.5 Payment Service (결제 및 정산)

**책임:**
- 결제 처리
- 자동 정산 (T+0 또는 T+1)
- 환불 처리

**정산 프로세스:**
```
매일 23:00 (KST) - 자동 정산 실행

1. 전날 completed 주문 수집
2. 수수료 계산 (거래액 × 12%)
3. 정산액 계산 (총액 × 0.88)
4. 생산자 계좌에 송금
5. 정산 내역 기록
6. 정산 완료 알림 (SMS/Email)
```

**외부 연동:**
- Stripe / Inicis (결제 게이트웨이)
- 은행 API (송금)
- SMS Service (알림)

### 7.6 Logistics Service (배송 추적)

**책임:**
- 배송사 연동
- 실시간 추적
- 콜드체인 모니터링

**지원 배송사:**
- CJ 대한통운
- 로젠택배
- 우체국
- 쿠팡로지스틱스

**실시간 추적 (WebSocket):**
```javascript
// 클라이언트
ws.subscribe(`shipment/${trackingNumber}`)
ws.on('update', (data) => {
  // 상태 업데이트 표시
})

// 서버
shipmentStatusUpdated.on('event', (data) => {
  wss.broadcast(`shipment/${data.trackingNumber}`, data)
})
```

### 7.7 Analytics Service (분석 및 모니터링)

**책임:**
- 대시보드 제공
- AI 기반 이상거래 탐지
- 리포트 생성

**이상거래 탐지 (Anomaly Detection):**

```python
from sklearn.ensemble import IsolationForest
import numpy as np

class AnomalyDetectionEngine:
    def __init__(self):
        self.model = IsolationForest(
            contamination=0.05,
            random_state=42,
            n_jobs=-1
        )
        self.scaler = StandardScaler()
        self.trained_at = None
    
    def train(self, historical_orders):
        """주간 1회 학습 (일요일 00:00)"""
        features = self._extract_features(historical_orders)
        features_scaled = self.scaler.fit_transform(features)
        self.model.fit(features_scaled)
        self.trained_at = datetime.now()
    
    def predict(self, order):
        """실시간 거래 검증"""
        features = self._extract_features([order])
        features_scaled = self.scaler.transform(features)
        
        is_anomaly = self.model.predict(features_scaled)[0] == -1
        anomaly_score = abs(
            self.model.score_samples(features_scaled)[0]
        )
        
        return {
            'is_anomaly': is_anomaly,
            'score': anomaly_score,
            'threshold': 0.5,
            'action': 'hold' if is_anomaly else 'approve'
        }
    
    def _extract_features(self, orders):
        """특성 추출"""
        features = []
        for order in orders:
            feature_vector = [
                order['quantity'],
                order['price'],
                order['delivery_time_hours'],
                order['producer_rating'],
                order['producer_transaction_count'],
                order['hour_of_day'],
                order['day_of_week'],
            ]
            features.append(feature_vector)
        return np.array(features)
```

### 7.8 Blockchain Service (원산지 추적)

**책임:**
- 블록체인 기록
- QR 코드 생성
- 소비자 조회 페이지

**Smart Contract (Solidity):**
```solidity
pragma solidity ^0.8.0;

contract ProductTraceability {
    
    struct ProductRecord {
        bytes32 productId;
        address producer;
        uint256 harvestDate;
        string farmLocation;
        string[] certifications;
        uint256 quantity;
        string imageIpfsHash;
    }
    
    struct TransactionRecord {
        bytes32 transactionId;
        bytes32 productId;
        address consumer;
        uint256 date;
        string status;
        string shippingIpfsHash;
    }
    
    mapping(bytes32 => ProductRecord) public products;
    mapping(bytes32 => TransactionRecord[]) public transactions;
    
    event ProductRecorded(bytes32 indexed productId, address producer);
    event TransactionRecorded(bytes32 indexed transactionId, bytes32 productId);
    
    function recordProduction(
        bytes32 productId,
        string memory farmLocation,
        uint256 quantity,
        string[] memory certifications,
        string memory imageIpfsHash
    ) public {
        require(msg.sender != address(0), "Invalid producer");
        
        products[productId] = ProductRecord({
            productId: productId,
            producer: msg.sender,
            harvestDate: block.timestamp,
            farmLocation: farmLocation,
            certifications: certifications,
            quantity: quantity,
            imageIpfsHash: imageIpfsHash
        });
        
        emit ProductRecorded(productId, msg.sender);
    }
    
    function recordTransaction(
        bytes32 transactionId,
        bytes32 productId,
        address consumer,
        string memory status,
        string memory shippingIpfsHash
    ) public {
        ProductRecord memory product = products[productId];
        require(product.producer != address(0), "Product not found");
        
        transactions[productId].push(TransactionRecord({
            transactionId: transactionId,
            productId: productId,
            consumer: consumer,
            date: block.timestamp,
            status: status,
            shippingIpfsHash: shippingIpfsHash
        }));
        
        emit TransactionRecorded(transactionId, productId);
    }
    
    function getProductHistory(bytes32 productId) 
        public 
        view 
        returns (ProductRecord memory) {
        return products[productId];
    }
    
    function getTransactionHistory(bytes32 productId) 
        public 
        view 
        returns (TransactionRecord[] memory) {
        return transactions[productId];
    }
}
```

---

# III. 상세 설계 (Design)

## 8. 데이터 모델 및 스키마

### 8.1 Entity Relationship Diagram (ERD)

#### PostgreSQL 스키마

```sql
-- 1. Users (사용자)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    name VARCHAR(100) NOT NULL,
    profile_image_url TEXT,
    kyc_status VARCHAR(20) DEFAULT 'pending',
    two_fa_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_kyc_status (kyc_status)
);

-- 2. User Roles
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role)
);

-- 3. Producers (생산자)
CREATE TABLE producers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    business_number VARCHAR(20) NOT NULL UNIQUE,
    farm_name VARCHAR(200) NOT NULL,
    farm_address TEXT NOT NULL,
    farm_coordinates POINT NOT NULL,
    certification_status VARCHAR(50) DEFAULT 'applied',
    certification_date TIMESTAMP,
    certification_expiry TIMESTAMP,
    rating FLOAT DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    review_count INT DEFAULT 0,
    total_orders INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_certification_status (certification_status),
    INDEX idx_farm_coordinates (farm_coordinates)
);

-- 4. Products (상품)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producer_id UUID NOT NULL REFERENCES producers(id) ON DELETE CASCADE,
    product_name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    available_quantity FLOAT NOT NULL,
    max_sales_quantity FLOAT NOT NULL,
    harvest_date TIMESTAMP,
    expiry_date TIMESTAMP,
    storage_method VARCHAR(100),
    rating FLOAT DEFAULT 0,
    review_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_producer_id (producer_id),
    INDEX idx_created_at (created_at)
);

-- 5. Orders (주문)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consumer_id UUID NOT NULL REFERENCES users(id),
    producer_id UUID NOT NULL REFERENCES producers(id),
    product_id UUID NOT NULL REFERENCES products(id),
    quantity FLOAT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    platform_fee DECIMAL(12, 2) NOT NULL,
    producer_amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    delivery_address TEXT,
    delivery_method VARCHAR(50),
    tracking_number VARCHAR(100),
    notes TEXT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_date TIMESTAMP,
    shipment_date TIMESTAMP,
    delivery_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_consumer_id (consumer_id),
    INDEX idx_producer_id (producer_id),
    INDEX idx_status (status),
    INDEX idx_order_date (order_date)
);

-- 6. Payments (결제)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE REFERENCES orders(id),
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    pg_transaction_id VARCHAR(255) UNIQUE,
    payment_gateway VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_pg_transaction_id (pg_transaction_id)
);

-- 7. Settlements (정산)
CREATE TABLE settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producer_id UUID NOT NULL REFERENCES producers(id),
    settlement_period_start DATE NOT NULL,
    settlement_period_end DATE NOT NULL,
    total_orders INT NOT NULL,
    total_amount DECIMAL(14, 2) NOT NULL,
    platform_fees DECIMAL(14, 2) NOT NULL,
    payout_amount DECIMAL(14, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_producer_id (producer_id),
    INDEX idx_status (status)
);

-- 8. Shipments (배송)
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE REFERENCES orders(id),
    tracking_number VARCHAR(100) NOT NULL UNIQUE,
    carrier VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'created',
    recipient_address TEXT NOT NULL,
    temperature FLOAT,
    humidity FLOAT,
    gps_location POINT,
    estimated_delivery_date TIMESTAMP,
    actual_delivery_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tracking_number (tracking_number),
    INDEX idx_status (status)
);

-- 9. Reviews (리뷰)
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product_id (product_id),
    INDEX idx_user_id (user_id)
);

-- 10. Audit Logs (감시 로그)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);
```

### 8.2 캐시 전략 (Redis)

```python
CACHE_CONFIG = {
    'user_profile': {
        'key_pattern': f'user:{user_id}:profile',
        'ttl': 3600,  # 1시간
        'hot': True
    },
    'product_detail': {
        'key_pattern': f'product:{product_id}:detail',
        'ttl': 1800,  # 30분
        'hot': True
    },
    'producer_info': {
        'key_pattern': f'producer:{producer_id}:info',
        'ttl': 1800,
        'hot': True
    },
    'search_results': {
        'key_pattern': f'search:{category}:{page}',
        'ttl': 3600,
        'hot': False
    },
    'daily_stats': {
        'key_pattern': f'stats:daily:{date}',
        'ttl': 86400,
        'hot': False
    },
    'session': {
        'key_pattern': f'session:{session_id}',
        'ttl': 86400,
        'hot': True
    }
}

def warm_cache():
    """인기 상품, 활성 생산자 캐시 사전 로드"""
    top_products = Product.query.order_by(
        Product.rating.desc()
    ).limit(100).all()
    
    for product in top_products:
        redis.set(
            f'product:{product.id}:detail',
            product.to_json(),
            ex=1800
        )
    
    print(f"✓ 워밍: {len(top_products)}개 상품 캐시됨")
```

---

## 9. API 계층 설계

### 9.1 REST API 설계 원칙

**요청/응답 형식**

```http
POST /api/v1/orders
Content-Type: application/json
Authorization: Bearer {accessToken}

{
  "productId": "prod_456",
  "quantity": 5,
  "deliveryAddress": "서울시 강남구",
  "paymentMethod": "credit_card"
}

HTTP/1.1 201 Created
Content-Type: application/json

{
  "success": true,
  "data": {
    "orderId": "order_789",
    "status": "pending",
    "totalPrice": 17500,
    "platformFee": 2100,
    "producerAmount": 15400
  },
  "meta": {
    "requestId": "req_12345",
    "timestamp": "2026-01-15T10:30:00Z"
  }
}
```

**에러 응답**

```http
HTTP/1.1 400 Bad Request

{
  "success": false,
  "error": {
    "code": "INVALID_QUANTITY",
    "message": "quantity는 0보다 커야 합니다",
    "details": {
      "field": "quantity",
      "provided": 0,
      "expected": "> 0"
    }
  },
  "meta": {
    "requestId": "req_12345",
    "timestamp": "2026-01-15T10:30:00Z"
  }
}
```

### 9.2 주요 API 엔드포인트 목록

```
=== Authentication ===
POST   /api/v1/auth/register              # 회원가입
POST   /api/v1/auth/login                 # 로그인
POST   /api/v1/auth/refresh-token         # 토큰 갱신
POST   /api/v1/auth/logout                # 로그아웃
POST   /api/v1/auth/2fa/enable            # 2FA 활성화
POST   /api/v1/auth/2fa/verify            # 2FA 검증

=== Users ===
GET    /api/v1/users/me                   # 현재 사용자 정보
GET    /api/v1/users/{userId}             # 사용자 프로필 조회
PUT    /api/v1/users/{userId}             # 프로필 수정
POST   /api/v1/users/{userId}/password    # 비밀번호 변경
DELETE /api/v1/users/{userId}             # 계정 탈퇴

=== Producers ===
POST   /api/v1/producers/register         # 생산자 등록
GET    /api/v1/producers/{producerId}     # 생산자 정보 조회
PUT    /api/v1/producers/{producerId}     # 생산자 정보 수정
GET    /api/v1/producers/{producerId}/farms         # 재배지 목록
POST   /api/v1/producers/{producerId}/farms         # 재배지 추가
GET    /api/v1/producers/{producerId}/certifications # 인증 현황
GET    /api/v1/producers/verification/list (Admin)  # 검증 대기 목록

=== Products ===
GET    /api/v1/products                   # 상품 목록 (페이지네이션)
GET    /api/v1/products/{productId}       # 상품 상세
POST   /api/v1/products                   # 상품 추가 (생산자)
PUT    /api/v1/products/{productId}       # 상품 수정 (생산자)
DELETE /api/v1/products/{productId}       # 상품 삭제 (생산자)
GET    /api/v1/products/search            # 상품 검색
GET    /api/v1/products/recommend         # 추천 상품
POST   /api/v1/products/{productId}/reviews # 리뷰 작성
GET    /api/v1/products/{productId}/reviews # 리뷰 목록

=== Orders ===
POST   /api/v1/orders                     # 주문 생성
GET    /api/v1/orders                     # 주문 목록
GET    /api/v1/orders/{orderId}           # 주문 상세
PUT    /api/v1/orders/{orderId}/cancel    # 주문 취소
GET    /api/v1/orders/{orderId}/invoice   # 송장 조회

=== Payments ===
POST   /api/v1/payments                   # 결제 생성
GET    /api/v1/payments/{paymentId}       # 결제 상태 조회
POST   /api/v1/payments/{paymentId}/cancel # 결제 취소

=== Settlements ===
GET    /api/v1/settlements                # 정산 내역 (생산자)
GET    /api/v1/settlements/{settlementId} # 정산 상세
GET    /api/v1/settlements/download       # 정산내역 다운로드

=== Logistics ===
GET    /api/v1/logistics/shipments/{shipmentId}    # 배송 상태
GET    /api/v1/logistics/tracking/{trackingNumber} # 실시간 추적

=== Analytics ===
GET    /api/v1/analytics/dashboard                 # 대시보드 (관리자)
GET    /api/v1/analytics/producer/{producerId}     # 생산자 대시보드
GET    /api/v1/analytics/orders/daily              # 일일 거래액
GET    /api/v1/analytics/anomalies                 # 이상 거래
GET    /api/v1/analytics/reports/monthly           # 월간 리포트

=== Blockchain ===
GET    /api/v1/traceability/products/{productId}  # 원산지 추적
GET    /api/v1/traceability/qr/{productId}        # QR 코드 조회
```

---

## 10. 프론트엔드 아키텍처

### 10.1 웹 어플리케이션 (React.js)

**폴더 구조:**
```
src/
├── components/
│   ├── common/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── Footer.jsx
│   ├── products/
│   │   ├── ProductList.jsx
│   │   ├── ProductCard.jsx
│   │   └── ProductDetail.jsx
│   └── orders/
│       ├── OrderForm.jsx
│       ├── OrderList.jsx
│       └── OrderTracking.jsx
│
├── pages/
│   ├── Home.jsx
│   ├── ProductsPage.jsx
│   ├── OrdersPage.jsx
│   ├── ProfilePage.jsx
│   └── AdminDashboard.jsx
│
├── hooks/
│   ├── useAuth.js
│   ├── useProducts.js
│   ├── useOrders.js
│   └── useAnalytics.js
│
├── services/
│   ├── api.js
│   ├── authService.js
│   ├── productService.js
│   └── orderService.js
│
├── store/
│   ├── authSlice.js
│   ├── productSlice.js
│   └── orderSlice.js
│
├── utils/
│   ├── constants.js
│   ├── validators.js
│   └── formatters.js
│
└── App.jsx
```

**상태 관리 (Zustand):**
```javascript
import create from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export const useAuthStore = create(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        
        setAuth: (user, token) => set({ user, token }),
        clearAuth: () => set({ user: null, token: null }),
        
        logout: async () => {
          await authService.logout()
          set({ user: null, token: null })
        }
      }),
      { name: 'auth-store' }
    )
  )
)
```

### 10.2 모바일 앱 - iOS (Swift)

**MVVM 아키텍처:**
```
├── App/
│   └── EodisanApp.swift
│
├── Models/
│   ├── User.swift
│   ├── Product.swift
│   ├── Order.swift
│   └── Producer.swift
│
├── ViewModels/
│   ├── AuthViewModel.swift
│   ├── ProductsViewModel.swift
│   ├── OrdersViewModel.swift
│   └── ProducerViewModel.swift
│
├── Views/
│   ├── ContentView.swift
│   ├── Screens/
│   │   ├── HomeView.swift
│   │   ├── ProductsView.swift
│   │   ├── OrdersView.swift
│   │   └── ProfileView.swift
│   └── Components/
│       ├── ProductCard.swift
│       ├── OrderCard.swift
│       └── LoadingView.swift
│
├── Services/
│   ├── APIService.swift
│   ├── AuthService.swift
│   ├── NetworkMonitor.swift
│   └── LocationService.swift
│
└── Utilities/
    ├── Constants.swift
    ├── Extensions.swift
    └── Formatters.swift
```

### 10.3 모바일 앱 - Android (Kotlin)

**MVVM + Clean Architecture:**
```
├── presentation/
│   ├── ui/
│   │   ├── MainActivity.kt
│   │   ├── screen/
│   │   │   ├── HomeScreen.kt
│   │   │   ├── ProductScreen.kt
│   │   │   └── OrderScreen.kt
│   │   └── component/
│   │       ├── ProductCard.kt
│   │       └── OrderCard.kt
│   └── viewmodel/
│       ├── AuthViewModel.kt
│       ├── ProductViewModel.kt
│       └── OrderViewModel.kt
│
├── domain/
│   ├── model/
│   │   ├── User.kt
│   │   ├── Product.kt
│   │   └── Order.kt
│   ├── repository/
│   │   ├── AuthRepository.kt
│   │   └── ProductRepository.kt
│   └── usecase/
│       ├── GetProductsUseCase.kt
│       └── CreateOrderUseCase.kt
│
└── data/
    ├── remote/
    │   └── APIService.kt
    ├── local/
    │   └── Database.kt
    └── repository/
        └── AuthRepositoryImpl.kt
```

---

# IV. 운영 및 배포

## 11. 보안 아키텍처

### 11.1 인증 및 권한

**JWT 토큰 구조:**
```
Header: {
  "alg": "HS256",
  "typ": "JWT",
  "kid": "key_123"
}

Payload: {
  "sub": "user_123",
  "email": "user@example.com",
  "roles": ["consumer", "producer"],
  "permissions": ["read:products", "write:orders"],
  "iat": 1704067200,
  "exp": 1704070800,
  "refresh_exp": 1706745600
}

Signature: HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), SECRET)
```

**토큰 관리:**
- Access Token: 1시간
- Refresh Token: 30일
- Token Rotation: Refresh마다 새 토큰 발급
- Token Revocation: 로그아웃 시 블랙리스트 등록

### 11.2 데이터 보안

**암호화 전략:**
```
1. 전송 계층 (In Transit)
   - TLS 1.3 (HTTPS 기본)
   - 모든 API 통신 암호화
   - WSS (WebSocket Secure)

2. 저장소 계층 (At Rest)
   - 비밀번호: bcrypt (Salt Rounds: 12)
   - 결제정보: AES-256-GCM
   - 민감한 데이터: Column-level 암호화
   - 데이터베이스 암호화: Transparent Data Encryption (TDE)

3. PII 마스킹
   - 전화번호: 010-1234-5678 → 010-****-5678
   - 계좌번호: 123-456-789012 → 123-***-789012
   - 카드번호: 표시 금지 (PCI-DSS)
```

### 11.3 API 보안

**Rate Limiting:**
```
- 공개 API (로그인): 10 requests/minute/IP
- 인증된 사용자: 100 requests/minute/user
- 결제 API: 5 requests/minute/user
- 관리자: 제한 없음
```

**CORS 정책:**
```
Access-Control-Allow-Origin: https://eodisan.kr
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 3600
Access-Control-Allow-Credentials: true
```

### 11.4 감시 및 로깅

**감시 대상:**
- 모든 인증 시도 (성공/실패)
- 권한 변경 작업
- PII 접근
- 결제 정보 조회
- 관리자 작업

**로깅 형식:**
```json
{
  "timestamp": "2026-01-15T10:30:00.123Z",
  "level": "INFO",
  "service": "user-service",
  "event": "user.login",
  "user_id": "user_123",
  "ip_address": "203.0.113.45",
  "user_agent": "Mozilla/5.0...",
  "result": "success",
  "duration_ms": 245,
  "request_id": "req_12345"
}
```

---

## 12. 인프라 및 배포 전략

### 12.1 AWS 인프라

**리전:** ap-northeast-2 (서울)  
**AZ:** 2개 이상 (고가용성)

**구성 요소:**
```yaml
네트워크:
  - VPC (CIDR: 10.0.0.0/16)
  - 퍼블릭 서브넷: 2개 (10.0.1.0/24, 10.0.2.0/24)
  - 프라이빗 서브넷: 2개 (10.0.11.0/24, 10.0.12.0/24)
  - NAT Gateway (고가용성)
  - Route 53 (DNS)

로드 밸런싱:
  - Application Load Balancer (ALB)
  - Target Groups (서비스별)
  - SSL/TLS 종료

컨테이너:
  - ECS 또는 EKS (Kubernetes)
  - ECR (Docker Registry)
  - CloudWatch (로깅)

데이터베이스:
  - RDS PostgreSQL (Multi-AZ)
  - ElastiCache Redis Cluster
  - S3 (객체 저장소)
  - DynamoDB (선택사항)

모니터링:
  - CloudWatch (메트릭, 로그)
  - CloudTrail (감사 로그)
  - VPC Flow Logs

보안:
  - Security Groups
  - Network ACLs
  - WAF (Web Application Firewall)
  - Secrets Manager (암호 관리)
```

### 12.2 Kubernetes 배포

**Cluster 구성:**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: eodisan-api
  namespace: production
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: eodisan-api
  template:
    metadata:
      labels:
        app: eodisan-api
    spec:
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - eodisan-api
              topologyKey: kubernetes.io/hostname
      
      containers:
      - name: api
        image: 123456789.dkr.ecr.ap-northeast-2.amazonaws.com/eodisan-api:v1.0.0
        imagePullPolicy: Always
        ports:
        - containerPort: 3000
          name: http
        
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: cache-credentials
              key: url
        - name: LOG_LEVEL
          value: "info"
        
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 2
      
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000

---
apiVersion: v1
kind: Service
metadata:
  name: eodisan-api-service
  namespace: production
spec:
  type: ClusterIP
  selector:
    app: eodisan-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
    name: http

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: eodisan-api-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: eodisan-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
```

### 12.3 CI/CD 파이프라인 (GitHub Actions)

```yaml
name: Build & Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [develop]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Lint
      run: npm run lint
    
    - name: Test
      run: npm test -- --coverage
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/lcov.info
    
    - name: Build
      run: npm run build
    
    - name: Build Docker image
      run: |
        docker build -t ${{ secrets.ECR_REGISTRY }}/eodisan-api:${{ github.sha }} .
        docker build -t ${{ secrets.ECR_REGISTRY }}/eodisan-api:latest .
    
    - name: Push to ECR
      env:
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        AWS_DEFAULT_REGION: ap-northeast-2
      run: |
        aws ecr get-login-password | docker login --username AWS --password-stdin ${{ secrets.ECR_REGISTRY }}
        docker push ${{ secrets.ECR_REGISTRY }}/eodisan-api:${{ github.sha }}
        docker push ${{ secrets.ECR_REGISTRY }}/eodisan-api:latest
    
    - name: Deploy to Kubernetes
      env:
        KUBECONFIG_CONTENT: ${{ secrets.KUBECONFIG }}
      run: |
        echo "$KUBECONFIG_CONTENT" | base64 -d > kubeconfig.yaml
        export KUBECONFIG=kubeconfig.yaml
        
        kubectl set image deployment/eodisan-api \
          eodisan-api=${{ secrets.ECR_REGISTRY }}/eodisan-api:${{ github.sha }} \
          -n production
        
        kubectl rollout status deployment/eodisan-api -n production
    
    - name: Slack notification
      if: always()
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        text: 'Deployment ${{ job.status }}: ${{ github.ref }}'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 13. 성능 및 모니터링

### 13.1 성능 목표 (SLA)

| 메트릭 | 목표 | 측정 방법 |
|--------|------|----------|
| **가용성** | 99.9% | CloudWatch, Uptime Monitor |
| **응답 시간 P50** | < 200ms | APM (DataDog) |
| **응답 시간 P99** | < 1s | APM (DataDog) |
| **처리량** | 10,000 req/s | Load Test (JMeter) |
| **DB 응답** | < 50ms | Slow Query Log |
| **캐시 Hit Rate** | > 85% | Redis Stats |

### 13.2 모니터링 대시보드 (Grafana)

```
1. 시스템 건강도 대시보드
   - CPU, Memory, Disk 사용률
   - Network I/O
   - Pod 상태 (Kubernetes)

2. 애플리케이션 성능
   - API 응답 시간 분포 (P50, P95, P99)
   - 요청 처리율
   - 에러율 및 에러 타입

3. 거래 현황
   - 일일 거래액
   - 활성 사용자
   - 상품별 판매량
   - 이상거래 탐지 현황

4. 데이터베이스
   - Connection Pool 사용률
   - Slow Query 목록
   - Replication Lag

5. 캐시 효율
   - Hit/Miss Rate
   - Memory 사용률
   - 키 만료율
```

### 13.3 알림 규칙 (Alert Rules)

```yaml
Groups:
  - Name: Application
    Rules:
    - Alert: HighErrorRate
      Expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
      For: 5m
      Annotations:
        summary: "High error rate detected"
    
    - Alert: SlowResponseTime
      Expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
      For: 10m
      Annotations:
        summary: "Slow API response time"
  
  - Name: Infrastructure
    Rules:
    - Alert: PodCrashLooping
      Expr: rate(kube_pod_container_status_restarts_total[1h]) > 5
      For: 5m
    
    - Alert: HighMemoryUsage
      Expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.9
      For: 5m
  
  - Name: Business
    Rules:
    - Alert: AnomalousTransaction
      Expr: count(increase(anomaly_detected_total[1h])) > 10
      For: 1m
      Annotations:
        summary: "Multiple anomalous transactions detected"
```

---

# V. 프로젝트 계획

## 14. 개발 로드맵

### 14.1 24개월 일정

```
Phase 1: 기획 및 설계 (Month 1-3)
├─ M1: 요구사항 정의, API 설계, DB 스키마
├─ M2: 시스템 아키텍처 확정, 개발 환경 구축
└─ M3: 팀 온보딩, 개발 표준 수립, 보안 검토

Phase 2: MVP 개발 (Month 4-9)
├─ M4-M5: 백엔드 코어 시스템
│  ├─ User/Auth Service
│  ├─ Producer Service (인증 로직)
│  ├─ Product Service
│  └─ Order Service
├─ M6-M7: 프론트엔드 + 모바일
│  ├─ 웹 어드민 (React)
│  ├─ iOS 앱 (Swift)
│  └─ Android 앱 (Kotlin)
├─ M8: 통합 테스트, 성능 최적화
└─ M9: 알파 테스트 (내부 50명)

Phase 3: 베타 런칭 (Month 10-12)
├─ M10: 베타 오픈 (생산자 100명, 소비자 1,000명)
├─ M11: 피드백 수집, 지속적 개선
└─ M12: 정식 런칭 준비

Phase 4: 성장 (Month 13-24)
├─ M13-M15: 정식 런칭, 지역 확대
├─ M16-M18: 프리미어 기능, 광고 시스템
├─ M19-M21: B2B 거래처 확대
└─ M22-M24: Series A 투자, 글로벌 준비
```

### 14.2 마일스톤별 산출물

| 마일스톤 | 산출물 | 성공 기준 |
|---------|--------|----------|
| M3 | 기술 명세서 v3.0 | 모든 이해관계자 동의 |
| M6 | MVP 백엔드 + 웹 | 코어 기능 동작 |
| M9 | 알파 테스트 완료 | 100+ 버그 수정, 성능 OK |
| M10 | 베타 버전 배포 | 1,000 사용자, 가용성 99.5% |
| M12 | 정식 런칭 버전 | 모든 테스트 통과, 보안 감사 완료 |

---

## 15. 위험 관리

### 15.1 주요 위험 및 대응 계획

| 위험 | 확률 | 영향 | 대응 계획 |
|------|------|------|----------|
| **기술 부채 누적** | 높음 | 높음 | 2주마다 리팩토링 스프린트 |
| **성능 저하** | 중간 | 높음 | 정기적 로드 테스트, 캐시 전략 |
| **보안 취약점** | 낮음 | 매우 높음 | 월1회 보안 감사, 침투 테스트 |
| **스케일링 실패** | 낮음 | 높음 | 수평 확장 설계, Auto Scaling |
| **데이터 손실** | 매우 낮음 | 매우 높음 | 백업 자동화, 재해복구 계획 |
| **규제 변경** | 중간 | 중간 | 법무팀 협력, 정책 모니터링 |
| **핵심 인력 이탈** | 낮음 | 높음 | 지식 공유, 문서화 강화 |
| **제3자 API 장애** | 중간 | 중간 | Multi-provider 전략, Circuit Breaker |

### 15.2 의존성 관리

```
Critical Dependencies:
├─ Payment Gateway (Stripe/Inicis)
│  → 대체재: 복수 PG 지원
├─ Shipping APIs (배송사)
│  → 대체재: 다양한 배송사 지원
├─ Database (PostgreSQL)
│  → 대체재: Auto Failover 구성
└─ Cloud Provider (AWS)
   → 대체재: 타 클라우드 준비
```

---

## 📊 부록: 기술 비용 및 팀 구성

### 비용 추정 (월간)

| 항목 | 비용 | 설명 |
|------|------|------|
| AWS 인프라 | 2,000,000 | EC2, RDS, S3, ALB, CloudFront |
| Kafka/Redis | 1,500,000 | 메시지 브로커, 캐시 |
| 모니터링 | 1,000,000 | DataDog, Sentry, 로그 저장소 |
| 외부 API | 2,000,000 | 결제 게이트웨이, SMS, 배송 API |
| CDN/도메인 | 500,000 | CloudFront, Route 53 |
| 보안 | 300,000 | SSL 인증서, WAF |
| **총계** | **7,300,000** | 12개월 = 87,600,000 KRW |

### 팀 구성

| 역할 | 인원 | 월 비용 |
|------|------|--------|
| 백엔드 엔지니어 | 10 | 60,000,000 |
| 프론트엔드 엔지니어 | 10 | 60,000,000 |
| DevOps/SRE | 3 | 18,000,000 |
| QA/테스터 | 3 | 15,000,000 |
| 프로젝트 매니저 | 2 | 12,000,000 |
| 보안 엔지니어 | 2 | 12,000,000 |
| **총 인건비** | **30명** | **177,000,000** |

---

## 🎯 결론

이 기술명세서 v3.0은 **업계 표준 SRS + SAD 형식**으로 완성되어, 다음을 제공합니다:

✅ **명확한 요구사항** - FR/NFR 구분, 측정 가능한 기준  
✅ **확장 가능한 아키텍처** - MSA, 마이크로서비스 독립 배포  
✅ **견고한 보안** - JWT, TLS, 데이터 암호화, 감시 로깅  
✅ **고가용성** - 99.9% SLA, Multi-AZ, 자동 페일오버  
✅ **실시간 기능** - Kafka 기반 이벤트, WebSocket  
✅ **AI/Blockchain 통합** - 이상거래 탐지, 원산지 추적  
✅ **명확한 배포 전략** - Kubernetes, CI/CD 자동화  
✅ **측정 가능한 계획** - 24개월 로드맵, 성공 기준  
✅ **완전한 설계** - DB 스키마, API 명세, 프론트엔드 아키텍처  
✅ **비용/팀 계획** - 실제 예산, 조직 구조  

---

**문서 버전:** v3.0 (완성본)  
**작성일:** 2026년 1월 15일  
**최종 업데이트:** 2026년 1월 16일  
**상태:** ✅ 완성 (모든 섹션 작성 완료)

---

*이 문서는 어디산 프로젝트의 공식 기술 명세서입니다. 모든 변경사항은 검토팀의 승인을 거쳐야 합니다.*
