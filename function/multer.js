const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { v1 } = require("uuid");
require('dotenv').config();

const s3 = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.ACCESSKEY,
    secretAccessKey: process.env.SECRETKEY,
  },
});

const getFileKeyFromURL = (url) => {
  const regex = /\/([^\/?#]+)$/i;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const multerimg ={ 
  upload : multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.BUCKET,
      key: (req, file, cb) => {
        cb(null, v1()); // 업로드 시 파일명 변경
      },
    }),
  }),

  deleted : (url) => {
    try {
      const key = getFileKeyFromURL(url);
      if (!key) throw new Error('Invalid URL');
  
      const command = new DeleteObjectCommand({
        Bucket: process.env.BUCKET,
        Key: key,
      });
  
      const result = s3.send(command);
      return result; // 필요에 따라 결과 반환
    } catch (error) {
      throw error;
    }
  }
}

module.exports = multerimg;