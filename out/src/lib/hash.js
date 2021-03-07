"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashSync = exports.getHasher = void 0;
const crypto_1 = require("crypto");
const alg = 'sha256';
const outputFormat = 'base64';
function getHasher() {
    return crypto_1.createHash(alg);
}
exports.getHasher = getHasher;
function hashSync(data) {
    let hasher;
    hasher = getHasher();
    hasher.update(data);
    return hasher.digest('base64');
}
exports.hashSync = hashSync;
//# sourceMappingURL=hash.js.map