const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".tab-panel");
const backToTopButton = document.querySelector(".back-to-top");
const routeToTab = {
  "/": "cobblespawnregions",
  "/cobblespawnregions": "cobblespawnregions",
  "/cobblespawnregions/": "cobblespawnregions",
  "/cobblebattlerewards": "cobblebattlerewards",
  "/cobblebattlerewards/": "cobblebattlerewards",
  "/cobblehunts": "cobblehunts",
  "/cobblehunts/": "cobblehunts",
  "/blanketrtp": "blanketrtp",
  "/blanketrtp/": "blanketrtp",
  "/everlastingutils": "everlastingutils",
  "/everlastingutils/": "everlastingutils",
  "/under-construction": "coming-soon-b",
  "/under-construction/": "coming-soon-b",
};

const tabToRoute = {
  cobblespawnregions: "/cobblespawnregions",
  cobblebattlerewards: "/cobblebattlerewards",
  cobblehunts: "/cobblehunts",
  blanketrtp: "/blanketrtp",
  everlastingutils: "/everlastingutils",
  "coming-soon-b": "/under-construction",
};

const siteUrl = "https://hysocs.github.io";

const tabMetadata = {
  cobblespawnregions: {
    title: "CobbleSpawnRegions | Everlasting.mods Wiki",
    description: "Create named regions that control Cobblemon natural spawns and custom Pokemon spawns.",
    image: `${siteUrl}/assets/cobblespawnregions-icon.png`,
    themeColor: "#2f8ce7",
  },
  cobblehunts: {
    title: "CobbleHunts | Everlasting.mods Wiki",
    description: "Create server-wide Pokemon hunts with editor tools, hunt pools, loot tables, cooldowns, and player rewards.",
    image: `${siteUrl}/assets/cobblehunts-icon.png`,
    themeColor: "#ffd84d",
  },
  cobblebattlerewards: {
    title: "CobbleBattleRewards | Everlasting.mods Wiki",
    description: "Reward players for Cobblemon battles with configurable drops, money, commands, cooldowns, and win or loss rules.",
    image: `${siteUrl}/assets/cobblebattlerewards-icon.png`,
    themeColor: "#f48ac2",
  },
  blanketrtp: {
    title: "B-RTP | Everlasting.mods Wiki",
    description: "Give players safer random teleports with dimensions, cooldowns, warmups, particles, titles, and permission controls.",
    image: `${siteUrl}/assets/blanketrtp-icon.png`,
    themeColor: "#4ade80",
  },
  everlastingutils: {
    title: "EverlastingUtils | Everlasting.mods Wiki",
    description: "Server-side utility and API library required by Everlasting.mods projects and useful for Fabric mod developers.",
    image: `${siteUrl}/assets/everlastingutils-icon.png`,
    themeColor: "#d25481",
  },
  "coming-soon-b": {
    title: "Under Construction | Everlasting.mods Wiki",
    description: "A fake dev loading screen and Cobbleraids preview for unreleased Everlasting.mods projects.",
    image: `${siteUrl}/assets/cobblespawnregions-icon.png`,
    themeColor: "#2f8ce7",
  },
};

const sidebarToggle = document.querySelector(".sidebar-toggle");

function setSidebarCollapsed(isCollapsed) {
  document.body.classList.toggle("is-sidebar-collapsed", isCollapsed);

  document.querySelectorAll(".tab-label, .sidebar-link-label").forEach((label) => {
    label.setAttribute("aria-hidden", String(isCollapsed));
  });

  if (sidebarToggle) {
    sidebarToggle.setAttribute("aria-expanded", String(!isCollapsed));
    sidebarToggle.setAttribute("aria-label", isCollapsed ? "Expand sidebar" : "Collapse sidebar");
  }

  localStorage.setItem("wiki:sidebar-collapsed", isCollapsed ? "true" : "false");
}

if (sidebarToggle) {
  const savedSidebarState = localStorage.getItem("wiki:sidebar-collapsed");
  setSidebarCollapsed(savedSidebarState === "true");

  sidebarToggle.addEventListener("click", () => {
    setSidebarCollapsed(!document.body.classList.contains("is-sidebar-collapsed"));
  });
}

const themeColors = {
  "theme-regions-page": {
    theme: "#2f8ce7",
    dark: "#0d3c77",
    soft: "#62b1f2",
  },
  "theme-battle-page": {
    theme: "#f48ac2",
    dark: "#7d2f5d",
    soft: "#ffc4df",
  },
  "theme-hunts-page": {
    theme: "#ffd84d",
    dark: "#8b6500",
    soft: "#fff08a",
  },
  "theme-rtp-page": {
    theme: "#4ade80",
    dark: "#14532d",
    soft: "#bbf7d0",
  },
  "theme-utils-page": {
    theme: "#d25481",
    dark: "#6f243d",
    soft: "#f3a6bf",
  },
};

