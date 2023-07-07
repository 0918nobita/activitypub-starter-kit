import type { FastifyInstance } from 'fastify';
import * as E from 'fp-ts/lib/Either.js';
import * as t from 'io-ts';

import { ACCOUNT, ACTOR, HOSTNAME } from '../fastify-env.js';

const WebFingerQuery = t.type({
    resource: t.string,
});

export const withWebFingerEndpoint = (
    server: FastifyInstance
): FastifyInstance => {
    // 「このユーザーネームのユーザは居る？」という質問に対して返答する役割をもつエンドポイント
    server.get('/.well-known/webfinger', async (request, reply) => {
        const decodeResult = WebFingerQuery.decode(request.query);

        if (E.isLeft(decodeResult)) {
            request.server.log.error(decodeResult.left);
            void reply
                .status(400)
                .send('The `resource` query parameter required, but not found');
            return;
        }

        const { resource } = decodeResult.right;

        if (resource !== `acct:${ACCOUNT}@${HOSTNAME}`) {
            void reply.status(404).send('Account not found');
            return;
        }

        await reply
            // JRD (JSON Resource Descriptor)
            .type('application/jrd+json')
            .status(200)
            .send({
                subject: `acct:${ACCOUNT}@${HOSTNAME}`,
                links: [
                    {
                        rel: 'self',
                        type: 'application/activity+json',
                        href: ACTOR,
                    },
                ],
            });
    });

    return server;
};
