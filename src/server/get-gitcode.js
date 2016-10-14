const git = require('nodegit');
const co = require('co');
const path = require('path');

const fn = async (ctx, next) => {
  await new Promise((resolve, reject) => {
    co(function *(){
        let entryList = [];
        try {
            // const repoPath =-path.resolve('/home/peter/workspace/Panda');
            const repoPath = '/home/peter/workspace/Panda';
            const repo = yield git.Repository.open(repoPath);
            //const commit = yield repo.getMasterCommit();
            const commit = yield repo.getBranchCommit('develop');
            const tree = yield commit.getTree();
            const walker = tree.walk();
            console.log('commit ', commit.date())
            console.log('tree entryCount', tree.entryCount());

            walker.on('entry', (entry)=>{
                const path = entry.path();
                entryList.push(path);
            });

            walker.on('end', function(trees) {
                entryList.sort();
                ctx.body = entryList.join('\n\r');
                console.log('result ' + entryList.length)
                resolve();
            });

            walker.start();
        }
        catch (e){
            console.log(e);
            throw e;
        }
    });
  });
};

module.exports = fn;
