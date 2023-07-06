# 用語集

## Actor

ユーザのようなもので、JSON-LD に基づいた一般公開されるドキュメント。

## WebFinger

「このユーザーネームのユーザは居る？」という質問に対して返答するエンドポイント。

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
