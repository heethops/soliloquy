  (function () {
  const STORAGE_KEY = 'timestamped_notes_v1';
  const FOLDERS_KEY = 'folders_v1';
  const PROFILE_BIO_KEY = 'profile_bio_v1';
  const PROFILE_IMAGE_KEY = 'profile_image_v1';
  const PROFILE_NAME_KEY = 'profile_name_v1';
  const BACKUP_KEY = 'backup_data_v1';
  const BOOKMARK_FOLDER_ID = '__bookmark_folder__';
  const PHOTO_FOLDER_ID = '__photo_folder__';

  /**
   * @typedef {{ id: string; text: string; createdAt: string; images?: string[]; imageData?: string; folderIds?: string[]; parentId?: string }} Note
   * @typedef {{ id: string; name: string }} Folder
   */

  function init() {
    /** @type {HTMLTextAreaElement|null} */
    const input = document.getElementById('note-input');
    /** @type {HTMLButtonElement|null} */
    const submitBtn = document.getElementById('submit-btn');
    /** @type {HTMLUListElement|null} */
    const list = document.getElementById('notes');
    /** @type {HTMLButtonElement|null} */
    const bulkEditBtn = document.getElementById('bulk-edit');
    /** @type {HTMLButtonElement|null} */
    const bulkDeleteBtn = document.getElementById('bulk-delete');
    /** @type {HTMLElement|null} */
    const selectedCountEl = document.getElementById('selected-count');
    /** @type {HTMLElement|null} */
    const toggleSelectionBtn = document.getElementById('toggle-selection');
    /** @type {HTMLElement|null} */
    const calendarEl = document.getElementById('calendar');
    /** @type {HTMLElement|null} */
    const calendarTitleEl = document.getElementById('calendar-title');
    /** @type {HTMLButtonElement|null} */
    const prevMonthBtn = document.getElementById('prev-month');
    /** @type {HTMLButtonElement|null} */
    const nextMonthBtn = document.getElementById('next-month');
    /** @type {HTMLButtonElement|null} */
    const changeUserIdBtn = null; // 제거됨
    /** @type {HTMLElement|null} */
    const lastUpdatedEl = document.getElementById('last-updated');
    /** @type {HTMLButtonElement|null} */
    const clearFilterBtn = document.getElementById('clear-filter');
    /** @type {HTMLElement|null} */
    const filterInfoEl = document.getElementById('filter-info');
    /** @type {HTMLButtonElement|null} */
    const toggleTransparencyBtn = document.getElementById('toggle-transparency');
    const toggleDateBtn = document.getElementById('toggle-date');
    const resetBtn = document.getElementById('reset-btn');
    const restoreBtn = document.getElementById('restore-btn');
    const finalDeleteBtn = document.getElementById('final-delete-btn');
    const resetConfirmModal = document.getElementById('reset-confirm-modal');
    const resetConfirmYes = document.getElementById('reset-confirm-yes');
    const resetConfirmNo = document.getElementById('reset-confirm-no');
    /** @type {HTMLButtonElement|null} */
    const selectAllBtn = document.getElementById('select-all-btn');
    /** @type {HTMLButtonElement|null} */
    const uploadBtn = document.getElementById('upload-btn');
    /** @type {HTMLInputElement|null} */
    const fileInput = document.getElementById('file-input');
    /** @type {HTMLElement|null} */
    const uploadPreview = document.getElementById('upload-preview');
    /** @type {HTMLElement|null} */
    const imageModal = document.getElementById('image-modal');
    /** @type {HTMLImageElement|null} */
    const imageModalImg = document.getElementById('image-modal-img');
    /** @type {HTMLButtonElement|null} */
    const imageModalClose = document.getElementById('image-modal-close');
    /** @type {HTMLButtonElement|null} */
    const imageModalPrev = document.getElementById('image-modal-prev');
    /** @type {HTMLButtonElement|null} */
    const imageModalNext = document.getElementById('image-modal-next');
    /** @type {HTMLInputElement|null} */
    const searchInput = document.getElementById('search-input');
    /** @type {HTMLButtonElement|null} */
    const searchBtn = document.getElementById('search-btn');
    /** @type {SVGElement|null} */
    const searchIcon = document.getElementById('search-icon');
    /** @type {SVGElement|null} */
    const closeIcon = document.getElementById('close-icon');
    /** @type {HTMLButtonElement|null} */
    const toggleFolderBtn = document.getElementById('toggle-folder');
    /** @type {HTMLElement|null} */
    const folderControls = document.querySelector('.folder-controls');
    /** @type {HTMLElement|null} */
    const folderList = document.getElementById('folder-list');
    /** @type {HTMLButtonElement|null} */
    const folderAddBtn = document.getElementById('folder-add');
    /** @type {HTMLButtonElement|null} */
    const folderEditBtn = document.getElementById('folder-edit');
    /** @type {HTMLButtonElement|null} */
    const folderDeleteBtn = document.getElementById('folder-delete');
    /** @type {HTMLButtonElement|null} */
    const folderRemoveBtn = document.getElementById('folder-remove');
    /** @type {HTMLElement|null} */
    const totalNotesCountEl = document.getElementById('total-notes-count');
    /** @type {HTMLInputElement|null} */
    const profileNameInput = document.getElementById('profile-name-input');
    /** @type {HTMLTextAreaElement|null} */
    const profileBioInput = document.getElementById('profile-bio-input');
    /** @type {HTMLImageElement|null} */
    const profileImg = document.getElementById('profile-img');
    /** @type {HTMLDivElement|null} */
    const profileImagePlaceholder = document.querySelector('.profile-image-placeholder');
    /** @type {HTMLDivElement|null} */
    const profileImage = document.querySelector('.profile-image');
    /** @type {HTMLDivElement|null} */
    const profileImageMenu = document.getElementById('profile-image-menu');
    /** @type {HTMLButtonElement|null} */
    const profileImageAddBtn = document.getElementById('profile-image-add');
    /** @type {HTMLButtonElement|null} */
    const profileImageDeleteBtn = document.getElementById('profile-image-delete');
    /** @type {HTMLInputElement|null} */
    const profileImageInput = document.getElementById('profile-image-input');
    /** @type {HTMLElement|null} */
    const userIdModal = document.getElementById('user-id-modal');
    /** @type {HTMLInputElement|null} */
    const userIdInput = document.getElementById('user-id-input');
    /** @type {HTMLButtonElement|null} */
    const userIdSubmitBtn = document.getElementById('user-id-submit');
    /** @type {HTMLButtonElement|null} */
    const userIdSkipBtn = document.getElementById('user-id-skip');

    if (!input || !submitBtn || !list) {
      console.error('필수 요소를 찾을 수 없습니다', { input: !!input, submitBtn: !!submitBtn, list: !!list });
      return;
    }

    // 검색 상태 (초기 렌더 전에 선언/초기화)
    let searchQuery = '';
    let selectedFolderIds = new Set(); // 선택된 폴더 ID들 (중복 선택 가능)
    let folderMode = false; // 폴더 모드 상태
    let editingFolderId = null; // 편집 중인 폴더 ID
    let dateMode = false; // 날짜 모드 상태

    // hh:mm (기본) 또는 mm/dd hh:mm (날짜 모드일 때)
    function formatCompact(date) {
      const HH = String(date.getHours()).padStart(2, '0');
      const mm = String(date.getMinutes()).padStart(2, '0');
      if (dateMode) {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${month}/${day} ${HH}:${mm}`;
      }
      return `${HH}:${mm}`;
    }

    // 이미지 모달 상태
    let currentImageList = [];
    let currentImageIndex = -1;

    function openImageModal(src, noteId) {
      if (!imageModal || !imageModalImg) return;
      
      // 같은 글의 모든 이미지 찾기
      const notes = loadNotes();
      const note = notes.find(n => n.id === noteId);
      if (note) {
        currentImageList = Array.isArray(note.images) ? note.images : (note.imageData ? [note.imageData] : []);
        currentImageIndex = currentImageList.indexOf(src);
      } else {
        currentImageList = [src];
        currentImageIndex = 0;
      }
      
      imageModalImg.src = src;
      imageModal.classList.add('open');
      updateImageModalButtons();
    }
    
    function updateImageModalButtons() {
      const prevBtn = document.getElementById('image-modal-prev');
      const nextBtn = document.getElementById('image-modal-next');
      
      if (prevBtn) {
        prevBtn.style.display = currentImageList.length > 1 ? 'block' : 'none';
        prevBtn.disabled = currentImageIndex <= 0;
      }
      if (nextBtn) {
        nextBtn.style.display = currentImageList.length > 1 ? 'block' : 'none';
        nextBtn.disabled = currentImageIndex >= currentImageList.length - 1;
      }
    }
    
    function showPrevImage() {
      if (currentImageIndex > 0 && imageModalImg) {
        currentImageIndex--;
        imageModalImg.src = currentImageList[currentImageIndex];
        updateImageModalButtons();
      }
    }
    
    function showNextImage() {
      if (currentImageIndex < currentImageList.length - 1 && imageModalImg) {
        currentImageIndex++;
        imageModalImg.src = currentImageList[currentImageIndex];
        updateImageModalButtons();
      }
    }
    
    function closeImageModal() {
      if (!imageModal || !imageModalImg) return;
      imageModal.classList.remove('open');
      imageModalImg.src = '';
      currentImageList = [];
      currentImageIndex = -1;
    }

    // 사용자 ID - 모든 사용자가 자동으로 같은 ID 사용
    const USER_ID_KEY = 'soliloquy_user_id';
    const DEFAULT_USER_ID = 'soliloquy-default-user'; // 모든 사용자가 공유하는 고정 ID
    
    function getUserId() {
      // 항상 같은 고정 ID 반환 (모든 사용자가 같은 데이터 공유)
      return DEFAULT_USER_ID;
    }
    
    function setUserId(userId) {
      // 더 이상 사용하지 않음 (고정 ID 사용)
    }
    
    // 사용자 ID 모달 함수들 제거됨 (자동으로 고정 ID 사용)
    function showUserIdModal() {
      // 더 이상 사용하지 않음
    }
    
    function hideUserIdModal() {
      // 더 이상 사용하지 않음
    }
    
    function submitUserId() {
      // 더 이상 사용하지 않음
    }
    
    // 토큰 입력창 표시/숨김 제어 함수
    function toggleTokenInput(show) {
      if (githubTokenInput) {
        githubTokenInput.style.display = show ? 'block' : 'none';
      }
      if (githubTokenLabel) {
        githubTokenLabel.style.display = show ? 'block' : 'none';
      }
      if (userIdHelp) {
        userIdHelp.style.display = show ? 'block' : 'none';
      }
    }
    
    
    // 사용자 ID 변경 (Firebase 데이터 마이그레이션)
    async function migrateUserId(oldUserId, newUserId) {
      // GitHub Gist는 사용자 ID 기반이므로 마이그레이션 불필요
      // Gist ID는 사용자 ID와 무관하게 동작
      return false;
      
      try {
        // 기존 ID의 데이터 가져오기
        const oldDoc = window.firebaseDoc(window.firebaseDb, 'users', oldUserId);
        const oldSnap = await window.firebaseGetDoc(oldDoc);
        
        if (oldSnap.exists()) {
          const oldData = oldSnap.data();
          
          // 새로운 ID로 데이터 복사
          const newDoc = window.firebaseDoc(window.firebaseDb, 'users', newUserId);
          await window.firebaseSetDoc(newDoc, {
            ...oldData,
            lastUpdated: new Date().toISOString()
          });
          
          // 로컬 스토리지도 업데이트
          if (oldData.notes && Array.isArray(oldData.notes)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(oldData.notes));
          }
          if (oldData.profileBio !== undefined) {
            localStorage.setItem(PROFILE_BIO_KEY, oldData.profileBio || '');
          }
          if (oldData.profileName !== undefined) {
            localStorage.setItem(PROFILE_NAME_KEY, oldData.profileName || '');
          }
          if (oldData.profileImage !== undefined) {
            if (oldData.profileImage) {
              localStorage.setItem(PROFILE_IMAGE_KEY, oldData.profileImage);
            } else {
              localStorage.removeItem(PROFILE_IMAGE_KEY);
            }
          }
          
          // 기존 ID 문서의 모든 데이터 삭제하고 migratedTo만 남김 (다른 기기에서 자동 변경 감지를 위해)
          // 기존 문서를 삭제하고 migratedTo만 있는 새 문서 생성
          await window.firebaseDeleteDoc(oldDoc);
          await window.firebaseSetDoc(oldDoc, {
            migratedTo: newUserId,
            migrationTime: new Date().toISOString()
          });
          
          return true;
        } else {
          // 기존 ID 문서에 migratedTo 필드만 추가 (다른 기기에서 자동 변경을 위해)
          await window.firebaseSetDoc(oldDoc, {
            migratedTo: newUserId,
            migrationTime: new Date().toISOString()
          });
          
          // 로컬 데이터를 새 ID로 Firebase에 저장
          const localNotes = loadNotes();
          const localFolders = loadFolders();
          if (localNotes.length > 0 || localFolders.length > 0) {
            const newDoc = window.firebaseDoc(window.firebaseDb, 'users', newUserId);
            const newData = {
              notes: localNotes,
              folders: localFolders,
              profileBio: localStorage.getItem(PROFILE_BIO_KEY) || '',
              profileName: localStorage.getItem(PROFILE_NAME_KEY) || '',
              profileImage: localStorage.getItem(PROFILE_IMAGE_KEY) || null,
              lastUpdated: new Date().toISOString()
            };
            await window.firebaseSetDoc(newDoc, newData);
          }
          
          return true;
        }
      } catch (error) {
        console.error('사용자 ID 마이그레이션 실패:', error);
        return false;
      }
    }
    
    // 사용자 ID 제출 함수 제거됨
    function submitUserId() {
      // UI 제거됨
    }
    
    // 계정 전환 모달 함수들 제거됨
    function showAccountSwitchModal(newUserId) {
      // UI 제거됨
    }
    
    function hideAccountSwitchModal() {
      // UI 제거됨
    }
    
    function performAccountSwitch(userId) {
      // UI 제거됨
    }

    // 두 사용자 데이터 합치기
    async function mergeUsers(userId1, userId2) {
      // GitHub Gist는 사용자 ID 기반이 아니므로 병합 불필요
      console.warn('GitHub Gist에서는 사용자 병합이 지원되지 않습니다.');
      return;
      
      try {
        
        // 두 사용자의 데이터 가져오기
        const doc1 = window.firebaseDoc(window.firebaseDb, 'users', userId1);
        const doc2 = window.firebaseDoc(window.firebaseDb, 'users', userId2);
        
        const snap1 = await window.firebaseGetDoc(doc1);
        const snap2 = await window.firebaseGetDoc(doc2);
        
        const notes1 = snap1.exists() && snap1.data().notes ? snap1.data().notes : [];
        const notes2 = snap2.exists() && snap2.data().notes ? snap2.data().notes : [];
        
        
        // 중복 제거 (id 기준)
        const mergedNotes = [];
        const noteIds = new Set();
        
        // 먼저 사용자 1의 노트 추가
        for (const note of notes1) {
          if (!noteIds.has(note.id)) {
            mergedNotes.push(note);
            noteIds.add(note.id);
          }
        }
        
        // 사용자 2의 노트 추가 (중복 제외)
        for (const note of notes2) {
          if (!noteIds.has(note.id)) {
            mergedNotes.push(note);
            noteIds.add(note.id);
          }
        }
        
        // 생성 시간 순으로 정렬
        mergedNotes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        // 로컬 저장소에 저장
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedNotes));
        
        // 화면 업데이트
        renderList(mergedNotes);
        
        showToast(`두 사용자 데이터를 합쳤습니다. 총 ${mergedNotes.length}개의 노트가 있습니다.`);
        
        return mergedNotes;
      } catch (error) {
        console.error('사용자 데이터 합치기 실패:', error);
        showToast('데이터 합치기에 실패했습니다.');
      }
    }
    
    // 전역 함수로 등록 (콘솔에서 사용 가능)
    window.mergeUsers = mergeUsers;
    // 사용자 ID 관련 전역 함수 제거됨
    
    // 모든 사용자 ID 찾기 함수 제거됨
    async function findAllUserIds() {
      // 사용자 ID 기능 제거됨
      return [];
    }
    
    window.findAllUserIds = findAllUserIds;

    // Firebase 동기화 활성화 여부 확인
    function isFirebaseEnabled() {
      return window.firebaseReady && window.firebaseDb;
      // 사용자 ID는 항상 고정 ID이므로 체크 불필요
    }

    let isSyncing = false;
    let lastSyncedData = null; // 마지막으로 동기화한 데이터 (중복 방지)
    let firebaseSyncInterval = null; // Firebase 수동 동기화 인터벌 (현재 사용 안 함)

    // Firebase에 데이터 저장 (즉시 동기화, 데이터 변경 시에만 저장)
    async function syncToFirebase(notes) {
      if (!isFirebaseEnabled()) {
        console.warn('Firebase 동기화가 활성화되지 않았습니다.');
        return;
      }

      const userId = getUserId(); // 고정 ID 사용

      console.log('Firebase에 동기화 시작...', {
        notesCount: notes.length,
        userId: userId
      });

      try {
        // 데이터가 실제로 변경되었는지 확인 (quota 절약)
        // loadFolders()는 동기화를 트리거할 수 있으므로 직접 localStorage에서 읽기
        let folders = [];
        try {
          const raw = localStorage.getItem(FOLDERS_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              folders = parsed;
            }
          }
        } catch {
          folders = [];
        }
        
        const profileData = {
          notes: notes,
          folders: folders,
          profileBio: localStorage.getItem(PROFILE_BIO_KEY) || '',
          profileName: localStorage.getItem(PROFILE_NAME_KEY) || '',
          profileImage: localStorage.getItem(PROFILE_IMAGE_KEY) || '',
          lastUpdated: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(profileData);
        if (lastSyncedData === dataStr) {
          // 데이터가 변경되지 않았으면 동기화하지 않음 (quota 절약)
          console.log('데이터 변경 없음, 동기화 스킵');
          return;
        }

        isSyncing = true;
        
        const userDoc = window.firebaseDoc(window.firebaseDb, 'users', userId);
        await window.firebaseSetDoc(userDoc, profileData, { merge: true });

        // 동기화 성공 시 마지막 동기화 데이터 저장
        lastSyncedData = dataStr;
        localStorage.setItem('firebase_last_updated', new Date().toISOString());
        console.log('Firebase 동기화 성공');
      } catch (error) {
        console.error('Firebase 동기화 실패:', error);
        showToast('동기화 실패: ' + error.message);
      } finally {
        isSyncing = false;
      }
    }

    // GitHub Gist에 데이터 저장 (레거시 함수, 호환성 유지)
    async function syncToGitHub(notes) {
      if (!isGitHubEnabled()) {
        console.warn('GitHub 동기화가 활성화되지 않았습니다.');
        return;
      }

      console.log('GitHub에 동기화 시작...', {
        notesCount: notes.length,
        hasGistId: !!window.githubSync.gistId
      });

      try {
        // 데이터가 실제로 변경되었는지 확인
        const folders = loadFolders();
        const profileData = {
          notes: notes,
          folders: folders,
          profileBio: localStorage.getItem(PROFILE_BIO_KEY) || '',
          profileName: localStorage.getItem(PROFILE_NAME_KEY) || '',
          profileImage: localStorage.getItem(PROFILE_IMAGE_KEY) || '',
          lastUpdated: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(profileData);
        if (lastSyncedData === dataStr) {
          // 데이터가 변경되지 않았으면 동기화하지 않음
          console.log('데이터 변경 없음, 동기화 스킵');
          return;
        }

        isSyncing = true;
        const content = JSON.stringify(profileData, null, 2);
        
        const gistData = {
          description: 'Soliloquy 메모 데이터',
          public: false, // 비공개 Gist
          files: {
            [window.githubSync.fileName]: {
              content: content
            }
          }
        };

        if (window.githubSync.gistId) {
          // 기존 Gist 업데이트
          console.log('기존 Gist 업데이트 중...', window.githubSync.gistId);
          await githubApiCall(`/gists/${window.githubSync.gistId}`, 'PATCH', gistData);
          console.log('Gist 업데이트 완료');
        } else {
          // 새 Gist 생성
          console.log('새 Gist 생성 중...');
          const result = await githubApiCall('/gists', 'POST', gistData);
          window.githubSync.gistId = result.id;
          localStorage.setItem('github_gist_id', result.id);
          console.log('Gist 생성 완료:', result.id);
        }

        // 동기화 성공 시 마지막 동기화 데이터 저장
        lastSyncedData = dataStr;
        localStorage.setItem('github_last_updated', new Date().toISOString());
        console.log('GitHub 동기화 성공');
      } catch (error) {
        console.error('GitHub 동기화 실패:', error);
        if (error.message?.includes('Bad credentials') || error.message?.includes('401')) {
          console.warn('GitHub 토큰이 유효하지 않습니다. 토큰을 다시 입력하세요.');
          showToast('GitHub 토큰이 유효하지 않습니다.');
        } else if (error.message?.includes('rate limit')) {
          showToast('API 호출 제한에 도달했습니다. 잠시 후 다시 시도해주세요.');
        } else if (error.message?.includes('권한') || error.message?.includes('403')) {
          // 403 오류 시 Gist ID 초기화하고 새로 생성 시도
          console.warn('Gist 권한 오류. Gist ID를 초기화하고 새로 생성합니다.');
          localStorage.removeItem('github_gist_id');
          window.githubSync.gistId = null;
          
          // 새 Gist 생성 시도
          try {
            const folders = loadFolders();
            const profileData = {
              notes: notes,
              folders: folders,
              profileBio: localStorage.getItem(PROFILE_BIO_KEY) || '',
              profileName: localStorage.getItem(PROFILE_NAME_KEY) || '',
              profileImage: localStorage.getItem(PROFILE_IMAGE_KEY) || '',
              lastUpdated: new Date().toISOString()
            };
            const content = JSON.stringify(profileData, null, 2);
            const gistData = {
              description: 'Soliloquy 메모 데이터',
              public: false,
              files: {
                [window.githubSync.fileName]: {
                  content: content
                }
              }
            };
            const result = await githubApiCall('/gists', 'POST', gistData);
            window.githubSync.gistId = result.id;
            localStorage.setItem('github_gist_id', result.id);
            localStorage.setItem('github_last_updated', new Date().toISOString());
            lastSyncedData = JSON.stringify(profileData);
            console.log('새 Gist 생성 완료:', result.id);
            showToast('새 Gist가 생성되었습니다.');
          } catch (retryError) {
            console.error('Gist 재생성 실패:', retryError);
            showToast('토큰 권한이 없습니다. GitHub에서 토큰 생성 시 "gist" 권한을 체크해주세요.');
          }
        } else {
          showToast('동기화 실패: ' + error.message);
        }
      } finally {
        isSyncing = false;
      }
    }

    // Firebase에서 데이터 읽기 (quota 절약: 수동 동기화만 사용)
    async function syncFromFirebase() {
      if (!isFirebaseEnabled()) {
        return null;
      }

      const userId = getUserId(); // 고정 ID 사용

      try {
        const userDoc = window.firebaseDoc(window.firebaseDb, 'users', userId);
        const docSnap = await window.firebaseGetDoc(userDoc);
        
        if (!docSnap.exists()) {
          return null;
        }

        const data = docSnap.data();

        // 프로필 정보 동기화
        if (data.profileBio !== undefined) {
          localStorage.setItem(PROFILE_BIO_KEY, data.profileBio || '');
        }
        if (data.profileName !== undefined) {
          localStorage.setItem(PROFILE_NAME_KEY, data.profileName || '');
        }
        if (data.profileImage !== undefined) {
          if (data.profileImage) {
            localStorage.setItem(PROFILE_IMAGE_KEY, data.profileImage);
          } else {
            localStorage.removeItem(PROFILE_IMAGE_KEY);
          }
        }

        // 폴더 동기화
        if (data.folders && Array.isArray(data.folders) && data.folders.length > 0) {
          isSyncing = true;
          localStorage.setItem(FOLDERS_KEY, JSON.stringify(data.folders));
          isSyncing = false;
          renderFolders();
        }

        // 최종 업데이트 시간 표시
        if (data.lastUpdated) {
          updateLastUpdatedTime(data.lastUpdated);
          localStorage.setItem('firebase_last_updated', data.lastUpdated);
        }

        if (data.notes && Array.isArray(data.notes)) {
          isSyncing = true;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.notes));
          isSyncing = false;
          return data.notes;
        }
      } catch (error) {
        console.error('Firebase에서 동기화 실패:', error);
      }
      return null;
    }

    // GitHub Gist에서 데이터 읽기
    async function syncFromGitHub() {
      if (!isGitHubEnabled()) {
        return null;
      }

      if (!window.githubSync.gistId) {
        // 저장된 Gist ID 확인
        const savedGistId = localStorage.getItem('github_gist_id');
        if (savedGistId) {
          window.githubSync.gistId = savedGistId;
        } else {
          return null; // Gist가 없음
        }
      }

      try {
        const gist = await githubApiCall(`/gists/${window.githubSync.gistId}`);
        const file = gist.files[window.githubSync.fileName];
        
        if (!file) {
          return null;
        }

        // 파일 내용 파싱
        const data = JSON.parse(file.content);

        // 프로필 정보 동기화
        if (data.profileBio !== undefined) {
          localStorage.setItem(PROFILE_BIO_KEY, data.profileBio || '');
        }
        if (data.profileName !== undefined) {
          localStorage.setItem(PROFILE_NAME_KEY, data.profileName || '');
        }
        if (data.profileImage !== undefined) {
          if (data.profileImage) {
            localStorage.setItem(PROFILE_IMAGE_KEY, data.profileImage);
          } else {
            localStorage.removeItem(PROFILE_IMAGE_KEY);
          }
        }

        // 폴더 동기화
        if (data.folders && Array.isArray(data.folders) && data.folders.length > 0) {
          isSyncing = true;
          localStorage.setItem(FOLDERS_KEY, JSON.stringify(data.folders));
          isSyncing = false;
          renderFolders();
        }

        // 최종 업데이트 시간 표시
        if (data.lastUpdated) {
          updateLastUpdatedTime(data.lastUpdated);
          localStorage.setItem('github_last_updated', gist.updated_at);
        }

        if (data.notes && Array.isArray(data.notes)) {
          isSyncing = true;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.notes));
          isSyncing = false;
          return data.notes;
        }
      } catch (error) {
        console.error('GitHub에서 동기화 실패:', error);
        if (error.message?.includes('404') || error.message?.includes('Not Found')) {
          console.warn('Gist를 찾을 수 없습니다.');
        }
      }
      return null;
    }

    // Firebase 동기화 업데이트 확인 (다른 기기/Firebase 콘솔에서 변경사항 감지)
    async function checkFirebaseUpdates() {
      if (!isFirebaseEnabled() || isSyncing) {
        return;
      }

      try {
        const userId = getUserId(); // 고정 ID 사용

        const userDoc = window.firebaseDoc(window.firebaseDb, 'users', userId);
        const docSnap = await window.firebaseGetDoc(userDoc);
        
        if (!docSnap.exists()) {
          return;
        }

        const data = docSnap.data();
        const lastUpdated = localStorage.getItem('firebase_last_updated');
        const currentUpdated = data.lastUpdated;

        if (lastUpdated !== currentUpdated) {
          // 업데이트 있음
          const cloudNotes = await syncFromFirebase();
          if (cloudNotes && cloudNotes.length > 0) {
            const currentLocalNotes = loadNotes();
            if (JSON.stringify(cloudNotes) !== JSON.stringify(currentLocalNotes)) {
              renderList(cloudNotes);
            }
          }
        }
      } catch (error) {
        console.error('업데이트 확인 오류:', error);
      }
    }

    // Firebase 동기화 시작 (정기 동기화 제거됨 - 변경 이벤트 발생 시에만 동기화)
    function startFirebaseSync() {
      // 정기 동기화 제거됨 - 변경 이벤트 발생 시에만 동기화
      // 이 함수는 호환성을 위해 유지하지만 실제로는 아무것도 하지 않음
    }

    // Firebase 동기화 중지
    function stopFirebaseSync() {
      if (firebaseSyncInterval) {
        clearInterval(firebaseSyncInterval);
        firebaseSyncInterval = null;
      }
    }

    // GitHub 동기화 업데이트 확인 (폴링)
    async function checkGitHubUpdates() {
      if (!isGitHubEnabled() || !window.githubSync.gistId || isSyncing) {
        return;
      }

      try {
        const gist = await githubApiCall(`/gists/${window.githubSync.gistId}`);
        const file = gist.files[window.githubSync.fileName];
        
        if (!file) return;

        // 마지막 업데이트 시간 확인
        const lastUpdated = localStorage.getItem('github_last_updated');
        const currentUpdated = gist.updated_at;

        if (lastUpdated !== currentUpdated) {
          // 업데이트 있음
          const data = await syncFromGitHub();
          if (data && data.length > 0) {
            renderList(data);
          }
        }
      } catch (error) {
        console.error('업데이트 확인 오류:', error);
        if (error.message?.includes('rate limit')) {
          // Rate limit 발생 시 폴링 중지하고 1시간 후 재시도
          console.warn('API 호출 제한 도달. 폴링을 중지합니다.');
          stopGitHubSync();
          showToast('API 호출 제한에 도달했습니다. 1시간 후 자동으로 재시도합니다.');
          
          // 1시간 후 재시도
          setTimeout(() => {
            if (isGitHubEnabled()) {
              startGitHubSync();
              showToast('동기화를 재개합니다.');
            }
          }, 60 * 60 * 1000); // 1시간
        }
      }
    }

    // GitHub 동기화 시작 (폴링)
    function startGitHubSync() {
      if (!isGitHubEnabled()) {
        return;
      }

      // 이미 폴링이 실행 중이면 다시 시작하지 않음
      if (githubPollInterval) {
        return;
      }

      // 초기 동기화
      syncFromGitHub().then(cloudNotes => {
        if (cloudNotes && cloudNotes.length > 0) {
          const currentLocalNotes = loadNotes();
          if (JSON.stringify(cloudNotes) !== JSON.stringify(currentLocalNotes)) {
            renderList(cloudNotes);
          }
        }
      });

      // 30초마다 업데이트 확인 (API 호출 제한 방지)
      githubPollInterval = setInterval(() => {
        checkGitHubUpdates();
      }, 30000);
    }

    // GitHub 동기화 중지
    function stopGitHubSync() {
      if (githubPollInterval) {
        clearInterval(githubPollInterval);
        githubPollInterval = null;
      }
    }

    function loadNotes() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        // 기존 folderId를 folderIds 배열로 마이그레이션
        return parsed.map(note => {
          if (note.folderId && !note.folderIds) {
            note.folderIds = [note.folderId];
            delete note.folderId;
          }
          return note;
        });
      } catch {
        return [];
      }
    }

    /** @param {Note[]} notes */
    function saveNotes(notes) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      
      // Firebase 즉시 동기화
      if (isFirebaseEnabled() && !isSyncing) {
        syncToFirebase(notes).catch(err => {
          console.error('Firebase 저장 실패 (재시도 안 함):', err);
        });
      }
      
      updateTotalNotesCount();
    }

    // 프로필 정보만 Firebase에 저장
    async function syncProfileToFirebase() {
      if (!isFirebaseEnabled() || isSyncing) return;
      
      try {
        const notes = loadNotes();
        await syncToFirebase(notes);
      } catch (error) {
        console.error('프로필 Firebase 동기화 실패:', error);
      }
    }

    function loadFolders() {
      try {
        const raw = localStorage.getItem(FOLDERS_KEY);
        let folders = [];
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            folders = parsed;
          }
        }
        // 북마크 폴더가 없으면 생성
        const bookmarkFolder = folders.find(f => f.id === BOOKMARK_FOLDER_ID);
        if (!bookmarkFolder) {
          folders.unshift({
            id: BOOKMARK_FOLDER_ID,
            name: '북마크'
          });
          saveFolders(folders, true); // skipSync = true (무한 재귀 방지)
        }
        // 사진 폴더가 없으면 생성
        const photoFolder = folders.find(f => f.id === PHOTO_FOLDER_ID);
        if (!photoFolder) {
          folders.push({
            id: PHOTO_FOLDER_ID,
            name: '사진'
          });
          saveFolders(folders, true); // skipSync = true (무한 재귀 방지)
        }
        // 북마크 폴더를 가장 위로 정렬
        const bookmark = folders.find(f => f.id === BOOKMARK_FOLDER_ID);
        if (bookmark) {
          folders = folders.filter(f => f.id !== BOOKMARK_FOLDER_ID);
          // 북마크 폴더 이름이 없으면 기본값 설정
          if (!bookmark.name || bookmark.name.trim() === '') {
            bookmark.name = '북마크';
          }
          folders.unshift(bookmark);
        }
        // 사진 폴더를 북마크 다음으로 정렬
        const photo = folders.find(f => f.id === PHOTO_FOLDER_ID);
        if (photo) {
          folders = folders.filter(f => f.id !== PHOTO_FOLDER_ID);
          if (!photo.name || photo.name.trim() === '') {
            photo.name = '사진';
          }
          // 북마크 다음에 삽입
          const bookmarkIndex = folders.findIndex(f => f.id === BOOKMARK_FOLDER_ID);
          folders.splice(bookmarkIndex + 1, 0, photo);
          saveFolders(folders, true); // skipSync = true (무한 재귀 방지)
        }
        return folders;
      } catch {
        // 에러 시에도 기본 폴더는 생성
        const bookmarkFolder = {
          id: BOOKMARK_FOLDER_ID,
          name: '북마크'
        };
        const photoFolder = {
          id: PHOTO_FOLDER_ID,
          name: '사진'
        };
        saveFolders([bookmarkFolder, photoFolder], true); // skipSync = true (무한 재귀 방지)
        return [bookmarkFolder, photoFolder];
      }
    }

    /** @param {Folder[]} folders */
    function saveFolders(folders, skipSync = false) {
      localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
      
      // Firebase 즉시 동기화 (skipSync가 true이면 건너뛰기 - 무한 재귀 방지)
      // syncToFirebase가 notes와 folders를 함께 저장하므로 notes를 로드해서 동기화
      if (!skipSync && isFirebaseEnabled() && !isSyncing) {
        const notes = loadNotes();
        syncToFirebase(notes).catch(err => {
          console.error('Firebase 저장 실패 (재시도 안 함):', err);
        });
      }
    }
    
    // 폴더만 GitHub에 저장 (기존 함수명 유지)
    async function syncFoldersToFirebase(folders) {
      // GitHub로 전환되었지만 호환성을 위해 함수명 유지
      // syncToGitHub가 notes와 folders를 함께 저장하므로 notes를 로드해서 동기화
      if (!isGitHubEnabled()) {
        return;
      }
      const notes = loadNotes();
      await syncToGitHub(notes);
    }

    // 업데이트 시간 표시 함수 (mm/dd hh:mm 형식)
    function updateLastUpdatedTime(lastUpdatedStr) {
      if (!lastUpdatedEl || !lastUpdatedStr) return;
      
      try {
        const date = new Date(lastUpdatedStr);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        lastUpdatedEl.textContent = `${month}/${day} ${hours}:${minutes}`;
      } catch (error) {
        console.error('업데이트 시간 표시 실패:', error);
      }
    }
    
    // 저장된 최종 수정 시간 표시 (초기화 시)
    function displaySavedLastUpdated() {
      const savedLastUpdated = localStorage.getItem('github_last_updated');
      if (savedLastUpdated) {
        updateLastUpdatedTime(savedLastUpdated);
      }
    }

    // 날짜 문자열 생성 (YYYY-MM-DD)
    function formatDateString(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // 프로필 소개 로드 (영구 저장)
    function loadProfileBio() {
      try {
        const bio = localStorage.getItem(PROFILE_BIO_KEY);
        return bio || '';
      } catch {
        return '';
      }
    }

    // 프로필 소개 저장 (영구 저장)
    function saveProfileBio(text) {
      try {
        localStorage.setItem(PROFILE_BIO_KEY, text);
        // Firebase에도 저장
        if (isFirebaseEnabled() && !isSyncing) {
          syncProfileToFirebase();
        }
      } catch {
        // 저장 실패 시 무시
      }
    }

    // 프로필 이름 로드 (영구 저장)
    function loadProfileName() {
      try {
        const name = localStorage.getItem(PROFILE_NAME_KEY);
        return name || '';
      } catch {
        return '';
      }
    }

    // 프로필 이름 저장 (영구 저장)
    function saveProfileName(text) {
      try {
        localStorage.setItem(PROFILE_NAME_KEY, text);
        // Firebase에도 저장
        if (isFirebaseEnabled() && !isSyncing) {
          syncProfileToFirebase();
        }
      } catch {
        // 저장 실패 시 무시
      }
    }

    // 특정 날짜의 소개를 로드 (더 이상 사용하지 않음)
    function loadProfileBioForDate(date) {
      return loadProfileBio();
    }

    // 현재 시간이 자정을 넘었는지 확인 (00:00:00 이후)
    function isPastMidnight() {
      const now = new Date();
      const hours = now.getHours();
      return hours === 0;
    }

    // 프로필 사진 로드
    function loadProfileImage() {
      try {
        const imageData = localStorage.getItem(PROFILE_IMAGE_KEY);
        if (imageData && profileImg && profileImagePlaceholder) {
          profileImg.src = imageData;
          profileImg.style.display = 'block';
          profileImagePlaceholder.style.display = 'none';
        }
      } catch {
        // 로드 실패 시 무시
      }
    }

    // 프로필 사진 저장
    function saveProfileImage(imageData) {
      try {
        localStorage.setItem(PROFILE_IMAGE_KEY, imageData);
        // Firebase에도 저장
        if (isFirebaseEnabled() && !isSyncing) {
          syncProfileToFirebase();
        }
      } catch {
        // 저장 실패 시 무시
      }
    }

    // 프로필 사진 삭제
    function deleteProfileImage() {
      try {
        localStorage.removeItem(PROFILE_IMAGE_KEY);
        if (profileImg && profileImagePlaceholder) {
          profileImg.src = '';
          profileImg.style.display = 'none';
          profileImagePlaceholder.style.display = 'flex';
        }
        // Firebase에도 저장
        if (isFirebaseEnabled() && !isSyncing) {
          syncProfileToFirebase();
        }
      } catch {
        // 삭제 실패 시 무시
      }
    }

    // 프로필 사용자 ID 업데이트 (UI 제거됨)
    function updateProfileUserId() {
      // 사용자 ID 표시 UI가 제거되어 아무것도 하지 않음
    }
    
    function updateProfileBio() {
      if (!profileBioInput) return;
      const bio = loadProfileBio();
      profileBioInput.value = bio;
      
      // autosize 적용
      autosize(profileBioInput);
      
      // 항상 수정 가능
      profileBioInput.disabled = false;
      profileBioInput.placeholder = '소개를 입력하세요...';
    }

    function showToast(message) {
      const toast = document.getElementById('toast');
      if (!toast) return;
      
      toast.textContent = message;
      toast.style.display = 'block';
      toast.classList.add('show');
      
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
          toast.style.display = 'none';
        }, 300);
      }, 1000);
    }

    // 노트 우클릭 메뉴
    let noteContextMenu = null;
    let noteContextMenuSubmenu = null;
    let currentContextNoteId = null;

    function showNoteContextMenu(e, note) {
      // 기존 메뉴 제거
      if (noteContextMenu) {
        noteContextMenu.remove();
      }
      if (noteContextMenuSubmenu) {
        noteContextMenuSubmenu.remove();
      }

      currentContextNoteId = note.id;

      // 메뉴 생성
      noteContextMenu = document.createElement('div');
      noteContextMenu.className = 'note-context-menu';
      
      // 위치 설정 (모바일에서도 터치한 위치에 표시)
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        // 모바일: 터치 위치에 표시 (화면 밖으로 나가지 않도록 조정)
        const menuWidth = 200; // 대략적인 메뉴 너비
        const menuHeight = 200; // 대략적인 메뉴 높이
        let left = e.clientX;
        let top = e.clientY;
        
        // 화면 오른쪽 경계 확인
        if (left + menuWidth > window.innerWidth) {
          left = window.innerWidth - menuWidth - 10;
        }
        // 화면 아래쪽 경계 확인
        if (top + menuHeight > window.innerHeight) {
          top = window.innerHeight - menuHeight - 10;
        }
        // 화면 왼쪽 경계 확인
        if (left < 10) {
          left = 10;
        }
        // 화면 위쪽 경계 확인
        if (top < 10) {
          top = 10;
        }
        
        noteContextMenu.style.left = left + 'px';
        noteContextMenu.style.top = top + 'px';
        noteContextMenu.style.transform = '';
      } else {
        // PC: 클릭/터치 위치에 표시
        noteContextMenu.style.left = e.clientX + 'px';
        noteContextMenu.style.top = e.clientY + 'px';
        noteContextMenu.style.transform = '';
      }

      // 수정 버튼
      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'note-context-menu-item';
      editBtn.textContent = '수정';
      editBtn.addEventListener('click', function() {
        const notes = loadNotes();
        const currentNote = notes.find(n => n.id === note.id);
        if (currentNote) {
          // 선택 모드 활성화 없이 바로 편집 모드로 진입
          editingIds.add(note.id);
          editDraft.set(note.id, currentNote.text);
          // 현재 필터링된 상태를 유지하면서 렌더링
          const allNotes = loadNotes();
          renderList(allNotes);
        }
        hideNoteContextMenu();
      });
      noteContextMenu.appendChild(editBtn);

      // 삭제 버튼
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'note-context-menu-item delete';
      deleteBtn.textContent = '삭제';
      deleteBtn.addEventListener('click', function() {
        const notes = loadNotes();
        const filtered = notes.filter(n => n.id !== note.id);
        saveNotes(filtered);
        renderList(filtered);
        hideNoteContextMenu();
      });
      noteContextMenu.appendChild(deleteBtn);

      // 답글 버튼
      const replyBtn = document.createElement('button');
      replyBtn.type = 'button';
      replyBtn.className = 'note-context-menu-item';
      replyBtn.textContent = '답글';
      replyBtn.addEventListener('click', function() {
        // 해당 노트를 선택하고 타래 모드로 진입
        selectedIds.clear();
        selectedIds.add(note.id);
        threadParentId = note.id;
        updateThreadMode();
        updateBulkState();
        hideNoteContextMenu();
        
        // 입력창으로 포커스 이동
        const input = document.getElementById('note-input');
        if (input) {
          input.focus();
        }
      });
      noteContextMenu.appendChild(replyBtn);

      // 폴더 추가 버튼
      const folderBtn = document.createElement('div');
      folderBtn.className = 'note-context-menu-item folder-add';
      const folderText = document.createElement('span');
      folderText.className = 'folder-add-text';
      folderText.textContent = '폴더 추가';
      const folderArrow = document.createElement('span');
      folderArrow.className = 'folder-add-arrow';
      folderArrow.textContent = '>';
      folderBtn.appendChild(folderText);
      folderBtn.appendChild(folderArrow);
      
      // 폴더 추가 버튼 클릭/마우스 오버 시 서브메뉴 표시
      const isMobileDevice = window.innerWidth <= 768;
      
      // 서브메뉴 생성 함수
      function createSubmenu() {
        // 기존 서브메뉴 제거
        if (noteContextMenuSubmenu) {
          noteContextMenuSubmenu.remove();
        }
        
        noteContextMenuSubmenu = document.createElement('div');
        noteContextMenuSubmenu.className = 'note-context-menu-submenu';
        const folders = loadFolders();
        
        // 디버깅: 폴더 목록 확인
        let addedCount = 0;
        folders.forEach(folder => {
          // 사진 폴더는 제외 (자동으로 추가되므로)
          if (folder.id === PHOTO_FOLDER_ID) {
            return;
          }
          const folderItem = document.createElement('button');
          folderItem.type = 'button';
          folderItem.className = 'note-context-menu-submenu-item';
          folderItem.textContent = folder.name || '폴더';
          folderItem.addEventListener('click', function(e) {
            e.stopPropagation();
            const notes = loadNotes();
            const currentNote = notes.find(n => n.id === note.id);
            if (currentNote) {
              if (!currentNote.folderIds) {
                currentNote.folderIds = [];
              }
              if (!currentNote.folderIds.includes(folder.id)) {
                currentNote.folderIds.push(folder.id);
                saveNotes(notes);
                renderList(notes);
              }
            }
            hideNoteContextMenu();
          });
          noteContextMenuSubmenu.appendChild(folderItem);
          addedCount++;
        });
        
        // PC 버전을 위한 마우스 이벤트 리스너 추가
        if (!isMobileDevice) {
          noteContextMenuSubmenu.addEventListener('mouseenter', function() {
            noteContextMenuSubmenu.style.display = 'flex';
          });
          noteContextMenuSubmenu.addEventListener('mouseleave', function() {
            noteContextMenuSubmenu.style.display = 'none';
          });
        }
        
        return noteContextMenuSubmenu;
      }
      
      if (isMobileDevice) {
        // 모바일: 클릭으로 서브메뉴 토글
        let submenuVisible = false;
        folderBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          e.preventDefault();
          
          if (submenuVisible) {
            if (noteContextMenuSubmenu) {
              noteContextMenuSubmenu.style.display = 'none';
            }
            submenuVisible = false;
          } else {
            // 서브메뉴를 최신 폴더 목록으로 새로 생성
            const submenu = createSubmenu();
            
            // 모바일에서 서브메뉴 위치: 폴더 추가 버튼의 오른쪽 끝에 바로 표시
            const folderBtnRect = folderBtn.getBoundingClientRect();
            
            // 폴더 추가 버튼의 오른쪽 끝에 서브메뉴 표시 (항상 오른쪽)
            let left = folderBtnRect.right + 4;
            let top = folderBtnRect.top;
            
            // 서브메뉴가 실제로 렌더링된 후 너비 확인
            submenu.style.visibility = 'hidden';
            submenu.style.display = 'flex';
            document.body.appendChild(submenu);
            const submenuWidth = submenu.offsetWidth || 180;
            const submenuHeight = Math.min(300, submenu.scrollHeight || 300);
            
            // 화면 오른쪽 경계 확인 - 오른쪽에 맞추되 화면 밖으로 나가지 않도록 조정
            if (left + submenuWidth > window.innerWidth - 10) {
              // 오른쪽에 맞추되 화면 안에 들어오도록 left 조정
              left = Math.max(10, window.innerWidth - submenuWidth - 10);
            }
            
            // 화면 아래쪽 경계 확인
            if (top + submenuHeight > window.innerHeight - 10) {
              top = Math.max(10, window.innerHeight - submenuHeight - 10);
            }
            
            // 화면 위쪽 경계 확인
            if (top < 10) {
              top = 10;
            }
            
            submenu.style.left = left + 'px';
            submenu.style.top = top + 'px';
            submenu.style.position = 'fixed';
            submenu.style.zIndex = '10000002';
            submenu.style.visibility = 'visible';
            
            submenuVisible = true;
            
            const currentFolders = loadFolders();
            
            // 서브메뉴 외부 클릭 시 닫기
            setTimeout(() => {
              const closeSubmenu = function(e) {
                if (noteContextMenuSubmenu && 
                    !noteContextMenuSubmenu.contains(e.target) && 
                    !folderBtn.contains(e.target) &&
                    (!noteContextMenu || !noteContextMenu.contains(e.target))) {
                  noteContextMenuSubmenu.style.display = 'none';
                  submenuVisible = false;
                  document.removeEventListener('click', closeSubmenu);
                  document.removeEventListener('touchend', closeSubmenu);
                }
              };
              document.addEventListener('click', closeSubmenu, true);
              document.addEventListener('touchend', closeSubmenu, true);
            }, 100);
          }
        });
      } else {
        // PC: 마우스 오버로 서브메뉴 표시
        folderBtn.addEventListener('mouseenter', function() {
          // 서브메뉴를 최신 폴더 목록으로 새로 생성
          const submenu = createSubmenu();
          const rect = folderBtn.getBoundingClientRect();
          submenu.style.left = (rect.right + 4) + 'px';
          submenu.style.top = rect.top + 'px';
          submenu.style.display = 'flex';
          document.body.appendChild(submenu);
        });

        folderBtn.addEventListener('mouseleave', function(e) {
          // 서브메뉴로 이동 중이면 유지
          if (noteContextMenuSubmenu && !noteContextMenuSubmenu.contains(e.relatedTarget)) {
            setTimeout(() => {
              if (noteContextMenuSubmenu && !noteContextMenuSubmenu.matches(':hover')) {
                noteContextMenuSubmenu.style.display = 'none';
              }
            }, 100);
          }
        });
      }

      noteContextMenu.appendChild(folderBtn);
      document.body.appendChild(noteContextMenu);

      // 메뉴 외부 클릭 시 닫기 (모바일에서는 메뉴를 클릭하지 않으면 계속 표시)
      setTimeout(() => {
        let menuJustShown = true;
        // 메뉴가 표시된 직후 일정 시간 동안은 touchend로 닫지 않음
        setTimeout(() => {
          menuJustShown = false;
        }, 500);
        
        const closeMenu = function(e) {
          // 모바일에서 메뉴가 방금 표시된 경우 touchend로 닫지 않음
          if (window.innerWidth <= 768 && menuJustShown && e.type === 'touchend') {
            return;
          }
          
          // 모바일에서는 메뉴나 서브메뉴를 클릭한 경우에만 닫지 않음 (외부 클릭 시에만 닫기)
          if (noteContextMenu && !noteContextMenu.contains(e.target) && 
              (!noteContextMenuSubmenu || !noteContextMenuSubmenu.contains(e.target))) {
            // 모바일에서는 click 이벤트만 처리 (touchend는 무시)
            if (window.innerWidth <= 768 && e.type === 'touchend') {
              return;
            }
            hideNoteContextMenu();
            document.removeEventListener('click', closeMenu);
            document.removeEventListener('touchend', closeMenu);
          }
        };
        // 모바일에서는 click 이벤트만 사용 (touchend는 사용하지 않음)
        document.addEventListener('click', closeMenu);
        if (window.innerWidth > 768) {
          document.addEventListener('touchend', closeMenu);
        }
      }, 0);
    }

    function hideNoteContextMenu() {
      if (noteContextMenu) {
        noteContextMenu.remove();
        noteContextMenu = null;
      }
      if (noteContextMenuSubmenu) {
        noteContextMenuSubmenu.remove();
        noteContextMenuSubmenu = null;
      }
      currentContextNoteId = null;
    }

    // 입력창 자동 높이 조절
    function autosize(el) {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }

    // 텍스트 내 URL을 하이퍼링크로 변환
    function linkify(text) {
      const frag = document.createDocumentFragment();
      // URL 패턴: http://, https://, www.로 시작하거나 도메인 패턴 (예: naver.com, example.co.kr)
      // 도메인 패턴: 알파벳/숫자로 시작하고 최소 2글자 이상의 TLD를 가진 패턴
      const urlRegex = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+|[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.(?:[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})*)(?:\/[^\s<>"']*)?)/gi;
      let lastIndex = 0;
      let match;
      while ((match = urlRegex.exec(text)) !== null) {
        const url = match[0];
        const start = match.index;
        // URL 뒤에 문장부호가 있는지 확인
        const afterUrl = text.slice(start + url.length, start + url.length + 1);
        const hasPunctuation = /[.,;:!?)]/.test(afterUrl);
        
        if (start > lastIndex) {
          frag.appendChild(document.createTextNode(text.slice(lastIndex, start)));
        }
        const a = document.createElement('a');
        let href = url;
        // URL 끝의 문장부호 제거 (URL에 포함된 경우)
        let cleanUrl = url.replace(/[.,;:!?)]+$/, '');
        if (url.startsWith('http://') || url.startsWith('https://')) {
          href = cleanUrl;
        } else if (url.startsWith('www.')) {
          href = `https://${cleanUrl}`;
        } else {
          // 도메인만 있는 경우 (예: naver.com)
          href = `https://${cleanUrl}`;
        }
        a.href = href;
        a.textContent = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        frag.appendChild(a);
        lastIndex = start + url.length;
      }
      if (lastIndex < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex)));
      }
      return frag;
    }

    /** 선택 상태 관리 (렌더 전에 선언) */
    /** @type {Set<string>} */
    const selectedIds = new Set();

    /** 타래 모드 상태 */
    let threadParentId = null;

    function toggleSelect(id, checked) {
      if (checked) selectedIds.add(id); else selectedIds.delete(id);
      // 단일 선택 시 타래 모드 활성화
      if (selectedIds.size === 1 && checked) {
        threadParentId = id;
        updateThreadMode();
      } else if (selectedIds.size !== 1) {
        threadParentId = null;
        updateThreadMode();
      }
      updateBulkState();
    }

    function updateThreadMode() {
      const composer = document.querySelector('.composer');
      const input = document.getElementById('note-input');
      const threadIndicator = document.getElementById('thread-indicator');
      const threadIndicatorText = document.querySelector('.thread-indicator-text');
      const cancelThreadBtn = document.getElementById('cancel-thread');
      
      if (threadParentId) {
        document.body.classList.add('thread-mode');
        if (input) {
          const notes = loadNotes();
          const parentNote = notes.find(n => n.id === threadParentId);
          if (parentNote) {
            const previewText = parentNote.text ? (parentNote.text.length > 50 ? parentNote.text.substring(0, 50) + '...' : parentNote.text) : '(이미지만)';
            input.placeholder = `"${previewText}"에 답글 작성...`;
            if (threadIndicator) threadIndicator.style.display = 'flex';
            if (threadIndicatorText) threadIndicatorText.textContent = `답글 작성 중: "${previewText}"`;
          }
        }
        if (cancelThreadBtn) {
          cancelThreadBtn.onclick = function() {
            threadParentId = null;
            selectedIds.clear();
            updateThreadMode();
            updateBulkState();
            renderList(loadNotes());
          };
        }
      } else {
        document.body.classList.remove('thread-mode');
        if (input) {
          input.placeholder = '여기에 글을 쓰세요...';
        }
        if (threadIndicator) threadIndicator.style.display = 'none';
      }
    }

    function updateBulkState() {
      const total = loadNotes().length;
      const selected = selectedIds.size;
      if (selectedCountEl) selectedCountEl.textContent = selected + '개 선택됨';
      if (bulkEditBtn) bulkEditBtn.disabled = selected === 0;
      if (bulkDeleteBtn) bulkDeleteBtn.disabled = selected === 0;
    }

    function updateTotalNotesCount() {
      if (!totalNotesCountEl) return;
      const total = loadNotes().length;
      totalNotesCountEl.textContent = total + '개';
    }

    /** 인라인 편집 상태 */
    /** @type {Set<string>} */
    const editingIds = new Set();
    /** @type {Map<string,string>} */
    const editDraft = new Map();

    /** 선택 모드 상태 */
    let selectionMode = false;
    function setSelectionMode(on) {
      selectionMode = on;
      document.body.classList.toggle('selection-mode', selectionMode);
      if (toggleSelectionBtn) toggleSelectionBtn.textContent = selectionMode ? '해제' : '선택';
      if (!selectionMode) {
        selectedIds.clear();
        editingIds.clear();
        editDraft.clear();
        threadParentId = null;
        updateThreadMode();
      }
      renderList(loadNotes());
      updateBulkState();
    }

    function startInlineEdit(ids) {
      const notes = loadNotes();
      for (const id of ids) {
        const n = notes.find(x => x.id === id);
        if (n) {
          editingIds.add(id);
          editDraft.set(id, n.text);
        }
      }
      renderList(notes);
    }

    function onInlineSave(id) {
      const notes = loadNotes();
      const n = notes.find(x => x.id === id);
      if (!n) return;
      const value = (editDraft.get(id) ?? n.text).trim();
      if (!value) return;
      n.text = value;
      saveNotes(notes);
      editingIds.delete(id);
      editDraft.delete(id);
      renderList(notes);
    }

    function onInlineCancel(id) {
      editingIds.delete(id);
      editDraft.delete(id);
      renderList(loadNotes());
    }

    // 날짜 필터 상태와 유틸을 렌더 전에 선언
    /** @type {Date[]} */
    let selectedDates = [];
    let lastSelectedDate = null; // Shift 연속 선택을 위한 마지막 선택 날짜
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    function formatDate(date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    // 업로드 임시 보관 (다중)
    /** @type {string[]} */
    let pendingImages = [];
    let dragIndex = null;

    // 업로드 미리보기 영역에서 기본 드래그오버 허용
    if (uploadPreview) {
      uploadPreview.addEventListener('dragover', function (e) { e.preventDefault(); });
    }

    function renderUploadPreview() {
      if (!uploadPreview) return;
      uploadPreview.innerHTML = '';
      if (pendingImages.length > 0) {
        pendingImages.forEach((src, index) => {
          const wrap = document.createElement('div');
          wrap.className = 'preview-thumb';
          wrap.draggable = true;
          wrap.dataset.index = String(index);

          const img = document.createElement('img');
          img.src = src;
          img.alt = '업로드 미리보기';
          img.draggable = false; // 이미지 드래그 방지

          const removeBtn = document.createElement('button');
          removeBtn.type = 'button';
          removeBtn.className = 'preview-remove';
          removeBtn.textContent = 'X';
          removeBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            pendingImages.splice(index, 1);
            renderUploadPreview();
          });

          // Drag events - 컨테이너에서만 드래그 가능
          wrap.addEventListener('dragstart', function (e) {
            e.stopPropagation();
            dragIndex = index;
            if (e.dataTransfer) {
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/html', String(index));
              e.dataTransfer.setData('text/plain', String(index));
            }
            wrap.classList.add('dragging');
            setTimeout(() => wrap.style.opacity = '0.5', 0);
          });
          wrap.addEventListener('dragend', function (e) {
            e.stopPropagation();
            wrap.classList.remove('dragging');
            wrap.style.opacity = '';
            dragIndex = null;
          });
          wrap.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (dragIndex !== null && dragIndex !== index) {
              wrap.classList.add('drag-over');
            }
          });
          wrap.addEventListener('dragleave', function (e) {
            e.preventDefault();
            e.stopPropagation();
            wrap.classList.remove('drag-over');
          });
          wrap.addEventListener('drop', function (e) {
            e.preventDefault();
            e.stopPropagation();
            wrap.classList.remove('drag-over');
            if (dragIndex === null) return;
            const sourceIndex = dragIndex;
            const targetIndex = index;
            if (sourceIndex === targetIndex) return;
            const moved = pendingImages.splice(sourceIndex, 1)[0];
            pendingImages.splice(targetIndex, 0, moved);
            renderUploadPreview();
          });

          wrap.appendChild(img);
          wrap.appendChild(removeBtn);
          uploadPreview.appendChild(wrap);
        });
        uploadPreview.style.display = '';
      } else {
        uploadPreview.style.display = 'none';
      }
    }

    /** @param {Note} note */
    /** @param {number} threadDepth 타래 깊이 (0 = 부모, 1 = 첫 번째 자식, 2 = 두 번째 자식...) */
    function renderNote(note, hasChildren = false, threadDepth = 0) {
      const wrapper = document.createElement('div');
      wrapper.className = 'note-wrapper';
      if (note.parentId) {
        wrapper.classList.add('thread-reply');
        wrapper.dataset.threadDepth = String(threadDepth);
      }

      const selWrap = document.createElement('div');
      selWrap.className = 'note-select';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = selectedIds.has(note.id);
      checkbox.addEventListener('change', function () {
        toggleSelect(note.id, checkbox.checked);
      });
      selWrap.appendChild(checkbox);
      
      // 모바일에서는 선택 모드가 아닐 때만 체크박스 숨김 (CSS로 처리)
      // 인라인 스타일을 설정하지 않고 CSS 클래스만 사용

      const li = document.createElement('li');
      li.className = 'note-item';

      const textEl = document.createElement('div');
      textEl.className = 'note-text';
      if (note.text) {
        textEl.appendChild(linkify(note.text));
      }

      const meta = document.createElement('div');
      meta.className = 'note-meta';

      const timeEl = document.createElement('time');
      timeEl.className = 'note-time';
      timeEl.dateTime = note.createdAt;
      // 날짜 모드에 따라 표시 형식 변경
      timeEl.textContent = formatCompact(new Date(note.createdAt));
      
      // 시간 클릭 시 북마크 폴더에 추가/제거
      timeEl.addEventListener('click', function () {
        const notes = loadNotes();
        const currentNote = notes.find(n => n.id === note.id);
        if (currentNote) {
          if (!currentNote.folderIds) {
            currentNote.folderIds = [];
          }
          const bookmarkIndex = currentNote.folderIds.indexOf(BOOKMARK_FOLDER_ID);
          if (bookmarkIndex >= 0) {
            // 북마크 제거
            currentNote.folderIds.splice(bookmarkIndex, 1);
            if (currentNote.folderIds.length === 0) {
              delete currentNote.folderIds;
            }
            showToast('북마크에서 삭제되었습니다.');
          } else {
            // 북마크 추가
            currentNote.folderIds.push(BOOKMARK_FOLDER_ID);
            showToast('북마크에 추가되었습니다.');
          }
          saveNotes(notes);
          renderList(notes);
        }
      });

      meta.appendChild(timeEl);

      // 선택 모드일 때 폴더명 표시
      if (selectionMode && note.folderIds && note.folderIds.length > 0) {
        const folders = loadFolders();
        const folderNames = note.folderIds
          .map(id => {
            const folder = folders.find(f => f.id === id);
            return folder ? folder.name : null;
          })
          .filter(name => name !== null);
        if (folderNames.length > 0) {
          folderNames.forEach(folderName => {
            const folderEl = document.createElement('div');
            folderEl.className = 'note-folder';
            folderEl.textContent = folderName;
            meta.appendChild(folderEl);
          });
        }
      }

      // 편집 중이면 원문 텍스트를 숨김 (append하지 않음)
      const isEditing = editingIds.has(note.id);
      if (!isEditing && note.text) {
        li.appendChild(textEl);
      }
      li.appendChild(meta);

      // 이미지(배열/단일) 표시
      const images = Array.isArray(note.images) ? note.images : (note.imageData ? [note.imageData] : []);
      if (images.length > 0) {
        const imgWrap = document.createElement('div');
        imgWrap.className = 'note-image-wrap';
        for (const src of images) {
          const img = document.createElement('img');
          img.className = 'note-image';
          img.src = src;
          img.alt = '첨부 이미지';
          img.addEventListener('click', function () { openImageModal(src, note.id); });
          imgWrap.appendChild(img);
        }
        imgWrap.style.gridColumn = '1 / -1';
        li.appendChild(imgWrap);
      }

      // 인라인 편집 영역: 편집 대상일 때만 표시 (텍스트만 편집)
      if (isEditing) {
        const editor = document.createElement('div');
        editor.className = 'note-editor';

        const ta = document.createElement('textarea');
        ta.rows = 3;
        ta.value = editDraft.get(note.id) ?? note.text;
        ta.addEventListener('input', function () {
          editDraft.set(note.id, ta.value);
        });
        ta.addEventListener('keydown', function (e) {
          // Alt+Enter: 강제 줄바꿈
          if (e.key === 'Enter' && e.altKey) {
            e.preventDefault();
            insertNewlineAtCursor(ta);
            return;
          }
          // Enter: 저장 (Alt/Shift/Control/Meta가 없을 때)
          if (e.key === 'Enter' && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            onInlineSave(note.id);
          }
        });

        const actionRow = document.createElement('div');
        actionRow.className = 'editor-actions';

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'btn btn-cancel';
        cancelBtn.textContent = '취소';
        cancelBtn.addEventListener('click', function () { onInlineCancel(note.id); });

        const saveBtn = document.createElement('button');
        saveBtn.type = 'button';
        saveBtn.className = 'btn btn-save';
        saveBtn.textContent = '저장';
        saveBtn.addEventListener('click', function () { onInlineSave(note.id); });

        actionRow.appendChild(cancelBtn);
        actionRow.appendChild(saveBtn);
        editor.appendChild(ta);
        editor.appendChild(actionRow);
        li.appendChild(editor);
      }

      // 우클릭 메뉴 추가
      li.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showNoteContextMenu(e, note);
      });

      // 모바일: 길게 누르기로 메뉴 표시
      let touchTimer = null;
      let touchStartX = 0;
      let touchStartY = 0;
      
      li.addEventListener('touchstart', function(e) {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        
        touchTimer = setTimeout(function() {
          // 길게 누르기 감지 (500ms 이상)
          const fakeEvent = {
            clientX: touchStartX,
            clientY: touchStartY,
            preventDefault: function() {}
          };
          showNoteContextMenu(fakeEvent, note);
          touchTimer = null;
        }, 500);
      });

      li.addEventListener('touchend', function(e) {
        if (touchTimer) {
          clearTimeout(touchTimer);
          touchTimer = null;
        }
        // 메뉴가 표시된 경우 touchend 이벤트 전파 중지 (메뉴가 바로 닫히지 않도록)
        if (noteContextMenu && noteContextMenu.parentNode) {
          e.stopPropagation();
        }
      }, { passive: false });

      li.addEventListener('touchmove', function(e) {
        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - touchStartX);
        const deltaY = Math.abs(touch.clientY - touchStartY);
        
        // 너무 많이 움직이면 취소
        if (deltaX > 10 || deltaY > 10) {
          if (touchTimer) {
            clearTimeout(touchTimer);
            touchTimer = null;
          }
        }
      });

      wrapper.appendChild(selWrap);
      wrapper.appendChild(li);
      return wrapper;
    }

    /** @param {Note[]} notes */
    function renderList(notes) {
      list.innerHTML = '';
      // 날짜 필터 적용
      let filtered = notes;
      if (selectedDates.length > 0) {
        const selectedDateStrs = new Set(selectedDates.map(d => formatDate(d)));
        filtered = filtered.filter(n => {
          const noteDateStr = formatDate(new Date(n.createdAt));
          return selectedDateStrs.has(noteDateStr);
        });
      }
      
      // 폴더 필터 적용 - 타래 구조 유지를 위해 부모/자식 중 하나라도 폴더에 있으면 전체 포함
      if (selectedFolderIds.size > 0) {
        // 사진 폴더가 선택되었는지 확인
        const hasPhotoFolder = selectedFolderIds.has(PHOTO_FOLDER_ID);
        const otherFolders = Array.from(selectedFolderIds).filter(id => id !== PHOTO_FOLDER_ID);
        
        if (hasPhotoFolder && otherFolders.length === 0) {
          // 사진 폴더만 선택: 사진이 있는 글만 표시
          filtered = filtered.filter(n => {
            const hasImages = (n.images && n.images.length > 0) || n.imageData;
            return hasImages;
          });
        } else {
          // 일반 폴더 선택 (사진 폴더 포함 가능): 타래 구조를 유지하면서 필터링
          // 먼저 타래 구조 정리 (필터 전)
          const allParentNotes = filtered.filter(n => !n.parentId);
          const allChildNotesMap = new Map();
          filtered.forEach(n => {
            if (n.parentId) {
              if (!allChildNotesMap.has(n.parentId)) {
                allChildNotesMap.set(n.parentId, []);
              }
              allChildNotesMap.get(n.parentId).push(n);
            }
          });
          
          // 선택된 폴더 중 하나라도 속한 글을 찾고, 타래 전체 포함
          const matchingNotes = new Set();
          filtered.forEach(n => {
            // 사진 폴더가 선택되었고 사진이 있으면 포함
            if (hasPhotoFolder) {
              const hasImages = (n.images && n.images.length > 0) || n.imageData;
              if (hasImages) {
                matchingNotes.add(n.id);
                // 부모 글도 포함
                if (n.parentId) {
                  matchingNotes.add(n.parentId);
                }
                // 자식 글들도 포함
                const children = allChildNotesMap.get(n.id) || [];
                children.forEach(child => matchingNotes.add(child.id));
              }
            }
            // 다른 폴더들 확인
            if (n.folderIds && otherFolders.length > 0) {
              const hasMatchingFolder = otherFolders.some(folderId => n.folderIds.includes(folderId));
              if (hasMatchingFolder) {
                matchingNotes.add(n.id);
                // 부모 글도 포함
                if (n.parentId) {
                  matchingNotes.add(n.parentId);
                }
                // 자식 글들도 포함
                const children = allChildNotesMap.get(n.id) || [];
                children.forEach(child => matchingNotes.add(child.id));
              }
            }
          });
          filtered = filtered.filter(n => matchingNotes.has(n.id));
        }
      }
      
      // 타래 구조 정리: 필터링 전 전체 노트에서 타래 구조 구성 (검색 필터용)
      const allChildNotesMap = new Map();
      notes.forEach(n => {
        if (n.parentId) {
          if (!allChildNotesMap.has(n.parentId)) {
            allChildNotesMap.set(n.parentId, []);
          }
          allChildNotesMap.get(n.parentId).push(n);
        }
      });
      
      // 검색 필터 적용(텍스트에 포함) - 타래 구조 유지를 위해 부모/자식 모두 포함
      if (searchQuery && searchQuery.trim() !== '') {
        const q = searchQuery.trim().toLowerCase();
        const matchingNotes = new Set();
        filtered.forEach(n => {
          if ((n.text || '').toLowerCase().includes(q)) {
            matchingNotes.add(n.id);
            // 부모 글도 포함
            if (n.parentId) {
              matchingNotes.add(n.parentId);
            }
            // 자식 글들도 포함
            const children = allChildNotesMap.get(n.id) || [];
            children.forEach(child => matchingNotes.add(child.id));
          }
        });
        filtered = filtered.filter(n => matchingNotes.has(n.id));
      }
      
      // 타래 구조 최종 정리 (필터 후) - 필터링된 노트만 사용하되, 필터링 전 타래 구조 참조
      const finalParentNotes = filtered.filter(n => !n.parentId);
      const finalChildNotesMap = new Map();
      filtered.forEach(n => {
        if (n.parentId) {
          // 부모가 필터링된 결과에 있는지 확인
          const parentExists = filtered.some(p => p.id === n.parentId);
          if (parentExists) {
            if (!finalChildNotesMap.has(n.parentId)) {
              finalChildNotesMap.set(n.parentId, []);
            }
            finalChildNotesMap.get(n.parentId).push(n);
          }
        }
      });
      
      // 타래가 있는 부모 글은 가장 최신 타래 시간 기준으로 정렬, 그 외는 부모 글 시간 기준
      const sorted = [...finalParentNotes].sort((a, b) => {
        const aChildren = finalChildNotesMap.get(a.id) || [];
        const bChildren = finalChildNotesMap.get(b.id) || [];
        
        // 가장 최신 타래 시간 찾기 (재귀적으로)
        function getLatestThreadTime(parentId, map) {
          const children = map.get(parentId) || [];
          if (children.length === 0) return 0;
          let latest = 0;
          for (const child of children) {
            const childTime = new Date(child.createdAt).getTime();
            if (childTime > latest) latest = childTime;
            const nestedLatest = getLatestThreadTime(child.id, map);
            if (nestedLatest > latest) latest = nestedLatest;
          }
          return latest;
        }
        
        const aLatestThread = getLatestThreadTime(a.id, finalChildNotesMap);
        const bLatestThread = getLatestThreadTime(b.id, finalChildNotesMap);
        
        // 타래가 있으면 타래 시간 기준, 없으면 부모 글 시간 기준
        const aTime = aLatestThread > 0 ? aLatestThread : new Date(a.createdAt).getTime();
        const bTime = bLatestThread > 0 ? bLatestThread : new Date(b.createdAt).getTime();
        
        return bTime - aTime;
      });
      
      // 재귀적으로 타래 렌더링
      function renderThread(parentId, childMap, container, depth = 1) {
        const children = childMap.get(parentId) || [];
        if (children.length === 0) return;
        
        const threadContainer = document.createElement('div');
        threadContainer.className = 'thread-container';
        threadContainer.dataset.threadDepth = String(depth);
        const sortedChildren = [...children].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        for (const child of sortedChildren) {
          const hasChildren = (childMap.get(child.id) || []).length > 0;
          const childWrapper = renderNote(child, hasChildren, depth);
          threadContainer.appendChild(childWrapper);
          // 중첩 타래 렌더링
          renderThread(child.id, childMap, threadContainer, depth + 1);
        }
        
        container.appendChild(threadContainer);
      }
      
      // DocumentFragment 사용하여 DOM 조작 최소화 (성능 개선)
      const fragment = document.createDocumentFragment();
      
      for (const parent of sorted) {
        // 부모 글 렌더링 (자식이 있는지 확인)
        const hasChildren = (finalChildNotesMap.get(parent.id) || []).length > 0;
        const parentWrapper = renderNote(parent, hasChildren, 0);
        fragment.appendChild(parentWrapper);
        
        // 자식 글들 렌더링 (타래, 재귀적으로)
        renderThread(parent.id, finalChildNotesMap, fragment, 1);
      }
      
      // 한 번에 DOM에 추가 (성능 개선)
      list.appendChild(fragment);
      
      updateTotalNotesCount();
      updateFilterInfo();
    }

    function generateId() {
      return Math.random().toString(36).slice(2) + Date.now().toString(36);
    }

    async function onSubmit() {
      const value = (input.value || '').trim();
      // 텍스트 또는 이미지가 하나라도 있을 때 전송
      if (!value && pendingImages.length === 0) {
        input.focus();
        return;
      }
      const nowIso = new Date().toISOString();
      /** @type {Note} */
      const note = { id: generateId(), text: value, createdAt: nowIso };
      if (pendingImages.length > 0) note.images = [...pendingImages];
      // 타래 모드일 때 parentId 설정
      if (threadParentId) {
        note.parentId = threadParentId;
        // 타래 모드는 유지 (여러 글 작성 가능)
      }
      const notes = loadNotes();
      notes.push(note);
      
      // 로컬 저장 먼저
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      updateTotalNotesCount();
      
      // Firebase 동기화 (모바일에서도 확실히 저장되도록 await)
      if (isFirebaseEnabled() && !isSyncing) {
        try {
          await syncToFirebase(notes);
          console.log('✅ 메모가 Firebase에 저장되었습니다.');
        } catch (err) {
          console.error('❌ Firebase 저장 실패:', err);
          // 저장 실패해도 로컬에는 저장되었으므로 계속 진행
        }
      }
      
      renderList(notes);
      if (calendarEl) renderCalendar();
      // 입력/미리보기 초기화
      input.value = '';
      autosize(input);
      pendingImages = [];
      if (fileInput) fileInput.value = '';
      renderUploadPreview();
      input.focus();
    }

    function insertNewlineAtCursor(textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      textarea.value = value.slice(0, start) + '\n' + value.slice(end);
      const newPos = start + 1;
      textarea.selectionStart = textarea.selectionEnd = newPos;
    }

    // 검색 아이콘 업데이트 함수
    function updateSearchIcon() {
      if (!searchIcon || !closeIcon) return;
      const hasSearch = searchQuery && searchQuery.trim() !== '';
      if (hasSearch) {
        searchIcon.style.display = 'none';
        closeIcon.style.display = 'block';
      } else {
        searchIcon.style.display = 'block';
        closeIcon.style.display = 'none';
      }
    }

    // 검색 UI 이벤트
    if (searchBtn && searchInput) {
      searchBtn.addEventListener('click', function () {
        if (searchQuery && searchQuery.trim() !== '') {
          // 검색이 활성화되어 있으면 해제
          searchQuery = '';
          searchInput.value = '';
          updateSearchIcon();
          renderList(loadNotes());
        } else {
          // 검색 실행
          searchQuery = searchInput.value || '';
          updateSearchIcon();
          renderList(loadNotes());
        }
      });
      searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          searchQuery = searchInput.value || '';
          updateSearchIcon();
          renderList(loadNotes());
        }
      });
      // 입력 필드가 비워지면 검색 해제
      searchInput.addEventListener('input', function () {
        if (!searchInput.value.trim()) {
          searchQuery = '';
          updateSearchIcon();
          renderList(loadNotes());
        }
      });
    }

    // 이벤트
    submitBtn.addEventListener('click', onSubmit);
    input.addEventListener('input', function () { autosize(input); });
    input.addEventListener('keydown', function (e) {
      // Alt+Enter: 강제 줄바꿈
      if (e.key === 'Enter' && e.altKey) {
        e.preventDefault();
        insertNewlineAtCursor(input);
        autosize(input);
        return;
      }
      // Enter: 전송 (Alt/Shift/Control/Meta가 없을 때)
      if (e.key === 'Enter' && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        onSubmit();
      }
    });

    // 전체 버튼: 전체 선택/해제 토글
    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', function () {
        const notes = loadNotes();
        if (selectedIds.size === notes.length) {
          selectedIds.clear();
        } else {
          selectedIds.clear();
          for (const n of notes) selectedIds.add(n.id);
        }
        renderList(notes);
        updateBulkState();
      });
    }

    if (bulkDeleteBtn) {
      bulkDeleteBtn.addEventListener('click', function () {
        const notes = loadNotes();
        if (selectedIds.size === 0) return;
        const next = notes.filter(n => !selectedIds.has(n.id));
        saveNotes(next);
        selectedIds.clear();
        renderList(next);
        if (calendarEl) renderCalendar();
        updateBulkState();
      });
    }

    if (bulkEditBtn) {
      bulkEditBtn.addEventListener('click', function () {
        if (selectedIds.size === 0) return;
        startInlineEdit(Array.from(selectedIds));
      });
    }

    // 업로드: 전송 보류, 미리보기 표시 (다중)
    if (uploadBtn && fileInput) {
      // label을 사용하므로 클릭 시 자동으로 fileInput이 트리거됨
      // 추가 이벤트 리스너는 필요 없지만, 호환성을 위해 유지
      uploadBtn.addEventListener('click', function(e) {
        // label이 자동으로 처리하므로 추가 작업 불필요
        // 하지만 모바일에서 확실하게 작동하도록 명시적으로 클릭
        if (fileInput && uploadBtn.tagName.toLowerCase() !== 'label') {
          e.preventDefault();
          fileInput.click();
        }
      });
      
      fileInput.addEventListener('change', function () {
        const files = fileInput.files;
        if (!files || files.length === 0) return;
        
        console.log('파일 선택됨:', files.length, '개 파일');
        
        const readPromises = [];
        for (const file of Array.from(files)) {
          readPromises.push(new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = function () {
              resolve(String(reader.result || ''));
            };
            reader.onerror = function(error) {
              console.error('파일 읽기 오류:', error);
              resolve(null);
            };
            reader.readAsDataURL(file);
          }));
        }
        Promise.all(readPromises).then(results => {
          const validResults = results.filter(r => r !== null);
          if (validResults.length > 0) {
            pendingImages.push(...validResults);
            renderUploadPreview();
            console.log('이미지 미리보기 추가:', validResults.length, '개');
          }
          // 선택 상태 초기화
          fileInput.value = '';
        });
      });
    }

    // 투명화 토글
    if (toggleTransparencyBtn) {
      const syncTransparencyLabel = () => {
        const on = document.body.classList.contains('text-transparent');
        toggleTransparencyBtn.textContent = on ? '해제' : '투명';
      };
      toggleTransparencyBtn.addEventListener('click', function () {
        document.body.classList.toggle('text-transparent');
        syncTransparencyLabel();
      });
      // 초기 라벨 동기화
      syncTransparencyLabel();
    }

    // 날짜 모드 토글
    if (toggleDateBtn) {
      const syncDateLabel = () => {
        toggleDateBtn.textContent = dateMode ? '해제' : '날짜';
      };
      toggleDateBtn.addEventListener('click', function () {
        dateMode = !dateMode;
        syncDateLabel();
        renderList(loadNotes());
      });
      syncDateLabel();
    }

    // 데이터 백업
    function backupData() {
      try {
        const backup = {
          notes: localStorage.getItem(STORAGE_KEY),
          folders: localStorage.getItem(FOLDERS_KEY),
          profileBio: localStorage.getItem(PROFILE_BIO_KEY),
          profileImage: localStorage.getItem(PROFILE_IMAGE_KEY),
          profileName: localStorage.getItem(PROFILE_NAME_KEY)
        };
        localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
        return true;
      } catch {
        return false;
      }
    }

    // 데이터 복원
    function restoreData() {
      try {
        const backupRaw = localStorage.getItem(BACKUP_KEY);
        if (!backupRaw) return false;
        const backup = JSON.parse(backupRaw);
        
        if (backup.notes !== null) localStorage.setItem(STORAGE_KEY, backup.notes);
        if (backup.folders !== null) localStorage.setItem(FOLDERS_KEY, backup.folders);
        if (backup.profileBio !== null) localStorage.setItem(PROFILE_BIO_KEY, backup.profileBio);
        if (backup.profileImage !== null) localStorage.setItem(PROFILE_IMAGE_KEY, backup.profileImage);
        if (backup.profileName !== null) localStorage.setItem(PROFILE_NAME_KEY, backup.profileName);
        
        return true;
      } catch {
        return false;
      }
    }

    // 데이터 초기화
    async function resetData() {
      // 로컬 스토리지 초기화
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(FOLDERS_KEY);
      localStorage.removeItem(PROFILE_BIO_KEY);
      localStorage.removeItem(PROFILE_IMAGE_KEY);
      localStorage.removeItem(PROFILE_NAME_KEY);
      
      // GitHub Gist에서도 데이터 삭제
      if (isGitHubEnabled() && window.githubSync && window.githubSync.gistId) {
        try {
          await githubApiCall(`/gists/${window.githubSync.gistId}`, 'DELETE');
          localStorage.removeItem('github_gist_id');
          localStorage.removeItem('github_last_updated');
          window.githubSync.gistId = null;
          console.log('GitHub Gist 데이터 삭제 완료');
        } catch (error) {
          console.error('GitHub Gist 데이터 삭제 실패:', error);
        }
      }
    }

    // 백업 삭제
    function deleteBackup() {
      localStorage.removeItem(BACKUP_KEY);
    }

    // 백업 존재 여부 확인
    function hasBackup() {
      return localStorage.getItem(BACKUP_KEY) !== null;
    }

    // 버튼 상태 업데이트
    function updateResetButtons() {
      if (resetBtn && restoreBtn && finalDeleteBtn) {
        if (hasBackup()) {
          resetBtn.style.display = 'none';
          restoreBtn.style.display = 'block';
          finalDeleteBtn.style.display = 'block';
        } else {
          resetBtn.style.display = 'block';
          restoreBtn.style.display = 'none';
          finalDeleteBtn.style.display = 'none';
        }
      }
    }

    // 초기화 버튼 이벤트
    if (resetBtn && resetConfirmModal && resetConfirmYes && resetConfirmNo) {
      resetBtn.addEventListener('click', function() {
        resetConfirmModal.style.display = 'flex';
      });

      resetConfirmYes.addEventListener('click', async function() {
        // 데이터 백업
        if (backupData()) {
          // 데이터 초기화 (Firebase 포함)
          await resetData();
          // UI 업데이트
          updateResetButtons();
          // 페이지 새로고침하여 초기화된 상태 반영
          location.reload();
        } else {
          showToast('백업 중 오류가 발생했습니다.');
        }
        resetConfirmModal.style.display = 'none';
      });

      resetConfirmNo.addEventListener('click', function() {
        resetConfirmModal.style.display = 'none';
      });

      // 모달 외부 클릭 시 닫기
      resetConfirmModal.addEventListener('click', function(e) {
        if (e.target === resetConfirmModal) {
          resetConfirmModal.style.display = 'none';
        }
      });
    }

    // 복원 버튼 이벤트
    if (restoreBtn) {
      restoreBtn.addEventListener('click', function() {
        if (restoreData()) {
          showToast('데이터가 복원되었습니다.');
          // 복원 후 백업 삭제하여 초기화 버튼으로 돌아가기
          deleteBackup();
          updateResetButtons();
          // 페이지 새로고침하여 복원된 상태 반영
          location.reload();
        } else {
          showToast('복원 중 오류가 발생했습니다.');
        }
      });
    }

    // 진짜끝 버튼 이벤트
    if (finalDeleteBtn) {
      finalDeleteBtn.addEventListener('click', function() {
        deleteBackup();
        updateResetButtons();
        showToast('백업이 영구적으로 삭제되었습니다.');
      });
    }

    // 초기 버튼 상태 설정
    updateResetButtons();

    // 이미지 모달 닫기 이벤트
    if (imageModal) {
      imageModal.addEventListener('click', function (e) {
        if (e.target === imageModal) {
          closeImageModal();
        }
      });
    }
    if (imageModalClose) {
      imageModalClose.addEventListener('click', function () { closeImageModal(); });
    }
    if (imageModalPrev) {
      imageModalPrev.addEventListener('click', function (e) {
        e.stopPropagation();
        showPrevImage();
      });
    }
    if (imageModalNext) {
      imageModalNext.addEventListener('click', function (e) {
        e.stopPropagation();
        showNextImage();
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeImageModal();
      } else if (e.key === 'ArrowLeft' && imageModal && imageModal.classList.contains('open')) {
        showPrevImage();
      } else if (e.key === 'ArrowRight' && imageModal && imageModal.classList.contains('open')) {
        showNextImage();
      }
    });

    // 초기 상태 업데이트
    updateBulkState();

    // 선택 모드 토글
    if (toggleSelectionBtn) {
      toggleSelectionBtn.addEventListener('click', function () {
        setSelectionMode(!selectionMode);
      });
    }

    // 초기에는 선택 모드 OFF
    setSelectionMode(false);

    // 달력/필터 관련 함수들
    function updateFilterInfo() {
      if (!filterInfoEl || !clearFilterBtn) return;
      const folders = loadFolders();
      
      if (selectedDates.length > 0 || selectedFolderIds.size > 0) {
        let messages = [];
        if (selectedDates.length > 0) {
          if (selectedDates.length === 1) {
            const f = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
            messages.push(f.format(selectedDates[0]) + ' 메모만 표시 중');
          } else {
            messages.push(selectedDates.length + '개 날짜 메모만 표시 중');
          }
        }
        if (selectedFolderIds.size > 0) {
          const selectedFolderNames = Array.from(selectedFolderIds)
            .map(id => folders.find(f => f.id === id))
            .filter(f => f)
            .map(f => f.name);
          if (selectedFolderNames.length === 1) {
            messages.push('"' + selectedFolderNames[0] + '" 폴더만 표시 중');
          } else {
            messages.push(selectedFolderNames.length + '개 폴더 표시 중');
          }
        }
        filterInfoEl.textContent = messages.join(', ');
        filterInfoEl.classList.add('active');
        clearFilterBtn.style.display = 'block';
      } else {
        filterInfoEl.classList.remove('active');
        clearFilterBtn.style.display = 'none';
      }
    }

    function getNotesDates() {
      const notes = loadNotes();
      const dates = new Set();
      for (const n of notes) {
        const dateStr = formatDate(new Date(n.createdAt));
        dates.add(dateStr);
      }
      return dates;
    }

    function renderCalendar() {
      if (!calendarEl || !calendarTitleEl) return;
      const notesDates = getNotesDates();
      const firstDay = new Date(currentYear, currentMonth, 1);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - startDate.getDay());

      const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
      calendarTitleEl.textContent = `${currentYear}년 ${monthNames[currentMonth]}`;

      calendarEl.innerHTML = '';

      // DocumentFragment 사용하여 DOM 조작 최소화 (성능 개선)
      const fragment = document.createDocumentFragment();

      const dayHeaders = ['일', '월', '화', '수', '목', '금', '토'];
      for (const header of dayHeaders) {
        const h = document.createElement('div');
        h.className = 'calendar-day-header';
        h.textContent = header;
        fragment.appendChild(h);
      }

      const today = new Date();
      const todayStr = formatDate(today);

      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateStr = formatDate(date);

        const dayEl = document.createElement('button');
        dayEl.className = 'calendar-day';
        dayEl.textContent = date.getDate();
        dayEl.type = 'button';

        if (date.getMonth() !== currentMonth) {
          dayEl.classList.add('other-month');
        }

        if (dateStr === todayStr) {
          dayEl.classList.add('today');
        }

        if (notesDates.has(dateStr)) {
          dayEl.classList.add('has-notes');
        }

        const isSelected = selectedDates.some(d => formatDate(d) === dateStr);
        if (isSelected) {
          dayEl.classList.add('selected');
        }

        dayEl.addEventListener('click', function (e) {
          const clickedDate = new Date(date);
          const clickedDateStr = formatDate(clickedDate);
          
          if (e.shiftKey && lastSelectedDate) {
            // Shift 클릭: 연속 선택
            const start = new Date(Math.min(clickedDate.getTime(), lastSelectedDate.getTime()));
            const end = new Date(Math.max(clickedDate.getTime(), lastSelectedDate.getTime()));
            const range = [];
            const current = new Date(start);
            while (current <= end) {
              const d = new Date(current);
              const dStr = formatDate(d);
              if (!selectedDates.some(sd => formatDate(sd) === dStr)) {
                range.push(d);
              }
              current.setDate(current.getDate() + 1);
            }
            selectedDates.push(...range);
            lastSelectedDate = clickedDate;
          } else if (e.ctrlKey || e.metaKey) {
            // Ctrl/Cmd 클릭: 개별 추가/제거
            const existingIndex = selectedDates.findIndex(d => formatDate(d) === clickedDateStr);
            if (existingIndex >= 0) {
              selectedDates.splice(existingIndex, 1);
            } else {
              selectedDates.push(clickedDate);
            }
            lastSelectedDate = clickedDate;
          } else {
            // 일반 클릭: 단일 선택
            const existingIndex = selectedDates.findIndex(d => formatDate(d) === clickedDateStr);
            if (existingIndex >= 0 && selectedDates.length === 1) {
              selectedDates = [];
              lastSelectedDate = null;
            } else {
              selectedDates = [clickedDate];
              lastSelectedDate = clickedDate;
            }
          }
          renderCalendar();
          renderList(loadNotes());
          updateFilterInfo();
        });

        fragment.appendChild(dayEl);
      }
      
      // 한 번에 DOM에 추가 (성능 개선)
      calendarEl.appendChild(fragment);
    }

    if (prevMonthBtn) {
      prevMonthBtn.addEventListener('click', function () {
        currentMonth--;
        if (currentMonth < 0) {
          currentMonth = 11;
          currentYear--;
        }
        renderCalendar();
      });
    }

    if (nextMonthBtn) {
      nextMonthBtn.addEventListener('click', function () {
        currentMonth++;
        if (currentMonth > 11) {
          currentMonth = 0;
          currentYear++;
        }
        renderCalendar();
      });
    }

    // 다른 ID 버튼 제거됨

    if (clearFilterBtn) {
      clearFilterBtn.addEventListener('click', function () {
        selectedDates = [];
        lastSelectedDate = null;
        selectedFolderIds.clear();
        renderCalendar();
        renderFolders();
        renderList(loadNotes());
        updateFilterInfo();
      });
    }

    // 폴더 관련 함수들
    function renderFolders() {
      if (!folderList) return;
      folderList.innerHTML = '';
      const folders = loadFolders();
      folders.forEach(folder => {
        const folderItem = document.createElement('div');
        folderItem.className = 'folder-item';
        folderItem.setAttribute('data-folder-id', folder.id);
        if (folder.id === BOOKMARK_FOLDER_ID) {
          folderItem.classList.add('bookmark');
        }
        if (selectedFolderIds.has(folder.id)) {
          folderItem.classList.add('selected');
        }
        if (folder.id === editingFolderId) {
          folderItem.classList.add('editing');
          const input = document.createElement('input');
          input.type = 'text';
          input.placeholder = '폴더명 입력';
          input.value = folder.name || '';
          input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
              const newName = input.value.trim();
              const folders = loadFolders();
              const f = folders.find(x => x.id === folder.id);
              if (newName) {
                if (f) {
                  f.name = newName;
                  saveFolders(folders);
                }
              } else {
                // 빈 값이면 폴더 삭제 (북마크 폴더와 사진 폴더 제외)
                if (f && f.id !== BOOKMARK_FOLDER_ID && f.id !== PHOTO_FOLDER_ID) {
                  const filtered = folders.filter(x => x.id !== folder.id);
                  saveFolders(filtered);
                  selectedFolderIds.delete(folder.id);
                } else if (f && (f.id === BOOKMARK_FOLDER_ID || f.id === PHOTO_FOLDER_ID)) {
                  // 북마크 폴더와 사진 폴더는 이름을 유지
                  if (f.id === BOOKMARK_FOLDER_ID) {
                    f.name = '북마크';
                  } else if (f.id === PHOTO_FOLDER_ID) {
                    f.name = '사진';
                  }
                  saveFolders(folders);
                }
              }
              editingFolderId = null;
              renderFolders();
              // 폴더 이름 변경 시 메모 목록은 다시 렌더링할 필요 없음 (성능 최적화)
              updateFilterInfo();
            } else if (e.key === 'Escape') {
              // Escape 시 폴더 삭제 (빈 이름이면, 북마크 폴더와 사진 폴더 제외)
              const folders = loadFolders();
              const f = folders.find(x => x.id === folder.id);
              if (f && !f.name && f.id !== BOOKMARK_FOLDER_ID && f.id !== PHOTO_FOLDER_ID) {
                const filtered = folders.filter(x => x.id !== folder.id);
                saveFolders(filtered);
                if (selectedFolderId === folder.id) {
                  selectedFolderId = null;
                }
              } else if (f && (f.id === BOOKMARK_FOLDER_ID || f.id === PHOTO_FOLDER_ID)) {
                // 북마크 폴더와 사진 폴더는 이름을 유지
                if (f.id === BOOKMARK_FOLDER_ID) {
                  f.name = '북마크';
                } else if (f.id === PHOTO_FOLDER_ID) {
                  f.name = '사진';
                }
                saveFolders(folders);
              }
              editingFolderId = null;
              renderFolders();
              // 폴더 이름 변경 시 메모 목록은 다시 렌더링할 필요 없음 (성능 최적화)
              updateFilterInfo();
            }
          });
          input.addEventListener('blur', function () {
            // blur 이벤트를 약간 지연시켜서 다른 이벤트(예: 클릭)가 먼저 처리되도록 함
            setTimeout(() => {
              const newName = input.value.trim();
              const folders = loadFolders();
              const f = folders.find(x => x.id === folder.id);
              
              // 편집 모드가 이미 해제되었으면 처리하지 않음
              if (editingFolderId !== folder.id) {
                return;
              }
              
              if (newName) {
                if (f) {
                  f.name = newName;
                  saveFolders(folders);
                }
                editingFolderId = null;
                renderFolders();
                // 폴더 이름 변경 시 메모 목록은 다시 렌더링할 필요 없음 (성능 최적화)
                updateFilterInfo();
              } else {
                // 빈 값이면 폴더 삭제 (북마크 폴더와 사진 폴더 제외)
                // 단, 새로 추가한 폴더(원래 이름이 빈 문자열)는 삭제하지 않음
                if (f && f.id !== BOOKMARK_FOLDER_ID && f.id !== PHOTO_FOLDER_ID) {
                  // 원래 이름이 있었던 폴더만 삭제
                  if (folder.name && folder.name.trim() !== '') {
                    const filtered = folders.filter(x => x.id !== folder.id);
                    saveFolders(filtered);
                    selectedFolderIds.delete(folder.id);
                editingFolderId = null;
                renderFolders();
                // 폴더 삭제 시에만 메모 목록 다시 렌더링
                renderList(loadNotes());
                updateFilterInfo();
              }
              // 새로 추가한 폴더(원래 이름이 빈 문자열)는 그냥 편집 모드만 해제
              else {
                editingFolderId = null;
                renderFolders();
              }
                } else if (f && (f.id === BOOKMARK_FOLDER_ID || f.id === PHOTO_FOLDER_ID)) {
                  // 북마크 폴더와 사진 폴더는 이름을 유지
                  if (f.id === BOOKMARK_FOLDER_ID) {
                    f.name = '북마크';
                  } else if (f.id === PHOTO_FOLDER_ID) {
                    f.name = '사진';
                  }
                saveFolders(folders);
                editingFolderId = null;
                renderFolders();
                // 폴더 이름 변경 시 메모 목록은 다시 렌더링할 필요 없음 (성능 최적화)
                updateFilterInfo();
              }
            }
          }, 200);
          });
          folderItem.appendChild(input);
        } else {
          // 폴더 아이콘 추가
          const icon = document.createElement('img');
          icon.src = folder.id === BOOKMARK_FOLDER_ID ? 'bookmark-icon.svg' : 
                     folder.id === PHOTO_FOLDER_ID ? 'photo-icon.svg' : 
                     'folder-icon.svg';
          icon.alt = folder.id === BOOKMARK_FOLDER_ID ? '북마크' : 
                     folder.id === PHOTO_FOLDER_ID ? '사진' : 
                     '폴더';
          icon.className = 'folder-icon';
          folderItem.appendChild(icon);
          folderItem.appendChild(document.createTextNode(folder.name || ''));
          
          folderItem.addEventListener('click', function () {
            if (folderMode && selectedIds.size > 0) {
              // 선택된 노트들을 폴더에 추가 (사진 폴더는 제외)
              if (folder.id === PHOTO_FOLDER_ID) {
                alert('사진 폴더에는 수동으로 추가할 수 없습니다.');
                return;
              }
              const notes = loadNotes();
              selectedIds.forEach(id => {
                const note = notes.find(n => n.id === id);
                if (note) {
                  if (!note.folderIds) {
                    note.folderIds = [];
                  }
                  // 이미 해당 폴더에 속해있지 않으면 추가
                  if (!note.folderIds.includes(folder.id)) {
                    note.folderIds.push(folder.id);
                  }
                }
              });
              saveNotes(notes);
              selectedIds.clear();
              setSelectionMode(false);
              renderList(notes);
              updateBulkState();
            } else {
              // 폴더 선택 (필터링) - 중복 선택 가능
              if (selectedFolderIds.has(folder.id)) {
                selectedFolderIds.delete(folder.id);
              } else {
                selectedFolderIds.add(folder.id);
              }
              renderFolders();
              renderList(loadNotes());
              updateFilterInfo();
            }
          });
        }
        folderList.appendChild(folderItem);
      });
    }

    function setFolderMode(on) {
      folderMode = on;
      if (toggleFolderBtn) {
        toggleFolderBtn.textContent = folderMode ? '닫기' : '폴더';
      }
      if (folderControls) {
        folderControls.style.display = folderMode ? 'flex' : 'none';
      }
      if (folderList) {
        folderList.style.display = folderMode ? 'flex' : 'none';
      }
      if (!folderMode) {
        editingFolderId = null;
        renderFolders();
      }
    }

    // 폴더 버튼 이벤트
    if (toggleFolderBtn) {
      toggleFolderBtn.addEventListener('click', function () {
        setFolderMode(!folderMode);
        renderFolders();
      });
    }

    if (folderAddBtn) {
      folderAddBtn.addEventListener('click', function () {
        // 폴더 모드가 꺼져있으면 켜기
        if (!folderMode) {
          setFolderMode(true);
        }
        const folders = loadFolders();
        const newFolder = {
          id: generateId(),
          name: ''
        };
        folders.push(newFolder);
        saveFolders(folders);
        editingFolderId = newFolder.id;
        renderFolders();
        
        // 새 폴더로 스크롤 및 포커스 (렌더링 완료 후)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const folderItem = folderList?.querySelector(`[data-folder-id="${newFolder.id}"]`);
            if (folderItem) {
              folderItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              const input = folderItem.querySelector('input');
              if (input) {
                input.focus();
                input.select();
              }
            }
          });
        });
      });
    }

    if (folderEditBtn) {
      folderEditBtn.addEventListener('click', function () {
        if (selectedFolderIds.size > 0) {
          // 첫 번째 선택된 폴더만 편집
          const firstSelectedId = Array.from(selectedFolderIds)[0];
          editingFolderId = firstSelectedId;
          renderFolders();
          // 편집 모드로 전환 후 포커스
          requestAnimationFrame(() => {
            const folderItem = folderList?.querySelector(`[data-folder-id="${firstSelectedId}"]`);
            if (folderItem) {
              const input = folderItem.querySelector('input');
              if (input) {
                input.focus();
                input.select();
              }
            }
          });
        }
      });
    }

    if (folderDeleteBtn) {
      folderDeleteBtn.addEventListener('click', function () {
        if (selectedFolderIds.size > 0) {
          const folders = loadFolders();
          const deletableIds = Array.from(selectedFolderIds).filter(id => 
            id !== BOOKMARK_FOLDER_ID && id !== PHOTO_FOLDER_ID
          );
          
          if (deletableIds.length === 0) {
            alert('선택한 폴더는 삭제할 수 없습니다.');
            return;
          }
          
          const folderNames = deletableIds.map(id => {
            const folder = folders.find(f => f.id === id);
            return folder ? folder.name : id;
          });
          
          const message = deletableIds.length === 1 
            ? `"${folderNames[0]}" 폴더를 삭제하시겠습니까? 폴더 안의 글은 삭제되지 않습니다.`
            : `${deletableIds.length}개 폴더를 삭제하시겠습니까? 폴더 안의 글은 삭제되지 않습니다.`;
          
          if (confirm(message)) {
            const filtered = folders.filter(f => !deletableIds.includes(f.id));
            saveFolders(filtered);
            // 해당 폴더들의 노트들의 folderIds에서 제거
            const notes = loadNotes();
            notes.forEach(note => {
              if (note.folderIds) {
                note.folderIds = note.folderIds.filter(id => !deletableIds.includes(id));
                // 빈 배열이 되면 속성 제거
                if (note.folderIds.length === 0) {
                  delete note.folderIds;
                }
              }
            });
            saveNotes(notes);
            deletableIds.forEach(id => selectedFolderIds.delete(id));
            renderFolders();
            renderList(notes);
            updateFilterInfo();
          }
        }
      });
    }

    if (folderRemoveBtn) {
      folderRemoveBtn.addEventListener('click', function () {
        if (selectedIds.size > 0) {
          const notes = loadNotes();
          let updated = false;
          selectedIds.forEach(id => {
            const note = notes.find(n => n.id === id);
            if (note && note.folderIds && note.folderIds.length > 0) {
              // 선택한 메모가 속한 모든 폴더에서 해제
              note.folderIds = [];
              delete note.folderIds;
              updated = true;
            }
          });
          if (updated) {
            saveNotes(notes);
            renderList(notes);
            showToast('선택한 메모를 모든 폴더에서 해제했습니다.');
          } else {
            showToast('선택한 메모 중 폴더에 속한 메모가 없습니다.');
          }
        } else {
          alert('해제할 메모를 선택해주세요.');
        }
      });
    }

    // 프로필 사진 우클릭 메뉴
    if (profileImage && profileImageMenu && profileImageAddBtn && profileImageDeleteBtn && profileImageInput) {
      // 메뉴를 body에 직접 추가하여 z-index 문제 해결
      document.body.appendChild(profileImageMenu);
      
      profileImage.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        profileImageMenu.style.left = e.clientX + 'px';
        profileImageMenu.style.top = e.clientY + 'px';
        profileImageMenu.classList.add('show');
      });

      // 메뉴 외부 클릭 시 닫기
      document.addEventListener('click', function(e) {
        if (profileImageMenu && !profileImage.contains(e.target) && !profileImageMenu.contains(e.target)) {
          profileImageMenu.classList.remove('show');
        }
      });

      // 사진 추가
      profileImageAddBtn.addEventListener('click', function() {
        if (profileImageInput) {
          profileImageInput.click();
        }
        if (profileImageMenu) {
          profileImageMenu.classList.remove('show');
        }
      });

      // 사진 삭제
      profileImageDeleteBtn.addEventListener('click', function() {
        deleteProfileImage();
        if (profileImageMenu) {
          profileImageMenu.classList.remove('show');
        }
      });

      // 파일 선택 시 처리
      if (profileImageInput) {
        profileImageInput.addEventListener('change', function(e) {
          const file = e.target.files?.[0];
          if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(event) {
              const imageData = event.target?.result;
              if (imageData && profileImg && profileImagePlaceholder) {
                profileImg.src = imageData;
                profileImg.style.display = 'block';
                profileImagePlaceholder.style.display = 'none';
                saveProfileImage(imageData);
              }
            };
            reader.readAsDataURL(file);
          }
        });
      }
    }

    // 프로필 소개 저장 및 autosize
    if (profileBioInput) {
      // 초기 autosize
      autosize(profileBioInput);
      
      profileBioInput.addEventListener('input', function() {
        autosize(profileBioInput);
        saveProfileBio(profileBioInput.value);
      });

      profileBioInput.addEventListener('blur', function() {
        saveProfileBio(profileBioInput.value);
      });
    }

    // 프로필 이름 저장
    if (profileNameInput) {
      // 초기 로드
      const name = loadProfileName();
      profileNameInput.value = name;
      
      profileNameInput.addEventListener('input', function() {
        saveProfileName(profileNameInput.value);
      });

      profileNameInput.addEventListener('blur', function() {
        saveProfileName(profileNameInput.value);
      });
    }

    // 로컬 데이터 먼저 표시 (새로고침 속도 개선)
    const localNotes = loadNotes();
    renderList(localNotes);
    
    // 초기 렌더
    // GitHub 동기화 초기화
    function initGitHubSync() {
      if (!isGitHubEnabled()) {
        console.warn('GitHub 동기화가 활성화되지 않았습니다.');
        return;
      }
      
      console.log('initGitHubSync 시작', {
        hasToken: !!window.githubSync.token,
        hasGistId: !!window.githubSync.gistId
      });
      
      // Gist ID가 없으면 먼저 로컬 데이터를 저장해서 Gist 생성
      if (!window.githubSync.gistId) {
        const savedGistId = localStorage.getItem('github_gist_id');
        if (!savedGistId) {
          // Gist가 없으면 로컬 데이터를 먼저 저장해서 Gist 생성
          const localNotes = loadNotes();
          console.log('Gist가 없어서 로컬 데이터를 먼저 저장합니다. 메모 개수:', localNotes.length);
          
          // 메모가 없어도 빈 배열로 Gist 생성
          syncToGitHub(localNotes).then(() => {
            console.log('Gist 생성/업데이트 완료');
            // Gist 생성 후 동기화 시작
            syncFromGitHub().then(cloudNotes => {
              if (cloudNotes && cloudNotes.length > 0) {
                const currentLocalNotes = loadNotes();
                if (JSON.stringify(cloudNotes) !== JSON.stringify(currentLocalNotes)) {
                  renderList(cloudNotes);
                }
              }
              startGitHubSync();
            }).catch((error) => {
              console.error('GitHub 동기화 오류:', error);
              showToast('동기화 오류: ' + error.message);
            });
          }).catch((error) => {
            console.error('Gist 생성 오류:', error);
            showToast('Gist 생성 실패: ' + error.message);
          });
          return;
        } else {
          window.githubSync.gistId = savedGistId;
        }
      }
      
      syncFromGitHub().then(cloudNotes => {
        // GitHub에서 데이터를 가져왔고, 로컬과 다르면 업데이트
        if (cloudNotes && cloudNotes.length > 0) {
          const currentLocalNotes = loadNotes();
          // 데이터가 다르면 업데이트 (성능 최적화: 같으면 렌더링 안 함)
          if (JSON.stringify(cloudNotes) !== JSON.stringify(currentLocalNotes)) {
            renderList(cloudNotes);
          }
        }
        // GitHub 동기화 시작 (폴링)
        startGitHubSync();
      }).catch((error) => {
        console.error('GitHub 동기화 오류:', error);
        showToast('동기화 오류: ' + error.message);
        // 에러 발생 시에도 로컬 데이터는 이미 표시되었으므로 추가 작업 불필요
      });
    }
    
    // Firebase 동기화 초기화 (quota 절약: 실시간 리스너 사용 안 함)
    function initFirebaseSync() {
      if (!isFirebaseEnabled()) {
        console.warn('Firebase 동기화가 활성화되지 않았습니다.');
        return;
      }
      
      console.log('initFirebaseSync 시작', {
        hasFirebase: !!window.firebaseDb,
        userId: getUserId() // 고정 ID
      });
      
      // 초기 동기화 (읽기 1회) - 새로고침 시에만 Firebase에서 최신 데이터 가져오기
      syncFromFirebase().then(cloudNotes => {
        const currentLocalNotes = loadNotes();
        
        // Firebase에서 데이터를 가져왔을 때
        if (cloudNotes && cloudNotes.length > 0) {
          // 로컬 데이터와 Firebase 데이터 병합 (최신 것 우선)
          const localNotesMap = new Map(currentLocalNotes.map(n => [n.id, n]));
          const cloudNotesMap = new Map(cloudNotes.map(n => [n.id, n]));
          
          // 모든 노트 ID 수집
          const allNoteIds = new Set([...localNotesMap.keys(), ...cloudNotesMap.keys()]);
          const mergedNotes = [];
          
          for (const id of allNoteIds) {
            const localNote = localNotesMap.get(id);
            const cloudNote = cloudNotesMap.get(id);
            
            if (localNote && cloudNote) {
              // 둘 다 있으면 더 최신 것 사용
              const localTime = new Date(localNote.createdAt).getTime();
              const cloudTime = new Date(cloudNote.createdAt).getTime();
              mergedNotes.push(localTime >= cloudTime ? localNote : cloudNote);
            } else if (localNote) {
              mergedNotes.push(localNote);
            } else if (cloudNote) {
              mergedNotes.push(cloudNote);
            }
          }
          
          // createdAt 기준으로 정렬
          mergedNotes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          
          // 병합된 데이터가 로컬과 다르면 업데이트
          if (JSON.stringify(mergedNotes) !== JSON.stringify(currentLocalNotes)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedNotes));
            renderList(mergedNotes);
            // 병합된 데이터를 Firebase에 저장
            syncToFirebase(mergedNotes).catch(err => {
              console.error('병합된 데이터를 Firebase에 저장 실패:', err);
            });
            console.log('로컬과 Firebase 데이터를 병합했습니다.');
          }
        } else {
          // Firebase에 데이터가 없으면 로컬 데이터를 Firebase에 저장
          if (currentLocalNotes && currentLocalNotes.length > 0) {
            syncToFirebase(currentLocalNotes).catch(err => {
              console.error('로컬 데이터를 Firebase에 저장 실패:', err);
            });
          }
        }
        // 정기 동기화 제거 - 변경 이벤트 발생 시에만 동기화
      }).catch((error) => {
        console.error('Firebase 동기화 오류:', error);
        // 에러가 발생해도 로컬 데이터는 이미 표시되었으므로 계속 사용
      });
    }
    
    // 초기 렌더링 작업을 requestAnimationFrame으로 분산하여 성능 개선
    // 1단계: 필수 UI 요소만 먼저 표시
    updateSearchIcon();
    updateTotalNotesCount();
    autosize(input);
    
    // 2단계: 다음 프레임에서 폴더와 프로필 렌더링
    requestAnimationFrame(() => {
      renderFolders();
      loadProfileImage();
      updateProfileBio();
      updateProfileUserId();
      renderUploadPreview();
      
      // 3단계: 그 다음 프레임에서 캘린더 렌더링 (무거운 작업)
      requestAnimationFrame(() => {
        if (calendarEl && calendarTitleEl && prevMonthBtn && nextMonthBtn && clearFilterBtn && filterInfoEl) {
          renderCalendar();
          updateFilterInfo();
        }
      });
    });
    
    // 프로필 정보는 syncFromFirebase에서 이미 처리되므로 중복 호출 제거 (성능 최적화)
    
    // Firebase 동기화 초기화 (새 창에서도 작동하도록)
    if (window.firebaseReady) {
      // Firebase가 이미 준비되었으면 즉시 초기화
      initFirebaseSync();
    } else {
      // Firebase가 아직 준비되지 않았으면 이벤트 대기
      window.addEventListener('firebase-ready', () => {
        initFirebaseSync();
      });
    }
    
    // 모바일 스타일 적용 함수
    function applyMobileStyles() {
      const isMobile = window.innerWidth <= 768;
      
      if (isMobile) {
        // 직접 스타일 적용
        const profileSection = document.querySelector('.profile-section');
        const calendarSection = document.querySelector('.calendar-section');
        const mainHeader = document.querySelector('.main-header');
        const notesSection = document.querySelector('.notes-section');
        const mainContent = document.querySelector('.main-content');
        const composer = document.querySelector('.composer');
        
        if (profileSection) profileSection.style.display = 'none';
        if (calendarSection) calendarSection.style.display = 'none';
        if (mainHeader) mainHeader.style.display = 'none';
        if (mainContent) {
          mainContent.style.gridTemplateColumns = '1fr';
        }
        if (notesSection) {
          notesSection.style.width = '100%';
          notesSection.style.maxWidth = '100%';
          notesSection.style.gridColumn = '1';
        }
        
        // composer의 ::before 스타일 조정
        if (composer) {
          composer.style.setProperty('--mobile-before-left', '0');
          composer.style.setProperty('--mobile-before-width', '100%');
        }
        
        // 모바일에서는 체크박스와 일괄 작업 숨김 (선택 모드가 아닐 때만)
        // selectionMode는 body의 클래스로 확인
        const isSelectionMode = document.body.classList.contains('selection-mode');
        if (!isSelectionMode) {
          // 인라인 스타일 제거하지 않고 CSS 클래스로만 제어
          // CSS에서 이미 처리되므로 여기서는 추가 작업 불필요
        }
        
        // 모바일: 파일 버튼 왼쪽에 투명화 버튼과 ID 변경 버튼 추가
        const actionsDiv = document.querySelector('.actions');
        const uploadBtn = document.getElementById('upload-btn');
        if (actionsDiv && uploadBtn && !document.getElementById('mobile-transparency-btn')) {
          // 투명화 버튼
          const transparencyBtn = document.createElement('button');
          transparencyBtn.id = 'mobile-transparency-btn';
          transparencyBtn.type = 'button';
          transparencyBtn.className = 'btn mobile-action-btn';
          transparencyBtn.textContent = '투명';
          
          // 투명화 기능
          const syncTransparencyLabel = () => {
            const on = document.body.classList.contains('text-transparent');
            transparencyBtn.textContent = on ? '해제' : '투명';
          };
          
          transparencyBtn.addEventListener('click', function () {
            document.body.classList.toggle('text-transparent');
            syncTransparencyLabel();
          });
          
          syncTransparencyLabel();
          actionsDiv.insertBefore(transparencyBtn, uploadBtn);
          
          // 사용자 ID 변경 버튼 제거됨
        }
      } else {
        // PC: 모바일 투명화 버튼과 ID 변경 버튼 제거
        const mobileTransparencyBtn = document.getElementById('mobile-transparency-btn');
        if (mobileTransparencyBtn) {
          mobileTransparencyBtn.remove();
        }
        const mobileChangeIdBtn = document.getElementById('mobile-change-id-btn');
        if (mobileChangeIdBtn) {
          mobileChangeIdBtn.remove();
        }
      }
    }
    
    // 모바일 스타일 적용
    applyMobileStyles();
    
    // 모바일 스타일 리사이즈 이벤트
    let mobileStyleTag = null;
    window.addEventListener('resize', function() {
      const nowMobile = window.innerWidth <= 768;
      const existingStyle = document.head.querySelector('style[data-mobile]');
      const hasMobileStyle = existingStyle !== null;
      
      if (nowMobile && !hasMobileStyle) {
        applyMobileStyles();
        mobileStyleTag = document.head.querySelector('style[data-mobile]');
      } else if (!nowMobile && hasMobileStyle) {
        if (existingStyle) {
          existingStyle.remove();
          mobileStyleTag = null;
        }
        if (document.body) {
          document.body.classList.remove('mobile-device');
        }
        const mobileTransparencyBtn = document.getElementById('mobile-transparency-btn');
        if (mobileTransparencyBtn) {
          mobileTransparencyBtn.remove();
        }
        const mobileChangeIdBtn = document.getElementById('mobile-change-id-btn');
        if (mobileChangeIdBtn) {
          mobileChangeIdBtn.remove();
        }
      } else {
        applyMobileStyles();
      }
    });
  }

  // DOM이 로드된 후 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // 이미 로드되었으면 즉시 실행
    setTimeout(init, 0);
  }
})();


