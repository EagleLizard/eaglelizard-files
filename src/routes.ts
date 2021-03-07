
import { Express } from 'express';

import { imageTransformCtrl } from './controllers/image-transform/image-transform-ctrl';
import { imageTransformV2Ctrl } from './controllers/image-transform-v2/image-transform-v2-ctrl';

export function registerRoutes(app: Express): Express {

  app.get('/image/:folder/:image?', imageTransformCtrl);
  app.get('/v2/image/:folder/:image?', imageTransformV2Ctrl);

  return app;
}
