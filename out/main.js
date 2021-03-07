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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mem_logger_1 = __importDefault(require("./mem-logger"));
const routes_1 = require("./src/routes");
const image_transform_service_1 = require("./src/services/image-transform/image-transform-service");
const PORT = process.env.PORT || 8080;
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield main();
    }
    catch (e) {
        console.error(e);
    }
}))();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let app;
        let memLogger;
        memLogger = new mem_logger_1.default(image_transform_service_1.memCache);
        memLogger.run();
        app = express_1.default();
        app = routes_1.registerRoutes(app);
        app.listen(PORT, () => {
            console.log(`Listening on port ${PORT}`);
        });
    });
}
//# sourceMappingURL=main.js.map