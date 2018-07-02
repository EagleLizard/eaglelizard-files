
const express = require('express');
const AWS = require('aws-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

main();

function main(){
  let s3;
  s3 = new AWS.S3({
    region: 'us-west-1',
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key,
  });
  app.get('/:image', (req, res)=>{
    let imageStream;
    imageStream = s3.getObject({
      Bucket: 'elasticbeanstalk-us-west-1-297608881144',
      Key: req.params.image
    }).createReadStream();

    imageStream.pipe(res);
  });

  app.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}`);
  });
}
