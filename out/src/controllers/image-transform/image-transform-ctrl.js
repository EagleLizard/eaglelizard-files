"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageTransformCtrl = void 0;
const stream_1 = __importDefault(require("stream"));
const AWS = __importStar(require("aws-sdk"));
const sharp_1 = __importDefault(require("sharp"));
const mem_cache_1 = __importDefault(require("../../../mem-cache"));
const jpgRx = /\.jpg$/;
function imageTransformCtrl(req, res) {
    let s3, cache;
    let imageKey, folderKey, transformer, imageData, width, cacheStream, s3Request, imageStream, contentType, cacheFile;
    cache = new mem_cache_1.default();
    s3 = new AWS.S3({
        region: 'us-west-1',
        accessKeyId: process.env.aws_access_key_id,
        secretAccessKey: process.env.aws_secret_access_key,
    });
    width = req.query.width;
    console.log(width);
    imageKey = req.params.image || req.params.folder;
    folderKey = req.params.image ? `/${req.params.folder}` : '';
    //consult image cache first
    if (width !== undefined && cache.has(imageKey, width)) {
        console.log('Pulling from memory');
        cacheFile = cache.get(imageKey, width);
        res.contentType(cacheFile.contentType);
        res.send(Buffer.from(cacheFile.data, 'binary'));
        return;
    }
    else {
        console.log('Pulling from s3');
    }
    s3Request = s3.getObject({
        Bucket: 'elasticbeanstalk-us-west-1-297608881144' + folderKey,
        Key: imageKey
    });
    s3Request.on('httpHeaders', (status, headers) => {
        contentType = headers['content-type'];
    });
    imageStream = s3Request.createReadStream();
    imageStream.on('error', err => {
        if (err.message === 'NoSuchKey') {
            console.error(`${err.message}: ${imageKey}`);
        }
        else {
            // console.error(err);
        }
    });
    if (width && !isNaN(+width)) {
        transformer = sharp_1.default().resize({
            width: +width,
            withoutEnlargement: true,
            fit: sharp_1.default.fit.inside,
        });
        if (jpgRx.test(imageKey)) {
            transformer.jpeg({
                quality: 100
            });
        }
        transformer.on('error', err => {
            console.error(err);
        });
        imageStream = imageStream.pipe(transformer);
    }
    // save data for caching
    imageData = '';
    cacheStream = imageStream.pipe(new stream_1.default.PassThrough());
    cacheStream.setEncoding('binary');
    // imageStream.setEncoding('binary');
    cacheStream.on('data', (chunk) => {
        imageData += chunk;
    });
    cacheStream.on('end', () => {
        cache.set(imageData, contentType, imageKey, width);
    });
    imageStream.pipe(res);
    res.setHeader('Access-Control-Allow-Origin', '*');
}
exports.imageTransformCtrl = imageTransformCtrl;
//# sourceMappingURL=image-transform-ctrl.js.map