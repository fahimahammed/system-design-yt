const http = require('http');

const bucketCapacity = 10;
const refillRate = 1; // per sec
const ipBuckets = new Map(); // { ip1: {tokens: number, lastRefillTime: Timestamp }, ip2: {tokens: number, lastRefillTime: Timestamp }}

const rateLimitMiddleware = (req, res) => {
    const ip = req.socket.remoteAddress;
    const currentTime = Date.now();

    if (!ipBuckets.has(ip)) {
        ipBuckets.set(ip, { tokens: bucketCapacity, lastRefillTime: currentTime });
    }

    const bucket = ipBuckets.get(ip);
    const timePassed = (currentTime - bucket.lastRefillTime) / 1000;
    const newToken = timePassed * refillRate; // 60 * 1 = 60, 5 * 1 = 5, existingToken = 8

    bucket.tokens = Math.min(bucketCapacity, newToken + bucket.tokens)
    bucket.lastRefillTime = currentTime;

    if (bucket.tokens >= 1) {
        bucket.tokens--;
        ipBuckets.set(ip, bucket)

        return true;
    } else {
        res.writeHead(429, { "Content-Type": "text/plain" });
        res.end("Too many requests. Please try again later.")
        return false;
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