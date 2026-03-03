---
slug: 메신저연결-vLLM연결
title: "vLLM 연결"
nav: vLLM 연결
order: 4
---

*검증 기준일: 2026-03-03 (공식 문서·릴리즈 기준)*

**내 GPU에서 돌리는 AI를 OpenClaw에 붙일 수 있어.**

vLLM이라는 로컬 모델 서버를 쓰면 돼.
토큰 비용 $0.

---

## Ollama랑 뭐가 달라?

| | Ollama | vLLM |
|---|---|---|
| 설치 | 매우 쉬움 | 약간 복잡 |
| 성능 | 단일 요청 최적화 | 동시 요청 최적화 |
| 퀀트 | GGUF (CPU+GPU) | fp4/fp8/AWQ (GPU 전용) |
| 적합한 경우 | 개인 데스크톱 | 서버/프로덕션 |

큰 모델(122B급)을 GPU에 올리려면 vLLM이 효율적이야.
작은 모델이면 Ollama로 충분해.

---

## 뭐가 필요해?

```
GPU VRAM: 48GB 이상 (권장 96GB)
RAM: 64GB 이상
저장소: SSD 200GB 이상 (모델 파일)
```

---

## 서버 돌고 있어?

vLLM이 이미 돌고 있어야 해.

```bash
curl -s http://localhost:8000/v1/models | python3 -m json.tool
```

이런 응답이 오면 정상이야:

```json
{
  "data": [
    {
      "id": "Qwen/Qwen3.5-122B-A10B",
      "object": "model",
      "owned_by": "vllm"
    }
  ]
}
```

아직 안 돌리고 있으면:

```bash
# 96GB VRAM 기준 예시
vllm serve Qwen/Qwen3.5-122B-A10B \
  --quantization fp4 \
  --tensor-parallel-size 2 \
  --max-model-len 32768 \
  --port 8000 \
  --api-key "vllm-local"
```

---

## 어떻게 등록해?

설정 파일(`~/.openclaw/openclaw.json`)에 추가해:

```jsonc
{
  "models": {
    "mode": "merge",  // 로컬 + 클라우드 모델 모두 사용
    "providers": {
      "vllm": {
        "baseUrl": "http://127.0.0.1:8000/v1",
        "apiKey": "vllm-local",
        "apiType": "openai-completions",
        "models": [
          {
            "id": "Qwen/Qwen3.5-122B-A10B",
            "name": "Qwen3.5 로컬",
            "contextWindow": 32768,
            "maxTokens": 4096,
            "cost": { "input": 0, "output": 0 },
            "capabilities": {
              "tools": true,
              "vision": false,
              "streaming": true
            }
          }
        ]
      }
    }
  }
}
```

**`"mode": "merge"`가 핵심이야.** 이걸 해야 기존 클라우드 모델이랑 같이 쓸 수 있어.

---

## 잘 됐어?

```bash
# 로컬 모델이 보이는지 확인
openclaw models list | grep -i qwen

# 이름이 길면 별명(alias) 등록
openclaw models aliases add qwen-local vllm/Qwen/Qwen3.5-122B-A10B
```

이제 설정에서 `"qwen-local"`로 쓸 수 있어.

---

## 서버 죽으면 어떡해?

vLLM 서버가 죽으면 에이전트도 멈춰.
반드시 폴백을 설정해:

```jsonc
{
  "model": {
    "primary": "vllm/Qwen/Qwen3.5-122B-A10B",
    "fallbacks": ["openai/gpt-4o-mini"]
  }
}
```

서버 다운 시 저렴한 클라우드 모델로 자동 전환돼.

GPU 메모리도 가끔 확인해봐:

```bash
nvidia-smi --query-gpu=memory.used,memory.total --format=csv
```

---

## 한 줄 정리

`openclaw.json`에 vLLM 프로바이더를 `mode: "merge"`로 등록하면 끝. [하이브리드 모델 전략](../실전활용/08-하이브리드모델)에서 로컬+클라우드를 나눠 쓰는 방법을 봐.
