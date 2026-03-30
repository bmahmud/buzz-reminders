$base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
$bytes = [Convert]::FromBase64String($base64)
$dir = Join-Path (Join-Path $PSScriptRoot '..') 'assets\images'
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$names = @('icon.png', 'favicon.png', 'splash-icon.png', 'adaptive-icon.png')
foreach ($name in $names) {
  $path = Join-Path $dir $name
  [IO.File]::WriteAllBytes($path, $bytes)
}
