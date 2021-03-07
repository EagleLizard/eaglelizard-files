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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsS3 = void 0;
const AWS = __importStar(require("aws-sdk"));
const DEFAULT_BUCKET = 'elasticbeanstalk-us-west-1-297608881144';
const s3 = new AWS.S3({
    region: 'us-west-1',
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key,
});
class AwsS3 {
    static getObject(objectKey, folderKey, bucket = DEFAULT_BUCKET) {
        let s3Request;
        console.log('Pulling from s3:');
        console.log(`${bucket + folderKey}/${objectKey}`);
        s3Request = s3.getObject({
            Bucket: bucket + folderKey,
            Key: objectKey
        });
        return s3Request;
    }
}
exports.AwsS3 = AwsS3;
//# sourceMappingURL=aws-s3.js.map