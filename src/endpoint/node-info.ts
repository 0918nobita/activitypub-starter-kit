import type { FastifyInstance } from 'fastify';

import { HOSTNAME } from '../fastify-env.js';

export const withNodeInfoEndpoints = (
    server: FastifyInstance
): FastifyInstance => {
    // nodeinfo に対応していることを表明するためのエンドポイント
    server.get('/.well-known/nodeinfo', () => ({
        links: [
            {
                rel: 'https://nodeinfo.diaspora.software/ns/schema/2.1',
                href: `https://${HOSTNAME}/nodeinfo/2.1`,
            },
        ],
    }));

    // activitypub プロトコルに対応していることを表明する
    server.get('/nodeinfo/2.1', () => ({
        openRegistrations: false,
        protocols: ['activitypub'],
        software: {
            name: 'kodai-activitypub-server',
            version: '0.1.0',
        },
        usage: {
            users: {
                total: 1,
            },
        },
        services: {
            inbound: [],
            outbound: [],
        },
        metadata: {},
        version: '2.1',
    }));

    return server;
};
