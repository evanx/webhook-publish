# webhook-publish

Simple webhook server, intended for incoming updates from Telegram, published via Redis.

For example, invoke `https://api.telegram.org/botTOKEN/setWebhook` with the URL for a deployment of this NodeJS webserver.

```
curl -s https://telebot.webserva.com/echo/testing | jq '.'
```
```
{
  "url": "/echo/testing"
}
```

The path of URL would `/webhook/SECRET` where you might generate a random `SECRET` as follows.

```
dd if=/dev/random bs=32 count=1 2>/dev/null | sha1sum | cut -f1 -d' '
```

Your bot should then subscribe to the Redis channel `telebot:SECRET` in order to receive these updates via Telegram.org webhook.

Note that your bot would reply to chat commands directly using https://api.telegram.org/botTOKEN/sendMessage`
