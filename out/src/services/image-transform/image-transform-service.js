"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageTransformService = exports.memCache = void 0;
const stream_1 = require("stream");
const sharp_1 = __importDefault(require("sharp"));
const aws_s3_1 = require("../../modules/aws/aws-s3");
const hasher_1 = require("../../lib/hasher");
const mem_cache_v2_1 = require("../../modules/mem-cache/mem-cache-v2");
const jpgMimeType = 'image/jpeg';
exports.memCache = new mem_cache_v2_1.MemCacheV2;
class ImageTransformService {
    static getImageStream(imageKey, folderKey, width) {
        return __awaiter(this, void 0, void 0, function* () {
            let s3Request;
            let s3Stream, sharpTransformer;
            let imageStream, cacheStream, resizeCacheStream, contentStream;
            let cacheStreamHeaderResult, headers, contentType;
            let imageDataChunks, imageData;
            let resizeImageDataChunks, resizeImageData;
            let hasher, resizeHasher;
            let hasResizeInCache, resizeCacheFile;
            let hasInCache, cacheFile;
            hasResizeInCache = exports.memCache.has(imageKey, folderKey, width);
            hasInCache = exports.memCache.has(imageKey, folderKey);
            if (hasInCache) {
                console.log('HAS IN CACHE');
                cacheFile = exports.memCache.get(imageKey, folderKey);
                contentType = cacheFile.contentType;
                contentStream = new stream_1.Readable;
                contentStream.push(Buffer.from(cacheFile.data, 'binary'));
                contentStream.push(null);
            }
            else {
                s3Request = aws_s3_1.AwsS3.getObject(imageKey, folderKey);
                s3Request.on('error', err => {
                    console.error(err);
                });
                cacheStream = new stream_1.PassThrough();
                cacheStream.setEncoding('binary');
                imageDataChunks = [];
                hasher = hasher_1.getHasher();
                cacheStream.on('data', (chunk) => {
                    hasher.update(chunk);
                    imageDataChunks.push(chunk);
                });
                cacheStream.on('end', () => {
                    imageData = imageDataChunks.join('');
                    if (!exports.memCache.has(imageKey, folderKey, width)) {
                        exports.memCache.set(imageData, contentType, hasher.digest(), imageKey, folderKey);
                    }
                });
                cacheStreamHeaderResult = yield initializeStreams(s3Request, cacheStream);
                s3Stream = cacheStreamHeaderResult.s3Stream;
                headers = cacheStreamHeaderResult.headers;
                contentType = headers['content-type'];
                contentStream = s3Stream;
            }
            /*
              SHARP TRANSFORM
            */
            if (width !== undefined) {
                if (hasResizeInCache) {
                    console.log('HAS RESIZE IN CACHE');
                    resizeCacheFile = exports.memCache.get(imageKey, folderKey, width);
                    contentType = cacheFile.contentType;
                    imageStream = new stream_1.Readable;
                    imageStream.push(Buffer.from(resizeCacheFile.data, 'binary'));
                    imageStream.push(null);
                }
                else {
                    sharpTransformer = sharp_1.default().resize({
                        width,
                        withoutEnlargement: true,
                        fit: sharp_1.default.fit.inside,
                    });
                    if (contentType.trim().toLowerCase() === jpgMimeType) {
                        sharpTransformer.jpeg({
                            quality: 100,
                        });
                    }
                    sharpTransformer.on('error', err => {
                        console.error(err);
                    });
                    resizeCacheStream = new stream_1.PassThrough;
                    resizeCacheStream.setEncoding('binary');
                    resizeHasher = hasher_1.getHasher();
                    resizeImageDataChunks = [];
                    resizeCacheStream.on('data', (chunk) => {
                        resizeHasher.update(chunk);
                        resizeImageDataChunks.push(chunk);
                    });
                    resizeCacheStream.on('end', () => {
                        resizeImageData = resizeImageDataChunks.join('');
                        exports.memCache.set(resizeImageData, contentType, resizeHasher.digest(), imageKey, folderKey, width);
                    });
                    sharpTransformer.pipe(resizeCacheStream);
                    imageStream = contentStream.pipe(sharpTransformer);
                }
            }
            else {
                imageStream = contentStream;
            }
            return {
                imageStream,
                contentType,
            };
        });
    }
}
exports.ImageTransformService = ImageTransformService;
function initializeStreams(s3Request, cacheStream) {
    return new Promise((resolve, reject) => {
        let s3Stream;
        s3Request.on('httpHeaders', (status, headers) => {
            resolve({
                headers,
                s3Stream,
                cacheStream,
            });
        });
        s3Stream = s3Request.createReadStream();
        s3Stream.pipe(cacheStream);
    });
}
//# sourceMappingURL=image-transform-service.js.map