type RepoInfo = { host: string, repo: string, owner: string }

export default class URLService {
    static getRepoInfoFromPathName(pathname: string): RepoInfo {
        try {
            const [host, owner, repo] = pathname.replace(/^\//i, "").split(/\//)
            return { host, owner, repo }
        }
        catch (e) {
            console.error('[URLService.getRepoInfo] failed to parse ', pathname)
        }
        return null
    }

    static getRepoInfo(url: string): RepoInfo {
        const link = document.createElement("a");
        link.href = url;
        const host = link.host;
        try {
            const [owner, repo] = link.pathname.replace(/^\//i, "").split(/\//)
            return { host, owner, repo }
        }
        catch (e) {
            console.error('[URLService.getRepoInfo] failed to parse ', url)
        }
        return null
    }
}