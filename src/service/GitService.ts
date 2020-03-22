import { Observable } from 'rxjs';

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

export default class GitService {
    dir: string = ''
    constructor(dirname: string) {
        this.dir = dirname
    }

    init(): Promise<any> {
        console.log('to init')
        return git.clone({
            fs,
            http,
            dir: this.dir,
            url: 'https://github.com/facebook/react',
            corsProxy: 'https://cors.isomorphic-git.org'
        })
    }

    static joinPath(...items: Array<string>) {
        return items.join('/')
    }

    //https://blog.csdn.net/weixin_44704691/article/details/102639587

    getFileList$(): Observable<FileItem> {
        const baseDir = this.dir

        console.log('getFileList$')


        return new Observable((observer: any) => {
            const read = (theDirPath: string) => {
                pfs.readdir(theDirPath).then((entryList: Array<string>) => {
                    entryList.sort(sortEntry).forEach(async (item: string) => {
                        const itemPath = GitService.joinPath(theDirPath, item)
                        const stat = await pfs.stat(itemPath)

                        if (stat.type == 'dir') {
                            // console.log('dir', stat, theDirPath, itemPath)
                            read(itemPath)
                        }
                        else {
                            // console.log('file', stat, itemPath)
                            observer.next({
                                dir: theDirPath,
                                name: item,
                                path: itemPath,
                                content: () => {
                                    return pfs.readFile(itemPath, {
                                        encoding: 'utf8'
                                    })
                                }
                            })
                        }
                    })
                })
            }

            read(baseDir)
        });
    }

    async getFileList(ignorePaths: Array<string> = []): Promise<Array<any>> {


        const result: Array<FileItem> = []
        const baseDir = this.dir
        const queue: Array<string> = []
        queue.push(baseDir)

        return new Promise(async (resolve) => {
            while (queue.length) {
                console.log('queue', queue)
                let dirPath = queue.shift()
                if (queue.length === 0) {
                    resolve(result)
                }
                const entryList = await pfs.readdir(dirPath);
                entryList.forEach(async (item: string) => {
                    const itemPath = GitService.joinPath(dirPath, item)
                    const stat = await pfs.stat(itemPath)

                    if (stat.type == 'dir') {
                        console.log('dir', stat, dirPath, itemPath)
                        queue.push(itemPath)
                    }
                    else {
                        console.log('file', stat, itemPath)
                        result.push({
                            dir: dirPath,
                            name: item,
                            path: itemPath,
                            content: () => {
                                return pfs.readFile(itemPath, {
                                    encoding: 'utf8'
                                })
                            }
                        })
                    }
                })
            }
        })
    }
}