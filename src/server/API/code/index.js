const API = "/code";
const prefix = {'prefix': API};

const path = require('path');
const fs = require('fs');

const router = require('koa-router')(prefix);

const config = require(path.resolve(__dirname, '../../', 'config.js'));

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

router.get('/:repo/*', async (ctx) => {
  const codeFile = ctx.params[0]; //relative path
  const repoPath = repoList[ctx.params.repo];
  const codeFilePath = path.join(repoPath, codeFile);

  ctx.body = fs.readFileSync(codeFilePath);
  ctx.set('Content-Type', 'text/plain');
});


module.exports = router;
