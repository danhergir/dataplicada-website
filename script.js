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
  const startedAt = Date.now();
  const startedAtField = inquiryForm.querySelector("#form-started-at");
  const honeypot = inquiryForm.querySelector('input[name="_honey"]');
  const status = inquiryForm.querySelector("#form-status");
  const submitButton = inquiryForm.querySelector('button[type="submit"]');
  const requestedService = new URLSearchParams(window.location.search).get("service");
  const requestedTopic = new URLSearchParams(window.location.search).get("topic");
  const serviceSelect = inquiryForm.querySelector("#project-type");
  const challengeField = inquiryForm.querySelector("#challenge");

  if (startedAtField) startedAtField.value = new Date(startedAt).toISOString();
  if (requestedService && serviceSelect?.querySelector(`option[value="${CSS.escape(requestedService)}"]`)) {
    serviceSelect.value = requestedService;
  }
  if (requestedTopic && challengeField && !challengeField.value) {
    const topicPrompts = {
      "feedbacker": "I would like to discuss a customer-feedback or Voice of Customer workflow similar to Feedbacker.",
      "port-data": "I would like to test a pilot for cross-checking port or logistics records.",
      "real-estate-documents": "I would like to test a pilot for finding gaps across real-estate or legal documents.",
      "ceo-ai-webinar": "I am interested in the CEO AI executive briefing. The question I most want covered is: "
    };
    if (topicPrompts[requestedTopic]) challengeField.value = topicPrompts[requestedTopic];
  }

  inquiryForm.addEventListener("submit", (event) => {
    const elapsed = Date.now() - startedAt;
    const lastAttempt = Number(sessionStorage.getItem("dataplicada-form-attempt") || 0);

    if (honeypot?.value) {
      event.preventDefault();
      inquiryForm.reset();
      if (status) status.textContent = "We could not send that message. Please reload the page and try again.";
      return;
    }

    if (elapsed < 4000) {
      event.preventDefault();
      if (status) status.textContent = "Please take a moment to review your message before sending.";
      return;
    }

    if (Date.now() - lastAttempt < 15000 || inquiryForm.dataset.submitting === "true") {
      event.preventDefault();
      if (status) status.textContent = "Your message is already being submitted.";
      return;
    }

    sessionStorage.setItem("dataplicada-form-attempt", String(Date.now()));
    inquiryForm.dataset.submitting = "true";
    if (status) status.textContent = "Sending your inquiry securely…";
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.querySelector("span").textContent = "Sending…";
    }
  });
}
