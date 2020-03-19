import git from 'isomorphic-git'
import LightningFS from '@isomorphic-git/lightning-fs';

const http = require('isomorphic-git/http/web')

const fs = new LightningFS('fs')
const pfs = fs.promises
console.log(git, http)


const dir = '/test-clone'
git.clone({
    fs,
    http,
    dir,
    url: 'https://github.com/isomorphic-git/lightning-fs',
    corsProxy: 'https://cors.isomorphic-git.org'
}).then(async x => {
    const result = await pfs.readdir(dir);
    result.forEach(async x => {
        const stat = await pfs.stat(dir + '/' + x)
        console.log(x, stat)
    })
    const content = await pfs.readFile(dir + '/' + 'README.md', {
        encoding: 'utf8'
    })
    console.log('result', result)
    //console.log('result', content)
})