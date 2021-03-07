
import stream from 'stream';

import { Request, Response } from 'express';
import * as AWS from 'aws-sdk';
import sharp from 'sharp';

import MemCache from '../../../mem-cache';
import CacheFile from '../../../cache-file';

const jpgRx = /\.jpg$/;

export function imageTransformCtrl(req: Request, res: Response) {
  let s3: AWS.S3, cache: MemCache;
  let imageKey:string, folderKey, transformer: sharp.Sharp, imageData: string,
    width: string, cacheStream, s3Request, imageStream, contentType: string,
    cacheFile: CacheFile;
  cache = new MemCache();

  s3 = new AWS.S3({
    region: 'us-west-1',
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key,
  });
  width = (req.query.width as string);
  console.log(width);
  imageKey = req.params.image || req.params.folder;
  folderKey = req.params.image ? `/${req.params.folder}` : '';
  //consult image cache first
  if(width !== undefined && cache.has(imageKey, width)) {
    console.log('Pulling from memory');
    cacheFile = <CacheFile>cache.get(imageKey, width);
    res.contentType(cacheFile.contentType);
    res.send(Buffer.from(cacheFile.data, 'binary'));
    return;
  } else {
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
    if(err.message === 'NoSuchKey') {
      console.error(`${err.message}: ${imageKey}`);
    } else {
      // console.error(err);
    }
  });

  if(width && !isNaN(+width)) {
    transformer = sharp().resize({
      width: +width,
      withoutEnlargement: true,
      fit: sharp.fit.inside,
    });

    if(jpgRx.test(imageKey)) {
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
  cacheStream = imageStream.pipe(new stream.PassThrough());
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

