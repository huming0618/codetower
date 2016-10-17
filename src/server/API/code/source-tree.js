const walk = require('walk');
const options = {
    'followLinks': false,
    'filters': ['node_modules','.git']
}

const getTree = function(path){
    let out = {};
    let pointer = {};
    let promise = new Promise();

    return new Promise((resolve,reject)=>{
        const walker = walk.walk(path, options);

        walker.on("names", (root, names)=>{

        });

        walker.on("file", (root, state, next)=>{
            let item = {'type':'file', 'name': state.name};
            pointer[root].items.push(item);
            next();
        });

        walker.on("directory", (root, state, next)=>{
            if (!pointer[root]){
                pointer[root] = {
                    'type': 'dir',
                    'name': root,
                    'items': []
                }
            }
            let item = {'type':'dir', 'name': state.name, 'items':[]};
            pointer[root].items.push(pointer[name] = item);
            next();
        });

        walker.on('end', ()=>{
            promise/resolve();
        });
    });
}

module.exports = getTree;