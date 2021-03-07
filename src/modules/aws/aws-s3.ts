
import * as AWS from 'aws-sdk';

const DEFAULT_BUCKET = 'elasticbeanstalk-us-west-1-297608881144';

const s3 = new AWS.S3({
  region: 'us-west-1',
  accessKeyId: process.env.aws_access_key_id,
  secretAccessKey: process.env.aws_secret_access_key,
});

export class AwsS3 {

  static getObject(
    objectKey: string,
    folderKey: string,
    bucket: string = DEFAULT_BUCKET,
  ) {
    let s3Request: AWS.Request<AWS.S3.GetObjectOutput, AWS.AWSError>;
    console.log('Pulling from s3:');
    console.log(`${bucket + folderKey}/${objectKey}`);
    s3Request = s3.getObject({
      Bucket: bucket + folderKey,
      Key: objectKey
    });

    return s3Request;
  }
}
