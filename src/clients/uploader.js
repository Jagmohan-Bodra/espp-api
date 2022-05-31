import multer from 'multer';
import { makeUrlFriendly } from '~/routes/utils';

const Minio = require('minio');
const multerS3 = require('multer-minio-storage-engine');

export default (
  config,
  maxFiles = 1,
  bucketNameDefault = 'default',
  folderDefault = '',
) => {
  const minioClient = new Minio.Client(config);

  return {
    download: function (filePath, bucketName = bucketNameDefault) {
      return new Promise((resolve, reject) => {
        minioClient.getObject(
          bucketName,
          `${filePath}`,
          function (err, stream) {
            if (err) reject(err);

            resolve(stream);
          },
        );
      });
    },
    getMulter: function (
      bucketName = bucketNameDefault,
      folder = folderDefault,
    ) {
      return multer({
        storage: multerS3({
          minio: minioClient,
          bucketName,
          objectName: function (request, file, cb) {
            cb(
              null,
              `${folder}${makeUrlFriendly(
                `${Date.now()}_${file.originalname}`,
              )}`,
            );
          },
        }),
      }).array('files', maxFiles);
    },
  };
};
