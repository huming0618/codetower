const code = require('./code');
const convert = require('koa-convert');

const list = [code];

const fn = function (app) {
  //CQRS, refer to npm install koa-cors


  list.forEach((route) => {
    app.use(route.routes())
       .use(route.allowedMethods({ throw: true }))
  });
}

module.exports = fn;