const THEME_LERP_DURATION = 500;
let hasSetInitialTheme = false;
let themeAnimationId = null;
let activeThemeName = "theme-regions-page";
let liveThemeColors = { ...themeColors[activeThemeName] };

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function parseColor(value, fallback = "#000000") {
  const raw = String(value || fallback).trim();

  if (raw.startsWith("#")) {
    const hex = raw.slice(1);
    const fullHex = hex.length === 3
      ? hex.split("").map((char) => char + char).join("")
      : hex.padEnd(6, "0").slice(0, 6);

    return {
      r: parseInt(fullHex.slice(0, 2), 16),
      g: parseInt(fullHex.slice(2, 4), 16),
      b: parseInt(fullHex.slice(4, 6), 16),
    };
  }

  const rgbMatch = raw.match(/rgba?\(([^)]+)\)/i);
  if (rgbMatch) {
    const [r, g, b] = rgbMatch[1].split(",").map((part) => parseFloat(part.trim()));
    return { r, g, b };
  }

  return parseColor(fallback);
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b]
    .map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

function lerpColor(fromValue, toValue, amount) {
  const from = parseColor(fromValue);
  const to = parseColor(toValue);

  return rgbToHex({
    r: from.r + (to.r - from.r) * amount,
    g: from.g + (to.g - from.g) * amount,
    b: from.b + (to.b - from.b) * amount,
  });
}

function readCurrentThemeColors() {
  const styles = getComputedStyle(document.body);

  return {
    theme: document.body.style.getPropertyValue("--theme").trim()
      || styles.getPropertyValue("--theme").trim()
      || liveThemeColors.theme,
    dark: document.body.style.getPropertyValue("--theme-dark").trim()
      || styles.getPropertyValue("--theme-dark").trim()
      || liveThemeColors.dark,
    soft: document.body.style.getPropertyValue("--theme-soft").trim()
      || styles.getPropertyValue("--theme-soft").trim()
      || liveThemeColors.soft,
  };
}

function applyThemeColors(colors) {
  liveThemeColors = { ...colors };

  document.body.style.setProperty("--theme", colors.theme);
  document.body.style.setProperty("--theme-dark", colors.dark);
  document.body.style.setProperty("--theme-soft", colors.soft);
  document.body.style.setProperty("--accent", colors.soft);
  document.body.style.setProperty("--accent-2", colors.theme);
}

function colorsMatch(a, b) {
  return ["theme", "dark", "soft"].every((key) => {
    const colorA = parseColor(a[key]);
    const colorB = parseColor(b[key]);
    return Math.abs(colorA.r - colorB.r) < 1
      && Math.abs(colorA.g - colorB.g) < 1
      && Math.abs(colorA.b - colorB.b) < 1;
  });
}

function easeInOutSmooth(amount) {
  return amount * amount * (3 - 2 * amount);
}

function applyTheme(themeName, animate = true) {
  const targetColors = themeColors[themeName];
  if (!targetColors) return;

  if (themeAnimationId) {
    cancelAnimationFrame(themeAnimationId);
    themeAnimationId = null;
  }

  const fromColors = readCurrentThemeColors();
  activeThemeName = themeName;

  if (!animate || colorsMatch(fromColors, targetColors)) {
    applyThemeColors(targetColors);
    return;
  }

  const startTime = performance.now();

  function frame(now) {
    const progress = clamp((now - startTime) / THEME_LERP_DURATION, 0, 1);
    const eased = easeInOutSmooth(progress);

    applyThemeColors({
      theme: lerpColor(fromColors.theme, targetColors.theme, eased),
      dark: lerpColor(fromColors.dark, targetColors.dark, eased),
      soft: lerpColor(fromColors.soft, targetColors.soft, eased),
    });

    if (progress < 1) {
      themeAnimationId = requestAnimationFrame(frame);
      return;
    }

    applyThemeColors(targetColors);
    themeAnimationId = null;
  }

  themeAnimationId = requestAnimationFrame(frame);
}

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

let activeTabId = document.querySelector(".tab-panel.is-active")?.id || null;
const contentTabConfig = {
  cobblespawnregions: [
    { key: "quick-start", label: "Quick Start", selector: ".quick-start-section" },
    { key: "features", label: "Region Features", selector: "#cobblespawnregions-features" },
    { key: "commands", label: "Commands", selector: "#cobblespawnregions-commands" },
    { key: "config", label: "Config Guide", selector: "#cobblespawnregions-config" },
  ],
  cobblebattlerewards: [
    { key: "quick-start", label: "Quick Start", selector: ".quick-start-section" },
    { key: "features", label: "Reward Features", selector: "#cobblebattlerewards-features" },
    { key: "commands", label: "Commands", selector: "#cobblebattlerewards-commands" },
    { key: "config", label: "Config Guide", selector: "#cobblebattlerewards-config" },
  ],
  cobblehunts: [
    { key: "quick-start", label: "Quick Start", selector: ".quick-start-section" },
    { key: "features", label: "Hunt Features", selector: "#cobblehunts-features" },
    { key: "commands", label: "Commands", selector: "#cobblehunts-commands" },
    { key: "config", label: "Config Guide", selector: "#cobblehunts-config" },
  ],
  blanketrtp: [
    { key: "quick-start", label: "Quick Start", selector: ".quick-start-section" },
    { key: "features", label: "Teleport Features", selector: "#blanketrtp-features" },
    { key: "commands", label: "Commands", selector: "#blanketrtp-commands" },
    { key: "config", label: "Config Guide", selector: "#blanketrtp-config" },
  ],
  everlastingutils: [
    { key: "players", label: "Player Setup", selector: "#everlastingutils-players" },
    { key: "developers", label: "Developer API", selector: "#everlastingutils-developers" },
  ],
};
const activeContentTabs = new Map();

