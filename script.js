const TELEGRAM_BOT_TOKEN = "8080788151:AAGE5VDIMPtMbWvomIgHGWaiSl34ZqeUatw";
const TELEGRAM_CHAT_ID = "660519190";

async function sendToTelegram(data) {
  const text = `📌 Новый ответ на приглашение:\nИмя: ${data.name}\nПрисутствие: ${data.attendance}`;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("Ошибка отправки в Telegram:", error);
    throw error;
  }
}

async function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const submitBtn = form.querySelector(".submit-btn");
  const messageEl = form.querySelector(".form-message");

  const formData = {
    name: form.querySelector("#name").value.trim(),
    attendance:
      form.querySelector('input[name="attendance"]:checked')?.value ||
      "Не указано",
  };

  if (!formData.name) {
    showMessage(messageEl, "Пожалуйста, укажите имя", "error");
    return;
  }

  setButtonState(submitBtn, "loading");
  try {
    await sendToTelegram(formData);
    showMessage(messageEl, "✅ Ваш ответ отправлен!", "success");
    form.reset();
  } catch (error) {
    showMessage(messageEl, "❌ Ошибка отправки", "error");
  } finally {
    setButtonState(submitBtn, "default");
  }
}

function showMessage(el, text, type) {
  el.textContent = text;
  el.style.display = "block";
  el.style.color = type === "error" ? "#f44336" : "#4CAF50";
  setTimeout(() => (el.style.display = "none"), 5000);
}

function setButtonState(button, state) {
  button.textContent = state === "loading" ? "⏳ Отправка..." : "Отправить";
  button.disabled = state === "loading";
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".rsvp-form");
  if (form) form.addEventListener("submit", handleFormSubmit);
});
