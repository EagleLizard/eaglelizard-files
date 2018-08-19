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
const memory_streams_1 = __importDefault(require("memory-streams"));
const mem_cache_1 = __importDefault(require("./mem-cache"));
dotenv_1.default.config();
const app = express_1.default();
const PORT = process.env.PORT || 8080;
const jpgRx = /\.jpg$/;
main();
function main() {
    let s3, cache;
    cache = new mem_cache_1.default();
    s3 = new AWS.S3({
        region: 'us-west-1',
        accessKeyId: process.env.aws_access_key_id,
        secretAccessKey: process.env.aws_secret_access_key,
    });
    app.get('/:folder/:image?', (req, res) => {
        let imageKey, folderKey, transformer, memoryWriter, width;
        width = req.query.width;
        imageKey = req.params.image || req.params.folder;
        folderKey = req.params.image ? `/${req.params.folder}` : '';
        //consult image cache first
        if (cache.has(imageKey, width)) {
            res.type('png');
            res.write(new Buffer(cache.get(imageKey, width), 'binary'), 'binary');
            res.end(undefined, 'binary');
            return;
        }
        let imageStream = s3.getObject({
            Bucket: 'elasticbeanstalk-us-west-1-297608881144' + folderKey,
            Key: imageKey
        }).createReadStream();
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
        memoryWriter = new memory_streams_1.default.WritableStream();
        // imageStream.pipe(memoryWriter);
        let imageData = '';
        imageStream.setEncoding('binary');
        imageStream.on('data', (chunk) => {
            imageData += chunk;
        });
        imageStream.on('end', () => {
            console.log('memoryWriterFinish');
            cache.set(imageData, imageKey, width);
        });
        res.type('png');
        imageStream.pipe(res);
        res.setHeader('Access-Control-Allow-Origin', '*');
    });
    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });
}
//# sourceMappingURL=main.js.map