function getActiveTabId() {
  return activeTabId || document.querySelector(".tab-panel.is-active")?.id || null;
}

function getContentTabSections(panel) {
  const config = contentTabConfig[panel?.id] || [];

  return config
    .map((item) => ({
      ...item,
      section: panel.querySelector(item.selector),
    }))
    .filter((item) => item.section);
}

function activateContentTab(panel, targetKey, shouldScroll = false) {
  const items = getContentTabSections(panel);
  if (!items.length) return false;

  const selected = items.find((item) => item.key === targetKey) || items[0];
  activeContentTabs.set(panel.id, selected.key);

  items.forEach((item) => {
    const isActive = item.key === selected.key;
    item.section.classList.add("content-section");
    item.section.hidden = !isActive;
    item.section.classList.toggle("is-active", isActive);
  });

  panel.querySelectorAll(".content-tab").forEach((button) => {
    const isActive = button.dataset.contentTab === selected.key;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    button.tabIndex = isActive ? 0 : -1;
  });

  if (shouldScroll) {
    panel.querySelector(".content-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  updateCodeShellScrollState();
  updateBackToTopButton();
  return true;
}

function setupContentTabs() {
  panels.forEach((panel) => {
    const items = getContentTabSections(panel);
    if (!items.length || panel.querySelector(".content-tabs")) return;

    const nav = document.createElement("nav");
    nav.className = "content-tabs";
    nav.setAttribute("aria-label", `${panel.id} sections`);
    nav.setAttribute("role", "tablist");

    items.forEach((item, index) => {
      item.section.classList.add("content-section");
      item.section.dataset.contentSection = item.key;

      const button = document.createElement("button");
      button.className = "content-tab";
      button.type = "button";
      button.textContent = item.label;
      button.dataset.contentTab = item.key;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", index === 0 ? "true" : "false");
      button.tabIndex = index === 0 ? 0 : -1;

      button.addEventListener("click", () => {
        activateContentTab(panel, item.key);
        window.history.replaceState(window.history.state || {}, "", window.location.pathname);
      });

      button.addEventListener("keydown", (event) => {
        const buttons = [...nav.querySelectorAll(".content-tab")];
        const currentIndex = buttons.indexOf(button);
        let nextIndex = currentIndex;

        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          nextIndex = (currentIndex + 1) % buttons.length;
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = buttons.length - 1;
        } else {
          return;
        }

        event.preventDefault();
        buttons[nextIndex].focus();
        buttons[nextIndex].click();
      });

      nav.appendChild(button);
    });

    panel.querySelector(".mod-hero")?.appendChild(nav);
    activateContentTab(panel, activeContentTabs.get(panel.id) || items[0].key);
  });
}

function activateContentTabForTarget(target, shouldScroll = false) {
  const panel = target?.closest(".tab-panel");
  const section = target?.closest(".content-section");
  if (!panel || !section) return false;

  return activateContentTab(panel, section.dataset.contentSection, shouldScroll);
}

function withInstantScroll(callback) {
  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  const previousBodyBehavior = document.body.style.scrollBehavior;

  root.classList.add("is-instant-scroll");
  root.style.scrollBehavior = "auto";
  document.body.style.scrollBehavior = "auto";
  callback();

  window.requestAnimationFrame(() => {
    root.style.scrollBehavior = previousBehavior;
    document.body.style.scrollBehavior = previousBodyBehavior;
    root.classList.remove("is-instant-scroll");
  });
}

function scrollToPageTop() {
  withInstantScroll(() => {
    const forceTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    forceTop();
    window.requestAnimationFrame(forceTop);
    window.requestAnimationFrame(() => window.requestAnimationFrame(forceTop));
    window.setTimeout(forceTop, 0);
  });
}

function getScrollProgress() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  return maxScroll > 0 ? window.scrollY / maxScroll : 0;
}

function updateBackToTopButton() {
  if (!backToTopButton) return;

  const isVisible = getScrollProgress() >= 0.5;
  backToTopButton.classList.toggle("is-visible", isVisible);
  backToTopButton.hidden = !isVisible;
}

function setMetaContent(selector, content) {
  const meta = document.head.querySelector(selector);
  if (meta) meta.setAttribute("content", content);
}

function updatePageMetadata(targetId) {
  const metadata = tabMetadata[targetId];
  if (!metadata) return;

  const route = tabToRoute[targetId] || "/";
  const url = `${siteUrl}${route}`;

  document.title = metadata.title;
  setMetaContent('meta[name="description"]', metadata.description);
  setMetaContent('meta[name="theme-color"]', metadata.themeColor);
  setMetaContent('meta[property="og:title"]', metadata.title);
  setMetaContent('meta[property="og:description"]', metadata.description);
  setMetaContent('meta[property="og:url"]', url);
  setMetaContent('meta[property="og:image"]', metadata.image);
  setMetaContent('meta[name="twitter:title"]', metadata.title);
  setMetaContent('meta[name="twitter:description"]', metadata.description);
  setMetaContent('meta[name="twitter:image"]', metadata.image);
}

