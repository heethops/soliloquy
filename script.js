  (function () {
  const STORAGE_KEY = 'timestamped_notes_v1';
  const FOLDERS_KEY = 'folders_v1';
  const PROFILE_BIO_KEY = 'profile_bio_v1';
  const PROFILE_IMAGE_KEY = 'profile_image_v1';
    const GITHUB_TOKEN_KEY = 'github_token';
    const GITHUB_REPO_KEY = 'github_repo';
  const PROFILE_NAME_KEY = 'profile_name_v1';
  const BACKUP_KEY = 'backup_data_v1';
  const BOOKMARK_FOLDER_ID = '__bookmark_folder__';
  const PHOTO_FOLDER_ID = '__photo_folder__';
  const HIDDEN_FOLDER_ID = '__hidden_folder__';

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
    
    
    
    // 사용자 ID 변경 (Firebase 데이터 마이그레이션) - 사용하지 않음
    async function migrateUserId(oldUserId, newUserId) {
      // 사용자 ID 기능이 제거되어 더 이상 사용하지 않음
      return false;
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


    // Firebase 동기화 활성화 여부 확인
    function isFirebaseEnabled() {
      return window.firebaseReady && window.firebaseDb;
      // 사용자 ID는 항상 고정 ID이므로 체크 불필요
    }

    let isSyncing = false;
    let lastSyncedData = null; // 마지막으로 동기화한 데이터 (중복 방지)
    let firebaseSyncInterval = null; // Firebase 수동 동기화 인터벌 (현재 사용 안 함)

    // Base64 이미지를 재압축하는 함수
    async function recompressBase64Image(base64Data, targetMaxSizeKB = 50) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function() {
          let width = img.width;
          let height = img.height;
          const originalWidth = width;
          const originalHeight = height;

          // 타겟 크기 (Base64는 원본보다 약 33% 크므로)
          const maxSize = targetMaxSizeKB * 1024 * 1.33; // Base64 크기
          
          // 초기 품질
          let quality = 0.6;
          let compressed = '';
          
          // 반복적으로 압축 시도 (최대 20회)
          for (let attempt = 0; attempt < 20; attempt++) {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            compressed = canvas.toDataURL('image/jpeg', quality);
            
            // 타겟 크기 이하면 성공
            if (compressed.length <= maxSize) {
              break;
            }
            
            // 품질을 낮춤
            if (quality > 0.1) {
              quality = Math.max(0.1, quality - 0.1);
        } else {
              // 품질이 최저이면 크기를 줄임
              const ratio = Math.sqrt(maxSize / compressed.length) * 0.9; // 90%로 더 작게
              width = Math.max(100, Math.round(originalWidth * ratio));
              height = Math.max(100, Math.round(originalHeight * ratio));
              quality = 0.3; // 크기 줄일 때는 품질도 낮춤
            }
          }
          
          // 여전히 크면 강제로 더 작게 리사이즈
          if (compressed.length > maxSize) {
            const forceRatio = Math.sqrt(maxSize / compressed.length) * 0.8;
            width = Math.max(100, Math.round(width * forceRatio));
            height = Math.max(100, Math.round(height * forceRatio));
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            compressed = canvas.toDataURL('image/jpeg', 0.2); // 매우 낮은 품질
          }

          resolve(compressed);
        };
        img.onerror = reject;
        img.src = base64Data;
      });
    }

    // Firebase에 데이터 저장 (즉시 동기화, 데이터 변경 시에만 저장)
    async function syncToFirebase(notes, forceSync = false) {
      if (!isFirebaseEnabled()) {
        console.warn('Firebase 동기화가 활성화되지 않았습니다.', {
          firebaseReady: window.firebaseReady,
          hasDb: !!window.firebaseDb
        });
        return false;
      }

      const userId = getUserId(); // 고정 ID 사용

      console.log('Firebase에 동기화 시작...', {
        notesCount: notes.length,
        userId: userId,
        isSyncing: isSyncing,
        forceSync: forceSync
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
        
        let profileData = {
          notes: notes,
          folders: folders,
          profileBio: localStorage.getItem(PROFILE_BIO_KEY) || '',
          profileName: localStorage.getItem(PROFILE_NAME_KEY) || '',
          profileImage: localStorage.getItem(PROFILE_IMAGE_KEY) || '',
          lastUpdated: new Date().toISOString()
        };
        
        let dataStr = JSON.stringify(profileData);
        
        // forceSync가 true이면 무조건 저장 (글 작성 시)
        // forceSync가 false일 때만 데이터 변경 확인
        if (!forceSync && lastSyncedData === dataStr) {
          // 데이터가 변경되지 않았으면 동기화하지 않음 (quota 절약)
          console.log('데이터 변경 없음, 동기화 스킵');
          return true; // 스킵했지만 성공으로 간주
        }
        
        // forceSync일 때는 lastSyncedData 체크 무시하고 무조건 저장

        // 동기화 중이면 잠시 대기 (최대 2초)
        if (isSyncing) {
          console.log('동기화 대기 중...');
          let waitCount = 0;
          while (isSyncing && waitCount < 20) {
            await new Promise(resolve => setTimeout(resolve, 100));
            waitCount++;
          }
          if (isSyncing) {
            console.warn('동기화 대기 시간 초과');
            return false;
          }
        }

        isSyncing = true;
        
        let dataSizeKB = Math.round(dataStr.length / 1024);
        console.log('Firebase에 데이터 저장 중...', {
          notes: notes.length,
          folders: folders.length,
          dataSize: dataSizeKB + 'KB',
          hasImages: notes.some(n => n.images && n.images.length > 0)
        });
        
        // Firebase Firestore 문서 크기 제한 확인 (1MB)
        // 크기가 초과하면 자동으로 모든 이미지를 재압축 (될 때까지 반복)
        const MAX_SIZE = 1000 * 1024; // 1MB
        let compressionAttempt = 0;
        const MAX_COMPRESSION_ATTEMPTS = 20; // 최대 20번 시도
        
        while (dataStr.length > MAX_SIZE && compressionAttempt < MAX_COMPRESSION_ATTEMPTS) {
          compressionAttempt++;
          console.warn(`⚠️ 데이터 크기 초과 (시도 ${compressionAttempt}/${MAX_COMPRESSION_ATTEMPTS}):`, dataSizeKB + 'KB', '- 이미지 자동 재압축 시도');
          
          // 이미지가 있는 모든 메모를 재압축
          const compressedNotes = [];
          let hasCompressed = false;
          let totalImages = 0;
          
          // 이미지 개수 계산
          for (const note of notes) {
            if (note.images && note.images.length > 0) {
              totalImages += note.images.length;
            }
          }
          
          // 각 이미지당 허용 크기 계산 (텍스트/폴더/프로필 데이터를 제외한 여유 공간)
          // 안전하게 텍스트 데이터가 약 100KB라고 가정하고, 나머지를 이미지에 할당
          const reservedSize = 100 * 1024; // 예약 공간
          const availableSize = MAX_SIZE - reservedSize;
          const targetSizePerImage = totalImages > 0 ? Math.floor(availableSize / totalImages) : 0;
          const targetSizePerImageKB = Math.max(20, Math.floor(targetSizePerImage / 1024)); // 최소 20KB
          
          console.log(`이미지당 목표 크기: ${targetSizePerImageKB}KB (총 이미지: ${totalImages}개)`);
          
          for (const note of notes) {
            if (note.images && note.images.length > 0) {
              const compressedImages = [];
              for (const imgData of note.images) {
                try {
                  // 시도 횟수에 따라 점진적으로 더 작게 압축
                  const progressiveTargetKB = Math.max(15, targetSizePerImageKB - (compressionAttempt - 1) * 10);
                  const compressed = await recompressBase64Image(imgData, progressiveTargetKB);
                  compressedImages.push(compressed);
                  hasCompressed = true;
                  const originalSize = Math.round(imgData.length / 1024);
                  const newSize = Math.round(compressed.length / 1024);
                  console.log(`이미지 재압축: ${originalSize}KB → ${newSize}KB (목표: ${progressiveTargetKB}KB)`);
                } catch (e) {
                  console.warn('이미지 재압축 실패, 원본 사용:', e);
                  compressedImages.push(imgData);
                }
              }
              compressedNotes.push({ ...note, images: compressedImages });
            } else {
              compressedNotes.push(note);
            }
          }
          
          if (hasCompressed) {
            // 재압축된 데이터로 프로필 데이터 재생성
            profileData.notes = compressedNotes;
            notes = compressedNotes; // 다음 반복에서 최신 압축 이미지 사용
            dataStr = JSON.stringify(profileData);
            dataSizeKB = Math.round(dataStr.length / 1024);
            
            // 재압축된 데이터를 localStorage에도 저장 (다음 시도에 사용)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(compressedNotes));
            
            if (dataStr.length <= MAX_SIZE) {
              console.log(`✅ 재압축 완료 (시도 ${compressionAttempt}회):`, dataSizeKB + 'KB');
              break; // 성공하면 루프 종료
            } else {
              console.warn(`재압축 후에도 크기 초과: ${dataSizeKB}KB, 재시도...`);
            }
          } else {
            // 이미지가 없거나 압축할 이미지가 없는 경우
            // (텍스트만으로 1MB 초과하거나 이미지 압축이 실패한 경우)
            console.error('❌ 데이터 크기가 너무 큽니다:', dataSizeKB + 'KB');
            if (totalImages === 0) {
              console.error('이미지가 없는데 텍스트만으로 크기 초과 - 메모가 너무 많습니다.');
              showToast('메모가 너무 많습니다. 일부 메모를 삭제해주세요.');
            } else {
              console.error('이미지 압축에 실패했습니다.');
              showToast('이미지 압축에 실패했습니다. 일부 메모나 이미지를 삭제해주세요.');
            }
            isSyncing = false;
            return false;
          }
        }
        
        // 최대 시도 횟수까지 했는데도 초과하면 에러
        if (dataStr.length > MAX_SIZE) {
          console.error('❌ 최대 압축 시도 후에도 데이터 크기가 너무 큽니다:', dataSizeKB + 'KB');
          console.error('일부 메모나 이미지를 삭제해주세요.');
          showToast('압축에 실패했습니다. 일부 메모나 이미지를 삭제해주세요.');
          isSyncing = false;
          return false;
        }
        
        const userDoc = window.firebaseDoc(window.firebaseDb, 'users', userId);
        console.log('Firebase setDoc 호출 중...', {
          userId: userId,
          dataSize: dataSizeKB + 'KB'
        });
        
        await window.firebaseSetDoc(userDoc, profileData, { merge: true });
        
        console.log('Firebase setDoc 완료');

        // 동기화 성공 시 마지막 동기화 데이터 저장 (로컬 저장소에도 저장)
        // forceSync일 때는 무조건 업데이트
        lastSyncedData = dataStr;
        try {
          localStorage.setItem('firebase_last_synced_data', dataStr);
          localStorage.setItem('firebase_last_updated', new Date().toISOString());
        } catch (e) {
          console.warn('lastSyncedData 저장 실패:', e);
        }
        
        console.log('✅ Firebase 동기화 성공', {
          notesCount: notes.length,
          forceSync: forceSync
        });
        return true;
      } catch (error) {
        console.error('❌ Firebase 동기화 실패:', error);
        console.error('에러 상세:', {
          message: error.message,
          code: error.code,
          stack: error.stack
        });
        
        // 크기 초과 관련 에러는 토스트 표시하지 않음 (이미 재압축 시도했으므로)
        if (!error.message || !error.message.includes('크기가 너무 큽니다')) {
          // 다른 에러만 토스트 표시
          const errorMsg = error.message || '알 수 없는 오류';
          showToast('동기화 실패: ' + errorMsg);
        }
        
        // lastSyncedData는 유지하지 않음 (재시도 가능하도록)
        return false;
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
            // 프로필 이미지를 favicon으로 설정
            updateFaviconFromProfileImage(data.profileImage);
            // 프로필 이미지 UI 업데이트
            if (profileImg && profileImagePlaceholder) {
              profileImg.src = data.profileImage;
              profileImg.style.display = 'block';
              profileImagePlaceholder.style.display = 'none';
            }
          } else {
            localStorage.removeItem(PROFILE_IMAGE_KEY);
            // Favicon 초기화
            updateFaviconFromProfileImage(null);
            // 프로필 이미지 UI 업데이트
            if (profileImg && profileImagePlaceholder) {
              profileImg.src = '';
              profileImg.style.display = 'none';
              profileImagePlaceholder.style.display = 'flex';
            }
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
          // 로컬 저장소를 바로 덮어쓰지 않고 데이터만 반환 (병합은 initFirebaseSync에서 처리)
          // 이렇게 하면 모바일에서 새로 작성한 글이 사라지지 않음
          return data.notes;
        }
      } catch (error) {
        console.error('Firebase에서 동기화 실패:', error);
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
        // 숨김 폴더가 없으면 생성
        const hiddenFolder = folders.find(f => f.id === HIDDEN_FOLDER_ID);
        if (!hiddenFolder) {
          folders.push({
            id: HIDDEN_FOLDER_ID,
            name: '숨김'
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
        // 숨김 폴더를 사진 폴더 다음으로 정렬
        const hidden = folders.find(f => f.id === HIDDEN_FOLDER_ID);
        if (hidden) {
          folders = folders.filter(f => f.id !== HIDDEN_FOLDER_ID);
          if (!hidden.name || hidden.name.trim() === '') {
            hidden.name = '숨김';
          }
          // 사진 폴더 다음에 삽입
          const photoIndex = folders.findIndex(f => f.id === PHOTO_FOLDER_ID);
          if (photoIndex !== -1) {
            folders.splice(photoIndex + 1, 0, hidden);
          } else {
            // 사진 폴더가 없으면 북마크 다음에 삽입
            const bookmarkIndex = folders.findIndex(f => f.id === BOOKMARK_FOLDER_ID);
            if (bookmarkIndex !== -1) {
              folders.splice(bookmarkIndex + 1, 0, hidden);
            } else {
              folders.push(hidden);
            }
          }
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
        const hiddenFolder = {
          id: HIDDEN_FOLDER_ID,
          name: '숨김'
        };
        saveFolders([bookmarkFolder, photoFolder, hiddenFolder], true); // skipSync = true (무한 재귀 방지)
        return [bookmarkFolder, photoFolder, hiddenFolder];
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
    // 프로필 이미지를 favicon 및 메타 태그 아이콘으로 설정
    function updateFaviconFromProfileImage(imageData) {
      if (!imageData) {
        // 프로필 이미지가 없으면 기본 아이콘 사용 (또는 빈 상태 유지)
        const faviconLink = document.getElementById('favicon');
        const appleTouchIconLink = document.getElementById('apple-touch-icon');
        const ogImageMeta = document.getElementById('og-image');
        const twitterImageMeta = document.getElementById('twitter-image');
        if (faviconLink) faviconLink.href = '';
        if (appleTouchIconLink) appleTouchIconLink.href = '';
        if (ogImageMeta) ogImageMeta.content = '';
        if (twitterImageMeta) twitterImageMeta.content = '';
        return;
      }

      try {
        const img = new Image();
        img.onload = function() {
          // Favicon 생성 (32x32)
          const faviconCanvas = document.createElement('canvas');
          faviconCanvas.width = 32;
          faviconCanvas.height = 32;
          const faviconCtx = faviconCanvas.getContext('2d');
          faviconCtx.drawImage(img, 0, 0, 32, 32);
          const faviconDataUrl = faviconCanvas.toDataURL('image/png');

          // Apple Touch Icon 생성 (180x180)
          const appleCanvas = document.createElement('canvas');
          appleCanvas.width = 180;
          appleCanvas.height = 180;
          const appleCtx = appleCanvas.getContext('2d');
          appleCtx.drawImage(img, 0, 0, 180, 180);
          const appleDataUrl = appleCanvas.toDataURL('image/png');

          // Open Graph / Twitter Image 생성 (1200x630 권장, 하지만 원본 비율 유지)
          const ogCanvas = document.createElement('canvas');
          const ogSize = Math.min(img.width, img.height, 1200);
          ogCanvas.width = ogSize;
          ogCanvas.height = ogSize;
          const ogCtx = ogCanvas.getContext('2d');
          ogCtx.drawImage(img, 0, 0, ogSize, ogSize);
          const ogDataUrl = ogCanvas.toDataURL('image/png');

          // Favicon 업데이트 (브라우저 캐시 문제 해결을 위해 기존 링크 제거 후 재생성)
          let faviconLink = document.getElementById('favicon');
          if (faviconLink) {
            faviconLink.remove();
          }
          faviconLink = document.createElement('link');
          faviconLink.id = 'favicon';
          faviconLink.rel = 'icon';
          faviconLink.type = 'image/png';
          faviconLink.href = faviconDataUrl;
          document.head.appendChild(faviconLink);
          
          // 짧은 딜레이 후 다시 설정하여 브라우저가 강제로 다시 로드하도록 함
          setTimeout(() => {
            if (faviconLink) {
              const href = faviconLink.href;
              faviconLink.href = '';
              setTimeout(() => {
                faviconLink.href = href;
              }, 10);
            }
          }, 100);

          // Apple Touch Icon 업데이트 (브라우저 캐시 문제 해결을 위해 기존 링크 제거 후 재생성)
          let appleTouchIconLink = document.getElementById('apple-touch-icon');
          if (appleTouchIconLink) {
            appleTouchIconLink.remove();
          }
          appleTouchIconLink = document.createElement('link');
          appleTouchIconLink.id = 'apple-touch-icon';
          appleTouchIconLink.rel = 'apple-touch-icon';
          appleTouchIconLink.href = appleDataUrl;
          document.head.appendChild(appleTouchIconLink);
          
          // 짧은 딜레이 후 다시 설정하여 브라우저가 강제로 다시 로드하도록 함
          setTimeout(() => {
            if (appleTouchIconLink) {
              const href = appleTouchIconLink.href;
              appleTouchIconLink.href = '';
              setTimeout(() => {
                appleTouchIconLink.href = href;
              }, 10);
            }
          }, 100);

          // Open Graph Image 업데이트 (기존 메타 태그 제거 후 재생성)
          let ogImageMeta = document.getElementById('og-image');
          if (ogImageMeta) {
            ogImageMeta.remove();
          }
          ogImageMeta = document.createElement('meta');
          ogImageMeta.id = 'og-image';
          ogImageMeta.property = 'og:image';
          ogImageMeta.content = ogDataUrl;
          document.head.appendChild(ogImageMeta);

          // Twitter Image 업데이트 (기존 메타 태그 제거 후 재생성)
          let twitterImageMeta = document.getElementById('twitter-image');
          if (twitterImageMeta) {
            twitterImageMeta.remove();
          }
          twitterImageMeta = document.createElement('meta');
          twitterImageMeta.id = 'twitter-image';
          twitterImageMeta.name = 'twitter:image';
          twitterImageMeta.content = ogDataUrl;
          document.head.appendChild(twitterImageMeta);
          
          // 추가: 모든 favicon 링크 찾아서 업데이트 (브라우저 호환성)
          const allFavicons = document.querySelectorAll('link[rel*="icon"]');
          allFavicons.forEach(link => {
            if (link.id !== 'favicon' && link.id !== 'apple-touch-icon') {
              link.href = faviconDataUrl;
            }
          });

          console.log('✅ Favicon 및 메타 태그 아이콘이 프로필 이미지로 업데이트되었습니다');
        };
        img.onerror = function(error) {
          console.warn('프로필 이미지를 아이콘으로 변환 실패:', error);
        };
        // Base64 데이터 URL이므로 crossOrigin 설정 불필요
        img.src = imageData;
      } catch (error) {
        console.error('아이콘 업데이트 오류:', error);
      }
    }

    function loadProfileImage() {
      try {
        const imageData = localStorage.getItem(PROFILE_IMAGE_KEY);
        if (imageData && profileImg && profileImagePlaceholder) {
          profileImg.src = imageData;
          profileImg.style.display = 'block';
          profileImagePlaceholder.style.display = 'none';
        }
        // 프로필 이미지를 favicon으로 설정
        updateFaviconFromProfileImage(imageData);
      } catch {
        // 로드 실패 시 무시
      }
    }

    // GitHub Pages favicon 업데이트
    async function updateGitHubFavicon(imageData) {
      try {
        const token = localStorage.getItem(GITHUB_TOKEN_KEY);
        const repo = localStorage.getItem(GITHUB_REPO_KEY);
        
        if (!token || !repo) {
          console.log('GitHub 설정이 없어 favicon 업데이트를 스킵합니다.');
          return; // GitHub 설정이 없으면 스킵
        }
        
        console.log('GitHub Pages favicon 업데이트 시작...', { repo });
        
        // 32x32 크기의 favicon 생성
        const img = new Image();
        img.onload = function() {
          const canvas = document.createElement('canvas');
          canvas.width = 32;
          canvas.height = 32;
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, 32, 32);
          
          canvas.toBlob(async function(blob) {
            if (!blob) {
              console.error('Favicon blob 생성 실패');
              return;
            }
            
            // Base64로 변환
            const reader = new FileReader();
            reader.onload = async function() {
              const base64Data = reader.result.split(',')[1];
              
              try {
                // GitHub API로 파일 업데이트
                // 먼저 기존 파일 정보 가져오기
                const getFileUrl = `https://api.github.com/repos/${repo}/contents/favicon.ico`;
                console.log('기존 favicon.ico 확인 중...', getFileUrl);
                
                const getResponse = await fetch(getFileUrl, {
                  headers: {
                    'Authorization': `Bearer ${token}`, // 최신 형식 사용
                    'Accept': 'application/vnd.github.v3+json',
                    'X-GitHub-Api-Version': '2022-11-28'
                  }
                });
                
                let sha = null;
                if (getResponse.ok) {
                  const fileData = await getResponse.json();
                  sha = fileData.sha;
                  console.log('기존 favicon.ico 발견, 업데이트 모드');
                } else if (getResponse.status === 404) {
                  console.log('기존 favicon.ico 없음, 새로 생성');
                } else {
                  const error = await getResponse.json();
                  console.error('기존 파일 확인 실패:', error);
                }
                
                // 파일 업데이트 또는 생성
                const putUrl = `https://api.github.com/repos/${repo}/contents/favicon.ico`;
                console.log('favicon.ico 업로드 중...', putUrl);
                
                const putResponse = await fetch(putUrl, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${token}`, // 최신 형식 사용
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                    'X-GitHub-Api-Version': '2022-11-28'
                  },
                  body: JSON.stringify({
                    message: 'Update favicon from profile image',
                    content: base64Data,
                    sha: sha // sha가 null이면 새로 생성, 있으면 업데이트
                  })
                });
                
                if (putResponse.ok) {
                  const result = await putResponse.json();
                  console.log('✅ GitHub Pages favicon 업데이트 완료', result);
                  showToast('GitHub Pages favicon이 업데이트되었습니다.');
                  
                  // GitHub Pages가 자동으로 배포되므로 약간의 시간이 걸릴 수 있음
                  console.log('참고: GitHub Pages 배포에는 몇 분이 걸릴 수 있습니다.');
                } else {
                  const error = await putResponse.json();
                  console.error('GitHub favicon 업데이트 실패:', error);
                  showToast('GitHub favicon 업데이트 실패: ' + (error.message || '알 수 없는 오류'));
                }
              } catch (error) {
                console.error('GitHub favicon 업데이트 오류:', error);
                showToast('GitHub favicon 업데이트 중 오류가 발생했습니다.');
              }
            };
            reader.onerror = function() {
              console.error('FileReader 오류');
            };
            reader.readAsDataURL(blob);
          }, 'image/png');
        };
        img.onerror = function() {
          console.error('이미지 로드 실패');
        };
        img.src = imageData;
      } catch (error) {
        console.error('GitHub favicon 업데이트 실패:', error);
        showToast('GitHub favicon 업데이트 중 오류가 발생했습니다.');
      }
    }

    // 프로필 사진 저장
    function saveProfileImage(imageData) {
      try {
        localStorage.setItem(PROFILE_IMAGE_KEY, imageData);
        // 프로필 이미지를 favicon으로 설정
        updateFaviconFromProfileImage(imageData);
        // Firebase에도 저장
        if (isFirebaseEnabled() && !isSyncing) {
          syncProfileToFirebase();
        }
        // 자동으로 ICO 파일 저장 (조용히, 토스트 없이)
        setTimeout(() => {
          exportProfileImageToICO(true);
        }, 500); // favicon 업데이트 후 약간의 딜레이를 두고 ICO 저장
        // GitHub Pages favicon 업데이트
        setTimeout(() => {
          updateGitHubFavicon(imageData);
        }, 1000);
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
        // Favicon도 초기화
        updateFaviconFromProfileImage(null);
        // Firebase에도 저장
        if (isFirebaseEnabled() && !isSyncing) {
          syncProfileToFirebase();
        }
      } catch {
        // 삭제 실패 시 무시
      }
    }

    // ICO 파일 생성 및 다운로드
    function exportProfileImageToICO(silent = false) {
      try {
        const imageData = localStorage.getItem(PROFILE_IMAGE_KEY);
        if (!imageData) {
          if (!silent) {
            showToast('프로필 이미지가 없습니다.');
          }
          return;
        }

        const img = new Image();
        img.onload = function() {
          // 원본 이미지 크기 확인
          const originalWidth = img.width;
          const originalHeight = img.height;
          const maxDimension = Math.max(originalWidth, originalHeight);
          
          // 최고 화질을 위한 모든 표준 ICO 크기 포함
          // 원본보다 작은 크기는 생성하고, 원본 크기도 포함 (최대 256px)
          const allSizes = [16, 24, 32, 48, 64, 96, 128, 256];
          
          // 원본 이미지가 매우 큰 경우, 256px 이상도 포함 (비표준이지만 고화질)
          const customSizes = [];
          if (maxDimension > 256) {
            // 원본 크기를 최대한 활용하되, 512, 1024 등 큰 크기도 포함
            if (maxDimension >= 512) customSizes.push(512);
            if (maxDimension >= 1024) customSizes.push(1024);
            // 원본 크기 그대로 (최대 2048px로 제한)
            const cappedSize = Math.min(maxDimension, 2048);
            if (cappedSize > 256 && !customSizes.includes(cappedSize)) {
              customSizes.push(cappedSize);
            }
          }
          
          const sizes = [...allSizes, ...customSizes].sort((a, b) => a - b);
          const iconEntries = [];

          sizes.forEach(size => {
            const canvas = document.createElement('canvas');
            
            // 최고 해상도를 위해 devicePixelRatio 고려
            const dpr = window.devicePixelRatio || 1;
            const actualSize = size * Math.min(dpr, 2); // 최대 2x까지만
            
            canvas.width = actualSize;
            canvas.height = actualSize;
            const ctx = canvas.getContext('2d');
            
            // 최고 품질 렌더링 설정
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // 고해상도 캔버스에 그리기
            ctx.drawImage(img, 0, 0, actualSize, actualSize);
            
            // 고품질 PNG로 변환
            // toBlob을 사용하여 더 나은 품질 (지원되는 경우)
            canvas.toBlob(function(blob) {
              if (blob) {
                const reader = new FileReader();
                reader.onload = function(e) {
                  const arrayBuffer = e.target.result;
                  const bytes = new Uint8Array(arrayBuffer);
                  
                  iconEntries.push({
                    width: size,
                    height: size,
                    data: bytes
                  });
                  
                  // 모든 크기 생성 완료 후 ICO 파일 생성
                  if (iconEntries.length === sizes.length) {
                    createAndDownloadICO(iconEntries, silent);
                  }
                };
                reader.readAsArrayBuffer(blob);
        } else {
                // toBlob 실패 시 toDataURL 사용
                const pngData = canvas.toDataURL('image/png', 1.0);
                const base64Data = pngData.split(',')[1];
                const binaryString = atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                
                iconEntries.push({
                  width: size,
                  height: size,
                  data: bytes
                });
                
                if (iconEntries.length === sizes.length) {
                  createAndDownloadICO(iconEntries, silent);
                }
              }
            }, 'image/png', 1.0);
          });
          
          // 동기 처리를 위한 폴백 (toBlob이 비동기이므로)
          // 모든 크기가 비동기로 처리되므로, 별도 함수로 분리
        };
        
        function createAndDownloadICO(iconEntries, silent) {
          try {
            // ICO 파일 생성
            const icoFile = createICOFile(iconEntries);
            
            // 다운로드
            const blob = new Blob([icoFile], { type: 'image/x-icon' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'favicon.ico';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            if (!silent) {
              showToast('고화질 ICO 파일이 다운로드되었습니다.');
            }
          } catch (error) {
            console.error('ICO 파일 생성 실패:', error);
            if (!silent) {
              showToast('ICO 파일 생성에 실패했습니다.');
            }
          }
        }
        
        img.onerror = function() {
          if (!silent) {
            showToast('이미지를 변환할 수 없습니다.');
          }
        };
        img.src = imageData;
      } catch (error) {
        console.error('ICO 파일 생성 실패:', error);
        if (!silent) {
          showToast('ICO 파일 생성에 실패했습니다.');
        }
      }
    }

    // ICO 파일 형식 생성 함수
    function createICOFile(iconEntries) {
      // ICO 파일 구조:
      // Header (6 bytes)
      // Icon Directory (16 bytes per entry)
      // Icon Data (PNG data)
      
      const numIcons = iconEntries.length;
      
      // ICO Header (6 bytes)
      const header = new ArrayBuffer(6);
      const headerView = new DataView(header);
      headerView.setUint16(0, 0, true); // Reserved (must be 0)
      headerView.setUint16(2, 1, true); // Type (1 = ICO)
      headerView.setUint16(4, numIcons, true); // Number of images
      
      // Icon Directory Entries (16 bytes each)
      let offset = 6 + (numIcons * 16); // Start after header + directory
      const directory = [];
      
      iconEntries.forEach(entry => {
        const dirEntry = new ArrayBuffer(16);
        const dirView = new DataView(dirEntry);
        
        // Width/Height (1 byte each, 0 = 256, but for sizes > 256, use 0)
        // ICO 형식에서는 256 이상의 크기는 0으로 표시 (실제 크기는 PNG 헤더에 포함)
        const width = entry.width >= 256 ? 0 : entry.width;
        const height = entry.height >= 256 ? 0 : entry.height;
        
        dirView.setUint8(0, width);
        dirView.setUint8(1, height);
        dirView.setUint8(2, 0); // Color palette (0 = no palette)
        dirView.setUint8(3, 0); // Reserved
        dirView.setUint16(4, 1, true); // Color planes (0 or 1)
        dirView.setUint16(6, 32, true); // Bits per pixel
        dirView.setUint32(8, entry.data.length, true); // Size of image data
        dirView.setUint32(12, offset, true); // Offset of image data
        
        directory.push(dirEntry);
        offset += entry.data.length;
      });
      
      // Combine all parts
      const totalSize = header.byteLength + 
                       directory.reduce((sum, d) => sum + d.byteLength, 0) +
                       iconEntries.reduce((sum, e) => sum + e.data.length, 0);
      
      const icoFile = new Uint8Array(totalSize);
      let position = 0;
      
      // Write header
      icoFile.set(new Uint8Array(header), position);
      position += header.byteLength;
      
      // Write directory
      directory.forEach(dirEntry => {
        icoFile.set(new Uint8Array(dirEntry), position);
        position += dirEntry.byteLength;
      });
      
      // Write image data
      iconEntries.forEach(entry => {
        icoFile.set(entry.data, position);
        position += entry.data.length;
      });
      
      return icoFile.buffer;
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
    
    /** Shift 연속 선택을 위한 마지막 선택 인덱스 */
    let lastSelectedIndex = null;

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
        lastSelectedIndex = null; // Shift 선택 인덱스 초기화
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
    let imageLoadingInProgress = false; // 이미지 로딩 중인지 추적

    // 이미지 압축 및 리사이즈 함수
    /**
     * @param {File} file 
     * @param {number} maxWidth 
     * @param {number} maxHeight 
     * @param {number} quality 
     * @returns {Promise<string>} Base64 이미지 데이터
     */
    async function compressImage(file, maxWidth = 1920, maxHeight = 1920, quality = 0.85) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
          const img = new Image();
          img.onload = function() {
            // 원본 크기
            let width = img.width;
            let height = img.height;

            // 리사이즈 필요 여부 확인
            if (width > maxWidth || height > maxHeight) {
              // 비율 유지하면서 리사이즈
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width = Math.round(width * ratio);
              height = Math.round(height * ratio);
            }

            // Canvas 생성
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            // 이미지 그리기
            ctx.drawImage(img, 0, 0, width, height);

            // JPEG로 변환 (압축)
            let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            
            // Base64 인코딩 후 크기 확인 (개별 이미지를 200KB 이하로 강력 압축)
            // 여러 이미지를 올릴 수 있으므로 개별 이미지는 작게 유지
            // Base64는 원본보다 약 33% 크므로, 원본이 150KB 정도면 Base64는 약 200KB
            let attemptQuality = quality;
            const maxSizePerImage = 150 * 1024; // 150KB (Base64로 약 200KB)
            
            // 크기가 너무 크면 품질을 낮춰서 재압축
            while (attemptQuality > 0.2 && compressedDataUrl.length > maxSizePerImage * 1.33) {
              attemptQuality -= 0.1;
              compressedDataUrl = canvas.toDataURL('image/jpeg', attemptQuality);
              console.log(`이미지 압축 재시도: 품질 ${Math.round(attemptQuality * 100)}%, 크기 ${Math.round(compressedDataUrl.length / 1024)}KB`);
            }

            // 여전히 너무 큰 경우 추가로 리사이즈 (반복적으로 크기 줄이기)
            let resizeAttempts = 0;
            while (compressedDataUrl.length > maxSizePerImage * 1.33 && resizeAttempts < 5) {
              const newRatio = Math.sqrt((maxSizePerImage * 1.33) / compressedDataUrl.length);
              const newWidth = Math.round(width * newRatio);
              const newHeight = Math.round(height * newRatio);
              
              canvas.width = newWidth;
              canvas.height = newHeight;
              ctx.drawImage(img, 0, 0, newWidth, newHeight);
              compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
              resizeAttempts++;
              console.log(`이미지 리사이즈 재시도 ${resizeAttempts}: ${newWidth}x${newHeight}, 크기 ${Math.round(compressedDataUrl.length / 1024)}KB`);
            }

            const originalSizeKB = Math.round(file.size / 1024);
            const compressedSizeKB = Math.round(compressedDataUrl.length / 1024);
            console.log(`이미지 압축 완료: ${originalSizeKB}KB → ${compressedSizeKB}KB (${Math.round((1 - compressedSizeKB / originalSizeKB) * 100)}% 감소)`);
            
            resolve(compressedDataUrl);
          };
          img.onerror = function() {
            reject(new Error('이미지 로드 실패'));
          };
          img.src = e.target.result;
        };
        reader.onerror = function() {
          reject(new Error('파일 읽기 실패'));
        };
        reader.readAsDataURL(file);
      });
    }

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
      checkbox.addEventListener('click', function (e) {
        // Shift 클릭: 범위 선택
        if (e.shiftKey && lastSelectedIndex !== null) {
          e.preventDefault();
          // 현재 필터링된 노트 목록 가져오기
          const notes = loadNotes();
          let filtered = notes;
          
          // 날짜 필터 적용
          if (selectedDates.length > 0) {
            const selectedDateStrs = new Set(selectedDates.map(d => formatDate(d)));
            filtered = filtered.filter(n => {
              const noteDateStr = formatDate(new Date(n.createdAt));
              return selectedDateStrs.has(noteDateStr);
            });
          }
          
          // 숨김 폴더 필터 적용: 기본적으로 숨김 폴더에 속한 메모는 제외
          const hasHiddenFolder = selectedFolderIds.has(HIDDEN_FOLDER_ID);
          if (!hasHiddenFolder) {
            filtered = filtered.filter(n => {
              if (!n.folderIds || n.folderIds.length === 0) {
                return true;
              }
              return !n.folderIds.includes(HIDDEN_FOLDER_ID);
            });
          }
          
          // 폴더 필터 적용
          if (selectedFolderIds.size > 0) {
            const hasPhotoFolder = selectedFolderIds.has(PHOTO_FOLDER_ID);
            const hasHiddenFolderSelected = selectedFolderIds.has(HIDDEN_FOLDER_ID);
            const otherFolders = Array.from(selectedFolderIds).filter(id => 
              id !== PHOTO_FOLDER_ID && id !== HIDDEN_FOLDER_ID
            );
            
            // 숨김 폴더만 선택된 경우
            if (hasHiddenFolderSelected && !hasPhotoFolder && otherFolders.length === 0) {
              filtered = filtered.filter(n => {
                return n.folderIds && n.folderIds.includes(HIDDEN_FOLDER_ID);
              });
            } else if (hasPhotoFolder && otherFolders.length === 0 && !hasHiddenFolderSelected) {
              filtered = filtered.filter(n => {
                const hasImages = (n.images && n.images.length > 0) || n.imageData;
                return hasImages;
              });
            } else {
              const allChildNotesMap = new Map();
              filtered.forEach(n => {
                if (n.parentId) {
                  if (!allChildNotesMap.has(n.parentId)) {
                    allChildNotesMap.set(n.parentId, []);
                  }
                  allChildNotesMap.get(n.parentId).push(n);
                }
              });
              
              const matchingNotes = new Set();
              filtered.forEach(n => {
                if (hasPhotoFolder) {
                  const hasImages = (n.images && n.images.length > 0) || n.imageData;
                  if (hasImages) {
                    matchingNotes.add(n.id);
                    if (n.parentId) matchingNotes.add(n.parentId);
                    const children = allChildNotesMap.get(n.id) || [];
                    children.forEach(child => matchingNotes.add(child.id));
                  }
                }
                if (hasHiddenFolderSelected) {
                  if (n.folderIds && n.folderIds.includes(HIDDEN_FOLDER_ID)) {
                    matchingNotes.add(n.id);
                    if (n.parentId) matchingNotes.add(n.parentId);
                    const children = allChildNotesMap.get(n.id) || [];
                    children.forEach(child => matchingNotes.add(child.id));
                  }
                }
                if (n.folderIds && otherFolders.length > 0) {
                  const hasMatchingFolder = otherFolders.some(folderId => n.folderIds.includes(folderId));
                  if (hasMatchingFolder) {
                    matchingNotes.add(n.id);
                    if (n.parentId) matchingNotes.add(n.parentId);
                    const children = allChildNotesMap.get(n.id) || [];
                    children.forEach(child => matchingNotes.add(child.id));
                  }
                }
              });
              filtered = filtered.filter(n => matchingNotes.has(n.id));
            }
          }
          
          // 검색 필터 적용
          if (searchQuery && searchQuery.trim() !== '') {
            const q = searchQuery.trim().toLowerCase();
            const allChildNotesMap = new Map();
            notes.forEach(n => {
              if (n.parentId) {
                if (!allChildNotesMap.has(n.parentId)) {
                  allChildNotesMap.set(n.parentId, []);
                }
                allChildNotesMap.get(n.parentId).push(n);
              }
            });
            
            const matchingNotes = new Set();
            filtered.forEach(n => {
              if ((n.text || '').toLowerCase().includes(q)) {
                matchingNotes.add(n.id);
                if (n.parentId) matchingNotes.add(n.parentId);
                const children = allChildNotesMap.get(n.id) || [];
                children.forEach(child => matchingNotes.add(child.id));
              }
            });
            filtered = filtered.filter(n => matchingNotes.has(n.id));
          }
          
          // 타래 구조 정리 후 부모 노트만 추출 (체크박스는 부모 노트에만 있음)
          const finalParentNotes = filtered.filter(n => !n.parentId);
          const finalChildNotesMap = new Map();
          filtered.forEach(n => {
            if (n.parentId) {
              const parentExists = filtered.some(p => p.id === n.parentId);
              if (parentExists) {
                if (!finalChildNotesMap.has(n.parentId)) {
                  finalChildNotesMap.set(n.parentId, []);
                }
                finalChildNotesMap.get(n.parentId).push(n);
              }
            }
          });
          
          // 타래가 있는 부모 글은 가장 최신 타래 시간 기준으로 정렬
          const sorted = [...finalParentNotes].sort((a, b) => {
            const aChildren = finalChildNotesMap.get(a.id) || [];
            const bChildren = finalChildNotesMap.get(b.id) || [];
            
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
            
            const aTime = aLatestThread > 0 ? aLatestThread : new Date(a.createdAt).getTime();
            const bTime = bLatestThread > 0 ? bLatestThread : new Date(b.createdAt).getTime();
            
            return bTime - aTime;
          });
          
          // 현재 노트의 인덱스 찾기
          const currentIndex = sorted.findIndex(n => n.id === note.id);
          
          if (currentIndex !== -1) {
            const start = Math.min(lastSelectedIndex, currentIndex);
            const end = Math.max(lastSelectedIndex, currentIndex);
            
            // 범위 내 모든 노트 선택/해제 (첫 번째 선택 상태 기준)
            const firstNote = sorted[lastSelectedIndex];
            const shouldSelect = !selectedIds.has(firstNote.id);
            
            for (let i = start; i <= end; i++) {
              const rangeNote = sorted[i];
              if (shouldSelect) {
                selectedIds.add(rangeNote.id);
              } else {
                selectedIds.delete(rangeNote.id);
              }
            }
            
            // 단일 선택 시 타래 모드 활성화
            if (selectedIds.size === 1) {
              const singleId = Array.from(selectedIds)[0];
              threadParentId = singleId;
              updateThreadMode();
            } else {
              threadParentId = null;
              updateThreadMode();
            }
            
            updateBulkState();
            renderList(notes);
            lastSelectedIndex = currentIndex;
          }
        } else {
          // 일반 클릭: 단일 선택/해제
          const checked = !selectedIds.has(note.id);
          toggleSelect(note.id, checked);
          
          // 현재 필터링된 노트 목록에서 인덱스 찾기
          const notes = loadNotes();
          let filtered = notes;
          
          if (selectedDates.length > 0) {
            const selectedDateStrs = new Set(selectedDates.map(d => formatDate(d)));
            filtered = filtered.filter(n => {
              const noteDateStr = formatDate(new Date(n.createdAt));
              return selectedDateStrs.has(noteDateStr);
            });
          }
          
          // 숨김 폴더 필터 적용
          const hasHiddenFolder = selectedFolderIds.has(HIDDEN_FOLDER_ID);
          if (!hasHiddenFolder) {
            filtered = filtered.filter(n => {
              if (!n.folderIds || n.folderIds.length === 0) {
                return true;
              }
              return !n.folderIds.includes(HIDDEN_FOLDER_ID);
            });
          }
          
          if (selectedFolderIds.size > 0) {
            const hasPhotoFolder = selectedFolderIds.has(PHOTO_FOLDER_ID);
            const hasHiddenFolderSelected = selectedFolderIds.has(HIDDEN_FOLDER_ID);
            const otherFolders = Array.from(selectedFolderIds).filter(id => 
              id !== PHOTO_FOLDER_ID && id !== HIDDEN_FOLDER_ID
            );
            
            if (hasHiddenFolderSelected && !hasPhotoFolder && otherFolders.length === 0) {
              filtered = filtered.filter(n => {
                return n.folderIds && n.folderIds.includes(HIDDEN_FOLDER_ID);
              });
            } else if (hasPhotoFolder && otherFolders.length === 0 && !hasHiddenFolderSelected) {
              filtered = filtered.filter(n => {
                const hasImages = (n.images && n.images.length > 0) || n.imageData;
                return hasImages;
              });
            } else {
              const allChildNotesMap = new Map();
              filtered.forEach(n => {
                if (n.parentId) {
                  if (!allChildNotesMap.has(n.parentId)) {
                    allChildNotesMap.set(n.parentId, []);
                  }
                  allChildNotesMap.get(n.parentId).push(n);
                }
              });
              
              const matchingNotes = new Set();
              filtered.forEach(n => {
                if (hasPhotoFolder) {
                  const hasImages = (n.images && n.images.length > 0) || n.imageData;
                  if (hasImages) {
                    matchingNotes.add(n.id);
                    if (n.parentId) matchingNotes.add(n.parentId);
                    const children = allChildNotesMap.get(n.id) || [];
                    children.forEach(child => matchingNotes.add(child.id));
                  }
                }
                if (hasHiddenFolderSelected) {
                  if (n.folderIds && n.folderIds.includes(HIDDEN_FOLDER_ID)) {
                    matchingNotes.add(n.id);
                    if (n.parentId) matchingNotes.add(n.parentId);
                    const children = allChildNotesMap.get(n.id) || [];
                    children.forEach(child => matchingNotes.add(child.id));
                  }
                }
                if (n.folderIds && otherFolders.length > 0) {
                  const hasMatchingFolder = otherFolders.some(folderId => n.folderIds.includes(folderId));
                  if (hasMatchingFolder) {
                    matchingNotes.add(n.id);
                    if (n.parentId) matchingNotes.add(n.parentId);
                    const children = allChildNotesMap.get(n.id) || [];
                    children.forEach(child => matchingNotes.add(child.id));
                  }
                }
              });
              filtered = filtered.filter(n => matchingNotes.has(n.id));
            }
          }
          
          if (searchQuery && searchQuery.trim() !== '') {
            const q = searchQuery.trim().toLowerCase();
            const allChildNotesMap = new Map();
            notes.forEach(n => {
              if (n.parentId) {
                if (!allChildNotesMap.has(n.parentId)) {
                  allChildNotesMap.set(n.parentId, []);
                }
                allChildNotesMap.get(n.parentId).push(n);
              }
            });
            
            const matchingNotes = new Set();
            filtered.forEach(n => {
              if ((n.text || '').toLowerCase().includes(q)) {
                matchingNotes.add(n.id);
                if (n.parentId) matchingNotes.add(n.parentId);
                const children = allChildNotesMap.get(n.id) || [];
                children.forEach(child => matchingNotes.add(child.id));
              }
            });
            filtered = filtered.filter(n => matchingNotes.has(n.id));
          }
          
          const finalParentNotes = filtered.filter(n => !n.parentId);
          const finalChildNotesMap = new Map();
          filtered.forEach(n => {
            if (n.parentId) {
              const parentExists = filtered.some(p => p.id === n.parentId);
              if (parentExists) {
                if (!finalChildNotesMap.has(n.parentId)) {
                  finalChildNotesMap.set(n.parentId, []);
                }
                finalChildNotesMap.get(n.parentId).push(n);
              }
            }
          });
          
          const sorted = [...finalParentNotes].sort((a, b) => {
            const aChildren = finalChildNotesMap.get(a.id) || [];
            const bChildren = finalChildNotesMap.get(b.id) || [];
            
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
            
            const aTime = aLatestThread > 0 ? aLatestThread : new Date(a.createdAt).getTime();
            const bTime = bLatestThread > 0 ? bLatestThread : new Date(b.createdAt).getTime();
            
            return bTime - aTime;
          });
          
          const currentIndex = sorted.findIndex(n => n.id === note.id);
          if (currentIndex !== -1) {
            lastSelectedIndex = currentIndex;
          }
        }
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
      
      // 숨김 폴더 필터 적용: 기본적으로 숨김 폴더에 속한 메모는 제외
      // 단, 숨김 폴더가 선택되었을 때만 표시
      const hasHiddenFolder = selectedFolderIds.has(HIDDEN_FOLDER_ID);
      if (!hasHiddenFolder) {
        // 숨김 폴더가 선택되지 않았으면 숨김 폴더에 속한 메모 제외
        filtered = filtered.filter(n => {
          // folderIds가 없거나 숨김 폴더 ID를 포함하지 않으면 표시
          if (!n.folderIds || n.folderIds.length === 0) {
            return true;
          }
          return !n.folderIds.includes(HIDDEN_FOLDER_ID);
        });
      }
      
      // 폴더 필터 적용 - 타래 구조 유지를 위해 부모/자식 중 하나라도 폴더에 있으면 전체 포함
      if (selectedFolderIds.size > 0) {
        // 사진 폴더가 선택되었는지 확인
        const hasPhotoFolder = selectedFolderIds.has(PHOTO_FOLDER_ID);
        // 숨김 폴더가 선택되었는지 확인
        const hasHiddenFolderSelected = selectedFolderIds.has(HIDDEN_FOLDER_ID);
        // 사진 폴더와 숨김 폴더를 제외한 다른 폴더들
        const otherFolders = Array.from(selectedFolderIds).filter(id => 
          id !== PHOTO_FOLDER_ID && id !== HIDDEN_FOLDER_ID
        );
        
        // 숨김 폴더만 선택된 경우
        if (hasHiddenFolderSelected && !hasPhotoFolder && otherFolders.length === 0) {
          // 숨김 폴더에 속한 메모만 표시
          filtered = filtered.filter(n => {
            return n.folderIds && n.folderIds.includes(HIDDEN_FOLDER_ID);
          });
        } else if (hasPhotoFolder && otherFolders.length === 0 && !hasHiddenFolderSelected) {
          // 사진 폴더만 선택: 사진이 있는 글만 표시
          filtered = filtered.filter(n => {
            const hasImages = (n.images && n.images.length > 0) || n.imageData;
            return hasImages;
          });
        } else {
          // 일반 폴더 선택 (사진 폴더, 숨김 폴더 포함 가능): 타래 구조를 유지하면서 필터링
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
            // 숨김 폴더가 선택되었고 숨김 폴더에 속해 있으면 포함
            if (hasHiddenFolderSelected) {
              if (n.folderIds && n.folderIds.includes(HIDDEN_FOLDER_ID)) {
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
      
      // 이미지가 로딩 중이면 완료될 때까지 대기 (모바일에서 이미지와 글을 같이 올릴 때 저장 안 되는 문제 해결)
      if (imageLoadingInProgress) {
        console.log('이미지 로딩 중... 대기합니다.');
        // 이미지 로딩이 완료될 때까지 최대 5초 대기
        let waitCount = 0;
        while (imageLoadingInProgress && waitCount < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          waitCount++;
        }
        if (imageLoadingInProgress) {
          console.warn('이미지 로딩 시간 초과, 진행합니다.');
          imageLoadingInProgress = false;
        }
      }
      
      // 텍스트 또는 이미지가 하나라도 있을 때 전송
      if (!value && pendingImages.length === 0) {
        input.focus();
        return;
      }
      
      // pendingImages가 확실히 준비되었는지 확인 (마지막 안전장치)
      const imagesToSave = pendingImages.length > 0 ? [...pendingImages] : [];
      
      const nowIso = new Date().toISOString();
      /** @type {Note} */
      const note = { id: generateId(), text: value, createdAt: nowIso };
      if (imagesToSave.length > 0) {
        note.images = imagesToSave;
        console.log('이미지 포함 메모 저장:', imagesToSave.length, '개 이미지');
      }
      // 타래 모드일 때 parentId 설정
      if (threadParentId) {
        note.parentId = threadParentId;
        // 타래 모드는 유지 (여러 글 작성 가능)
      }
      const notes = loadNotes();
      notes.push(note);
      
      // 로컬 저장 먼저 (확실히 저장되도록)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      updateTotalNotesCount();
      console.log('로컬 저장 완료:', { text: value.substring(0, 50), images: imagesToSave.length });
      
      // Firebase 동기화 - 백그라운드에서 비동기 처리 (UI 블로킹 없음)
      if (isFirebaseEnabled()) {
        // 비동기로 처리해서 전송 속도 개선
        (async () => {
          try {
            // 이미지가 포함된 경우 데이터 크기 확인 및 추가 압축
            if (imagesToSave.length > 0) {
              let dataSize = JSON.stringify(notes).length;
              let dataSizeKB = Math.round(dataSize / 1024);
              
              // Firebase Firestore 문서 크기 제한 확인 (1MB = 1024KB)
              // 크기가 초과되면 이미지를 추가로 압축
              if (dataSize > 1000 * 1024) {
                console.warn('⚠️ 데이터 크기 초과:', dataSizeKB + 'KB', '- 추가 압축 시도');
                
                // 각 이미지를 더 작게 압축
                const recompressedImages = [];
                for (let i = 0; i < imagesToSave.length; i++) {
                  const imgData = imagesToSave[i];
                  const imgSizeKB = Math.round(imgData.length / 1024);
                  
                  // 이미지가 200KB 이상이면 추가 압축
                  if (imgData.length > 200 * 1024) {
                    try {
                      // Base64를 Image로 변환하여 재압축
                      const img = new Image();
                      const recompressed = await new Promise((resolve, reject) => {
                        img.onload = function() {
                          const canvas = document.createElement('canvas');
                          const ratio = Math.min(1200 / img.width, 1200 / img.height);
                          canvas.width = Math.round(img.width * ratio);
                          canvas.height = Math.round(img.height * ratio);
                          const ctx = canvas.getContext('2d');
                          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                          const compressed = canvas.toDataURL('image/jpeg', 0.6);
                          resolve(compressed);
                        };
                        img.onerror = reject;
                        img.src = imgData;
                      });
                      
                      recompressedImages.push(recompressed);
                      console.log(`이미지 ${i + 1} 추가 압축: ${imgSizeKB}KB → ${Math.round(recompressed.length / 1024)}KB`);
                    } catch (e) {
                      console.warn(`이미지 ${i + 1} 재압축 실패, 원본 사용:`, e);
                      recompressedImages.push(imgData);
                    }
                  } else {
                    recompressedImages.push(imgData);
                  }
                }
                
                // 재압축된 이미지로 노트 업데이트
                const noteIndex = notes.length - 1;
                if (notes[noteIndex] && notes[noteIndex].images) {
                  notes[noteIndex].images = recompressedImages;
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
                  
                  // 재압축 후 크기 확인
                  dataSize = JSON.stringify(notes).length;
                  dataSizeKB = Math.round(dataSize / 1024);
                  
                  if (dataSize > 1000 * 1024) {
                    console.error('❌ 재압축 후에도 데이터 크기가 너무 큽니다:', dataSizeKB + 'KB');
                    // 여전히 크면 일부 이미지 제거하거나 더 강력하게 압축
                    showToast('이미지가 너무 많아 일부만 저장됩니다');
                  }
                }
              }
            }
            
            // forceSync: true로 무조건 저장 (백그라운드에서)
            await syncToFirebase(notes, true);
            console.log('✅ 메모가 Firebase에 저장되었습니다');
          } catch (err) {
            console.error('❌ Firebase 저장 실패:', err);
            // 에러는 콘솔에만 표시, 토스트 없음
          }
        })();
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
      
      fileInput.addEventListener('change', async function () {
        const files = fileInput.files;
        if (!files || files.length === 0) return;
        
        console.log('파일 선택됨:', files.length, '개 파일');
        
        // 이미지 로딩 시작 표시
        imageLoadingInProgress = true;
        
        try {
          const compressPromises = [];
        for (const file of Array.from(files)) {
            // 이미지 파일만 처리
            if (file.type.startsWith('image/')) {
              compressPromises.push(
                compressImage(file)
                  .then(compressed => compressed)
                  .catch(error => {
                    console.error('이미지 압축 실패:', error, file.name);
                    // 압축 실패 시 원본 사용하지 않고 null 반환 (안전)
                    return null;
                  })
              );
            } else {
              console.warn('이미지 파일이 아닙니다:', file.name, file.type);
              compressPromises.push(Promise.resolve(null));
            }
          }
          
          const results = await Promise.all(compressPromises);
          const validResults = results.filter(r => r !== null && r !== undefined);
          
          if (validResults.length > 0) {
            // 압축된 이미지 크기 확인 및 로깅
            validResults.forEach((imgData, index) => {
              const imgSizeKB = Math.round(imgData.length / 1024);
              console.log(`이미지 ${index + 1} 압축 완료: ${imgSizeKB}KB`);
            });
            
            const totalSize = validResults.reduce((sum, img) => sum + img.length, 0);
            const totalSizeKB = Math.round(totalSize / 1024);
            console.log('전체 이미지 크기:', totalSizeKB + 'KB', `(${validResults.length}개)`);
            
            pendingImages.push(...validResults);
            renderUploadPreview();
            console.log('이미지 미리보기 추가:', validResults.length, '개');
          } else {
            showToast('이미지를 처리할 수 없습니다.');
          }
        } catch (error) {
          console.error('이미지 처리 중 오류:', error);
          showToast('이미지 처리 중 오류가 발생했습니다.');
        } finally {
          // 이미지 로딩 완료 표시
          imageLoadingInProgress = false;
          // 선택 상태 초기화
          fileInput.value = '';
        }
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
      localStorage.removeItem('firebase_last_synced_data');
      localStorage.removeItem('firebase_last_updated');
      
      // Firebase에서도 데이터 삭제
      if (isFirebaseEnabled()) {
        try {
          const userId = getUserId();
          const userDoc = window.firebaseDoc(window.firebaseDb, 'users', userId);
          await window.firebaseDeleteDoc(userDoc);
          console.log('Firebase 데이터 삭제 완료');
        } catch (error) {
          console.error('Firebase 데이터 삭제 실패:', error);
          // Firebase 삭제 실패해도 로컬은 이미 삭제되었으므로 계속 진행
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

      resetConfirmYes.addEventListener('click', async function(e) {
        e.stopPropagation(); // 모달 외부 클릭 이벤트 방지
        // 모달 닫기
        resetConfirmModal.style.display = 'none';
        
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
      });

      resetConfirmNo.addEventListener('click', function(e) {
        e.stopPropagation(); // 모달 외부 클릭 이벤트 방지
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
      if (!folderList) {
        console.error('folderList가 없습니다!');
        return;
      }
      folderList.innerHTML = '';
      const folders = loadFolders();
      console.log('renderFolders: 폴더 개수 =', folders.length, folders);
      if (!folders || folders.length === 0) {
        console.warn('폴더가 없습니다!');
        return;
      }
      folders.forEach(folder => {
        if (!folder || !folder.id) {
          console.warn('잘못된 폴더:', folder);
          return;
        }
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
                // 빈 값이면 폴더 삭제 (북마크 폴더, 사진 폴더, 숨김 폴더 제외)
                if (f && f.id !== BOOKMARK_FOLDER_ID && f.id !== PHOTO_FOLDER_ID && f.id !== HIDDEN_FOLDER_ID) {
                  const filtered = folders.filter(x => x.id !== folder.id);
                  saveFolders(filtered);
                  selectedFolderIds.delete(folder.id);
                } else if (f && (f.id === BOOKMARK_FOLDER_ID || f.id === PHOTO_FOLDER_ID || f.id === HIDDEN_FOLDER_ID)) {
                  // 북마크 폴더, 사진 폴더, 숨김 폴더는 이름을 유지
                  if (f.id === BOOKMARK_FOLDER_ID) {
                    f.name = '북마크';
                  } else if (f.id === PHOTO_FOLDER_ID) {
                    f.name = '사진';
                  } else if (f.id === HIDDEN_FOLDER_ID) {
                    f.name = '숨김';
                  }
                  saveFolders(folders);
                }
              }
              editingFolderId = null;
              renderFolders();
              // 폴더 이름 변경 시 메모 목록은 다시 렌더링할 필요 없음 (성능 최적화)
              updateFilterInfo();
            } else if (e.key === 'Escape') {
              // Escape 시 폴더 삭제 (빈 이름이면, 북마크 폴더, 사진 폴더, 숨김 폴더 제외)
              const folders = loadFolders();
              const f = folders.find(x => x.id === folder.id);
              if (f && !f.name && f.id !== BOOKMARK_FOLDER_ID && f.id !== PHOTO_FOLDER_ID && f.id !== HIDDEN_FOLDER_ID) {
                const filtered = folders.filter(x => x.id !== folder.id);
                saveFolders(filtered);
                if (selectedFolderId === folder.id) {
                  selectedFolderId = null;
                }
              } else if (f && (f.id === BOOKMARK_FOLDER_ID || f.id === PHOTO_FOLDER_ID || f.id === HIDDEN_FOLDER_ID)) {
                // 북마크 폴더, 사진 폴더, 숨김 폴더는 이름을 유지
                if (f.id === BOOKMARK_FOLDER_ID) {
                  f.name = '북마크';
                } else if (f.id === PHOTO_FOLDER_ID) {
                  f.name = '사진';
                } else if (f.id === HIDDEN_FOLDER_ID) {
                  f.name = '숨김';
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
                // 빈 값이면 폴더 삭제 (북마크 폴더, 사진 폴더, 숨김 폴더 제외)
                // 단, 새로 추가한 폴더(원래 이름이 빈 문자열)는 삭제하지 않음
                if (f && f.id !== BOOKMARK_FOLDER_ID && f.id !== PHOTO_FOLDER_ID && f.id !== HIDDEN_FOLDER_ID) {
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
                } else if (f && (f.id === BOOKMARK_FOLDER_ID || f.id === PHOTO_FOLDER_ID || f.id === HIDDEN_FOLDER_ID)) {
                  // 북마크 폴더, 사진 폴더, 숨김 폴더는 이름을 유지
                  if (f.id === BOOKMARK_FOLDER_ID) {
                    f.name = '북마크';
                  } else if (f.id === PHOTO_FOLDER_ID) {
                    f.name = '사진';
                  } else if (f.id === HIDDEN_FOLDER_ID) {
                    f.name = '숨김';
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
                     folder.id === HIDDEN_FOLDER_ID ? 'lock-icon.svg' : 
                     'folder-icon.svg';
          icon.alt = folder.id === BOOKMARK_FOLDER_ID ? '북마크' : 
                     folder.id === PHOTO_FOLDER_ID ? '사진' : 
                     folder.id === HIDDEN_FOLDER_ID ? '숨김' : 
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
            id !== BOOKMARK_FOLDER_ID && id !== PHOTO_FOLDER_ID && id !== HIDDEN_FOLDER_ID
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
        profileImageInput.addEventListener('change', async function(e) {
          const file = e.target.files?.[0];
          if (file && file.type.startsWith('image/')) {
            try {
              // 프로필 이미지는 작은 크기로 리사이즈 (500x500)
              const compressedImage = await compressImage(file, 500, 500, 0.9);
              if (compressedImage && profileImg && profileImagePlaceholder) {
                profileImg.src = compressedImage;
                profileImg.style.display = 'block';
                profileImagePlaceholder.style.display = 'none';
                saveProfileImage(compressedImage);
              }
            } catch (error) {
              console.error('프로필 이미지 압축 실패:', error);
              showToast('이미지를 처리할 수 없습니다.');
            }
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
    
    // Firebase 동기화 초기화 (새로고침 시 Firebase에서 데이터 가져오기)
    function initFirebaseSync() {
      if (!isFirebaseEnabled()) {
        console.warn('Firebase 동기화가 활성화되지 않았습니다.');
            return;
      }
      
      console.log('initFirebaseSync 시작', {
        hasFirebase: !!window.firebaseDb,
        userId: getUserId() // 고정 ID
      });
      
      // 새로고침 시 Firebase에서 데이터 가져오기 (비교 없이)
      syncFromFirebase().then(cloudNotes => {
          if (cloudNotes && cloudNotes.length > 0) {
          // Firebase에서 가져온 데이터로 로컬 업데이트 (비교 없음)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudNotes));
              renderList(cloudNotes);
          console.log('✅ Firebase에서 데이터 가져옴:', cloudNotes.length, '개 메모');
      } else {
          // Firebase에 데이터가 없으면 로컬 데이터를 Firebase에 저장
          const localNotes = loadNotes();
          if (localNotes && localNotes.length > 0) {
            syncToFirebase(localNotes, true).catch(err => {
              console.error('로컬 데이터를 Firebase에 저장 실패:', err);
            });
          }
          console.log('Firebase에 데이터 없음, 로컬 데이터 유지');
        }
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
        
        // 모바일: 상단 헤더에 투명화 버튼 추가
        const mobileHeader = document.getElementById('mobile-header');
        const mobileTransparencyBtnContainer = document.getElementById('mobile-transparency-btn-container');
        if (mobileHeader && mobileTransparencyBtnContainer && !document.getElementById('mobile-transparency-btn')) {
          // 투명화 버튼
          const transparencyBtn = document.createElement('button');
          transparencyBtn.id = 'mobile-transparency-btn';
          transparencyBtn.type = 'button';
          transparencyBtn.className = 'mobile-transparency-btn';
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
          mobileTransparencyBtnContainer.appendChild(transparencyBtn);
          mobileHeader.style.display = 'block';
        }
      } else {
        // PC: 모바일 헤더와 투명화 버튼 숨김
        const mobileHeader = document.getElementById('mobile-header');
        if (mobileHeader) {
          mobileHeader.style.display = 'none';
        }
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


