"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageTransformV2Ctrl = void 0;
const image_transform_service_1 = require("../../services/image-transform/image-transform-service");
function imageTransformV2Ctrl(req, res) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        let imageKey, folderKey, widthParam, width;
        if (req.params.image) {
            imageKey = req.params.image;
            folderKey = `/${req.params.folder}`;
        }
        else {
            imageKey = req.params.folder;
            folderKey = '';
        }
        widthParam = (_b = (_a = req.query) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : undefined;
        if (((typeof widthParam) === 'string') && !isNaN(+widthParam)) {
            width = +widthParam;
        }
        const { imageStream, contentType } = yield image_transform_service_1.ImageTransformService.getImageStream(imageKey, folderKey, width);
        res.setHeader('content-type', contentType);
        res.setHeader('Access-Control-Allow-Origin', '*');
        imageStream.pipe(res);
    });
}
exports.imageTransformV2Ctrl = imageTransformV2Ctrl;
//# sourceMappingURL=image-transform-v2-ctrl.js.map