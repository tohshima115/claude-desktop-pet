# キャラの表情つきで Windows の通知を出す。送り主は「Claude」、1行目に session のタイトル、2行目にひとこと。
# 使い方:
#   powershell.exe -NoProfile -ExecutionPolicy Bypass -File notify.ps1 -Body "ひとこと" -Mood happy -SessionId <id> -FallbackTitle "キャラ名" [-Force]
#   powershell.exe -NoProfile -ExecutionPolicy Bypass -File notify.ps1 -RegisterOnly
# Claude Desktop を前面で見ているときは出さない（-Force で必ず出す）。
# WinRT の通知 API を使うので、PowerShell 7 ではなく Windows PowerShell 5.1 で動かす。
# 日本語を含むので、このファイルは UTF-8（BOM つき）で保存する。
param(
  [string]$Body = '',
  [string]$Mood = 'normal',
  [string]$SessionId = '',
  [string]$FallbackTitle = 'Claude',
  [switch]$Force,
  [switch]$RegisterOnly
)

$ErrorActionPreference = 'Stop'

# どこまで進んだかを notify/ps1-trace.log に残す（最新の 100 行）
$tracePath = Join-Path $PSScriptRoot 'ps1-trace.log'
function Trace([string]$text) {
  try {
    $old = if (Test-Path $tracePath) { @(Get-Content -LiteralPath $tracePath -Encoding UTF8) } else { @() }
    $line = '{0} {1} {2}' -f [DateTime]::UtcNow.ToString('o'), $SessionId.Substring(0, [Math]::Min(8, $SessionId.Length)), $text
    (@($old) + $line | Select-Object -Last 100) | Set-Content -LiteralPath $tracePath -Encoding UTF8
  } catch {}
}
trap {
  Trace "error: $($_.Exception.Message)"
  exit 1
}

$iconDir = Join-Path $PSScriptRoot 'icons'
# Windows は、初めて見た送り主の名前とアイコンを覚える。アイコンを変えたら末尾の番号を上げる
$appId = 'ClaudeDesktopPet.Notify.v1'
$key = "HKCU:\Software\Classes\AppUserModelId\$appId"

# 送り主「Claude」を登録する。アイコンは、入っている Claude Desktop のロゴを使う（なければキャラの顔）
function Register-Sender {
  if (Test-Path $key) { return }
  $logo = Join-Path $iconDir 'normal.png'
  $package = Get-AppxPackage -Name 'Claude' -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($package) {
    $source = Join-Path $package.InstallLocation 'assets\Square44x44Logo.targetsize-256_altform-unplated.png'
    if (Test-Path -LiteralPath $source) {
      $logo = Join-Path $PSScriptRoot 'claude-logo.png'
      Copy-Item -LiteralPath $source -Destination $logo -Force
    }
  }
  New-Item -Path $key -Force | Out-Null
  Set-ItemProperty -Path $key -Name DisplayName -Value 'Claude'
  Set-ItemProperty -Path $key -Name IconUri -Value $logo
  Trace "registered sender icon=$logo"
}

Register-Sender
if ($RegisterOnly) { exit 0 }

Trace "start force=$Force mood=$Mood body=$Body"

if (-not $Force) {
  Add-Type -Namespace ClaudeDesktopPet -Name Win32 -MemberDefinition @'
[DllImport("user32.dll")] public static extern System.IntPtr GetForegroundWindow();
[DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(System.IntPtr hWnd, out uint processId);
'@
  $processId = 0
  [void][ClaudeDesktopPet.Win32]::GetWindowThreadProcessId([ClaudeDesktopPet.Win32]::GetForegroundWindow(), [ref]$processId)
  $foreground = Get-Process -Id $processId -ErrorAction SilentlyContinue
  if ($foreground -and $foreground.ProcessName -eq 'claude') {
    Trace 'skip: Claude is in the foreground'
    exit 0
  }
}

# session のタイトルは、会話の記録（~/.claude/projects/*/<id>.jsonl）の最後の custom-title 行にある
function Get-SessionTitle([string]$id) {
  if ($id -eq '') { return $null }
  $transcript = Get-ChildItem -Path (Join-Path $env:USERPROFILE '.claude\projects') -Filter "$id.jsonl" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $transcript) { return $null }
  $line = Select-String -LiteralPath $transcript.FullName -Pattern '"type":"custom-title"' | Select-Object -Last 1
  if (-not $line) { return $null }
  return ($line.Line | ConvertFrom-Json).customTitle
}

$title = $null
try { $title = Get-SessionTitle $SessionId } catch { $title = $null }
if ([string]::IsNullOrWhiteSpace($title)) { $title = $FallbackTitle }

$icon = Join-Path $iconDir "$Mood.png"
if (-not (Test-Path $icon)) {
  $icon = Join-Path $iconDir 'normal.png'
}
$iconUri = ([System.Uri]$icon).AbsoluteUri
$titleText = [System.Security.SecurityElement]::Escape($title)
$bodyText = [System.Security.SecurityElement]::Escape($Body)

[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null

# 1行目（太字）に session のタイトル、2行目にひとこと、横に表情のアイコン
$xml = New-Object Windows.Data.Xml.Dom.XmlDocument
$xml.LoadXml(@"
<toast>
  <visual>
    <binding template="ToastGeneric">
      <text>$titleText</text>
      <text>$bodyText</text>
      <image placement="appLogoOverride" hint-crop="circle" src="$iconUri"/>
    </binding>
  </visual>
</toast>
"@)

$toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($appId).Show($toast)
Trace "shown title=$title"
