import fastify from 'fastify';
import { pipe } from 'fp-ts/lib/function.js';

import * as endpoint from './endpoint/index.js';

const server = pipe(
    fastify({ logger: true }),
    endpoint.hostMeta,
    endpoint.nodeInfo,
    endpoint.webFinger,
    endpoint.actorInbox,
    endpoint.actorOutbox
);

void server.listen({ port: 3000 });
