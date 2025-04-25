"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
// サンプルのsendResponse関数
const sendResponse = (data) => {
    // 実装
    return {
        statusCode: 200,
        body: {
            success: true,
            data: data.stitchFile
        }
    };
};
exports.sendResponse = sendResponse;
//# sourceMappingURL=sendResponse.js.map