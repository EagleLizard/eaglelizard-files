"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const INTERVAL = 6e4;
class MemLogger {
    constructor() {
        // this.logHeap();
    }
    run() {
        this.logHeap();
    }
    logHeap() {
        let used;
        used = process.memoryUsage().heapUsed / 1024 / 1024;
        console.log(`Used Memory: ${used.toFixed(2)} MB`);
        setTimeout(() => {
            this.logHeap();
        }, INTERVAL);
    }
}
exports.default = MemLogger;
//# sourceMappingURL=mem-logger.js.map