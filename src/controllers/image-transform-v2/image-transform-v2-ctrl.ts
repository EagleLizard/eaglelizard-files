
import { Request, Response } from 'express';

import { ImageTransformService } from '../../services/image-transform/image-transform-service';

export async function imageTransformV2Ctrl(req: Request, res: Response) {
  let imageKey: string, folderKey: string, widthParam: string, width: number;
  if(req.params.image) {
    imageKey = req.params.image;
    folderKey = `/${req.params.folder}`;
  } else {
    imageKey = req.params.folder;
    folderKey = '';
  }
  widthParam = (req.query?.width as string) ?? undefined;

  if(((typeof widthParam) === 'string') && !isNaN(+widthParam)) {
    width = +widthParam;
  }

  const { imageStream, contentType } = await ImageTransformService.getImageStream(imageKey, folderKey, width);

  res.setHeader('content-type', contentType);
  res.setHeader('Access-Control-Allow-Origin', '*');
  imageStream.pipe(res);
  // s3Request.createReadStream().pipe(res);
}
