const http = require('http');

const server = http.createServer((req, res) => {
    let loc = `https://${req.headers.host}${req.url}`;
    console.log(loc);
    res.writeHead(301,{Location: loc});
    res.end();
});

server.listen(80);
console.log(`http2https ==> 80:443`);