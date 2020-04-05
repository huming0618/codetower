import { Observable } from 'rxjs';

const axios = require('axios')
const git = require('isomorphic-git')
const http = require('isomorphic-git/http/web')
const LightningFS = require('@isomorphic-git/lightning-fs')

const fs = new LightningFS('fs')
const pfs = fs.promises

type FileItem = {
    name: string,
    path: string,
    content: () => Promise<string>,
    dir: string
}

const sortEntry = (a: string, b: string) => {
    return a[0].toLowerCase() > b[0].toLowerCase() ? 1 : -1
}

const auth = {
    username: 'huqiming',
    password: '8a795508ef9a8b190db4314d8e3a4bd821dd8f95'
}

type NodeEntry = {
    path: string,
    mode: string,
    type: "blob" | "tree",
    sha: string,
    size?: number,
    url: string
}

export default class GitService {
    baseURL: string
    commits: any
    constructor(baseURL: string) {
        this.baseURL = baseURL
    }

    static joinPath(...items: Array<string>) {
        return items.join('/')
    }

    async init(): Promise<any> {
        let resp = await axios.get('https://oss.navercorp.com/api/v3/repos/GWorks-Service/webtalk/commits', { auth })
        this.commits = resp.data
        return this
    }



    //https://blog.csdn.net/weixin_44704691/article/details/102639587

    async getFileList() {
        const commits = this.commits
        const resp = await axios.get(`https://oss.navercorp.com/api/v3/repos/GWorks-Service/webtalk/git/trees/${commits[0].sha}`, { auth })
        const tree = resp.data.tree
        console.log('tree', tree)
        const result = {
            name: "",
            items: tree.map((x: any) => { return { name: x.path, type: x.type } }).sort((a: any, b: any) => a.type > b.type)
        }
        // console.log('result', result)

        const srcItem = tree.filter((x: any) => x.path == 'src')[0]
        const resp1 = await axios.get(srcItem.url, { auth })
        const tree1 = resp1.data.tree
        console.log('result.srcItem', tree1)
        return result
    }

}