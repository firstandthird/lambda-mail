const AWS = require('aws-sdk');
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

class S3 {
  constructor(bucket, region) {
    this.bucket = bucket;
    AWS.config.region = region;
  }

  listObjects(prefix, done) {
    s3.listObjects({
      Bucket: this.bucket,
      Prefix: prefix
    }, done);
  }

  getObject(key, done) {
    s3.getObject({
      Bucket: this.bucket,
      Key: key
    }, done);
  }

  loadTextObject(key, done) {
    this.getObject(key, (err, data) => {
      if (err) {
        return done(err);
      }
      done(null, data.Body.toString());
    });
  }
}

module.exports = S3;

