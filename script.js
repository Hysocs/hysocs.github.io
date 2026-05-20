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

  document.body.classList.remove("theme-regions-page", "theme-battle-page", "theme-hunts-page", "theme-rtp-page");
  if (activeTheme) document.body.classList.add(activeTheme);

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
