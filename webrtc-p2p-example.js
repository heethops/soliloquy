// WebRTC P2P 동기화 예시 코드
// 이 코드는 참고용이며, 실제 구현은 더 복잡합니다

// PeerJS를 사용한 간단한 예시
// 1. HTML에 추가: <script src="https://unpkg.com/peerjs@1/dist/peerjs.min.js"></script>

class P2PSync {
  constructor(userId) {
    this.userId = userId;
    this.peer = null;
    this.connections = new Map(); // 연결된 기기들
    this.dataChannel = null;
  }

  // 초기화
  async init() {
    // PeerJS 초기화 (무료 시그널링 서버 사용)
    this.peer = new Peer(this.userId, {
      host: '0.peerjs.com',
      port: 443,
      path: '/',
      secure: true
    });

    this.peer.on('open', (id) => {
      console.log('P2P 연결 준비 완료:', id);
      // 다른 기기에서 이 ID로 연결 가능
    });

    // 다른 기기의 연결 요청 수신
    this.peer.on('connection', (conn) => {
      this.setupConnection(conn);
    });
  }

  // 다른 기기에 연결
  connectToPeer(otherUserId) {
    const conn = this.peer.connect(otherUserId);
    this.setupConnection(conn);
  }

  // 연결 설정
  setupConnection(conn) {
    conn.on('open', () => {
      console.log('P2P 연결 성공:', conn.peer);
      this.connections.set(conn.peer, conn);

      // 데이터 수신
      conn.on('data', (data) => {
        this.handleReceivedData(data);
      });

      // 연결 종료
      conn.on('close', () => {
        this.connections.delete(conn.peer);
      });
    });
  }

  // 데이터 전송
  sendData(data) {
    const dataToSend = JSON.stringify(data);
    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(dataToSend);
      }
    });
  }

  // 데이터 수신 처리
  handleReceivedData(data) {
    try {
      const parsed = JSON.parse(data);
      // 메모 데이터 동기화
      if (parsed.type === 'notes') {
        this.syncNotes(parsed.notes);
      } else if (parsed.type === 'folders') {
        this.syncFolders(parsed.folders);
      }
    } catch (error) {
      console.error('데이터 수신 오류:', error);
    }
  }

  // 메모 동기화
  syncNotes(notes) {
    // 로컬 저장소와 병합
    const localNotes = loadNotes();
    const merged = this.mergeNotes(localNotes, notes);
    saveNotes(merged);
    renderList(merged);
  }

  // 메모 병합 (충돌 해결)
  mergeNotes(local, remote) {
    // 간단한 병합 로직 (실제로는 더 복잡함)
    const merged = [...local];
    remote.forEach(remoteNote => {
      const existing = merged.find(n => n.id === remoteNote.id);
      if (!existing) {
        merged.push(remoteNote);
      } else {
        // 더 최신 데이터 사용
        const localTime = new Date(existing.updatedAt || existing.createdAt);
        const remoteTime = new Date(remoteNote.updatedAt || remoteNote.createdAt);
        if (remoteTime > localTime) {
          const index = merged.indexOf(existing);
          merged[index] = remoteNote;
        }
      }
    });
    return merged;
  }

  // 메모 변경 시 동기화
  onNoteChanged(notes) {
    this.sendData({
      type: 'notes',
      notes: notes,
      timestamp: Date.now()
    });
  }
}

// 사용 예시
/*
const p2pSync = new P2PSync('user-hayagwi');
p2pSync.init();

// 다른 기기 연결 (다른 기기의 사용자 ID 필요)
p2pSync.connectToPeer('user-ios');

// 메모 저장 시 동기화
function saveNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  p2pSync.onNoteChanged(notes); // P2P 동기화
}
*/

// ⚠️ 주의사항
// 1. 두 기기가 동시에 온라인일 때만 동기화 가능
// 2. 다른 기기의 사용자 ID를 알아야 연결 가능
// 3. 방화벽/NAT 환경에서 연결 실패 가능
// 4. 충돌 해결 로직이 복잡함

