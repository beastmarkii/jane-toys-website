// ===== 다국어 적용 / i18n =====
const LANGS = ["zh", "en", "ja"];
const HTML_LANG = { zh: "zh-CN", en: "en", ja: "ja" };
const YEAR = new Date().getFullYear();

function applyLang(lang) {
  if (!LANGS.includes(lang)) lang = "zh";
  const dict = window.I18N[lang];
  if (!dict) return;

  // 텍스트 노드 / plain text
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key] != null) el.textContent = dict[key].replace("{year}", YEAR);
  });
  // HTML 허용 노드 / rich text (strong, small, span 등)
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    if (dict[key] != null) el.innerHTML = dict[key].replace("{year}", YEAR);
  });

  document.documentElement.setAttribute("lang", HTML_LANG[lang]);
  // 페이지별 제목 / per-page document title
  const PAGE_TITLE_KEY = {
    about: "about.title", bases: "bases.title", process: "process.title",
    quality: "quality.title", products: "products.title", brands: "brands.title",
    contact: "nav.contact",
  };
  const page = document.body.getAttribute("data-page");
  if (page && PAGE_TITLE_KEY[page] && dict[PAGE_TITLE_KEY[page]]) {
    document.title = dict[PAGE_TITLE_KEY[page]] + " · " + (dict["footer.company"] || "");
  } else if (dict.docTitle) {
    document.title = dict.docTitle;
  }

  // 활성 버튼 표시 / active button
  document.querySelectorAll(".lang-btn").forEach((b) => {
    b.classList.toggle("active", b.getAttribute("data-lang") === lang);
  });

  try { localStorage.setItem("lang", lang); } catch (e) {}
}

// 언어 버튼 / language buttons
document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => applyLang(btn.getAttribute("data-lang")));
});

// 초기 언어: 저장값 → 브라우저 언어 → 중문 / initial language
let initial = "zh";
try {
  const saved = localStorage.getItem("lang");
  if (saved && LANGS.includes(saved)) {
    initial = saved;
  } else {
    const nav = (navigator.language || "").toLowerCase();
    if (nav.startsWith("ja")) initial = "ja";
    else if (nav.startsWith("en")) initial = "en";
    else if (nav.startsWith("zh")) initial = "zh";
  }
} catch (e) {}
applyLang(initial);

// ===== 테마 전환 / theme toggle =====
const themeToggle = document.getElementById("theme-toggle");
const root = document.documentElement;

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
  try { localStorage.setItem("theme", theme); } catch (e) {}
}

let savedTheme = null;
try { savedTheme = localStorage.getItem("theme"); } catch (e) {}
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

themeToggle.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
});

// ===== 문의 폼 / inquiry form =====
// INQUIRY_ENDPOINT 에 Formspree 등 폼 서비스 주소를 넣으면 메일 앱 없이 바로 전송됩니다.
// 예: const INQUIRY_ENDPOINT = "https://formspree.io/f/xxxxxxx";
const INQUIRY_ENDPOINT = "https://formspree.io/f/xykrrpaz";
const INQUIRY_EMAIL = "janetoys@jane-toys.com";

const inquiryForm = document.getElementById("inquiry-form");
if (inquiryForm) {
  const submitButton = inquiryForm.querySelector("button[type=submit]");
  const statusEl = document.getElementById("form-status");
  const defaultButtonText = submitButton ? submitButton.textContent : "";

  function setFormStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.dataset.status = type || "";
  }

  inquiryForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!inquiryForm.reportValidity()) return;
    const fd = new FormData(inquiryForm);
    const lang = (() => { try { return localStorage.getItem("lang") || "zh"; } catch (err) { return "zh"; } })();
    fd.append("_subject", "Jane Toys website inquiry");

    if (!INQUIRY_ENDPOINT) {
      setFormStatus("Form service is being configured. Please email janetoys@jane-toys.com directly for now.", "error");
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }
    setFormStatus("", "");

    try {
      const res = await fetch(INQUIRY_ENDPOINT, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: fd,
      });
      if (res.ok) {
        inquiryForm.reset();
        setFormStatus("Thank you. Your inquiry has been sent.", "success");
        return;
      }
      setFormStatus("The message could not be sent. Please try again or email janetoys@jane-toys.com.", "error");
    } catch (err) {
      setFormStatus("The message could not be sent. Please try again or email janetoys@jane-toys.com.", "error");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = defaultButtonText || "Send Inquiry";
        applyLang(lang);
      }
    }
  });
}

// ===== 모바일 메뉴 / mobile menu =====
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", open ? "true" : "false");
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});
