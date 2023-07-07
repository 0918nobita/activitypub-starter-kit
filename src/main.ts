import fastify from 'fastify';
import { pipe } from 'fp-ts/lib/function.js';

import {
    withHostMetaEndpoint,
    withNodeInfoEndpoints,
    withWebFingerEndpoint,
} from './endpoint/index.js';

const server = pipe(
    fastify({ logger: true }),
    withHostMetaEndpoint,
    withNodeInfoEndpoints,
    withWebFingerEndpoint
);

void server.listen({ port: 3000 });
