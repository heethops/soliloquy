# Git 테스트 스크립트

Write-Host "GitHub Desktop Git 경로 찾기 테스트..." -ForegroundColor Cyan
Write-Host ""

# GitHub Desktop의 Git 찾기
$gitPath = $null
$possiblePaths = @(
    "$env:LOCALAPPDATA\GitHubDesktop\app-*\resources\app\git\cmd",
    "C:\Program Files\Git\cmd",
    "C:\Program Files (x86)\Git\cmd"
)

foreach ($basePath in $possiblePaths) {
    $gitDirs = Get-ChildItem -Path $basePath -ErrorAction SilentlyContinue | Sort-Object -Descending
    foreach ($gitDir in $gitDirs) {
        $testGit = Join-Path $gitDir.FullName "git.exe"
        if (Test-Path $testGit) {
            $gitPath = $testGit
            $env:PATH = "$($gitDir.FullName);$env:PATH"
            Write-Host "✅ Git 발견: $testGit" -ForegroundColor Green
            $gitVersion = & $gitPath --version 2>&1
            Write-Host "   버전: $gitVersion" -ForegroundColor Gray
            break
        }
    }
    if ($gitPath) { break }
}

if ($gitPath) {
    Write-Host ""
    Write-Host "✅ Git이 정상적으로 작동합니다!" -ForegroundColor Green
    Write-Host ""
    Write-Host "다음 단계:" -ForegroundColor Yellow
    Write-Host "1. GitHub Desktop에서 이 폴더를 저장소로 추가하거나" -ForegroundColor White
    Write-Host "2. auto-upload.ps1를 실행하면 자동으로 저장소를 초기화합니다" -ForegroundColor White
} else {
    Write-Host "❌ Git을 찾을 수 없습니다." -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit"

