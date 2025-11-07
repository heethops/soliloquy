@echo off
REM GitHub 자동 업로드 시작 스크립트
REM 이 파일을 더블클릭하면 파일 변경 감지가 시작됩니다

echo ========================================
echo GitHub 자동 업로드 시작
echo ========================================
echo.

REM PowerShell 스크립트 실행
powershell.exe -ExecutionPolicy Bypass -File "%~dp0auto-upload.ps1"

pause

