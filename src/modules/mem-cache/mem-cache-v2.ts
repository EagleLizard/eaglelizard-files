
import { CacheFileV2 } from './cache-file-v2';

export class MemCacheV2 {
  cacheMap: Map<string, CacheFileV2>;
  constructor() {
    this.cacheMap = new Map;
  }

  get(imageKey: string, folderKey: string, width?: number) {
    let cacheKey: string;
    cacheKey = this.getKey(imageKey, folderKey, width);
    return this.cacheMap.get(cacheKey);
  }

  set(imageData: string, contentType: string, fileHash: string, imageKey: string, folderKey: string, width?: number) {
    let cacheKey: string;
    cacheKey = this.getKey(imageKey, folderKey, width);
    if(!this.cacheMap.has(cacheKey)) {
      this.cacheMap.set(cacheKey, new CacheFileV2(imageData, contentType, fileHash));
    }
  }

  has(imageKey: string, folderKey: string, width?: number) {
    let cacheKey: string;
    cacheKey = this.getKey(imageKey, folderKey, width);
    return this.cacheMap.has(cacheKey);
  }

  cacheSize(): number {
    let cacheFiles: CacheFileV2[];
    cacheFiles = [ ...this.cacheMap.values() ];
    return cacheFiles.reduce((acc, curr) => {
      return acc + curr.data.length;
    }, 0);
  }

  private getKey(imageKey: string, folderKey: string, width?: number) {
    return `${imageKey}_${folderKey}_${width}`;
  }
}
