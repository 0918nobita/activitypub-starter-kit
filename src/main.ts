import fastify from 'fastify';
import { pipe } from 'fp-ts/lib/function.js';

import * as endpoint from './endpoint/index.js';

const server = pipe(
    fastify({ logger: true }),
    endpoint.actorInbox,
    endpoint.actorOutbox,
    endpoint.hostMeta,
    endpoint.nodeInfo,
    endpoint.webFinger
);

void server.listen({ port: 3000 });
