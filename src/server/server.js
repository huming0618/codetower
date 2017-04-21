// require("babel-core/register")({
//      presets: ['es2015-node5', 'stage-3']
// });

const koa = require('koa');
const convert = require('koa-convert');
const cors = require('koa-cors');

const serve = require('koa-static-server');

const addAPIRoutes = require('./API');

const app = new koa();

// app.use(convert(router.routes()));
app.use(cors())
    .use(convert(serve({"rootDir":"public", "index": "index.html"})));
addAPIRoutes(app);


// app.use(async (ctx, next) => {
//   await new Promise((resolve, reject) => {
//     setTimeout(() => {
//       ctx.body = 'Hello asynchronous world!';
//       resolve();
//     }, 100);
//   });
// });



app.listen(3000);
