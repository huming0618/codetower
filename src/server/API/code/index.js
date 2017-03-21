const API = "/code";
const prefix = {'prefix': API};

const router = require('koa-router')(prefix);
const path = require('path');
const config = require(path.resolve(__dirname, '../../', 'config'));

const sourceTree = require('./source-tree.js');
//const router = new Router(prefix);

const repoList = config.repo;

// /code - list all registered repostiory
router.get('/', async (ctx) => {
  ctx.body = await {'repo': Object.keys(repoList).sort() };
});

router.get('/:repo', async (ctx) => {
  const name = ctx.params.repo;
  const path = repoList[name];

  ctx.body = await Promise.resolve(sourceTree(path));

});

module.exports = router;
