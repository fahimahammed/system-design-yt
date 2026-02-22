const http = require('http');

const maxRequests = 5;
const rateLimitWindow = 60 * 1000;
const ipRequests = {}; // {ip: [timestamp1, timestamp2, timestamp3, ......]}

const rateLimitMiddleware = (req, res) => {
    const ip = req.socket.remoteAddress;
    const currentTime = Date.now();

    // if ip is new, the initialize user req
    if (!ipRequests[ip]) {
        ipRequests[ip] = []
    }

    // get and remove older timestamp
    ipRequests[ip] = ipRequests[ip].filter(timestamp => {
        return currentTime - timestamp < rateLimitWindow
    });

    console.log("timestamps::: ", ipRequests[ip])

    if (ipRequests[ip].length >= maxRequests) {
        res.writeHead(429, { "Content-Type": "text/plain" });
        res.end("Too many requests. Please try again later.")
        return false;
    } else {
        ipRequests[ip].push(currentTime);
        return true;
    }

}

const server = http.createServer((req, res) => {
    if (!rateLimitMiddleware(req, res)) return;

    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Request Accepted!")
});

server.listen(3000, () => {
    console.log('📡 Server running at http://localhost:3000');
});