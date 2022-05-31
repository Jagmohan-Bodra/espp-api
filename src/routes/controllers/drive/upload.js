import { notFound, successResponse } from '~/routes/utils/response';

export default ({ uploader, config, models, uploadJwt }, validator) => [
  validator,
  async (req, res) => {
    const { tokenInfo } = req.context;
    const multer = uploader.getMulter();

    await multer(req, res, async function (error) {
      if (error) {
        return notFound(res, error);
      }

      const result = await Promise.all(
        (req.files || []).map(async (file) => {
          const fileToken = uploadJwt.sign({ filePath: file.objectName });
          const path = `/v1/drive/${fileToken}`;
          const fullPath = `${config.BASE_URL}${path}`;

          // save model
          const param = {
            link: fullPath,
            updatedBy: tokenInfo.id,
          };
          await models.Image(param).save();

          return {
            fileName: fileToken,
            filePath: fullPath,
            fileOriginPath: path,
          };
        }),
      );

      return successResponse(res, result);
    });
  },
];
