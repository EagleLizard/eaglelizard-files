"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MemCache {
    constructor() {
        this.cacheMap = new Map();
    }
    get(imageKey, width) {
        let key;
        key = this.getKey(imageKey, width);
        return this.cacheMap.get(key);
    }
    has(imageKey, width) {
        return this.cacheMap.has(this.getKey(imageKey, width));
    }
    set(imageData, imageKey, width) {
        let key;
        key = this.getKey(imageKey, width);
        if (!this.has(imageKey, width)) {
            this.cacheMap.set(key, imageData);
        }
    }
    getKey(imageKey, width) {
        return `${imageKey}:${width || ''}`;
    }
}
exports.default = MemCache;
//sundance10.jpg 860kb
//utahrenaissancefaire.png 1.7mb
// fatpig9.jpg 718kb
//# sourceMappingURL=mem-cache.js.map