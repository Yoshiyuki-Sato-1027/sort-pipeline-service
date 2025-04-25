"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
async function default_1(fastify) {
    /*
     * GET /brand/{$brandId}/stitch-file
     */
    fastify.get('/', {
        preHandler: () => { },
        schema: { get: {} }
    }, async (request, reply) => {
        return pipe(start(extractParamsForStitchFile(request)), bypass(matchBrandIdTokenAndParams), bypass(getRequester), bypass(checkRequester), bypass(getStitchFile), bypass(sendResponse));
    });
}
//# sourceMappingURL=_handlers.js.map