function activateTab(targetId, updateUrl = true, scrollMode = "top") {
  let activeTheme = "";
  let activePanel = null;

  tabs.forEach((tab) => {
    const isActive = tab.dataset.tab === targetId;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
    if (isActive) activeTheme = tab.dataset.theme || "";
  });

  panels.forEach((panel) => {
    const isActive = panel.id === targetId;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
    if (isActive) activePanel = panel;
  });

  activeTabId = targetId;
  if (activePanel) {
    activateContentTab(activePanel, activeContentTabs.get(activePanel.id));
  }

  updatePageMetadata(targetId);

  if (activeTheme) {
    applyTheme(activeTheme, hasSetInitialTheme);
    hasSetInitialTheme = true;
  }

  if (updateUrl && tabToRoute[targetId]) {
    const nextPath = tabToRoute[targetId];
    if (window.location.pathname !== nextPath) {
      window.history.pushState({ tab: targetId }, "", nextPath);
    }
  }

  if (scrollMode === "top") {
    scrollToPageTop();
  }

  updateBackToTopButton();
}

tabs.forEach((tab) => {
  tab.addEventListener("click", (event) => {
    event.preventDefault();

    const targetId = tab.dataset.tab;

    if (!targetId || targetId === getActiveTabId()) return;

    if (window.location.hash) {
      window.history.replaceState(window.history.state || {}, "", window.location.pathname);
    }

    activateTab(targetId, true, "top");
  });

  tab.addEventListener("keydown", (event) => {
    const tabList = [...tabs];
    const currentIndex = tabList.indexOf(tab);
    let nextIndex = currentIndex;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % tabList.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + tabList.length) % tabList.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabList.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    tabList[nextIndex].focus();
    tabList[nextIndex].click();
  });
});

