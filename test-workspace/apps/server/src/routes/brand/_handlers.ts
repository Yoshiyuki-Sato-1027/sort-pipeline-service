import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
  /*
   * GET /brand/{$brandId}/stitch-file
   */
  fastify.get(
    '/',
    {
      preHandler: () => {},
      schema: { get: {} }
    },
    async (request, reply) => {
      return pipe(
        start(extractParamsForStitchFile(request)),
        bypass(matchBrandIdTokenAndParams),
        bypass(getRequester),
        bypass(checkRequester),
        bypass(getStitchFile),
        bypass(sendResponse)
      );
    }
  );
}
