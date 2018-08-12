
const express = require('express');
const AWS = require('aws-sdk');
const sharp = require('sharp');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

const jpgRx = /\.jpg$/;

main();

function main(){
  let s3;
  s3 = new AWS.S3({
    region: 'us-west-1',
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key,
  });
  app.get('/:folder/:image?', (req, res)=>{
    let imageStream, imageKey, folderKey, transformer;
    
    imageKey = req.params.image || req.params.folder;
    folderKey = req.params.image ? `/${req.params.folder}` : '';
    imageStream = s3.getObject({
      Bucket: 'elasticbeanstalk-us-west-1-297608881144'+folderKey,
      Key: imageKey
    }).createReadStream();

    imageStream.on('error', err=>{
      if(err.code === 'NoSuchKey'){
        console.error(`${err.message}: ${imageKey}`);
      }else{
        console.error(err);
      }
    })

    if(req.query.width && !isNaN(+req.query.width)){
      transformer = sharp().resize(+req.query.width);

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

    imageStream.pipe(res);
    res.setHeader('Access-Control-Allow-Origin', '*');
  });

  app.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}`);
  });
}
