# 🔥 Firebase 연동 가이드

이 가이드를 따라하면 5분 안에 Firebase 연동을 완료할 수 있습니다!

## 📋 준비사항

- Google 계정 (Gmail 계정이면 됩니다)
- 웹 브라우저 (Chrome, Edge, Firefox 등)

---

## 1단계: Firebase 프로젝트 생성

1. **[Firebase 콘솔](https://console.firebase.google.com/) 접속**
   - Google 계정으로 로그인

2. **"프로젝트 추가" 클릭** (또는 "Add project")

3. **프로젝트 이름 입력**
   - 예: "soliloquy", "my-memo-app" 등
   - 프로젝트 ID는 자동 생성됩니다

4. **Google Analytics 설정**
   - ⚠️ **"이 프로젝트에 Google Analytics 사용 설정" 체크 해제** (선택사항)
   - 무료 요금제에서는 필요 없습니다

5. **"프로젝트 만들기" 클릭**
   - 몇 초 정도 걸립니다

## 2단계: Firestore 데이터베이스 생성

1. **프로젝트가 생성되면 "계속" 클릭**

2. **왼쪽 메뉴에서 "Firestore Database" 클릭**
   - 또는 "Build" → "Firestore Database"

3. **"데이터베이스 만들기" 클릭**

4. **보안 규칙 선택**
   - ✅ **"테스트 모드에서 시작" 선택** (개발용)
   - ⚠️ 나중에 보안 규칙을 수정해야 합니다 (5단계 참고)

5. **위치 선택**
   - 한국 사용자: **"asia-northeast3 (Seoul)"** 추천
   - 다른 지역도 가능하지만 가까운 지역이 빠릅니다

6. **"사용 설정" 클릭**
   - 몇 초 정도 걸립니다

## 3단계: 웹 앱 등록 및 설정 복사

1. **프로젝트 설정 열기**
   - 왼쪽 상단의 **톱니바퀴 아이콘** 클릭
   - 또는 "프로젝트 설정" 클릭

2. **"내 앱" 섹션으로 스크롤**
   - 아래로 내려가면 "내 앱" 섹션이 보입니다

3. **웹 앱 추가**
   - `</>` (웹) 아이콘 클릭
   - 또는 "웹 앱 추가" 버튼 클릭

4. **앱 닉네임 입력**
   - 예: "Soliloquy Web", "My Memo App" 등
   - 아무거나 입력해도 됩니다

5. **"Firebase Hosting도 설정" 체크 해제**
   - ⚠️ 필요 없으므로 체크 해제

6. **"앱 등록" 클릭**

7. **설정 정보 복사**
   - 아래와 같은 코드가 나타납니다:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyC...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```
   - 이 정보를 복사해두세요!

## 4단계: index.html에 설정 추가

1. **프로젝트 폴더에서 `index.html` 파일 열기**
   - 메모장, VS Code, 또는 다른 텍스트 에디터 사용

2. **Firebase 설정 부분 찾기**
   - 파일 상단 부분 (8-22번째 줄 정도)
   - `const firebaseConfig = { ... }` 부분 찾기

3. **복사한 설정 정보로 교체**
   - Firebase 콘솔에서 복사한 값들을 그대로 붙여넣기
   - 따옴표(`"`) 안의 값만 교체하면 됩니다

   **예시:**
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyC1234567890abcdefghijklmnop",  // 복사한 값
     authDomain: "soliloquy-12345.firebaseapp.com",  // 복사한 값
     projectId: "soliloquy-12345",  // 복사한 값
     storageBucket: "soliloquy-12345.appspot.com",  // 복사한 값
     messagingSenderId: "123456789012",  // 복사한 값
     appId: "1:123456789012:web:abcdef123456"  // 복사한 값
   };
   ```

4. **파일 저장**
   - Ctrl+S (Windows) 또는 Cmd+S (Mac)

## 5단계: Firestore 보안 규칙 설정 (중요!)

1. **Firebase 콘솔에서 "Firestore Database" 클릭**
   - 왼쪽 메뉴에서 선택

2. **"규칙" 탭 클릭**
   - 상단에 "데이터", "규칙", "인덱스", "사용량" 탭이 있습니다

3. **규칙 편집**
   - 기존 규칙을 모두 삭제하고 아래 규칙으로 교체:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // 개발용: 모든 사용자가 접근 가능
      // ⚠️ 프로덕션에서는 인증을 추가해야 합니다
      allow read, write: if true;
    }
  }
}
```

