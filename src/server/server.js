const koa = require('koa');
const serve = require('koa-static-server')
const app = koa();

// app.use(function *(){
//   this.body = "hello";
// });

app.use(serve({"rootDir":"public", "index": "index.html"}));

app.listen(3000);
