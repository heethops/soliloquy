# GitHub 자동 업로드 가이드

## 방법 1: GitHub Desktop 사용 (가장 쉬움! ⭐ 추천)

### 설치
1. [GitHub Desktop 다운로드](https://desktop.github.com/)
2. 설치 후 GitHub 계정으로 로그인

### 사용법
1. **저장소 열기**
   - GitHub Desktop 열기
   - File > Add Local Repository
   - 프로젝트 폴더 선택

2. **변경사항 확인**
   - 파일을 수정하면 왼쪽에 변경사항이 표시됨
   - 변경된 파일 목록 확인

3. **커밋 및 푸시**
   - 하단에 커밋 메시지 입력 (예: "프로필 숨김 기능 추가")
   - **"Commit to main"** 클릭
   - **"Push origin"** 클릭 (또는 상단의 Push 버튼)

**✅ 장점**: 클릭 몇 번으로 끝! GUI로 쉽게 사용 가능

---

## 방법 2: VS Code Git 확장 기능 사용

### 설정
1. VS Code에서 프로젝트 폴더 열기
2. 왼쪽 사이드바에서 **소스 제어** 아이콘 클릭 (또는 `Ctrl+Shift+G`)

### 사용법
1. **변경사항 스테이징**
   - 변경된 파일 옆의 **+** 버튼 클릭
   - 또는 파일을 우클릭 > "Stage Changes"

2. **커밋**
   - 상단 커밋 메시지 입력란에 메시지 입력
   - **✓** 버튼 클릭 (또는 `Ctrl+Enter`)

3. **푸시**
   - 상단의 **...** 메뉴 클릭
   - **Push** 선택
   - 또는 `Ctrl+Shift+P` > "Git: Push" 입력

**✅ 장점**: 에디터에서 바로 작업 가능

---

## 방법 3: Git 명령어 사용 (터미널)

### 초기 설정 (처음 한 번만)
```bash
# Git 설치 확인
git --version

# 저장소 초기화 (이미 되어 있으면 생략)
git init

# GitHub 저장소 연결 (이미 되어 있으면 생략)
git remote add origin https://github.com/사용자명/저장소명.git
```

### 자동 업로드 스크립트 만들기

**Windows PowerShell 스크립트** (`upload.ps1` 파일 생성):
```powershell
# 변경사항 추가
git add .

# 커밋 (현재 시간을 메시지로)
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "자동 업로드: $timestamp"

# GitHub에 푸시
git push origin main
```

**사용법**:
```powershell
# PowerShell에서 실행
.\upload.ps1
```

**또는 배치 파일** (`upload.bat` 파일 생성):
```batch
@echo off
git add .
git commit -m "자동 업로드: %date% %time%"
git push origin main
pause
```

**사용법**: `upload.bat` 파일을 더블클릭

---

## 방법 4: GitHub Actions로 자동화 (고급)

### `.github/workflows/auto-commit.yml` 파일 생성:
```yaml
name: Auto Commit

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  auto-commit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Auto commit
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add .
          git commit -m "Auto commit" || exit 0
          git push
```

**⚠️ 주의**: 이 방법은 GitHub에서 자동으로 커밋하는 것이므로, 로컬 파일 변경사항을 자동으로 업로드하는 것은 아닙니다.

---

## 방법 5: 파일 감시 스크립트 (자동 감지)

### Node.js 사용 (watch-and-push.js):
```javascript
const { exec } = require('child_process');
const chokidar = require('chokidar');

// 파일 변경 감지
const watcher = chokidar.watch('.', {
  ignored: /(^|[\/\\])\../, // 숨김 파일 제외
  persistent: true
});

let timeout;
watcher.on('change', () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    console.log('파일 변경 감지, 자동 업로드 시작...');
    exec('git add .', (err) => {
      if (err) return console.error(err);
      exec('git commit -m "자동 업로드: ' + new Date().toLocaleString() + '"', (err) => {
        if (err) return console.error(err);
        exec('git push origin main', (err) => {
          if (err) return console.error(err);
          console.log('✅ 업로드 완료!');
        });
      });
    });
  }, 5000); // 5초 대기 (여러 파일 동시 변경 대비)
});
```

**설치 및 실행**:
```bash
npm install chokidar
node watch-and-push.js
```

---

## 추천 방법

### 초보자용: **GitHub Desktop**
- 설치만 하면 끝
- 클릭 몇 번으로 업로드
- 변경사항을 시각적으로 확인 가능

### 개발자용: **VS Code Git 확장**
- 에디터에서 바로 작업
- 빠르고 효율적

### 자동화 원할 때: **배치 파일/스크립트**
- 파일 수정 후 스크립트 실행만 하면 됨
- 간단한 자동화 가능

---

## 자주 묻는 질문

### Q: 매번 커밋 메시지를 입력해야 하나요?
**A**: 배치 파일이나 스크립트를 사용하면 자동으로 시간/날짜를 메시지로 사용할 수 있습니다.

### Q: 특정 파일만 제외하고 싶어요
**A**: `.gitignore` 파일에 제외할 파일/폴더를 추가하세요:
```
node_modules/
.vscode/
*.log
```

### Q: 충돌이 발생했어요
**A**: GitHub Desktop이나 VS Code에서 충돌 해결 도구를 사용하거나, 수동으로 해결 후 다시 커밋하세요.

### Q: 자동으로 푸시만 하고 싶어요 (커밋은 수동)
**A**: 커밋 후 자동 푸시 스크립트:
```batch
git push origin main
```

---

## 빠른 시작 (GitHub Desktop)

1. GitHub Desktop 설치
2. 프로젝트 폴더 열기
3. 파일 수정
4. 커밋 메시지 입력
5. "Commit to main" 클릭
6. "Push origin" 클릭

**끝!** 🎉

