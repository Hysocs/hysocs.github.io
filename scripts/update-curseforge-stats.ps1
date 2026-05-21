param(
  [string]$OutputPath = "assets/curseforge-stats.json"
)

$ErrorActionPreference = "Stop"

$apiKey = $env:CURSEFORGE_API_KEY
if ([string]::IsNullOrWhiteSpace($apiKey)) {
  throw "Set CURSEFORGE_API_KEY before running this script."
}

$projects = @(
  @{ key = "cobblebattlerewards"; projectId = 1275662; slug = "cobblebattlerewards"; url = "https://www.curseforge.com/minecraft/mc-mods/cobblebattlerewards" },
  @{ key = "cobblehunts"; projectId = 1276069; slug = "cobblehunts"; url = "https://www.curseforge.com/minecraft/mc-mods/cobblehunts" },
  @{ key = "blanketrtp"; projectId = 1394114; slug = "b-rtp"; url = "https://www.curseforge.com/minecraft/mc-mods/b-rtp" },
  @{ key = "e-utils"; projectId = 1275646; slug = "e-utils"; url = "https://www.curseforge.com/minecraft/mc-mods/e-utils" }
)

$headers = @{
  "x-api-key" = $apiKey
  "Accept" = "application/json"
}

$stats = [ordered]@{}

foreach ($project in $projects) {
  $response = Invoke-RestMethod `
    -Uri "https://api.curseforge.com/v1/mods/$($project.projectId)" `
    -Headers $headers

  $mod = $response.data
  $stats[$project.key] = [ordered]@{
    projectId = $project.projectId
    slug = $project.slug
    url = $project.url
    downloads = [int]$mod.downloadCount
    updated = ([datetime]$mod.dateModified).ToString("yyyy-MM-dd")
  }
}

$json = $stats | ConvertTo-Json -Depth 4
$json | Set-Content -LiteralPath $OutputPath -Encoding UTF8
