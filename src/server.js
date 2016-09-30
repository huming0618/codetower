const koa = require('koa');

const app = koa();

app.use(function *(){
  this.body = "hello";
});

app.listen(3000);
