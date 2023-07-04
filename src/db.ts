import crypto from 'node:crypto';
import { readFileSync } from 'node:fs';

import Database from 'better-sqlite3';

import { DATABASE_PATH, SCHEMA_PATH } from './env.js';

const db = new Database(DATABASE_PATH);

const migration = readFileSync(SCHEMA_PATH);
db.exec(migration.toString());

interface Post {
    id: string;
    contents: Record<string, unknown>;
    createdAt: Date;
}

export function createPost(object: object): Post {
    const id = crypto.randomUUID();

    const result = db
        .prepare('INSERT INTO posts (id, contents) VALUES (?, ?) RETURNING *')
        .get(id, JSON.stringify(object)) as {
        id: string;
        contents: string;
        created_at: string;
    };

    return {
        id: result.id,
        contents: JSON.parse(result.contents) as Record<string, unknown>,
        createdAt: new Date(result.created_at),
    };
}

export function listPosts(): Post[] {
    const results = db.prepare('SELECT * FROM posts').all() as Array<{
        id: string;
        contents: string;
        created_at: string;
    }>;

    return results.map((result) => ({
        id: result.id,
        contents: JSON.parse(result.contents) as Record<string, unknown>,
        createdAt: new Date(result.created_at),
    }));
}

export function findPost(id: string): Post | undefined {
    const result = db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as
        | { id: string; contents: string; created_at: string }
        | undefined;

    if (!result) return;

    return {
        id: result.id,
        contents: JSON.parse(result.contents) as Record<string, unknown>,
        createdAt: new Date(result.created_at),
    };
}

interface Follower {
    id: string;
    actor: string;
    uri: string;
    createdAt: Date;
}

export function createFollower(input: { actor: string; uri: string }) {
    db.prepare(
        'INSERT INTO followers (id, actor, uri) VALUES (?, ?, ?) ON CONFLICT DO UPDATE SET uri = excluded.uri'
    ).run(crypto.randomUUID(), input.actor, input.uri);
}

export function listFollowers(): Follower[] {
    const results = db.prepare('SELECT * FROM followers').all() as Array<{
        id: string;
        actor: string;
        uri: string;
        created_at: string;
    }>;

    return results.map((result) => ({
        id: result.id,
        actor: result.actor,
        uri: result.uri,
        createdAt: new Date(result.created_at),
    }));
}

export function deleteFollower(input: { actor: string; uri: string }) {
    db.prepare('DELETE FROM followers WHERE actor = ? AND uri = ?')
        .bind(input.actor, input.uri)
        .run();
}

interface Following {
    id: string;
    actor: string;
    uri: string;
    confirmed: boolean;
    createdAt: Date;
}

export function createFollowing(input: { actor: string; uri: string }) {
    db.prepare(
        'INSERT INTO following (id, actor, uri) VALUES (?, ?, ?) ON CONFLICT DO UPDATE SET uri = excluded.uri'
    ).run(crypto.randomUUID(), input.actor, input.uri);
}

export function listFollowing(): Following[] {
    const results = db.prepare('SELECT * FROM following').all() as Array<{
        id: string;
        actor: string;
        uri: string;
        confirmed: string;
        created_at: string;
    }>;

    return results.map((result) => ({
        id: result.id,
        actor: result.actor,
        uri: result.uri,
        confirmed: Boolean(result.confirmed),
        createdAt: new Date(result.created_at),
    }));
}

export function getFollowing(actor: string): Following | undefined {
    const result = db
        .prepare('SELECT * FROM following WHERE actor = ?')
        .get(actor) as
        | {
              id: string;
              actor: string;
              uri: string;
              confirmed: string;
              created_at: string;
          }
        | undefined;

    if (!result) return;

    return {
        id: result.id,
        actor: result.actor,
        uri: result.uri,
        confirmed: Boolean(result.confirmed),
        createdAt: new Date(result.created_at),
    };
}

export function updateFollowing(input: {
    actor: string;
    uri: string;
    confirmed: boolean;
}) {
    db.prepare(
        'UPDATE following SET confirmed = ? WHERE actor = ? AND uri = ?'
    ).run(Number(input.confirmed), input.actor, input.uri);
}

export function deleteFollowing(input: { actor: string; uri: string }) {
    db.prepare('DELETE FROM following WHERE actor = ? AND uri = ?')
        .bind(input.actor, input.uri)
        .run();
}
