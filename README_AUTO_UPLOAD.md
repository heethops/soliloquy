# 🚀 GitHub 자동 업로드 사용 가이드

## ✅ 준비 사항

### 1. Git 설치 확인
현재 Git이 설치되어 있지 않습니다. 다음 중 하나를 설치하세요:

**옵션 A: Git for Windows (명령줄)**
- 다운로드: https://git-scm.com/download/win
- 설치 후 PowerShell을 재시작하세요

**옵션 B: GitHub Desktop (GUI, 추천)**
- 다운로드: https://desktop.github.com/
- 설치 후 GitHub 계정으로 로그인

### 2. GitHub 저장소 준비
1. GitHub.com에 로그인
2. 새 저장소 생성 (New Repository)
3. 저장소 URL 복사 (예: `https://github.com/사용자명/저장소명.git`)

## 🎯 사용 방법

### 방법 1: 자동 감지 모드 (파일 변경 시 자동 업로드)
```powershell
# PowerShell에서 실행
.\auto-upload.ps1
```

또는 `start-auto-upload.bat` 파일을 더블클릭

**동작 방식:**
- 파일을 저장하면 자동으로 감지
- 3초 대기 후 자동으로 커밋 및 푸시
- Ctrl+C로 종료

### 방법 2: 수동 업로드 (한 번만 실행)
```powershell
# PowerShell에서 실행
.\upload.ps1
```

또는 `upload.bat` 파일을 더블클릭

**동작 방식:**
- 현재 변경사항을 한 번만 업로드
- 업로드 후 종료

## 📋 처음 설정하기

### 1단계: Git 저장소 초기화
```powershell
git init
```

### 2단계: GitHub 저장소 연결
```powershell
git remote add origin https://github.com/사용자명/저장소명.git
```

### 3단계: 첫 커밋 및 푸시
```powershell
git add .
git commit -m "초기 커밋"
git branch -M main
git push -u origin main
```

## ⚙️ 자동 업로드 스크립트 특징

- ✅ 파일 변경 자동 감지
- ✅ 불필요한 파일 자동 제외 (.git, node_modules 등)
- ✅ 여러 파일 동시 변경 시 스마트 대기 (3초)
- ✅ Git 설치 및 저장소 설정 자동 확인
- ✅ 친절한 오류 메시지

## 🔧 문제 해결

### "Git이 설치되어 있지 않습니다" 오류
→ Git을 설치하고 PowerShell을 재시작하세요

### "원격 저장소가 설정되지 않았습니다" 오류
→ GitHub 저장소 URL을 입력하거나 다음 명령어 실행:
```powershell
git remote add origin https://github.com/사용자명/저장소명.git
```

### "푸시 실패" 오류
→ GitHub 인증이 필요합니다:
- GitHub Desktop 사용 시: 자동으로 인증됨
- Git 명령줄 사용 시: Personal Access Token 필요
  - GitHub → Settings → Developer settings → Personal access tokens
  - 토큰 생성 후 사용

### 파일이 너무 자주 업로드됨
→ 스크립트의 대기 시간을 늘리세요 (auto-upload.ps1의 3000ms 수정)

## 💡 팁

1. **자동 업로드 모드**는 백그라운드에서 계속 실행됩니다
2. 파일을 저장할 때마다 자동으로 업로드되므로 편리합니다
3. 작업이 끝나면 Ctrl+C로 종료하세요
4. `.gitignore` 파일로 업로드하지 않을 파일을 지정할 수 있습니다

## 📝 예시

```
1. auto-upload.ps1 실행
2. "✅ 파일 감시 시작됨!" 메시지 확인
3. index.html 파일 수정 및 저장
4. [14:30:25] 파일 변경 감지됨! 메시지 확인
5. 자동으로 커밋 및 푸시 완료
6. GitHub에서 변경사항 확인
```

---

**현재 상태:** Git이 설치되어 있지 않아 스크립트를 실행할 수 없습니다. 위의 "준비 사항"을 따라 Git을 설치하세요.

