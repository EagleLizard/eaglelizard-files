"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = void 0;
const image_transform_ctrl_1 = require("./controllers/image-transform/image-transform-ctrl");
const image_transform_v2_ctrl_1 = require("./controllers/image-transform-v2/image-transform-v2-ctrl");
function registerRoutes(app) {
    app.get('/image/:folder/:image?', image_transform_ctrl_1.imageTransformCtrl);
    app.get('/v2/image/:folder/:image?', image_transform_v2_ctrl_1.imageTransformV2Ctrl);
    return app;
}
exports.registerRoutes = registerRoutes;
//# sourceMappingURL=routes.js.map