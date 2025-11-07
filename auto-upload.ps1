# GitHub 자동 업로드 스크립트 (파일 변경 감지)
# 파일이 변경되면 자동으로 GitHub에 업로드합니다

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GitHub 자동 업로드 감시 시작..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "파일 변경을 감지하고 있습니다..." -ForegroundColor Yellow
Write-Host "종료하려면 Ctrl+C를 누르세요" -ForegroundColor Gray
Write-Host ""

# Git 경로 찾기
$gitPath = $null

# 1. PATH에서 Git 찾기
try {
    $gitVersion = git --version 2>&1
    if ($LASTEXITCODE -eq 0 -or $gitVersion -like "*git version*") {
        $gitPath = "git"
        Write-Host "✅ Git 발견 (PATH): $gitVersion" -ForegroundColor Green
    }
} catch {
    # PATH에 없으면 계속 찾기
}

# 2. GitHub Desktop의 Git 찾기
if (-not $gitPath) {
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
                # PATH에 추가 (이 세션에서만)
                $env:PATH = "$($gitDir.FullName);$env:PATH"
                break
            }
        }
        if ($gitPath) { break }
    }
}

if (-not $gitPath) {
    Write-Host "오류: Git을 찾을 수 없습니다!" -ForegroundColor Red
    Write-Host ""
    Write-Host "해결 방법:" -ForegroundColor Yellow
    Write-Host "1. PowerShell을 재시작해보세요 (GitHub Desktop 설치 후 PATH가 업데이트되었을 수 있습니다)" -ForegroundColor White
    Write-Host "2. 또는 Git for Windows를 별도로 설치하세요: https://git-scm.com/download/win" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Git 저장소 확인
if (-not (Test-Path ".git")) {
    Write-Host "경고: Git 저장소가 초기화되지 않았습니다." -ForegroundColor Yellow
    Write-Host ""
    $init = Read-Host "Git 저장소를 초기화하시겠습니까? (y/n)"
    if ($init -eq "y" -or $init -eq "Y") {
        git init
        Write-Host "Git 저장소가 초기화되었습니다." -ForegroundColor Green
        Write-Host ""
        Write-Host "다음 단계:" -ForegroundColor Yellow
        Write-Host "1. GitHub에서 새 저장소를 만드세요" -ForegroundColor White
        Write-Host "2. 다음 명령어로 연결하세요:" -ForegroundColor White
        Write-Host "   git remote add origin https://github.com/사용자명/저장소명.git" -ForegroundColor Cyan
        Write-Host ""
    } else {
        exit 0
    }
}

# 원격 저장소 확인
$remote = git remote get-url origin 2>$null
if (-not $remote) {
    Write-Host "경고: GitHub 원격 저장소가 설정되지 않았습니다." -ForegroundColor Yellow
    Write-Host ""
    $repoUrl = Read-Host "GitHub 저장소 URL을 입력하세요 (예: https://github.com/사용자명/저장소명.git)"
    if ($repoUrl) {
        git remote add origin $repoUrl
        Write-Host "원격 저장소가 설정되었습니다." -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "원격 저장소 설정이 취소되었습니다." -ForegroundColor Yellow
        exit 0
    }
}

# 업로드 함수
function Upload-ToGitHub {
    Write-Host ""
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 파일 변경 감지됨!" -ForegroundColor Cyan
    Write-Host "업로드 시작..." -ForegroundColor Yellow
    
    # 변경사항 추가
    git add . 2>&1 | Out-Null
    
    # 커밋
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $commitResult = git commit -m "자동 업로드: $timestamp" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "커밋 완료: $timestamp" -ForegroundColor Green
        
        # 푸시
        $pushResult = git push origin main 2>&1
        if ($LASTEXITCODE -ne 0) {
            # main 브랜치가 아니면 master 시도
            $pushResult = git push origin master 2>&1
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ GitHub 업로드 완료!" -ForegroundColor Green
        } else {
            Write-Host "경고: 푸시 실패 (인증 문제일 수 있습니다)" -ForegroundColor Yellow
            Write-Host $pushResult -ForegroundColor Red
        }
    } else {
        Write-Host "변경사항이 없거나 커밋 실패" -ForegroundColor Gray
    }
    
    Write-Host ""
}

# 파일 변경 감지 설정
$watcher = New-Object System.IO.FileSystemWatcher
# 현재 작업 디렉토리 사용 (스크립트 위치가 아닌 실행 위치)
$watcher.Path = Get-Location
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

# 제외할 파일/폴더 패턴
$excludePatterns = @('.git', 'node_modules', '.vscode', '.idea', '__pycache__', '.pytest_cache')

# 변경 감지 이벤트 핸들러
$action = {
    $path = $Event.SourceEventArgs.FullPath
    $name = $Event.SourceEventArgs.Name
    $changeType = $Event.SourceEventArgs.ChangeType
    
    # 제외 패턴 확인
    $shouldExclude = $false
    foreach ($pattern in $excludePatterns) {
        if ($path -like "*\$pattern\*" -or $name -eq $pattern) {
            $shouldExclude = $true
            break
        }
    }
    
    if (-not $shouldExclude) {
        # 디바운싱: 3초 대기 후 업로드 (여러 파일 동시 변경 대비)
        if ($script:uploadTimer) {
            $script:uploadTimer.Dispose()
        }
        $script:uploadTimer = New-Object System.Timers.Timer(3000)
        $script:uploadTimer.AutoReset = $false
        $script:uploadTimer.Add_Elapsed({
            Upload-ToGitHub
        })
        $script:uploadTimer.Start()
    }
}

# 이벤트 등록
Register-ObjectEvent -InputObject $watcher -EventName "Changed" -Action $action | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName "Created" -Action $action | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName "Deleted" -Action $action | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName "Renamed" -Action $action | Out-Null

Write-Host "✅ 파일 감시 시작됨!" -ForegroundColor Green
Write-Host "파일을 수정하면 자동으로 GitHub에 업로드됩니다." -ForegroundColor Gray
Write-Host ""

# 무한 대기
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    # 정리
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    Write-Host ""
    Write-Host "감시 종료됨." -ForegroundColor Yellow
}

