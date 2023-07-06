# ActivityPub サーバを自作する

## 起動方法

```bash
$ npm i
$ npm run build
# pino-pretty で fastify からのログを読みやすく整形する
$ npm run start | npx pino-pretty
```

## 用語集

### Actor

ユーザのようなもので、JSON-LD に基づいた一般公開されるドキュメント。

### WebFinger

ここでは「このユーザーネームのユーザは居る？」という質問に対して返答する役割をもつエンドポイントとなる。

エンドポイントの例: `/.well-known/webfinger?resource=acct:bob@my-example.com`

レスポンスの例:

```json
{
    "subject": "acct:alice@my-example.com",
    "links": [
        {
            "rel": "self",
            "type": "application/activity+json",
            "href": "https://my-example.com/actor"
        }
    ]
}
```
