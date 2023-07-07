import crypto from 'node:crypto';

import { RequestHandler, Router } from 'express';
import { Infer } from 'superstruct';

import {
    createFollower,
    deleteFollower,
    findPost,
    listFollowers,
    listFollowing,
    listPosts,
    updateFollowing,
} from './db.js';
import { ACCOUNT, ACTOR, HOSTNAME, PUBLIC_KEY } from './express-env.js';
import { send, verify } from './request.js';
import { Activity } from './types.js';

export const activitypub = Router();

activitypub.get('/:actor/outbox', (req, res) => {
    if (req.params.actor !== ACCOUNT) return res.sendStatus(404);

    const posts = listPosts().filter(
        (post) => 'type' in post.contents && post.contents.type === 'Create'
    );

    return res.contentType('application/activity+json').json({
        '@context': 'https://www.w3.org/ns/activitystreams',
        id: `${ACTOR}/outbox`,
        type: 'OrderedCollection',
        totalItems: posts.length,
        orderedItems: posts.map((post) => ({
            ...post.contents,
            id: `${ACTOR}/posts/${post.id}`,
            actor: ACTOR,
            published: post.createdAt.toISOString(),
            to: ['https://www.w3.org/ns/activitystreams#Public'],
            cc: [],
        })),
    });
});

activitypub.post('/:actor/inbox', (async (req, res) => {
    if (req.params.actor !== ACCOUNT) return res.sendStatus(404);

    /** If the request successfully verifies against the public key, `from` is the actor who sent it. */
    let from = '';
    try {
        // verify the signed HTTP request
        from = await verify(req);
    } catch (err) {
        console.error(err);
        return res.sendStatus(401);
    }

    const body = JSON.parse(req.body as string) as Infer<typeof Activity>;

    // ensure that the verified actor matches the actor in the request body
    if (from !== body.actor) return res.sendStatus(401);

    switch (body.type) {
        case 'Follow': {
            await send(ACTOR, body.actor, {
                '@context': 'https://www.w3.org/ns/activitystreams',
                id: `https://${HOSTNAME}/${crypto.randomUUID()}`,
                type: 'Accept',
                actor: ACTOR,
                object: body,
            });

            createFollower({ actor: body.actor, uri: body.id });
            break;
        }

        case 'Undo': {
            if (body.object.type === 'Follow') {
                deleteFollower({ actor: body.actor, uri: body.object.id });
            }

            break;
        }

        case 'Accept': {
            if (body.object.type === 'Follow') {
                updateFollowing({
                    actor: body.actor,
                    uri: body.object.id,
                    confirmed: true,
                });
            }

            break;
        }
    }

    return res.sendStatus(204);
}) as RequestHandler);

activitypub.get('/:actor/followers', (req, res) => {
    if (req.params.actor !== ACCOUNT) return res.sendStatus(404);
    const page = req.query.page;

    const followers = listFollowers();

    res.contentType('application/activity+json');

    if (!page) {
        return res.json({
            '@context': 'https://www.w3.org/ns/activitystreams',
            id: `${ACTOR}/followers`,
            type: 'OrderedCollection',
            totalItems: followers.length,
            first: `${ACTOR}/followers?page=1`,
        });
    }

    return res.json({
        '@context': 'https://www.w3.org/ns/activitystreams',
        id: `${ACTOR}/followers?page=${page as string}`,
        type: 'OrderedCollectionPage',
        partOf: `${ACTOR}/followers`,
        totalItems: followers.length,
        orderedItems: followers.map((follower) => follower.actor),
    });
});

activitypub.get('/:actor/following', (req, res) => {
    if (req.params.actor !== ACCOUNT) return res.sendStatus(404);
    const page = req.query.page;

    const following = listFollowing();

    res.contentType('application/activity+json');

    if (!page) {
        return res.json({
            '@context': 'https://www.w3.org/ns/activitystreams',
            id: `${ACTOR}/following`,
            type: 'OrderedCollection',
            totalItems: following.length,
            first: `${ACTOR}/following?page=1`,
        });
    }

    return res.json({
        '@context': 'https://www.w3.org/ns/activitystreams',
        id: `${ACTOR}/following?page=${page as string}`,
        type: 'OrderedCollectionPage',
        partOf: `${ACTOR}/following`,
        totalItems: following.length,
        orderedItems: following.map((follow) => follow.actor),
    });
});

activitypub.get('/:actor', (req, res) => {
    if (req.params.actor !== ACCOUNT) return res.sendStatus(404);

    return res.contentType('application/activity+json').json({
        '@context': [
            'https://www.w3.org/ns/activitystreams',
            'https://w3id.org/security/v1',
        ],
        id: ACTOR,
        type: 'Person',
        preferredUsername: ACCOUNT,
        inbox: `${ACTOR}/inbox`,
        outbox: `${ACTOR}/outbox`,
        followers: `${ACTOR}/followers`,
        following: `${ACTOR}/following`,
        publicKey: {
            id: `${ACTOR}#main-key`,
            owner: ACTOR,
            publicKeyPem: PUBLIC_KEY,
        },
    });
});

activitypub.get('/:actor/posts/:id', (req, res) => {
    if (req.params.actor !== ACCOUNT) return res.sendStatus(404);

    const post = findPost(req.params.id);
    if (!post) return res.sendStatus(404);

    return res.contentType('application/activity+json').json({
        ...post,
        id: `${ACTOR}/posts/${req.params.id}`,
    });
});
