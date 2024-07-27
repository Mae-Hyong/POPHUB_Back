const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4 } = require("uuid");
require('dotenv').config();

const s3 = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.ACCESSKEY,
    secretAccessKey: process.env.SECRETKEY,
  },
});

// Multer와 multerS3 설정
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKET,
    key: function (req, file, cb) {
      cb(null, Date.now().toString()); // 업로드 시 파일명 변경
    },
  }),
});

module.exports = upload;