4. **"게시" 클릭**
   - 오른쪽 상단의 "게시" 버튼 클릭

**⚠️ 주의:** 
- 현재 규칙은 개발용입니다 (모든 사용자가 접근 가능)
- 프로덕션에서는 인증을 추가하는 것이 좋습니다
- 하지만 개인 사용 목적이라면 현재 규칙으로도 충분합니다

## 6단계: 테스트

1. **브라우저에서 `index.html` 파일 열기**
   - 파일을 더블클릭하거나 브라우저로 드래그 앤 드롭

2. **개발자 도구 열기**
   - F12 키 누르기
   - 또는 우클릭 → "검사" / "요소 검사"

3. **콘솔 탭 확인**
   - 개발자 도구에서 "Console" 탭 클릭
   - ✅ **"Firebase 초기화 완료"** 메시지가 보여야 합니다
   - ❌ 에러가 있다면 설정을 다시 확인하세요

4. **사용자 ID 입력**
   - 모달이 나타나면 사용자 ID 입력 (예: "mymemo123")
   - 다른 기기에서 같은 ID를 사용하면 동기화됩니다

5. **메모 작성 테스트**
   - 메모를 작성하고 전송 버튼 클릭
   - 10초 정도 기다리기 (자동 동기화)

6. **Firebase에서 확인**
   - Firebase 콘솔 → "Firestore Database" → "데이터" 탭
   - `users` 컬렉션이 생성되고 데이터가 저장되었는지 확인

**✅ 성공!** 이제 다른 기기에서도 같은 사용자 ID를 입력하면 데이터가 동기화됩니다!

## 🔧 문제 해결

### ❌ "Firebase 설정이 완료되지 않았습니다" 에러
**원인:** `index.html`의 Firebase 설정이 아직 입력되지 않았습니다.

**해결:**
1. `index.html` 파일 열기
2. Firebase 콘솔에서 복사한 설정 정보 확인
3. `여기에_..._입력` 부분을 실제 값으로 교체
4. 파일 저장 후 브라우저 새로고침

### ❌ "Firebase 초기화 실패" 에러
**원인:** 설정 정보가 잘못되었거나 Firebase 프로젝트가 없습니다.

**해결:**
1. Firebase 콘솔에서 프로젝트가 생성되었는지 확인
2. 설정 정보를 다시 복사해서 붙여넣기
3. 따옴표(`"`)가 빠지지 않았는지 확인
4. 콤마(`,`)가 올바르게 있는지 확인

### ❌ 동기화가 안 됨
**원인:** 사용자 ID가 없거나 Firestore 규칙 문제입니다.

**해결:**
1. 사용자 ID 모달에서 ID를 입력했는지 확인
2. Firestore 규칙이 올바르게 설정되었는지 확인 (5단계)
3. 브라우저 콘솔에서 에러 메시지 확인
4. Firebase 콘솔 → Firestore Database → 데이터 탭에서 `users` 컬렉션 확인

### ⚠️ 할당량 초과 경고
**원인:** 무료 할당량을 초과했습니다.

**해결:**
1. Firebase 콘솔에서 사용량 확인
2. 불필요한 데이터 삭제
3. 디바운싱 시간을 더 늘릴 수 있음 (현재 10초)
4. 다음 달까지 기다리거나 유료 요금제로 업그레이드

### 💡 기타 팁
- **브라우저 캐시 문제:** Ctrl+Shift+R (강력 새로고침)
- **설정 확인:** 콘솔에 "프로젝트 ID: ..."가 표시되면 정상입니다
- **로컬 저장소:** Firebase 없이도 로컬 저장소는 작동합니다 (동기화만 안 됨)

## 다음 단계 (선택사항)

### 보안 강화
프로덕션 환경에서는 Firestore 규칙에 인증을 추가하세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Firebase Authentication 사용 시
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // 또는 사용자 ID 기반 (현재 방식)
      allow read, write: if request.resource.data.userId == userId;
    }
  }
}
```

### Firebase Authentication 추가 (선택사항)
더 안전한 인증을 원하면 Firebase Authentication을 추가할 수 있습니다.

