import { openDB } from 'idb';

const DB_NAME = 'BoomVideoDB';
const DB_VERSION = 1;
const VIDEOS_STORE = 'videos';

class StorageService {
  constructor() {
    this.db = null;
  }

  async init() {
    if (this.db) return this.db;

    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(VIDEOS_STORE)) {
          const store = db.createObjectStore(VIDEOS_STORE, {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('title', 'title');
        }
      },
    });

    return this.db;
  }

  async saveVideo(videoData) {
    const db = await this.init();
    const video = {
      ...videoData,
      timestamp: Date.now(),
    };
    const id = await db.add(VIDEOS_STORE, video);
    return { ...video, id };
  }

  async getVideo(id) {
    const db = await this.init();
    return await db.get(VIDEOS_STORE, id);
  }

  async getAllVideos() {
    const db = await this.init();
    const videos = await db.getAll(VIDEOS_STORE);
    return videos.sort((a, b) => b.timestamp - a.timestamp);
  }

  async updateVideo(id, updates) {
    const db = await this.init();
    const video = await db.get(VIDEOS_STORE, id);
    if (!video) throw new Error('Video not found');
    
    const updatedVideo = { ...video, ...updates };
    await db.put(VIDEOS_STORE, updatedVideo);
    return updatedVideo;
  }

  async deleteVideo(id) {
    const db = await this.init();
    await db.delete(VIDEOS_STORE, id);
  }

  async clearAll() {
    const db = await this.init();
    await db.clear(VIDEOS_STORE);
  }

  async getStorageSize() {
    const videos = await this.getAllVideos();
    return videos.reduce((total, video) => total + (video.size || 0), 0);
  }
}

export default new StorageService();