if (backToTopButton) {
  backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", updateBackToTopButton, { passive: true });
  window.addEventListener("resize", updateBackToTopButton);
  updateBackToTopButton();
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

document.querySelectorAll(".copy-command").forEach((button) => {
  button.addEventListener("click", async () => {
    const text = button.closest(".command-box, .permission-box")?.querySelector("code")?.textContent.trim();
    if (!text) return;

    await copyText(text);
    const originalText = button.textContent;
    button.textContent = "Copied";
    window.setTimeout(() => {
      button.textContent = originalText;
    }, 1200);
  });
});

document.querySelectorAll(".command-item").forEach((item) => {
  const commandText = item.querySelector(".command-box code")?.textContent.trim();
  if (!commandText || item.querySelector(".command-title")) return;

  const title = document.createElement("h4");
  title.className = "command-title";
  title.textContent = createCommandTitle(commandText);
  item.prepend(title);
});

function createCommandTitle(commandText) {
  const ignoredRoots = new Set([
    "cbr",
    "cobblebattlerewards",
    "csr",
    "hunts",
    "rtp",
    "rtpbiome",
  ]);

  const words = commandText
    .split(/\s+/)
    .map((word) => word.replace(/^\//, ""))
    .filter((word) => word && !word.startsWith("<") && !word.startsWith("["))
    .filter((word) => !ignoredRoots.has(word.toLowerCase()))
    .slice(0, 2);

  const titleWords = words.length ? words : [commandText.replace(/^\//, "").split(/\s+/)[0]];

  return titleWords
    .join(" ")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function highlightJsonCode(text) {
  return escapeHtml(text).replace(
    /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\b\d+(?:\.\d+)?\b/g,
    (match, stringValue, keyColon, literalValue) => {
      if (stringValue) {
        const className = keyColon ? "json-key" : "json-string";
        return `<span class="${className}">${stringValue}</span>${keyColon || ""}`;
      }

      if (literalValue) {
        return `<span class="json-literal">${literalValue}</span>`;
      }

      return `<span class="json-number">${match}</span>`;
    },
  );
}

document.querySelectorAll("pre > code").forEach((code) => {
  const pre = code.parentElement;
  if (!pre || pre.closest(".code-shell")) return;

  const rawCode = code.textContent;
  code.innerHTML = highlightJsonCode(rawCode);

  const shell = document.createElement("div");
  shell.className = "code-shell";
  pre.parentNode.insertBefore(shell, pre);
  shell.appendChild(pre);

  const copyButton = document.createElement("button");
  copyButton.className = "copy-code";
  copyButton.type = "button";
  copyButton.textContent = "Copy";
  copyButton.addEventListener("click", async () => {
    await copyText(rawCode.trim());
    copyButton.textContent = "Copied";
    window.setTimeout(() => {
      copyButton.textContent = "Copy";
    }, 1200);
  });

  shell.appendChild(copyButton);
});

function updateCodeShellScrollState() {
  document.querySelectorAll(".code-shell").forEach((shell) => {
    const pre = shell.querySelector("pre");
    if (!pre) return;

    shell.classList.toggle(
      "has-scrollbar",
      pre.scrollHeight > pre.clientHeight || pre.scrollWidth > pre.clientWidth,
    );
  });
}

updateCodeShellScrollState();
window.addEventListener("resize", updateCodeShellScrollState);

function setupHeroActionGradients() {
  document.querySelectorAll(".hero-actions").forEach((group) => {
    const buttons = [...group.querySelectorAll(".button-link")];
    const lastIndex = Math.max(buttons.length - 1, 1);

    buttons.forEach((button, index) => {
      const progress = Math.round((index / lastIndex) * 100);
      button.style.setProperty("--action-position", `${progress}%`);
    });
  });
}

function scrollToPageSection(target) {
  const activePanel = document.querySelector(".tab-panel.is-active");
  if (!target || !activePanel || !activePanel.contains(target)) return false;

  activateContentTabForTarget(target);
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

document.querySelectorAll(".hero-actions a[href^='#']").forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = decodeURIComponent(link.getAttribute("href").slice(1));
    const target = document.getElementById(targetId);

    if (!scrollToPageSection(target)) return;

    event.preventDefault();
    window.history.replaceState(window.history.state || {}, "", `${window.location.pathname}#${targetId}`);
  });
});

setupHeroActionGradients();
setupContentTabs();

function activateRoute() {
  const redirectedPath = sessionStorage.getItem("wiki:path");

  if (redirectedPath) {
    sessionStorage.removeItem("wiki:path");
    window.history.replaceState({}, "", redirectedPath);
  }

  const targetId = routeToTab[window.location.pathname] || routeToTab["/"];
  activateTab(targetId, false, window.location.hash ? "none" : "top");

  if (window.location.hash) {
    window.requestAnimationFrame(() => {
      const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      scrollToPageSection(target);
    });
  }
}

window.addEventListener("popstate", activateRoute);
activateRoute();

const MODRINTH_MOD_BASE_URL = "https://modrinth.com/mod/";
const MODRINTH_USER_AGENT = "Everlasting.mods-Wiki/1.0.0 (Minecraft mod documentation site; https://github.com/Hysocs/hysocs.github.io)";
const CURSEFORGE_STATS_URL = "assets/curseforge-stats.json";
const FALLBACK_CURSEFORGE_STATS = {
  cobblebattlerewards: {
    projectId: 1275662,
    slug: "cobblebattlerewards",
    url: "https://www.curseforge.com/minecraft/mc-mods/cobblebattlerewards",
    downloads: 16418,
    updated: "2025-12-12",
  },
  cobblehunts: {
    projectId: 1276069,
    slug: "cobblehunts",
    url: "https://www.curseforge.com/minecraft/mc-mods/cobblehunts",
    downloads: 3827,
    updated: "2025-12-12",
  },
  blanketrtp: {
    projectId: 1394114,
    slug: "b-rtp",
    url: "https://www.curseforge.com/minecraft/mc-mods/b-rtp",
    downloads: 165,
    updated: "2026-05-18",
  },
  "e-utils": {
    projectId: 1275646,
    slug: "e-utils",
    url: "https://www.curseforge.com/minecraft/mc-mods/e-utils",
    downloads: 336542,
    updated: "2026-05-16",
  },
};
const modrinthVersionCache = new Map();
const modrinthProjectCache = new Map();
const modrinthVersionByIdCache = new Map();
let curseforgeStatsPromise = null;
const skippedRequirementProjects = new Set(["fabric-loader", "fabricloader", "minecraft"]);
const requirementProjectAliases = {
  everlastingutils: "e-utils",
  "everlasting-utils": "e-utils",
  eutils: "e-utils",
};

function normalizeRequirementSlug(slug) {
  const normalized = String(slug || "").trim().toLowerCase();
  return requirementProjectAliases[normalized] || normalized;
}

function isSkippedRequirement(projectOrSlug) {
  const slug = normalizeRequirementSlug(projectOrSlug?.slug || projectOrSlug?.id || projectOrSlug);
  const title = String(projectOrSlug?.title || projectOrSlug?.name || "").trim().toLowerCase().replace(/\s+/g, "-");
  return skippedRequirementProjects.has(slug) || skippedRequirementProjects.has(title);
}

function getProjectLinkTarget(project) {
  const target = String(project?.slug || project?.id || "").trim();
  if (!target || isSkippedRequirement(target)) return "";
  if (/^https?:\/\//i.test(target)) return "";
  if (/\s|[<>"']/g.test(target)) return "";
  return `${MODRINTH_MOD_BASE_URL}${encodeURIComponent(target)}`;
}

async function fetchModrinth(url) {
  try {
    return await fetch(url, {
      headers: {
        "User-Agent": MODRINTH_USER_AGENT,
      },
    });
  } catch (error) {
    console.info("Browser blocked the custom Modrinth User-Agent header; retrying without it.", error);
    return fetch(url);
  }
}

async function getLatestModrinthVersion(project) {
  if (!project) return null;

  if (!modrinthVersionCache.has(project)) {
    const params = new URLSearchParams({
      loaders: JSON.stringify(["fabric"]),
      game_versions: JSON.stringify(["1.21.1"]),
      include_changelog: "false",
    });

    modrinthVersionCache.set(
      project,
      fetchModrinth(`https://api.modrinth.com/v2/project/${encodeURIComponent(project)}/version?${params}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Modrinth returned ${response.status}`);
          }
          return response.json();
        })
        .then((versions) => versions.find((version) => version.status === "listed") || versions[0] || null)
        .catch((error) => {
          console.info(`Could not load Modrinth version for ${project}:`, error);
          return null;
        }),
    );
  }

  return modrinthVersionCache.get(project);
}

async function loadModrinthVersion(element) {
  const project = element.dataset.modrinthProject;
  const fallbackVersion = element.dataset.fallbackVersion || element.textContent.trim();
  const note = element.parentElement.querySelector(".version-note");

  if (!project) return;

  const latestListedVersion = await getLatestModrinthVersion(project);

  if (!latestListedVersion) {
    element.textContent = fallbackVersion;
    if (note) {
      note.textContent = "Modrinth version unavailable";
    }
    return;
  }

  element.textContent = latestListedVersion.version_number;
  if (note) note.textContent = "";
}

document.querySelectorAll(".modrinth-version").forEach(loadModrinthVersion);

async function getModrinthProject(projectIdOrSlug) {
  const slug = normalizeRequirementSlug(projectIdOrSlug);
  if (!slug || isSkippedRequirement(slug)) return null;

  if (!modrinthProjectCache.has(slug)) {
    modrinthProjectCache.set(
      slug,
      fetchModrinth(`https://api.modrinth.com/v2/project/${encodeURIComponent(slug)}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Modrinth returned ${response.status}`);
          }
          return response.json();
        })
        .catch((error) => {
          console.info(`Could not load Modrinth project for ${slug}:`, error);
          return null;
        }),
    );
  }

  return modrinthProjectCache.get(slug);
}

function formatModrinthDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const formattedDate = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

  const relativeDays = formatRelativeDays(date);
  return relativeDays ? `${formattedDate} (${relativeDays})` : formattedDate;
}

function formatRelativeDays(date) {
  const today = new Date();
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const days = Math.round((todayStart - dateStart) / 86400000);
  const absoluteDays = Math.abs(days);

  if (days < 0) {
    return `in ${absoluteDays} ${absoluteDays === 1 ? "day" : "days"}`;
  }

  return `${days} ${days === 1 ? "day" : "days"} ago`;
}

function formatCompactNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";

  return new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: number >= 1000 ? 1 : 0,
  }).format(number);
}

function formatWholeNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";

  return new Intl.NumberFormat().format(number);
}

async function getCurseForgeStats() {
  if (!curseforgeStatsPromise) {
    curseforgeStatsPromise = fetch(CURSEFORGE_STATS_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`CurseForge stats returned ${response.status}`);
        }
        return response.json();
      })
      .catch((error) => {
        console.info("Could not load local CurseForge stats:", error);
        return FALLBACK_CURSEFORGE_STATS;
      });
  }

  return curseforgeStatsPromise;
}

async function getCurseForgeProject(projectIdOrSlug) {
  const slug = normalizeRequirementSlug(projectIdOrSlug);
  if (!slug) return null;

  const stats = await getCurseForgeStats();
  return stats[slug] || null;
}

async function loadProjectUpdated(element) {
  const project = await getModrinthProject(element.dataset.modrinthProject);
  const updated = formatModrinthDate(project?.updated);
  element.textContent = updated || "Unavailable";
}

async function loadProjectDownloads(element) {
  const modrinthProject = await getModrinthProject(element.dataset.modrinthProject);
  const curseforgeProject = await getCurseForgeProject(element.dataset.curseforgeProject || element.dataset.modrinthProject);
  const modrinthDownloads = Number(modrinthProject?.downloads);
  const curseforgeDownloads = Number(curseforgeProject?.downloads);
  const hasModrinthDownloads = Number.isFinite(modrinthDownloads);
  const hasCurseforgeDownloads = Number.isFinite(curseforgeDownloads);
  const totalDownloads =
    (hasModrinthDownloads ? modrinthDownloads : 0) +
    (hasCurseforgeDownloads ? curseforgeDownloads : 0);

  if (!totalDownloads) {
    element.textContent = "Unavailable";
    return;
  }

  const sourceCounts = [
    hasModrinthDownloads ? `Modrinth ${formatCompactNumber(modrinthDownloads)}` : "",
    hasCurseforgeDownloads ? `CurseForge ${formatCompactNumber(curseforgeDownloads)}` : "",
  ].filter(Boolean);

  element.classList.add("download-count");
  element.title = [
    hasModrinthDownloads ? `Modrinth: ${formatWholeNumber(modrinthDownloads)}` : "",
    hasCurseforgeDownloads ? `CurseForge: ${formatWholeNumber(curseforgeDownloads)}` : "",
  ].filter(Boolean).join(" + ");
  element.replaceChildren(
    Object.assign(document.createElement("strong"), {
      textContent: `${formatCompactNumber(totalDownloads)} total`,
    }),
  );

  if (sourceCounts.length > 1) {
    element.append(
      Object.assign(document.createElement("small"), {
        textContent: sourceCounts.join(" + "),
      }),
    );
  }
}

