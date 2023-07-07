import { FastifyInstance } from 'fastify';

import { HOSTNAME } from '../fastify-env.js';

export const withHostMetaEndpoint = (
    server: FastifyInstance
): FastifyInstance => {
    server.get('/.well-known/host-meta', async (_requst, reply) => {
        await reply.type('application/xrd+xml').send(`<?xml version="1.0"?>
        <XRD xmlns="http://docs.oasis-open.org/ns/xri/xrd-1.0">
            <Link rel="lrdd" type="application/xrd+xml" template="https://${HOSTNAME}/.well-known/webfinger?resource={uri}" />
        </XRD>`);
    });
    return server;
};
