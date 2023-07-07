import crypto from 'node:crypto';

import { RequestHandler, Router } from 'express';
import basicAuth from 'express-basic-auth';
import { is, omit, type } from 'superstruct';

import {
    createFollowing,
    createPost,
    deleteFollowing,
    getFollowing,
    listFollowers,
} from './db.js';
import {
    ACTOR,
    ADMIN_PASSWORD,
    ADMIN_USERNAME,
    HOSTNAME,
} from './express-env.js';
import { send } from './request.js';
import { ActivityPubObject } from './types.js';

export const admin = Router();

if (ADMIN_USERNAME && ADMIN_PASSWORD) {
    admin.use(basicAuth({ users: { [ADMIN_USERNAME]: ADMIN_PASSWORD } }));
}

admin.post('/create', (req, res) => {
    const create = type({ object: omit(ActivityPubObject, ['id']) });

    const body: unknown = JSON.parse(req.body as string);
    if (!is(body, create)) return res.sendStatus(400);

    const date = new Date();

    const object = createPost({
        attributedTo: ACTOR,
        published: date.toISOString(),
        to: ['https://www.w3.org/ns/activitystreams#Public'],
        cc: [`${ACTOR}/followers`],
        ...body.object,
    });

    const activity = createPost({
        '@context': 'https://www.w3.org/ns/activitystreams',
        type: 'Create',
        published: date.toISOString(),
        ACTOR,
        to: ['https://www.w3.org/ns/activitystreams#Public'],
        cc: [`${ACTOR}/followers`],
        ...body,
        object: { ...object.contents, id: `${ACTOR}/post/${object.id}` },
    });

    for (const follower of listFollowers()) {
        void send(ACTOR, follower.actor, {
            ...activity.contents,
            id: `${ACTOR}/post/${activity.id}`,
            cc: [follower.actor],
        });
    }

    return res.sendStatus(204);
});

admin.post('/follow/:actor', (async (req, res) => {
    const object = req.params.actor;
    const uri = `https://${HOSTNAME}/@${crypto.randomUUID()}`;
    await send(ACTOR, object, {
        '@context': 'https://www.w3.org/ns/activitystreams',
        id: uri,
        type: 'Follow',
        actor: ACTOR,
        object,
    });

    createFollowing({ actor: object, uri });
    res.sendStatus(204);
}) as RequestHandler);

admin.delete('/follow/:actor', (async (req, res) => {
    const object = req.params.actor;
    const following = getFollowing(object);
    if (!following) return res.sendStatus(204);

    await send(ACTOR, object, {
        '@context': 'https://www.w3.org/ns/activitystreams',
        id: following.uri + '/undo',
        type: 'Undo',
        actor: ACTOR,
        object: {
            id: following.uri,
            type: 'Follow',
            actor: ACTOR,
            object,
        },
    });

    deleteFollowing({ actor: object, uri: following.uri });

    return res.sendStatus(204);
}) as RequestHandler);
