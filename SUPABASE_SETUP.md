# Supabase로 전환하기 (무제한 동기화)

## 🎯 왜 Supabase인가?

- ✅ **무제한 API 요청** (Firebase는 일일 제한 있음)
- ✅ Firebase와 거의 동일한 API 구조
- ✅ 실시간 동기화 지원
- ✅ 무료 플랜: 500MB DB, 2GB 파일 스토리지

## 📋 설정 단계

### 1. Supabase 계정 생성
1. https://supabase.com 접속
2. "Start your project" 클릭
3. GitHub 계정으로 로그인 (무료)

### 2. 프로젝트 생성
1. "New Project" 클릭
2. 프로젝트 이름 입력 (예: soliloquy)
3. 데이터베이스 비밀번호 설정
4. 리전 선택 (가장 가까운 곳)
5. "Create new project" 클릭

### 3. API 키 확인
1. 프로젝트 대시보드에서 ⚙️ Settings 클릭
2. API 메뉴 선택
3. 다음 정보 복사:
   - **Project URL** (예: https://xxxxx.supabase.co)
   - **anon public** 키 (예: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)

### 4. 데이터베이스 테이블 생성
1. 왼쪽 메뉴에서 "Table Editor" 클릭
2. "New Table" 클릭
3. 테이블 이름: `users`
4. 컬럼 추가:
   - `id` (text, Primary Key)
   - `notes` (jsonb)
   - `folders` (jsonb)
   - `profileBio` (text)
   - `profileName` (text)
   - `profileImage` (text)
   - `lastUpdated` (text)
   - `migratedTo` (text, nullable)
   - `migrationTime` (text, nullable)
5. "Save" 클릭

### 5. 코드 수정
`index.html` 파일을 열고 Firebase SDK 부분을 Supabase로 교체:

```html
<!-- 기존 Firebase SDK 제거하고 아래 코드로 교체 -->

<!-- Supabase SDK -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script type="module">
  const SUPABASE_URL = '여기에_Project_URL_붙여넣기';
  const SUPABASE_ANON_KEY = '여기에_anon_public_키_붙여넣기';
  
  // ... (나머지 코드는 index-supabase.html 참고)
</script>
```

## ✅ 완료!

이제 Firebase Quota 제한 없이 무제한으로 동기화할 수 있습니다!

## 🔧 문제 해결

- **"relation does not exist" 오류**: 테이블 이름이 `users`인지 확인
- **권한 오류**: Supabase 대시보드 > Authentication > Policies에서 RLS 정책 확인

