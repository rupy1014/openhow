const statusText = document.querySelector("#status-text");
const primaryButton = document.querySelector("#primary-button");
const secondaryButton = document.querySelector("#secondary-button");

const setStatus = (message) => {
  if (!statusText) {
    return;
  }

  statusText.textContent = message;
};

if (primaryButton) {
  primaryButton.addEventListener("click", () => {
    setStatus("좋습니다. 이제 문구를 더 또렷하게 바꾸는 작은 수정 연습을 해보면 됩니다.");
  });
}

if (secondaryButton) {
  secondaryButton.addEventListener("click", () => {
    setStatus("좋습니다. 다음엔 AGENTS.md와 config.toml이 어떤 역할을 하는지 읽어보세요.");
  });
}
