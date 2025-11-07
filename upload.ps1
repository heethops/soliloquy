# GitHub 자동 업로드 스크립트 (PowerShell)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GitHub 자동 업로드 시작..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 변경사항 추가
Write-Host "[1/3] 변경사항 추가 중..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "오류: git add 실패" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# 커밋 (현재 시간 포함)
Write-Host "[2/3] 커밋 중..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "자동 업로드: $timestamp"
if ($LASTEXITCODE -ne 0) {
    Write-Host "경고: 커밋할 변경사항이 없거나 커밋 실패" -ForegroundColor Yellow
}

# GitHub에 푸시
Write-Host "[3/3] GitHub에 푸시 중..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "브랜치 이름이 'main'이 아닐 수 있습니다. 'master'를 시도합니다..." -ForegroundColor Yellow
    git push origin master
    if ($LASTEXITCODE -ne 0) {
        Write-Host "오류: git push 실패" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ 업로드 완료!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Read-Host "Press Enter to exit"

