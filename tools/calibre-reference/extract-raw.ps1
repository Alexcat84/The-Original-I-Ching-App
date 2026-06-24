# Optional Calibre raw export from manifest EPUBs (Windows).
# Requires Calibre: https://calibre-ebook.com/
$ErrorActionPreference = "Stop"
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$ManifestPath = Join-Path $Root "tools\source-pdfs\manifest.json"
$OutDir = Join-Path $Root "tools\output\calibre-reference"

function Find-EbookConvert {
  $cmd = Get-Command ebook-convert -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  foreach ($p in @(
    "${env:ProgramFiles}\Calibre2\ebook-convert.exe",
    "${env:ProgramFiles}\Calibre\ebook-convert.exe",
    "${env:ProgramFiles(x86)}\Calibre2\ebook-convert.exe"
  )) {
    if (Test-Path $p) { return $p }
  }
  throw "ebook-convert not found. Install Calibre and re-run."
}

$manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json
$sourceDir = Join-Path $Root "tools\source-pdfs"
$ebookConvert = Find-EbookConvert
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$sources = @(
  @{ id = "wilhelm"; file = $manifest.sources.wilhelm.fileCrossCheckEpub },
  @{ id = "legge"; file = $manifest.sources.legge.fileCrossCheckEpub }
)

foreach ($src in $sources) {
  $epub = Join-Path $sourceDir $src.file
  if (-not (Test-Path $epub)) {
    Write-Warning "Missing EPUB: $epub"
    continue
  }
  $txtOut = Join-Path $OutDir "$($src.id)-raw.txt"
  $htmlOut = Join-Path $OutDir "$($src.id)-raw.html"
  Write-Host "Converting $($src.id) -> TXT"
  & $ebookConvert $epub $txtOut --pretty-print --no-chapters-in-toc --chapter / --insert-metadata
  Write-Host "Converting $($src.id) -> HTML"
  & $ebookConvert $epub $htmlOut --pretty-print --chapter /
  Write-Host "Wrote $txtOut and $htmlOut"
}

Write-Host "Done. Compare with tools/output/epub-full/*.json via npm run extract:epub-full"
