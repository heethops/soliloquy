# GitHub를 통한 동기화

## 🎯 GitHub 동기화 방법

GitHub를 사용하면 **완전 무료**로 데이터를 저장하고 동기화할 수 있습니다!

## 📊 옵션 비교

| 방법 | 저장소 | 용량 | API 제한 | 공개/비공개 |
|------|--------|------|---------|------------|
| **GitHub Gist** | Gist | 무제한 | 시간당 5,000회 | 공개/비공개 가능 |
| **GitHub Repository** | 저장소 | 무제한 | 시간당 5,000회 | 공개/비공개 가능 |

## 🚀 방법 1: GitHub Gist (추천)

### 장점
- ✅ 완전 무료
- ✅ 무제한 저장 (Gist는 작은 파일용이지만 충분함)
- ✅ API 간단함
- ✅ 버전 관리 자동 (Git 히스토리)
- ✅ 공개/비공개 선택 가능

### 단점
- ⚠️ 파일 크기 제한 (1MB, 하지만 JSON 데이터는 충분함)
- ⚠️ API 호출 제한 (시간당 5,000회, 충분함)

### 동작 방식
```
앱 → GitHub Gist API → Gist 파일 저장
     ↓
다른 기기 → GitHub Gist API → Gist 파일 읽기
```

## 🚀 방법 2: GitHub Repository

### 장점
- ✅ 완전 무료
- ✅ 무제한 저장
- ✅ 버전 관리 (Git)
- ✅ 여러 파일 저장 가능

### 단점
- ⚠️ 구현이 더 복잡함
- ⚠️ 공개 저장소면 데이터 공개됨

## 💡 추천: GitHub Gist

**Gist가 가장 적합한 이유:**
1. API가 간단함
2. 작은 JSON 파일 저장에 최적화
3. 비공개 Gist 가능 (프라이버시 보호)
4. 무제한 저장

## 📋 구현 방법

### 1. GitHub Personal Access Token 생성
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" 클릭
3. 권한 선택:
   - `gist` (Gist 생성/수정)
   - `repo` (저장소 사용 시)
4. 토큰 복사 (한 번만 보여줌!)

### 2. 코드 구현
- GitHub API를 사용해서 Gist에 JSON 파일 저장
- 다른 기기에서 같은 Gist 읽기
- 변경 사항 감지 및 동기화

## 🔒 보안 주의사항

⚠️ **중요**: Personal Access Token은 절대 공개하지 마세요!
- 클라이언트 코드에 직접 넣지 않음
- 환경 변수나 서버를 통해 관리
- 또는 사용자가 직접 입력하도록 함

## 📊 API 제한

- **인증 없이**: 시간당 60회
- **인증 있음**: 시간당 5,000회
- **충분함**: 일반 사용에는 문제없음

## 🎯 이 프로젝트에 적용

### 데이터 구조
```json
{
  "notes": [...],
  "folders": [...],
  "profileBio": "...",
  "profileName": "...",
  "profileImage": "...",
  "lastUpdated": "..."
}
```

### 동기화 흐름
1. 사용자가 메모 저장
2. GitHub Gist API로 JSON 파일 업데이트
3. 다른 기기에서 Gist 읽기
4. 변경 사항 감지 시 로컬 업데이트

## ✅ 장점 요약

- ✅ **완전 무료**
- ✅ **무제한 저장**
- ✅ **버전 관리** (Git 히스토리로 복원 가능)
- ✅ **API 제한 충분** (시간당 5,000회)
- ✅ **구현 가능** (GitHub API 사용)

## 🤔 Firebase vs Supabase vs GitHub

| 항목 | Firebase | Supabase | GitHub Gist |
|------|----------|----------|-------------|
| 비용 | 무료 (제한) | 무료 (제한) | **완전 무료** ✅ |
| API 제한 | 일일 50,000 | 무제한 | 시간당 5,000 ✅ |
| 실시간 | ✅ | ✅ | ❌ (폴링 필요) |
| 구현 난이도 | 쉬움 | 쉬움 | 중간 |
| 버전 관리 | ❌ | ❌ | **✅ (Git)** |

## 🚀 다음 단계

GitHub Gist로 전환하려면:
1. GitHub Personal Access Token 생성
2. 코드에 GitHub API 통합
3. Gist 생성/업데이트/읽기 함수 구현

원하시면 구현해드릴 수 있습니다!

