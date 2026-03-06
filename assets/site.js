(() => {
  const supported = [
    "en",
    "ja",
    "es",
    "es-419",
    "pt-BR",
    "de",
    "fr",
    "ko",
    "zh-Hans",
    "zh-Hant",
    "ru",
  ];

  const labels = {
    en: "English",
    ja: "日本語",
    es: "Español",
    "es-419": "Español (LatAm)",
    "pt-BR": "Português (Brasil)",
    de: "Deutsch",
    fr: "Français",
    ko: "한국어",
    "zh-Hans": "简体中文",
    "zh-Hant": "繁體中文",
    ru: "Русский",
  };

  const storageKey = "morseLinkSiteLang";

  function normalizeLang(value) {
    if (!value) return null;
    const raw = String(value).trim();
    if (!raw) return null;

    const lower = raw.toLowerCase();
    if (lower === "zh-hans" || lower === "zh-cn" || lower === "zh-sg") return "zh-Hans";
    if (lower === "zh-hant" || lower === "zh-tw" || lower === "zh-hk" || lower === "zh-mo")
      return "zh-Hant";
    if (lower === "pt-br" || lower === "pt_br") return "pt-BR";
    if (lower === "es-419" || lower === "es_419") return "es-419";
    if (lower === "ja-jp" || lower === "ja_jp") return "ja";

    const primary = lower.split(/[-_]/)[0];
    if (primary === "en") return "en";
    if (primary === "ja") return "ja";
    if (primary === "es") return "es";
    if (primary === "pt") return "pt-BR";
    if (primary === "de") return "de";
    if (primary === "fr") return "fr";
    if (primary === "ko") return "ko";
    if (primary === "ru") return "ru";
    if (primary === "zh") return "zh-Hans";
    return "en";
  }

  function getParamLang() {
    try {
      const url = new URL(window.location.href);
      return normalizeLang(url.searchParams.get("lang"));
    } catch (_) {
      return null;
    }
  }

  function getStoredLang() {
    try {
      return normalizeLang(window.localStorage.getItem(storageKey));
    } catch (_) {
      return null;
    }
  }

  function setStoredLang(lang) {
    try {
      window.localStorage.setItem(storageKey, lang);
    } catch (_) {
      // ignore
    }
  }

  function applyLang(lang) {
    const effective = supported.includes(lang) ? lang : "en";
    document.documentElement.lang = effective;

    const langElements = Array.from(document.querySelectorAll("[data-lang]"));
    if (langElements.length === 0) return;

    let hasExact = false;
    for (const el of langElements) {
      const elLang = el.getAttribute("data-lang");
      if (elLang === effective) {
        hasExact = true;
        break;
      }
    }

    for (const el of langElements) {
      const elLang = el.getAttribute("data-lang");
      const show =
        elLang === "*" ||
        elLang === effective ||
        (!hasExact && elLang === "en") ||
        (!hasExact && elLang === effective);
      el.style.display = show ? "" : "none";
    }
  }

  function rewriteInternalLinks(lang) {
    const effective = supported.includes(lang) ? lang : "en";
    const anchors = Array.from(document.querySelectorAll("a[href]"));
    for (const a of anchors) {
      const href = a.getAttribute("href");
      if (!href) continue;
      if (href.startsWith("#")) continue;
      if (href.startsWith("mailto:") || href.startsWith("tel:")) continue;
      if (href.startsWith("http://") || href.startsWith("https://")) continue;

      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) continue;
        if (!url.pathname.endsWith(".html")) continue;
        url.searchParams.set("lang", effective);
        a.setAttribute("href", url.pathname + "?" + url.searchParams.toString() + url.hash);
      } catch (_) {
        // ignore
      }
    }
  }

  function mountSwitcher(lang) {
    const effective = supported.includes(lang) ? lang : "en";
    const container = document.createElement("div");
    container.className = "ml-lang-switcher";

    const select = document.createElement("select");
    select.setAttribute("aria-label", "Language");

    for (const code of supported) {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = labels[code] ?? code;
      if (code === effective) option.selected = true;
      select.appendChild(option);
    }

    select.addEventListener("change", () => {
      const next = normalizeLang(select.value) ?? "en";
      setStoredLang(next);
      applyLang(next);
      rewriteInternalLinks(next);
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("lang", next);
        window.history.replaceState({}, "", url.toString());
      } catch (_) {
        // ignore
      }
    });

    container.appendChild(select);
    document.body.appendChild(container);
  }

  function bindLangLinks() {
    const links = Array.from(document.querySelectorAll("a[data-set-lang]"));
    for (const link of links) {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const next = normalizeLang(link.getAttribute("data-set-lang")) ?? "en";
        setStoredLang(next);
        applyLang(next);
        rewriteInternalLinks(next);

        try {
          const url = new URL(window.location.href);
          url.searchParams.set("lang", next);
          const href = link.getAttribute("href") ?? "";
          if (href.startsWith("#")) url.hash = href;
          window.history.replaceState({}, "", url.toString());
          if (href.startsWith("#")) window.location.hash = href;
        } catch (_) {
          // ignore
        }
      });
    }
  }

  const initialLang = getParamLang() ?? getStoredLang() ?? "en";
  setStoredLang(initialLang);
  applyLang(initialLang);
  rewriteInternalLinks(initialLang);
  mountSwitcher(initialLang);
  bindLangLinks();
})();
