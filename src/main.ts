import fastify from 'fastify';

const server = fastify({ logger: true });

server.get('/', async (_request, reply) => {
    void reply.type('application/json').code(200);
    return { hello: 'world' };
});

// server.get('/.well-known/webfinger', async (_request, reply) => {});

void server.listen({ port: 3000 });
