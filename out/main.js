"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AWS = __importStar(require("aws-sdk"));
const sharp_1 = __importDefault(require("sharp"));
const dotenv_1 = __importDefault(require("dotenv"));
const stream_1 = __importDefault(require("stream"));
const mem_cache_1 = __importDefault(require("./mem-cache"));
const mem_logger_1 = __importDefault(require("./mem-logger"));
dotenv_1.default.config();
const app = express_1.default();
const PORT = process.env.PORT || 8080;
const jpgRx = /\.jpg$/;
main();
function main() {
    let s3, cache, memLogger;
    memLogger = new mem_logger_1.default();
    memLogger.run();
    cache = new mem_cache_1.default();
    s3 = new AWS.S3({
        region: 'us-west-1',
        accessKeyId: process.env.aws_access_key_id,
        secretAccessKey: process.env.aws_secret_access_key,
    });
    app.get('/:folder/:image?', (req, res) => {
        let imageKey, folderKey, transformer, imageData, width, cacheStream, s3Request, imageStream, contentType, cacheFile;
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
            transformer = sharp_1.default().resize(+width);
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
    });
    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });
}
//# sourceMappingURL=main.js.map