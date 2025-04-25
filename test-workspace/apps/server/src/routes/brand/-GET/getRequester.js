"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequester = void 0;
// サンプルのgetRequester関数
const getRequester = (data) => {
    // 実装
    return { ...data, requester: { id: '12345', name: 'テストユーザー' } };
};
exports.getRequester = getRequester;
//# sourceMappingURL=getRequester.js.map