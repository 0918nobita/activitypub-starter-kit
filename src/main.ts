import fastify from 'fastify';
import * as E from 'fp-ts/lib/Either.js';
import * as t from 'io-ts';

const hostname = 'ap.kodai.vision';
const account = 'kodai';

const server = fastify({ logger: true });

server.get('/', async (_request, reply) => {
    void reply.type('application/json').code(200);
    return { hello: 'world' };
});

const WebFingerQuery = t.type({
    resource: t.string,
});

server.get('/.well-known/webfinger', (request, reply) => {
    const decodeResult = WebFingerQuery.decode(request.query);

    if (E.isLeft(decodeResult)) {
        server.log.error(decodeResult.left);
        void reply
            .status(400)
            .send('The `resource` query parameter required, but not found');
        return;
    }

    const { resource } = decodeResult.right;

    if (resource !== `acct:${account}@${hostname}`) {
        void reply.status(404).send('Account not found');
        return;
    }

    void reply
        // JRD (JSON Resource Descriptor)
        .type('application/jrd+json')
        .status(200)
        .send({
            subject: `acct:${account}@${hostname}`,
            links: [
                {
                    rel: 'self',
                    type: 'application/activity+json',
                    href: 'https://ap.kodai.vision/actor',
                },
            ],
        });
});

void server.listen({ port: 3000 });
