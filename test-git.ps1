# Git 테스트 스크립트

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Git 연결 테스트" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Git 경로 찾기
$gitPath = $null

# 1. PATH에서 Git 찾기
Write-Host "[1/3] PATH에서 Git 찾는 중..." -ForegroundColor Yellow
try {
    $gitVersion = git --version 2>&1
    if ($LASTEXITCODE -eq 0 -or $gitVersion -like "*git version*") {
        $gitPath = "git"
        Write-Host "✅ Git 발견 (PATH): $gitVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ PATH에 Git 없음" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ PATH에 Git 없음" -ForegroundColor Red
}

# 2. GitHub Desktop의 Git 찾기
if (-not $gitPath) {
    Write-Host "[2/3] GitHub Desktop에서 Git 찾는 중..." -ForegroundColor Yellow
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
                $gitVersion = & $gitPath --version 2>&1
                Write-Host "✅ Git 발견 (GitHub Desktop): $gitVersion" -ForegroundColor Green
                Write-Host "   경로: $testGit" -ForegroundColor Gray
                # PATH에 추가 (이 세션에서만)
                $env:PATH = "$($gitDir.FullName);$env:PATH"
                break
            }
        }
        if ($gitPath) { break }
    }
}

if (-not $gitPath) {
    Write-Host ""
    Write-Host "❌ 오류: Git을 찾을 수 없습니다!" -ForegroundColor Red
    Write-Host ""
    Write-Host "해결 방법:" -ForegroundColor Yellow
    Write-Host "1. PowerShell을 재시작해보세요" -ForegroundColor White
    Write-Host "2. GitHub Desktop이 제대로 설치되었는지 확인하세요" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "[3/3] Git 저장소 확인 중..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "✅ Git 저장소 발견됨" -ForegroundColor Green
    
    # 원격 저장소 확인
    $remote = git remote get-url origin 2>$null
    if ($remote) {
        Write-Host "✅ 원격 저장소: $remote" -ForegroundColor Green
    } else {
        Write-Host "⚠️  원격 저장소가 설정되지 않았습니다" -ForegroundColor Yellow
    }
    
    # 브랜치 확인
    $branch = git branch --show-current 2>$null
    if ($branch) {
        Write-Host "✅ 현재 브랜치: $branch" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  Git 저장소가 초기화되지 않았습니다" -ForegroundColor Yellow
    Write-Host "   'git init' 명령어로 초기화하거나 GitHub Desktop에서 저장소를 열어주세요" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ 테스트 완료!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "다음 단계:" -ForegroundColor Cyan
Write-Host "1. Git이 발견되었다면: .\auto-upload.ps1 실행 가능" -ForegroundColor White
Write-Host "2. 저장소가 없다면: GitHub Desktop에서 이 폴더를 저장소로 추가" -ForegroundColor White
Write-Host ""
