
import express, { Express } from 'express';
import dotenv from 'dotenv';
dotenv.config();

import MemLogger from './mem-logger';
import { registerRoutes } from './src/routes';
import { memCache } from './src/services/image-transform/image-transform-service';

const PORT = process.env.PORT || 8080;

(async () => {
  try {
    await main();
  } catch(e) {
    console.error(e);
  }
})();

async function main() {
  let app: Express;
  let memLogger: MemLogger;

  memLogger = new MemLogger(memCache);
  memLogger.run();

  app = express();

  app = registerRoutes(app);

  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}
