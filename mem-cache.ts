import CacheFile from './cache-file';

export default class MemCache {

  cacheMap: Map<string, CacheFile>;

  constructor() {
    this.cacheMap = new Map();
  }

  get(imageKey: string, width?: string): CacheFile | undefined {
    let key:string;
    key = this.getKey(imageKey, width);
    return this.cacheMap.get(key);
  }

  has(imageKey: string, width?: string): boolean {
    return this.cacheMap.has(this.getKey(imageKey, width));
  }

  set(imageData: string, contentType: string, imageKey: string, width?: string) {
    let key:string;
    key = this.getKey(imageKey, width);
    if(!this.has(imageKey, width)) {
      this.cacheMap.set(key, new CacheFile(imageData, contentType));
    }
  }

  private getKey(imageKey: string, width?: string) {
    return `${imageKey}:${width || ''}`;
  }
}

//sundance10.jpg 860kb
//utahrenaissancefaire.png 1.7mb
// fatpig9.jpg 718kb
