import { Observable } from 'rxjs';

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

import gql from 'graphql-tag';

const userFragment = gql`
  fragment User_user on User {
    firstName
    lastName
  }`

const query = gql`
  {
    user(id: 5) {
      ...User_user
    }
  }
  ${userFragment}
`

console.log('query', query, query.loc.source.body)
// console.log(query.definitions.bod)
// const git = require('isomorphic-git')
// const http = require('isomorphic-git/http/web')
// const LightningFS = require('@isomorphic-git/lightning-fs')

// const fs = new LightningFS('fs')
// const pfs = fs.promises

type FileItem = {
    name: string,
    path: string,
    content: () => Promise<string>,
    dir: string
}

const sortEntry = (a: string, b: string) => {
    return a[0].toLowerCase() > b[0].toLowerCase() ? 1 : -1
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
    host: string
    HTTPClient: any
    apiToken: string

    constructor(baseURL: string) {
        this.baseURL = baseURL
        this.host = this.baseURL.replace(/^https?:\/\//i, '')
        this.HTTPClient = axios.create({
            baseURL: baseURL,
            timeout: 10000
            // headers: { 'X-Custom-Header': 'foobar' }
        });
    }

    static async create(option: { baseURL: string, clientId: string, clientSecret: string, authCode: string }) {
        const instance = new GitService(option.baseURL)
        const { clientId, clientSecret, authCode } = option
        await instance.initAuth(clientId, clientSecret, authCode)
        return instance
    }

    async initAuth(clientId: string, clientSecret: string, code: string): Promise<GitService> {
        //https://github.com/login/oauth/access_token
        // const auth = {
        //     client_id: clientId,
        //     client_secret: clientSecret,
        //     code: code
        // }

        // const iframe = document.createElement('iframe')
        // iframe.name = 'temp_token'
        // document.body.appendChild(iframe)

        // const form = document.createElement('form')
        // document.body.appendChild(form)


        // form.enctype = 'text/plain'
        // form.method = 'POST'
        // form.target = 'temp_token'
        // form.action = `${ this.baseURL }/login/oauth / access_token ? ` +
        //     `client_id = ${ clientId }& ` +
        //     `client_secret = ${ clientSecret }& ` +
        //     `code = ${ code } ` +
        //     `& redirect_uri=http://localhost:8000`
        // form.submit()
        const option = { headers: { 'Accept': 'application/json' } }
        //`/r/${this.baseURL.replace(/^https?:\/\//i, '')}/login/oauth/access_token?
        const url = `http://localhost:7000/accesstoken/${this.host}?client_id=${clientId}&client_secret=${clientSecret}&code=${code}`
        let resp = await axios.post(url, null, option)
        if (resp.data) {
            this.apiToken = resp.data['access_token']
            console.log('apiToken', this.apiToken)
        }
        return this
    }

    async getBranchList(owner: string, repo: string) {
        const query = gql`{
                        repository(owner: "${owner}", name: "${repo}") {
                            refs(first: 100, refPrefix: "refs/heads/") {
                                nodes {
                                    name
                                    target {
                                        ... on Commit {
                                            oid
                                            committedDate
                                        }
                                    }
                                }
                            }
                        }
                    }`

        const resp = await axios.post('https://api.github.com/graphql',
            { query: query.loc.source.body },
            {
                headers: {
                    'Authorization': `bearer ${this.apiToken}`
                }
            }
        )
        return resp.data
    }

    async getCommitList(owner: string, repo: string, branch: string = 'master') {
        const query = gql`{
                            repository(name: "${repo}", owner: "${owner}") {
                                object(expression: "${branch}:") {
                                    ... on Tree {
                                        entries {
                                            name,
                                            type
                                
                                        }
                                    }
                                }
                            }
                        }`
        // const query = gql`{
        //                     repository(name: "${repo}", owner: "${owner}") {
        //                         ref(qualifiedName: "${branch}") {
        //                             target {
        //                                 ... on Commit {
        //                                     commitUrl
        //                                     id
        //                                     commitResourcePath
        //                                 }
        //                             }
        //                         }
        //                     }
        //                 }`

        const resp = await axios.post('https://api.github.com/graphql',
            { query: query.loc.source.body },
            {
                headers: {
                    'Authorization': `bearer ${this.apiToken}`
                }
            }
        )
        return resp.data
    }

    static joinPath(...items: Array<string>) {
        return items.join('/')
    }

    // async init(): Promise<any> {
    //     let resp = await axios.get('https://example.com/api/v3/repos/GWorks-Service/webtalk/commits', { auth })
    //     this.commits = resp.data
    //     return this
    // }



    // async getCommits() {
    //     const resp = await axios.get(`https://example.com/api/v3/repos/GWorks-Service/webtalk/git/trees/${commits[0].sha}`)
    // }

    //https://blog.csdn.net/weixin_44704691/article/details/102639587

    // async getFileList() {
    //     const commits = this.commits
    //     const resp = await axios.get(`https://example.com/api/v3/repos/GWorks-Service/webtalk/git/trees/${commits[0].sha}`, { auth })
    //     const tree = resp.data.tree
    //     console.log('tree', tree)
    //     const result = {
    //         name: "",
    //         items: tree.map((x: any) => { return { name: x.path, type: x.type } }).sort((a: any, b: any) => a.type > b.type)
    //     }
    //     // console.log('result', result)

    //     const srcItem = tree.filter((x: any) => x.path == 'src')[0]
    //     const resp1 = await axios.get(srcItem.url, { auth })
    //     const tree1 = resp1.data.tree
    //     console.log('result.srcItem', tree1)
    //     return result
    // }

}