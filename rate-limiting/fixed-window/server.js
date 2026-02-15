const http = require('http');

const maxRequests = 5;
const rateLimitWindow = 60 * 1000;
const ipRequests = {};

const rateLimitMiddleware = (req, res) => {
    const ip = req.socket.remoteAddress;
    const currentTime = Date.now();

    // newUser?
    if (!ipRequests[ip]) {
        ipRequests[ip] = { count: 1, startTime: currentTime } // set
    }
    else {
        if (currentTime - ipRequests[ip].startTime < rateLimitWindow) {
            ipRequests[ip].count += 1;
        }
        else {
            equests[ip] = { count: 1, startTime: currentTime } // reset
        }
    }

    if (ipRequests[ip].count > maxRequests) {
        res.writeHead(429, { "Content-Type": "text/plain" });
        res.end("Too many requests. Please try again later.")
        return false;
    }
    else {
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