document.querySelectorAll(".modrinth-updated").forEach(loadProjectUpdated);
document.querySelectorAll(".modrinth-downloads").forEach(loadProjectDownloads);

async function getModrinthVersionById(versionId) {
  const id = String(versionId || "").trim();
  if (!id) return null;

  if (!modrinthVersionByIdCache.has(id)) {
    modrinthVersionByIdCache.set(
      id,
      fetchModrinth(`https://api.modrinth.com/v2/version/${encodeURIComponent(id)}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Modrinth returned ${response.status}`);
          }
          return response.json();
        })
        .catch((error) => {
          console.info(`Could not load Modrinth dependency version ${id}:`, error);
          return null;
        }),
    );
  }

  return modrinthVersionByIdCache.get(id);
}

function createRequirementText(name) {
  const span = document.createElement("span");
  span.className = "requirement-name";
  span.textContent = name || "Unknown requirement";
  return span;
}

function createRequirementLink(project, fallbackName) {
  const href = getProjectLinkTarget(project);
  const label = fallbackName || project?.title || project?.slug || project?.id || "Unknown requirement";

  if (!href) {
    return createRequirementText(label);
  }

  const link = document.createElement("a");
  link.className = "requirement-link";
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = label;
  return link;
}

function renderRequirementLinks(element, projects) {
  const fragment = document.createDocumentFragment();
  const uniqueProjects = [];
  const seen = new Set();

  projects.forEach((project) => {
    if (!project || isSkippedRequirement(project)) return;
    const key = project.id || project.slug || project.title;
    if (!key || seen.has(key)) return;
    seen.add(key);
    uniqueProjects.push(project);
  });

  uniqueProjects.forEach((project, index) => {
    if (index > 0) fragment.append(", ");
    fragment.append(createRequirementLink(project));
  });

  if (uniqueProjects.length) {
    element.replaceChildren(fragment);
  }
}

async function loadRequirementLink(element) {
  const rawSlug = element.dataset.modrinthRequirement;
  const slug = normalizeRequirementSlug(rawSlug);
  const fallbackName = element.textContent.trim();

  if (!slug || isSkippedRequirement(slug)) {
    element.remove();
    return;
  }

  const project = await getModrinthProject(slug);
  if (!project || isSkippedRequirement(project)) {
    element.replaceWith(createRequirementText(fallbackName));
    return;
  }

  element.replaceWith(createRequirementLink(project, fallbackName));
}

async function getDependencyProject(dependency) {
  if (dependency.project_id) {
    return getModrinthProject(dependency.project_id);
  }

  if (dependency.version_id) {
    const dependencyVersion = await getModrinthVersionById(dependency.version_id);
    if (dependencyVersion?.project_id) {
      return getModrinthProject(dependencyVersion.project_id);
    }
  }

  return null;
}

async function loadVersionRequirements(element) {
  const project = element.dataset.modrinthRequirementsFor;
  if (!project) return;

  const latestVersion = await getLatestModrinthVersion(project);
  const dependencies = latestVersion?.dependencies || [];
  const requiredDependencies = dependencies.filter((dependency) => dependency.dependency_type === "required");

  if (!requiredDependencies.length) {
    element.querySelectorAll("[data-modrinth-requirement]").forEach(loadRequirementLink);
    return;
  }

  const projects = (await Promise.all(requiredDependencies.map(getDependencyProject)))
    .filter((dependencyProject) => dependencyProject && !isSkippedRequirement(dependencyProject));

  if (!projects.length) {
    element.querySelectorAll("[data-modrinth-requirement]").forEach(loadRequirementLink);
    return;
  }

  renderRequirementLinks(element, projects);
}

document.querySelectorAll("[data-modrinth-requirements-for]").forEach(loadVersionRequirements);
document
  .querySelectorAll("[data-modrinth-requirement]")
  .forEach((element) => {
    if (!element.closest("[data-modrinth-requirements-for]")) {
      loadRequirementLink(element);
    }
  });

document.addEventListener("click", (event) => {
  const link = event.target.closest("a.requirement-link");
  if (!link) return;

  if (!link.href || !link.href.startsWith(MODRINTH_MOD_BASE_URL)) {
    event.preventDefault();
  }
});


// Under construction console showcase
const constructionGame = document.querySelector("[data-construction-game]");
const loadingLog = document.querySelector("[data-loading-log]");
const loadingBar = document.querySelector("[data-loading-bar]");
const secretGrid = document.querySelector("[data-secret-grid]");
const sparseGridHeader = document.querySelector("[data-sparse-grid]");

