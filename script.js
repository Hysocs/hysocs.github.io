const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".tab-panel");
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
};

const tabToRoute = {
  cobblespawnregions: "/cobblespawnregions",
  cobblebattlerewards: "/cobblebattlerewards",
  cobblehunts: "/cobblehunts",
  blanketrtp: "/blanketrtp",
};

const sidebarToggle = document.querySelector(".sidebar-toggle");

function setSidebarCollapsed(isCollapsed) {
  document.body.classList.toggle("is-sidebar-collapsed", isCollapsed);

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

function activateTab(targetId, updateUrl = true) {
  let activeTheme = "";

  tabs.forEach((tab) => {
    const isActive = tab.dataset.tab === targetId;
    tab.classList.toggle("is-active", isActive);
    if (isActive) activeTheme = tab.dataset.theme || "";
  });

  panels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === targetId);
  });

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
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activateTab(tab.dataset.tab);
  });
});

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

function activateRoute() {
  const redirectedPath = sessionStorage.getItem("wiki:path");
  if (redirectedPath) {
    sessionStorage.removeItem("wiki:path");
    window.history.replaceState({}, "", redirectedPath);
  }

  const targetId = routeToTab[window.location.pathname] || routeToTab["/"];
  activateTab(targetId, false);
}

window.addEventListener("popstate", activateRoute);
activateRoute();

async function loadModrinthVersion(element) {
  const project = element.dataset.modrinthProject;
  const fallbackVersion = element.dataset.fallbackVersion || element.textContent.trim();
  const note = element.parentElement.querySelector(".version-note");

  if (!project) return;

  const params = new URLSearchParams({
    loaders: JSON.stringify(["fabric"]),
    game_versions: JSON.stringify(["1.21.1"]),
    include_changelog: "false",
  });

  try {
    const response = await fetch(`https://api.modrinth.com/v2/project/${project}/version?${params}`);

    if (!response.ok) {
      throw new Error(`Modrinth returned ${response.status}`);
    }

    const versions = await response.json();
    const latestListedVersion = versions.find((version) => version.status === "listed") || versions[0];

    if (!latestListedVersion) {
      throw new Error("No public Modrinth versions found");
    }

    element.textContent = latestListedVersion.version_number;
    if (note) {
      note.textContent = `Latest on Modrinth for ${latestListedVersion.game_versions.join(", ")}`;
    }
  } catch (error) {
    element.textContent = fallbackVersion;
    if (note) {
      note.textContent = "Modrinth version unavailable";
    }
    console.info(`Could not load Modrinth version for ${project}:`, error);
  }
}

document.querySelectorAll(".modrinth-version").forEach(loadModrinthVersion);
