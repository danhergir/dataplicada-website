const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector("#site-nav");

menuButton?.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!open));
  nav.classList.toggle("open", !open);
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 3, 2) * 80}ms`;
  revealObserver.observe(element);
});

window.setTimeout(() => {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("visible"));
}, 1200);

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

const inquiryForm = document.querySelector("[data-antispam-form]");

if (inquiryForm) {
  const isSpanish = document.documentElement.lang === "es";
  const startedAt = Date.now();
  const startedAtField = inquiryForm.querySelector("#form-started-at");
  const honeypot = inquiryForm.querySelector('input[name="_honey"]');
  const status = inquiryForm.querySelector("#form-status");
  const submitButton = inquiryForm.querySelector('button[type="submit"]');
  const requestedService = new URLSearchParams(window.location.search).get("service");
  const requestedTopic = new URLSearchParams(window.location.search).get("topic");
  const serviceSelect = inquiryForm.querySelector("#project-type");
  const challengeField = inquiryForm.querySelector("#challenge");
  const sourcePageField = inquiryForm.querySelector("#form-source-page");
  const sourceReferrerField = inquiryForm.querySelector("#form-source-referrer");

  const messages = isSpanish ? {
    blocked: "No pudimos enviar el mensaje. Recarga la página e inténtalo de nuevo.",
    review: "Tómate un momento para revisar el mensaje antes de enviarlo.",
    duplicate: "Tu mensaje ya se está enviando.",
    sending: "Enviando tu consulta de forma segura…",
    sendingButton: "Enviando…"
  } : {
    blocked: "We could not send that message. Please reload the page and try again.",
    review: "Please take a moment to review your message before sending.",
    duplicate: "Your message is already being submitted.",
    sending: "Sending your inquiry securely…",
    sendingButton: "Sending…"
  };

  if (startedAtField) startedAtField.value = new Date(startedAt).toISOString();
  if (sourcePageField) sourcePageField.value = window.location.href;
  if (sourceReferrerField) sourceReferrerField.value = document.referrer || "direct";
  if (requestedService && serviceSelect?.querySelector(`option[value="${CSS.escape(requestedService)}"]`)) {
    serviceSelect.value = requestedService;
  }
  if (requestedTopic && challengeField && !challengeField.value) {
    const topicPrompts = isSpanish ? {
      "feedbacker": "Quiero conversar sobre un flujo de retroalimentación o Voz del Cliente similar a Feedbacker.",
      "port-data": "Quiero probar un piloto para contrastar registros portuarios o logísticos.",
      "real-estate-documents": "Quiero probar un piloto para encontrar vacíos en documentos inmobiliarios o legales.",
      "ceo-ai-webinar": "Me interesa la sesión ejecutiva sobre IA para CEOs. La pregunta que más quiero resolver es: ",
      "customer-follow-up": "Quiero conversar sobre un flujo gestionado de seguimiento a clientes.",
      "customer-intelligence": "Quiero conversar sobre un flujo de inteligencia de comentarios de clientes."
    } : {
      "feedbacker": "I would like to discuss a customer-feedback or Voice of Customer workflow similar to Feedbacker.",
      "port-data": "I would like to test a pilot for cross-checking port or logistics records.",
      "real-estate-documents": "I would like to test a pilot for finding gaps across real-estate or legal documents.",
      "ceo-ai-webinar": "I am interested in the CEO AI executive briefing. The question I most want covered is: ",
      "customer-follow-up": "I would like to discuss a managed customer follow-up workflow.",
      "customer-intelligence": "I would like to discuss a customer-feedback intelligence workflow."
    };
    if (topicPrompts[requestedTopic]) challengeField.value = topicPrompts[requestedTopic];
  }

  inquiryForm.addEventListener("submit", (event) => {
    const elapsed = Date.now() - startedAt;
    const lastAttempt = Number(sessionStorage.getItem("dataplicada-form-attempt") || 0);

    if (honeypot?.value) {
      event.preventDefault();
      inquiryForm.reset();
      if (status) status.textContent = messages.blocked;
      return;
    }

    if (elapsed < 4000) {
      event.preventDefault();
      if (status) status.textContent = messages.review;
      return;
    }

    if (Date.now() - lastAttempt < 15000 || inquiryForm.dataset.submitting === "true") {
      event.preventDefault();
      if (status) status.textContent = messages.duplicate;
      return;
    }

    sessionStorage.setItem("dataplicada-form-attempt", String(Date.now()));
    inquiryForm.dataset.submitting = "true";
    if (status) status.textContent = messages.sending;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.querySelector("span").textContent = messages.sendingButton;
    }
  });
}
