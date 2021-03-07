"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const INTERVAL = 6e4;
const INTERVAL = 1e4;
class MemLogger {
    constructor(memCache) {
        // this.logHeap();
        this.memCache = memCache;
    }
    run() {
        this.logHeap();
    }
    logHeap() {
        let used, cacheSize;
        used = process.memoryUsage().heapUsed / 1024 / 1024;
        console.log(`Used Memory: ${used.toFixed(2)} MB`);
        if (this.memCache !== undefined) {
            cacheSize = this.memCache.cacheSize() / 1024 / 1024;
            console.log(`Cache Size: ${cacheSize.toFixed(2)} MB`);
        }
        setTimeout(() => {
            this.logHeap();
        }, INTERVAL);
    }
}
exports.default = MemLogger;
//# sourceMappingURL=mem-logger.js.map