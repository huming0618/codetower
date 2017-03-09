const walk = require('walk');
const options = {
    'followLinks': false,
    'filters': ['node_modules','.git']
}

const getTree = function(path){
    let pointer = {};

    return new Promise((resolve,reject)=>{
        const walker = walk.walk(path, options);

        walker.on("names", (root, names)=>{

        });

        walker.on("file", (root, state, next)=>{
            let name = state.name;

            let item = {'type':'file', 'name': name, 'root': root};
            //console.log('file state', pointer[root]);
            if (!pointer[root]){
                pointer[root] = {
                    'type': 'dir',
                    'name': root,
                    'items': []
                }
            }
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
            let name = state.name;
            let item = {'type':'dir', 'name': name, 'items':[]};
            pointer[root].items.push(pointer[name]=item);

            next();
        });

        walker.on('end', ()=>{
            resolve(pointer);
        });
    });
}

module.exports = getTree;