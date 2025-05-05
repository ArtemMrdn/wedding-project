// Конфигурация
const APP_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbw8ITjdTV8hwerP5A0Y3H4ASJgzhsmVVqpPDdJJ3NyqdLV_iVHP1sp0uTUx54r33ARw4A/exec";

// Главная функция отправки
async function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const submitBtn = form.querySelector(".submit-btn");
  const messageEl =
    form.querySelector(".form-message") || createMessageElement(form);

  // Получаем данные формы
  const formData = {
    name: form.querySelector("#name").value.trim(),
    attendance:
      form.querySelector('input[name="attendance"]:checked')?.value ||
      "Не указано",
    timestamp: new Date().toISOString(),
  };

  // Валидация
  if (!formData.name) {
    showMessage(messageEl, "Пожалуйста, укажите ваше имя", "error");
    return;
  }

  // Показываем загрузку
  setButtonState(submitBtn, "loading");

  try {
    // Отправка данных
    const response = await sendDataToGoogleSheets(formData);

    if (response.status === "success") {
      showMessage(messageEl, "✅ Ваш ответ успешно сохранён!", "success");
      form.reset();
    } else {
      throw new Error(response.message || "Неизвестная ошибка");
    }
  } catch (error) {
    console.error("Ошибка отправки:", error);
    showMessage(messageEl, `❌ Ошибка: ${error.message}`, "error");
  } finally {
    setButtonState(submitBtn, "default");
  }
}

// Функция отправки данных
async function sendDataToGoogleSheets(data) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  // Пробуем сначала стандартный fetch
  try {
    const response = await fetch(APP_SCRIPT_URL, options);
    return await response.json();
  } catch (fetchError) {
    console.warn("Ошибка fetch, пробуем JSONP...", fetchError);
    return await sendViaJsonp(data);
  }
}

// Резервный метод через JSONP
function sendViaJsonp(data) {
  return new Promise((resolve, reject) => {
    const callbackName = `jsonp_${Date.now()}`;
    const script = document.createElement("script");

    window[callbackName] = (response) => {
      delete window[callbackName];
      document.body.removeChild(script);
      resolve(response);
    };

    const url = new URL(APP_SCRIPT_URL);
    url.searchParams.set("callback", callbackName);
    url.searchParams.set("data", JSON.stringify(data));

    script.src = url.toString();
    script.onerror = () => {
      reject(new Error("Ошибка JSONP запроса"));
    };

    document.body.appendChild(script);
  });
}

// Вспомогательные функции
function createMessageElement(form) {
  const messageEl = document.createElement("div");
  messageEl.className = "form-message";
  form.appendChild(messageEl);
  return messageEl;
}

function showMessage(el, text, type = "info") {
  el.textContent = text;
  el.style.display = "block";
  el.style.color =
    type === "error" ? "#f44336" : type === "success" ? "#4CAF50" : "#2196F3";

  setTimeout(() => {
    el.style.display = "none";
  }, 5000);
}

function setButtonState(button, state) {
  const states = {
    loading: {
      text: "⏳ Отправка...",
      disabled: true,
    },
    success: {
      text: "✓ Готово",
      disabled: true,
      bgColor: "#4CAF50",
    },
    error: {
      text: "⛔ Ошибка",
      disabled: false,
      bgColor: "#f44336",
    },
    default: {
      text: "Отправить",
      disabled: false,
      bgColor: "",
    },
  };

  const { text, disabled, bgColor } = states[state] || states.default;
  button.textContent = text;
  button.disabled = disabled;
  button.style.backgroundColor = bgColor;
}

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".rsvp-form");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);

    // Создаем элемент для сообщений, если его нет
    if (!form.querySelector(".form-message")) {
      form.appendChild(createMessageElement(form));
    }
  }
});
