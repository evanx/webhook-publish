# webhook-publish

Simple webhook server for JSON HTTP POST requests, to be published via Redis pubsub.

It is intended for incoming updates from Telegram.org bots.

This enables your bot server to receive webhook updates via Redis pubsub as follows:
```javascript
    const client = redis.createClient(REDIS_URL);
    client.on('message', (channel, message) => {
       logger.debug({channel, message});
    });
    client.subscribe(`telebot:${WEBHOOK_SECRET}`);
```
where the configured `REDIS_URL` would be the remote Redis instance also connected to the live HTTPS server deployment of this microservice.

For example, it's deployed at least for my own purposes on `telebot.webserva.com.`

```shell
curl -s https://telebot.webserva.com/echo/testing | jq '.'
```
```json
{
  "url": "/echo/testing"
}
```

This is useful for development insomuch as you can use ssh port forwarding to the remote Redis instance, to effectively receive webhook notifications from live Telegram.org bots onto your development machine.
```shell
ssh telebot.webserva.com -L6333:127.0.0.1:6379
```
We can use `redis-cli` to subscribe too, for monitoring and debugging purposes.
```
redis-cli -p 6333 subscribe "telebot:${WEBHOOK_SECRET}"
```

For your bot `TOKEN` use `https://api.telegram.org/botTOKEN/setWebhook` with your HTTPS deployment URL. In my case, this is 
```
curl https://api.telegram.org/botTOKEN/setWebhook?url=https://telebot.webserva.com/webhook/SECRET
```

This service simplifies production for multiple Telegram bots, since each is "hooked up" via a Redis connection, i.e. requiring minimal configuration. The HTTPS server requires Certbot and Nginx, but is a single generic deployment, i.e. done once only and reused e.g. `telebot.webserva.com` in my personal case.

The path of URL would `/webhook/${WEBHOOK_SECRET}` where you might generate a random `WEBHOOK_SECRET` as follows.

```shell
dd if=/dev/random bs=32 count=1 2>/dev/null | sha1sum | cut -f1 -d' '
```

Alternatively see my http://github.com/evanx/secret-base56 
```
docker build -t secret-base56 https://github.com/evanx/secret-base56.git
docker run -e length=40 secret-base56
```

Your bot should then subscribe to the Redis channel `telebot:${WEBHOOK_SECRET}` in order to receive these updates via Telegram.org webhook.

Note that your bot would reply to chat commands directly using https://api.telegram.org/botTOKEN/sendMessage`

where the `TOKEN` for your bot is provided by @BotFather when you use the commands `/newbot` or `/token`

See more documentation on the related project https://github.com/evanx/webhook-push
