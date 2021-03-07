
import { Readable, PassThrough } from 'stream';

import sharp from 'sharp';
import { AwsS3 } from '../../modules/aws/aws-s3';

import { getHasher, Hasher } from '../../lib/hasher';
import { MemCacheV2 } from '../../modules/mem-cache/mem-cache-v2';
import { CacheFileV2 } from '../../modules/mem-cache/cache-file-v2';

const jpgMimeType = 'image/jpeg';

export const memCache = new MemCacheV2;

interface CacheStreamHeaderResult {
  s3Stream: Readable;
  cacheStream: Readable;
  headers: Record<string, string>;
}

export class ImageTransformService {

  static async getImageStream(imageKey: string, folderKey: string, width?: number): Promise<{ imageStream: Readable, contentType: string }> {
    let s3Request: AWS.Request<AWS.S3.GetObjectOutput, AWS.AWSError>;
    let s3Stream: Readable, sharpTransformer: sharp.Sharp;
    let imageStream: Readable, cacheStream: PassThrough, resizeCacheStream: PassThrough,
      contentStream: Readable;
    let cacheStreamHeaderResult: CacheStreamHeaderResult, headers: Record<string, string>,
      contentType: string;
    let imageDataChunks: string[], imageData: string;
    let resizeImageDataChunks: string[], resizeImageData: string;
    let hasher: Hasher, resizeHasher: Hasher;

    let hasResizeInCache: boolean, resizeCacheFile: CacheFileV2;
    let hasInCache: boolean, cacheFile: CacheFileV2;
    hasResizeInCache = memCache.has(imageKey, folderKey, width);
    hasInCache = memCache.has(imageKey, folderKey);

    if(hasInCache) {
      console.log('HAS IN CACHE');
      cacheFile = memCache.get(imageKey, folderKey);
      contentType = cacheFile.contentType;
      contentStream = new Readable;
      contentStream.push(Buffer.from(cacheFile.data, 'binary'));
      contentStream.push(null);
    } else {
      s3Request = AwsS3.getObject(imageKey, folderKey);
      s3Request.on('error', err => {
        console.error(err);
      });
      cacheStream = new PassThrough();
      cacheStream.setEncoding('binary');
      imageDataChunks = [];

      hasher = getHasher();

      cacheStream.on('data', (chunk) => {
        hasher.update(chunk);
        imageDataChunks.push(chunk);
      });

      cacheStream.on('end', () => {
        imageData = imageDataChunks.join('');

        if(!memCache.has(imageKey, folderKey, width)) {
          memCache.set(imageData, contentType, hasher.digest(), imageKey, folderKey);
        }
      });
      cacheStreamHeaderResult = await initializeStreams(s3Request, cacheStream);
      s3Stream = cacheStreamHeaderResult.s3Stream;
      headers = cacheStreamHeaderResult.headers;

      contentType = headers['content-type'];
      contentStream = s3Stream;
    }

    /*
      SHARP TRANSFORM
    */
    if(width !== undefined) {
      if(hasResizeInCache) {
        console.log('HAS RESIZE IN CACHE');
        resizeCacheFile = memCache.get(imageKey, folderKey, width);
        contentType = cacheFile.contentType;
        imageStream = new Readable;
        imageStream.push(Buffer.from(resizeCacheFile.data, 'binary'));
        imageStream.push(null);
      } else {
        sharpTransformer = sharp().resize({
          width,
          withoutEnlargement: true,
          fit: sharp.fit.inside,
        });
        if(contentType.trim().toLowerCase() === jpgMimeType) {
          sharpTransformer.jpeg({
            quality: 100,
          });
        }

        sharpTransformer.on('error', err => {
          console.error(err);
        });

        resizeCacheStream = new PassThrough;
        resizeCacheStream.setEncoding('binary');

        resizeHasher = getHasher();
        resizeImageDataChunks = [];

        resizeCacheStream.on('data', (chunk) => {
          resizeHasher.update(chunk);
          resizeImageDataChunks.push(chunk);
        });
        resizeCacheStream.on('end', () => {
          resizeImageData = resizeImageDataChunks.join('');
          memCache.set(resizeImageData, contentType, resizeHasher.digest(), imageKey, folderKey, width);
        });
        sharpTransformer.pipe(resizeCacheStream);
        imageStream = contentStream.pipe(sharpTransformer);
      }
    } else {
      imageStream = contentStream;
    }
    return {
      imageStream,
      contentType,
    };
  }
}

function initializeStreams(
  s3Request: AWS.Request<AWS.S3.GetObjectOutput, AWS.AWSError>,
  cacheStream: PassThrough,
): Promise<CacheStreamHeaderResult> {
  return new Promise((resolve, reject) => {
    let s3Stream: Readable;

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
