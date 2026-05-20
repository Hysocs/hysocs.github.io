const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".tab-panel");

function activateTab(targetId) {
  tabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.tab === targetId);
  });

  panels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === targetId);
  });
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activateTab(tab.dataset.tab);
  });
});

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
