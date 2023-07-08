import { FastifyInstance } from 'fastify';

import { ACCOUNT, ACTOR } from '../fastify-env.js';

export const actorInbox = (server: FastifyInstance) => {
    server.get<{ Params: { actor: string } }>(
        '/actor/:actor/inbox',
        async (request, reply) => {
            if (request.params.actor !== ACCOUNT) {
                await reply.code(404).send('Account not found');
                return;
            }

            return {};
        }
    );

    return server;
};

export const actorOutbox = (server: FastifyInstance) => {
    server.get<{ Params: { actor: string } }>(
        '/actor/:actor/outbox',
        async (request, reply) => {
            if (request.params.actor !== ACCOUNT) {
                await reply.code(404).send('Account not found');
                return;
            }

            await reply.type('application/activity+json').send({
                '@context': 'https://www.w3.org/ns/activitystreams',
                id: `${ACTOR}/outbox`,
                type: 'OrderedCollection',
                totalItems: 1,
                orderedItems: [
                    {
                        id: `${ACTOR}/posts/5ff3d3d1-c320-48a3-881b-d4c2c96fdc6d`,
                        actor: ACTOR,
                        published: '2023-07-08T09:57:58.163Z',
                        to: ['https://www.w3.org/ns/activitystreams#Public'],
                        cc: [],
                    },
                ],
            });
        }
    );

    return server;
};
