const walk = require('walk');
const path = require('path');

const options = {
    'followLinks': false,
    'filters': ['node_modules','.git']
}

const getTree = function(sourcePath){
    const tree = {'type': 'dir', 'name': path.basename(sourcePath), 'items': [], 'root': null, path: sourcePath};
    let pointer = {};

    pointer[sourcePath] = tree;

    // const findPosition = (rootPath)=>{
    //     if (rootPath === sourcePath){
    //         return tree;
    //     }
    //     else {
            
    //     }
    // }

    return new Promise((resolve,reject)=>{
        const walker = walk.walk(sourcePath, options);

        walker.on("names", (root, names)=>{

        });

        walker.on("file", (root, state, next)=>{
            let name = state.name;
     
            let key = path.join(root.replace(sourcePath, ''), name);
            if (key.startsWith(path.sep)){
                key = key.slice(1);
            }
            let item = {'type':'file', 'name': name, 'root': root, 'path': key};
            //console.log('file state', pointer[root]);
            // if (!pointer[root]){
            //     pointer[root] = {
            //         'type': 'dir',
            //         'name': path.basename(root),
            //         'path': root, 
            //         'items': []
            //     }
            // }
            pointer[root].items.push(item);

            next();
        });

        walker.on("directory", (root, state, next)=>{
            // if (!pointer[root]){
            //     pointer[root] = {
            //         'type': 'dir',
            //         'name': path.basename(root),
            //         'path': root, 
            //         'items': []
            //     }
            // }
            let name = state.name;
            let key = path.join(root, name)
            let item = {'type':'dir', 'name': name, 'items':[], 'path': key};
            pointer[root].items.push(pointer[key] = item);
            next();
        });

        walker.on('end', ()=>{
            resolve(tree);
        });
    });
}

module.exports = getTree;