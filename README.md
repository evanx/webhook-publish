# webhook-publish

Simple webhook server for JSON HTTP POST requests, to be published via Redis pubsub.

It is intended for incoming updates from Telegram.org bots.

This enables your bot server to receive webhook updates via Redis pubsub as follows:
```javascript
    const client = redis.createClient(config.redisURL);
    client.on('message', (channel, message) => {
       logger.debug({channel, message});
    });
    client.subscribe('telebot:' + config.webhookSecret);
```
where the configured `redisURL` might be a generic remote "Telebot" server using this microservice.

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
ssh telebot.webserva.com -L6777:127.0.0.1:6379
```
We can use `redis-cli` to subscribe too, for monitoring and debugging purposes.
```
redis-cli -p 6777 subscribe telebot:$secret
```

For your own Telebot deployment, invoke `https://api.telegram.org/botTOKEN/setWebhook` with your deployment URL.

The path of URL would `/webhook/SECRET` where you might generate a random `SECRET` as follows.

```shell
dd if=/dev/random bs=32 count=1 2>/dev/null | sha1sum | cut -f1 -d' '
```

Your bot should then subscribe to the Redis channel `telebot:SECRET` in order to receive these updates via Telegram.org webhook.

Note that your bot would reply to chat commands directly using https://api.telegram.org/botTOKEN/sendMessage`

where the `TOKEN` for your bot is provided by @BotFather when you use the commands `/newbot` or `/token`
