import { param } from 'express-validator';
import { notFound } from '~/routes/utils/response';

export default ({ uploader, uploadJwt }, validator) => [
  [param('fileName').notEmpty()],
  validator,
  async (req, res) => {
    const { fileName } = req.params;
    const jwtObj = await uploadJwt.verify(fileName);
    if (jwtObj instanceof Error) {
      notFound(res, jwtObj);
    }

    return uploader
      .download(jwtObj.filePath)
      .then((stream) => {
        stream.pipe(res);
      })
      .catch((err) => notFound(res, err));
  },
];
