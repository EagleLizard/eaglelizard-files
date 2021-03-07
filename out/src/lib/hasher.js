"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashSync = exports.getHasher = void 0;
const crypto_1 = require("crypto");
const alg = 'sha256';
const outputFormat = 'base64';
function getHasher() {
    let hash;
    hash = crypto_1.createHash(alg);
    return {
        update,
        digest,
    };
    function update(data) {
        hash.update(data);
    }
    function digest() {
        return hash.digest(outputFormat);
    }
}
exports.getHasher = getHasher;
function hashSync(data) {
    let hasher;
    hasher = getHasher();
    hasher.update(data);
    return hasher.digest();
}
exports.hashSync = hashSync;
//# sourceMappingURL=hasher.js.map