const assert = require('assert');
const fetch = require('node-fetch');
const lodash = require('lodash');
const Promise = require('bluebird');

const Koa = require('koa');
const KoaRouter = require('koa-router');
const bodyParser = require('koa-bodyparser');
const app = new Koa();
const api = KoaRouter();
const state = {};

const redis = require('redis');
const client = Promise.promisifyAll(redis.createClient());

const config = require(process.env.configFile || '../config/' + process.env.NODE_ENV);

const logger = require('winston');
logger.level = config.loggerLevel || 'info';

async function multiExecAsync(client, multiFunction) {
   const multi = client.multi();
   multiFunction(multi);
   return Promise.promisify(multi.exec).call(multi);
}

async function start() {
    api.get('/echo/*', async ctx => {
        ctx.body = JSON.stringify({url: ctx.request.url});
    });
    api.post('/webhook/*', async ctx => {
        multiExecAsync(client, multi => {
            multi.publish([config.redisName, ctx.params[0]].join(':'), JSON.stringify(ctx.request.body));
        });
    });
    app.use(bodyParser());
    app.use(api.routes());
    app.use(async ctx => {
       ctx.statusCode = 404;
    });
    state.server = app.listen(config.port);
}

start().catch(err => {
    logger.error(err);
});