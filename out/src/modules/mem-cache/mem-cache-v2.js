"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemCacheV2 = void 0;
const cache_file_v2_1 = require("./cache-file-v2");
class MemCacheV2 {
    constructor() {
        this.cacheMap = new Map;
    }
    get(imageKey, folderKey, width) {
        let cacheKey;
        cacheKey = this.getKey(imageKey, folderKey, width);
        return this.cacheMap.get(cacheKey);
    }
    set(imageData, contentType, fileHash, imageKey, folderKey, width) {
        let cacheKey;
        cacheKey = this.getKey(imageKey, folderKey, width);
        if (!this.cacheMap.has(cacheKey)) {
            this.cacheMap.set(cacheKey, new cache_file_v2_1.CacheFileV2(imageData, contentType, fileHash));
        }
    }
    has(imageKey, folderKey, width) {
        let cacheKey;
        cacheKey = this.getKey(imageKey, folderKey, width);
        return this.cacheMap.has(cacheKey);
    }
    cacheSize() {
        let cacheFiles;
        cacheFiles = [...this.cacheMap.values()];
        return cacheFiles.reduce((acc, curr) => {
            return acc + curr.data.length;
        }, 0);
    }
    getKey(imageKey, folderKey, width) {
        return `${imageKey}_${folderKey}_${width}`;
    }
}
exports.MemCacheV2 = MemCacheV2;
//# sourceMappingURL=mem-cache-v2.js.map