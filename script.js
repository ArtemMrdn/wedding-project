const TELEGRAM_BOT_TOKEN = "8015332822:AAENoAkeyBYFNUezY8ityBE1yto1qW1BZVk";
const TELEGRAM_CHAT_ID = "7446230071";

// Показ/скрытие дополнительных полей
document.addEventListener("DOMContentLoaded", function () {
  const attendanceRadios = document.querySelectorAll(
    'input[name="attendance"]'
  );

  attendanceRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      const additionalFields = document.querySelector(".additional-fields");
      if (this.value === "Да, с радостью") {
        additionalFields.style.display = "block";
      } else {
        additionalFields.style.display = "none";
        // Сброс значений
        document.getElementById("guests").value = "";
        document.querySelector(
          'input[name="accommodation"][value="Нет"]'
        ).checked = true;
      }
    });
  });

  // Инициализация формы
  const form = document.querySelector(".rsvp-form");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  }
});

async function sendToTelegram(data) {
  let text = `📌 Новый ответ на приглашение:\nИмя: ${data.name}\nПрисутствие: ${data.attendance}`;

  if (data.attendance === "Да, с радостью") {
    text += `\nКоличество гостей: ${data.guests || 1}`;
    text += `\nНочёвка: ${data.accommodation || "Нет"}`;
  }

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
    attendance: form.querySelector('input[name="attendance"]:checked')?.value,
    guests: form.querySelector("#guests")?.value,
    accommodation: form.querySelector('input[name="accommodation"]:checked')
      ?.value,
  };

  if (!formData.name) {
    showMessage(messageEl, "Пожалуйста, укажите имя", "error");
    return;
  }

  setButtonState(submitBtn, "loading");
  try {
    await sendToTelegram(formData);
    showMessage(messageEl, "Ваш ответ отправлен!", "success");
    form.reset();
    // Скрываем дополнительные поля после отправки
    document.querySelector(".additional-fields").style.display = "none";
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
  el.style.fontFamily = "Literata, sans-serif";
  el.style.fontStyle = "italic";
  setTimeout(() => (el.style.display = "none"), 8000);
}

function setButtonState(button, state) {
  button.textContent = state === "loading" ? "⏳ Отправка..." : "Отправить";
  button.disabled = state === "loading";
}

document.addEventListener("DOMContentLoaded", function () {
  // Анимация секций при скролле
  const animateSections = () => {
    const sections = document.querySelectorAll(".section-animate");
    const windowHeight = window.innerHeight;
    const triggerOffset = 100;

    sections.forEach((section) => {
      const sectionTop = section.getBoundingClientRect().top;

      if (sectionTop < windowHeight - triggerOffset) {
        section.classList.add("section-visible");
      }
    });
  };

  // Проверяем при загрузке
  animateSections();

  // И при скролле (с троттлингом для производительности)
  let isScrolling = false;
  window.addEventListener("scroll", () => {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        animateSections();
        isScrolling = false;
      });
      isScrolling = true;
    }
  });

  // Анимация первой секции с небольшой задержкой
  setTimeout(() => {
    const firstAnimatedSection = document.querySelector(".date-section");
    if (firstAnimatedSection) {
      firstAnimatedSection.classList.add("section-visible");
    }
  }, 300);
});
