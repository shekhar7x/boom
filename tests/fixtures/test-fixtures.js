import { test as base } from '@playwright/test';

export const test = base.extend({
  // Mock MediaRecorder API
  mockMediaRecorder: async ({ page }, use) => {
    await page.addInitScript(() => {
      class MockMediaRecorder {
        constructor(stream, options) {
          this.stream = stream;
          this.options = options;
          this.state = 'inactive';
          this.ondataavailable = null;
          this.onstop = null;
          this.onstart = null;
          this.onpause = null;
          this.onresume = null;
          this.onerror = null;
          this.chunks = [];
        }

        start(timeslice) {
          this.state = 'recording';
          if (this.onstart) this.onstart();
          
          // Simulate data chunks
          this.interval = setInterval(() => {
            const blob = new Blob(['mock video data'], { type: 'video/webm' });
            if (this.ondataavailable) {
              this.ondataavailable({ data: blob });
            }
            this.chunks.push(blob);
          }, timeslice || 1000);
        }

        stop() {
          this.state = 'inactive';
          clearInterval(this.interval);
          
          const blob = new Blob(this.chunks, { type: 'video/webm' });
          if (this.ondataavailable) {
            this.ondataavailable({ data: blob });
          }
          if (this.onstop) this.onstop();
        }

        pause() {
          this.state = 'paused';
          if (this.onpause) this.onpause();
        }

        resume() {
          this.state = 'recording';
          if (this.onresume) this.onresume();
        }

        requestData() {
          const blob = new Blob(this.chunks, { type: 'video/webm' });
          if (this.ondataavailable) {
            this.ondataavailable({ data: blob });
          }
        }
      }

      MockMediaRecorder.isTypeSupported = () => true;
      window.MediaRecorder = MockMediaRecorder;
    });
    await use();
  },

  // Mock getUserMedia and getDisplayMedia
  mockMediaDevices: async ({ page }, use) => {
    await page.addInitScript(() => {
      const mockStream = {
        id: 'mock-stream-id',
        active: true,
        getTracks: () => [
          {
            kind: 'video',
            id: 'video-track',
            label: 'Mock Video Track',
            enabled: true,
            muted: false,
            readyState: 'live',
            stop: () => {},
            getSettings: () => ({
              width: 1920,
              height: 1080,
              frameRate: 30,
            }),
          },
          {
            kind: 'audio',
            id: 'audio-track',
            label: 'Mock Audio Track',
            enabled: true,
            muted: false,
            readyState: 'live',
            stop: () => {},
          },
        ],
        getVideoTracks: () => [mockStream.getTracks()[0]],
        getAudioTracks: () => [mockStream.getTracks()[1]],
        addTrack: () => {},
        removeTrack: () => {},
      };

      navigator.mediaDevices = {
        getUserMedia: async (constraints) => mockStream,
        getDisplayMedia: async (constraints) => mockStream,
        enumerateDevices: async () => [
          { kind: 'videoinput', deviceId: 'camera1', label: 'Mock Camera' },
          { kind: 'audioinput', deviceId: 'mic1', label: 'Mock Microphone' },
        ],
      };
    });
    await use();
  },

  // Mock IndexedDB with in-memory storage
  mockIndexedDB: async ({ page }, use) => {
    await page.addInitScript(() => {
      const mockDB = {
        videos: [],
        nextId: 1,
      };

      window.__mockDB = mockDB;

      // Override IDB operations
      const originalOpen = window.indexedDB.open;
      window.indexedDB.open = function(name, version) {
        const request = originalOpen.call(this, name, version);
        const originalSuccess = request.onsuccess;
        
        request.onsuccess = function(event) {
          const db = event.target.result;
          
          // Mock transaction methods
          const originalTransaction = db.transaction.bind(db);
          db.transaction = function(storeNames, mode) {
            const tx = originalTransaction(storeNames, mode);
            const originalObjectStore = tx.objectStore.bind(tx);
            
            tx.objectStore = function(name) {
              const store = originalObjectStore(name);
              
              // Mock add
              const originalAdd = store.add.bind(store);
              store.add = function(value) {
                const id = mockDB.nextId++;
                value.id = id;
                mockDB.videos.push(value);
                
                const request = originalAdd(value);
                setTimeout(() => {
                  if (request.onsuccess) {
                    request.onsuccess({ target: { result: id } });
                  }
                }, 0);
                return request;
              };
              
              // Mock getAll
              const originalGetAll = store.getAll.bind(store);
              store.getAll = function() {
                const request = originalGetAll();
                setTimeout(() => {
                  if (request.onsuccess) {
                    request.onsuccess({ target: { result: mockDB.videos } });
                  }
                }, 0);
                return request;
              };
              
              return store;
            };
            
            return tx;
          };
          
          if (originalSuccess) originalSuccess.call(this, event);
        };
        
        return request;
      };
    });
    await use();
  },
});

export { expect } from '@playwright/test';
