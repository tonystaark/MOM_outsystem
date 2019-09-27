const Koa = require('koa');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const config = require('./config/index')
const app = new Koa();
const router = require ('./routes/applications')
app.use(logger());
app.use(bodyParser())
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err.message;
    ctx.app.emit('error', err, ctx);
  }
});
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(config.port, () => {
  console.log(`Server running on port: ${config.port}`)
})

module.exports = app