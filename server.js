const http = require('http')
const url = require('url')
const axios = require('axios')

const server = http.createServer(async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    } else if (req.method === 'POST' && url.parse(req.url).pathname.match(/^\/accesstoken/i)) {

        const parsedURL = url.parse(req.url, true)

        const host = parsedURL.pathname.match(/^\/accesstoken\/(.*)/i)[1]
        const params = parsedURL.query
        console.log(host, params)
        const proxyUrl = `https://${host}/login/oauth/access_token?` +
            `client_id=${params.client_id}&` +
            `client_secret=${params.client_secret}&` +
            `code=${params.code}`
        console.log(proxyUrl)
        const tokenResponse = await axios.post(proxyUrl, null, {
            headers: {
                accept: 'application/json'
            }
        })

        console.log(tokenResponse.data)
        res.writeHead(200, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify(tokenResponse.data));
    }
})

server.listen(7000);