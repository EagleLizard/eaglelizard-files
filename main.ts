
import express from 'express';
import * as AWS from 'aws-sdk';
import sharp from 'sharp';
import dotenv from 'dotenv';
import streams from 'memory-streams';
import fs from 'fs';

import MemCache from './mem-cache';
import { WriteStream, fstat } from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

const jpgRx = /\.jpg$/;

main();

function main(){
  let s3: AWS.S3, cache: MemCache;

  cache = new MemCache();


  s3 = new AWS.S3({
    region: 'us-west-1',
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key,
  });

  app.get('/:folder/:image?', (req, res)=>{
    let imageKey:string, folderKey, transformer,
    memoryWriter: streams.WritableStream, width: string;

    width = req.query.width;
    imageKey = req.params.image || req.params.folder;
    folderKey = req.params.image ? `/${req.params.folder}` : '';
    //consult image cache first
    if(cache.has(imageKey, width)){
      res.type('png');
      res.write(new Buffer(<string>cache.get(imageKey, width), 'binary'), 'binary');
      res.end(undefined, 'binary');
      return;
    }
  
    let imageStream = s3.getObject({
      Bucket: 'elasticbeanstalk-us-west-1-297608881144'+folderKey,
      Key: imageKey
    }).createReadStream();

    imageStream.on('error', err=>{
      if(err.message === 'NoSuchKey'){
        console.error(`${err.message}: ${imageKey}`);
      }else{
        // console.error(err);
      }
    })

    if(width && !isNaN(+width)){
      transformer = sharp().resize(+width);

      if(jpgRx.test(imageKey)){
        transformer.jpeg({
          quality: 100
        });
      }

      transformer.on('error', err=>{
        console.error(err);
      });

      imageStream = imageStream.pipe(transformer);
    }

    
    memoryWriter = new streams.WritableStream();
    // imageStream.pipe(memoryWriter);

    let imageData = '';
    imageStream.setEncoding('binary');
    imageStream.on('data', (chunk)=>{
      imageData += chunk;
    });

    imageStream.on('end', ()=>{
      console.log('memoryWriterFinish');
      cache.set(imageData, imageKey, width);
    });
    res.type('png');
    imageStream.pipe(res);
    res.setHeader('Access-Control-Allow-Origin', '*');
  });

  app.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}`);
  });
}