const constructionLogs = [
  { level: "boot", text: "Booting everlasting_dev_server.exe... please pretend this is stable.", type: "normal" },
  { level: "cfg", text: "Added <strong>407</strong> more JSONC options because one toggle looked lonely.", type: "danger" },
  { level: "cfg", text: "Split config files detected. Migration scare has been scheduled for next reboot.", type: "danger" },
  { level: "cfg", text: "Unsplit config files detected. Single giant JSONC blob restored for tradition.", type: "weird" },
  { level: "meme", text: "Renamed CobbleSpawnRegions to <strong>Large Area Of Mons</strong>. Wiki links have entered witness protection.", type: "weird" },
  { level: "csr", text: "<strong>/csr reload</strong> completed. Please now run /csr check, /csr info, and then ask why nothing changed.", type: "normal" },
  { level: "hunts", text: "CobbleHunts generated a hunt pool so configurable it started hunting the config editor.", type: "weird" },
  { level: "br", text: "CobbleBattleRewards added rewards for winning, losing, existing, and opening the config file.", type: "normal" },
  { level: "rtp", text: "B-RTP renamed internally to <strong>Blanket Randomly Teleports Probably</strong>. Safety not guaranteed, vibes guaranteed.", type: "weird" },
  { level: "utils", text: "EverlastingUtils now requires <strong>EverlastingUtilsUtils</strong>. This dependency is also server-side. Probably.", type: "danger" },
  { level: "utils", text: "EverlastingUtilsUtils requires EverlastingUtils. Circular dependency achieved. Ship it.", type: "danger" },
  { level: "cmd", text: "Command format updated from readable to <strong>/mod subcommand thing value optionalThing maybeTrue</strong>.", type: "weird" },
  { level: "cmd", text: "Added permission node: <strong>everlasting.command.admin.reload.reload.confirm.real</strong>.", type: "danger" },
  { level: "free", text: "Price check complete: mods are still free. Business department found crying in a JSONC comment.", type: "success" },
  { level: "free", text: "Paid version canceled because then I would have to provide responsible release dates.", type: "normal" },
  { level: "break", text: "Developer visibility check failed. Last seen months ago adding one checkbox to a GUI.", type: "danger" },
  { level: "break", text: "Random break detected. Marking project as 'not abandoned, just ominously quiet'.", type: "weird" },
  { level: "other", text: "Scanning for other projects... none found. Definitely not working on anything else. Do not look behind the wiki.", type: "normal" },
  { level: "raid", text: "Cobbleraids preview mounted below. This is the only leak the console is legally allowed to admit.", type: "success" },
  { level: "cfg", text: "Config comments preserved. Just kidding, migration ate three of them and blamed formatting.", type: "danger" },
  { level: "patch", text: "Patch note: fixed typo, accidentally invented a new system, documentation pending.", type: "weird" },
  { level: "warn", text: "Large Area Of Mons requesting one more GUI screen before release. It says this is the last one.", type: "danger" },
  { level: "info", text: "Loading stuck at <strong>99%</strong>. This is intended behavior and counts as suspense.", type: "normal" },
];

function addConstructionLogLine(entry) {
  if (!loadingLog) return;

  const line = document.createElement("div");
  line.className = `loading-log-line is-${entry.type || "normal"}`;
  line.innerHTML = `<span>${new Date().toLocaleTimeString([], { hour12: false })}</span><em>${entry.level || "log"}</em><span>${entry.text}</span>`;
  loadingLog.appendChild(line);

  while (loadingLog.children.length > 16) {
    loadingLog.firstElementChild?.remove();
  }
}

function startConstructionLoader() {
  if (!constructionGame || !loadingLog) return;

  let index = 0;
  addConstructionLogLine(constructionLogs[index]);
  if (loadingBar) loadingBar.style.width = "7%";

  window.setInterval(() => {
    index = (index + 1) % constructionLogs.length;
    addConstructionLogLine(constructionLogs[index]);

    if (loadingBar) {
      const fakeProgress = Math.min(99, 7 + ((index + 1) / constructionLogs.length) * 92);
      loadingBar.style.width = `${fakeProgress}%`;
    }
  }, 1150);
}

function startSecretVideos() {
  secretGrid?.querySelectorAll("video").forEach((video) => {
    video.play?.().catch(() => {});
  });
}

function spawnSparseGridSquare() {
  if (!sparseGridHeader) return;

  const square = document.createElement("span");
  square.className = "sparse-grid-square";

  const bounds = sparseGridHeader.getBoundingClientRect();
  const cell = 22;
  const columns = Math.max(1, Math.floor(bounds.width / cell));
  const rows = Math.max(1, Math.floor(bounds.height / cell));

  square.style.left = `${Math.floor(Math.random() * columns) * cell}px`;
  square.style.top = `${Math.floor(Math.random() * rows) * cell}px`;
  square.style.setProperty("--grid-life", `${3200 + Math.random() * 3200}ms`);

  sparseGridHeader.appendChild(square);
  square.addEventListener("animationend", () => square.remove(), { once: true });
}

function startSparseGrid() {
  if (!sparseGridHeader) return;
  window.setInterval(() => {
    if (Math.random() < 0.72) spawnSparseGridSquare();
  }, 900);
}

startConstructionLoader();
startSecretVideos();
startSparseGrid();
