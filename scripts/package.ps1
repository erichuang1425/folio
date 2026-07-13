$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Push-Location $root
try {
  node scripts/validate.mjs
  if ($LASTEXITCODE -ne 0) { throw 'Validation failed.' }
  $dist = Join-Path $root 'dist'
  New-Item -ItemType Directory -Force -Path $dist | Out-Null
  $archive = Join-Path $dist 'tabento-3.1.1.zip'
  if (Test-Path -LiteralPath $archive) { Remove-Item -LiteralPath $archive }
  $files = @('_locales','icons','manifest.json','background.js','emoji-data.js','newtab.html','newtab.css','newtab.js','popup.html','popup.css','popup.js','suspended.html','suspended.js','themes.css','favicon.ico','LICENSE','PRIVACY.md','THIRD_PARTY_NOTICES.md')
  Compress-Archive -Path $files -DestinationPath $archive -CompressionLevel Optimal
  Write-Host "Created $archive"
} finally { Pop-Location }
