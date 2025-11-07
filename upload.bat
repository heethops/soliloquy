@echo off
echo ========================================
echo GitHub 자동 업로드 시작...
echo ========================================
echo.

REM 변경사항 추가
echo [1/3] 변경사항 추가 중...
git add .
if %errorlevel% neq 0 (
    echo 오류: git add 실패
    pause
    exit /b 1
)

REM 커밋 (현재 시간 포함)
echo [2/3] 커밋 중...
for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set mydate=%%c-%%a-%%b
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set mytime=%%a:%%b
git commit -m "자동 업로드: %mydate% %mytime%"
if %errorlevel% neq 0 (
    echo 경고: 커밋할 변경사항이 없거나 커밋 실패
)

REM GitHub에 푸시
echo [3/3] GitHub에 푸시 중...
git push origin main
if %errorlevel% neq 0 (
    echo 오류: git push 실패
    echo 브랜치 이름이 'main'이 아닐 수 있습니다. 'master'를 시도합니다...
    git push origin master
    if %errorlevel% neq 0 (
        echo 오류: git push 실패
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo ✅ 업로드 완료!
echo ========================================
pause

