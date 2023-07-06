import fastify from 'fastify';
import * as E from 'fp-ts/lib/Either.js';
import { pipe } from 'fp-ts/lib/function.js';
import * as t from 'io-ts';

const server = fastify({ logger: true });

server.get('/', async (_request, reply) => {
    void reply.type('application/json').code(200);
    return { hello: 'world' };
});

const WebFingerQuery = t.type({
    resource: t.string,
});

server.get('/.well-known/webfinger', (request) => {
    return pipe(
        WebFingerQuery.decode(request.query),
        E.fold(
            () => 'Error occurred',
            ({ resource }) => `Successful! Specified resource is ${resource}`
        )
    );
});

void server.listen({ port: 3000 });
