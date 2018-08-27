"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MemLogger {
    constructor() {
        this.logHeap();
    }
    logHeap() {
        let used;
        used = process.memoryUsage().heapUsed / 1024 / 1024;
        console.log(`Used Memory: ${used.toFixed(2)} MB`);
        setTimeout(() => {
            this.logHeap();
        }, 2000);
    }
}
exports.default = MemLogger;
//# sourceMappingURL=mem-logger.js.map