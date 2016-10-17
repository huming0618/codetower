const API = "/code";

const prefix = {'prefix': API};
const router = require('koa-router')(prefix);
//const router = new Router(prefix);

const repoList = {
    "workseditor": "/home/peter/workspace/Panda"
}
    
// /code - list all registered repostiory
router.get('/', async (ctx) => {
  ctx.body = await {'repo': Object.keys(repoList).sort() };
});

router.get('/:repo', async (ctx) => {
  const name = ctx.params.repo;
  
  //ctx.body = await City.find()
});


// //get the list of the files in repo
// router.get('/:repo', async (ctx) => {
//   const name = ctx.params.repo;
//   //ctx.body = await City.find()
// });

// //get the source-code for the file
// router.get('/:repo/:file', async (ctx) => {
//   const repo = ctx.params.repo;
//   const file = ctx.params.file;
//   //ctx.body = await City.find()
// });

module.exports = router;
