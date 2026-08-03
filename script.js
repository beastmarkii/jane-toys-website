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
const INQUIRY_ENDPOINT = "";
const INQUIRY_EMAIL = "janetoys@jane-toys.com";

function buildInquiryMailto(data, lang) {
  const dict = window.I18N[lang] || window.I18N.zh;
  const subject = (dict["form.subject"] || "[Inquiry]") + " " + (data.company || data.name || "");
  const body = [
    (dict["form.name"] || "Name") + ": " + data.name,
    (dict["form.company"] || "Company") + ": " + data.company,
    (dict["form.email"] || "Email") + ": " + data.email,
    (dict["form.country"] || "Country") + ": " + (data.country || "-"),
    (dict["form.qty"] || "Qty") + ": " + (data.qty || "-"),
    "",
    data.msg,
  ].join("\n");
  return "mailto:" + INQUIRY_EMAIL +
    "?subject=" + encodeURIComponent(subject) +
    "&body=" + encodeURIComponent(body);
}
window.buildInquiryMailto = buildInquiryMailto; // 테스트용 노출

const inquiryForm = document.getElementById("inquiry-form");
if (inquiryForm) {
  inquiryForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!inquiryForm.reportValidity()) return;
    const fd = new FormData(inquiryForm);
    const data = Object.fromEntries(fd.entries());
    const lang = (() => { try { return localStorage.getItem("lang") || "zh"; } catch (err) { return "zh"; } })();

    if (INQUIRY_ENDPOINT) {
      // 폼 서비스로 직접 전송 / direct submission via form service
      const btn = inquiryForm.querySelector("button[type=submit]");
      btn.disabled = true;
      try {
        const res = await fetch(INQUIRY_ENDPOINT, {
          method: "POST",
          headers: { "Accept": "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          inquiryForm.reset();
          btn.textContent = "✓";
          setTimeout(() => { applyLang(lang); btn.disabled = false; }, 2500);
          return;
        }
      } catch (err) { /* 실패 시 mailto 로 폴백 */ }
      btn.disabled = false;
    }
    // mailto 폴백 / mailto fallback
    window.location.href = buildInquiryMailto(data, lang);
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
