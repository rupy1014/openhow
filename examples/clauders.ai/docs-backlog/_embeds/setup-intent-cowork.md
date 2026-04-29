---
hidden: true
---

# Intent + Cowork 설정 프롬프트

> 이 파일의 "=== 여기서부터 복사 ===" 부터 "=== 여기까지 복사 ===" 까지 복사해서 새 Claude Code 세션에 붙여넣어.

---

=== 여기서부터 복사 ===

Intent Engineering 커맨드 세트를 설치해줘. GitHub에서 받아서 설정까지.

## 1. 커맨드 파일 설치

```bash
# 클론
git clone https://github.com/roboco-io/intent-engineering /tmp/intent-engineering

# 커맨드 복사 (프로젝트 또는 글로벌)
cp -r /tmp/intent-engineering/.claude/commands/intent.md .claude/commands/
cp -r /tmp/intent-engineering/.claude/commands/intent-modes/ .claude/commands/
cp -r /tmp/intent-engineering/.claude/commands/cowork.md .claude/commands/
cp -r /tmp/intent-engineering/.claude/commands/cowork-phases/ .claude/commands/

# 정리
rm -rf /tmp/intent-engineering
```

설치 후 이 구조가 되어야 해:

```
.claude/commands/
├── intent.md
├── intent-modes/
│   ├── new.md
│   ├── explore.md
│   ├── clarify.md
│   ├── pivot.md
│   ├── kill.md
│   ├── update.md
│   └── dashboard.md
├── cowork.md
└── cowork-phases/
    ├── phase0-intent.md
    ├── phase1-plan.md
    ├── phase2-exec.md
    └── phase3-review.md
```

## 2. CLAUDE.md에 워크플로우 추가

```markdown
## 의도 하네스 & Codex 연동

### 워크플로우
/intent new → explore → clarify → /cowork → done

### 커맨드
| 용도 | 커맨드 |
|------|--------|
| 의도 관리 | `/intent [자연어]` |
| 오케스트레이션 | `/cowork [작업]` |

### 핵심 원칙
- 의도 크기: What 7항목 이상이면 쪼개기
- 시그널 착지: 유저 피드백은 `/intent`로 [signal] 기록
- done 판단: Why 같으면 재개, 다르면 신규
```

## 3. 테스트

```bash
claude
> /intent 결제가 느려서 고치고 싶어
```

인터뷰가 시작되고 `intents/` 폴더에 파일이 생성되면 성공.

결과를 알려줘:
1. 설치된 커맨드 파일 목록
2. CLAUDE.md 업데이트 내용
3. 테스트 안내

=== 여기까지 복사 ===
