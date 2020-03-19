

const git = require('isomorphic-git')
const http = require('isomorphic-git/http/web')
const LightningFS = require('@isomorphic-git/lightning-fs')

const fs = new LightningFS('fs')
const pfs = fs.promises

type FileItem = {
    name: string,
    path: string,
    content: () => Promise<string>
}

class GitService {
    dir: string = ''
    constructor(dirname: string) {
        this.dir = dirname
    }

    init() {
        return git.clone({
            fs,
            http,
            dir: this.dir,
            url: 'https://github.com/isomorphic-git/lightning-fs',
            corsProxy: 'https://cors.isomorphic-git.org'
        })
    }

    //https://blog.csdn.net/weixin_44704691/article/details/102639587
    async getFileList(): Promise<Array<any>> {
        const result: Array<any> = []
        const dir = this.dir
        const entryList = await pfs.readdir(dir);
        for (let entry in entryList) {
            const stat = await pfs.stat(dir + '/' + entry)
            console.log(x, stat)
        }
        entryList.forEach(async x => {
            const stat = await pfs.stat(dir + '/' + x)
            console.log(x, stat)
        })
        const content = await pfs.readFile(dir + '/' + 'README.md', {
            encoding: 'utf8'
        })
        console.log('result', result)

        return result
    }
}