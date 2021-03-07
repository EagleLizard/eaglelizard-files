import { MemCacheV2 } from './src/modules/mem-cache/mem-cache-v2';

// const INTERVAL = 6e4;
const INTERVAL = 1e4;

export default class MemLogger {
  memCache?: MemCacheV2;
  constructor(memCache?: MemCacheV2) {
    // this.logHeap();
    this.memCache = memCache;
  }

  run() {
    this.logHeap();
  }

  private logHeap() {
    let used: number, cacheSize: number;
    used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`Used Memory: ${used.toFixed(2)} MB`);
    if(this.memCache !== undefined) {
      cacheSize = this.memCache.cacheSize() / 1024 / 1024;
      console.log(`Cache Size: ${cacheSize.toFixed(2)} MB`);
    }
    setTimeout(() => {
      this.logHeap();
    }, INTERVAL);
  }
}
