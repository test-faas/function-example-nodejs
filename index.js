// A Tower function is a SERVER, not a handler.
//
// Tower builds this repository into an image and runs the command in package.json's
// "start" script — here, `node index.js`. Two things must be true of whatever that
// starts, and both are easy to get wrong:
//
//   1. It listens on the port in process.env.PORT — the port configured on the function.
//   2. It keeps running. A module that exports a handler and returns builds perfectly
//      well and then never serves anything.
//
// The second is the common one. `exports.handler = ...` is the natural first attempt on
// a product called "Functions", and it produces a green build followed by a failure that
// says the program exited by itself.

const http = require('node:http');

// You choose the port on the function (8080 by default); Tower puts that value in PORT.
// Read it rather than hardcoding, so your code and your configuration cannot disagree —
// and so changing the port later needs no code change. The fallback is only for running
// this on your laptop.
const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  if (req.url === '/healthz') {
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end('ok\n');
    return;
  }

  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({
    message: 'Hello from Tower.',
    method: req.method,
    path: req.url,
  }) + '\n');
});

// 0.0.0.0, NOT localhost. A server bound to localhost is unreachable from outside the
// instance: it starts cleanly, logs nothing unusual, and never passes a health check.
// This is the other way to build successfully and still not serve.
server.listen(port, '0.0.0.0', () => {
  console.log(`listening on 0.0.0.0:${port}`);
});

// Shut down cleanly when Tower asks, so in-flight requests are not cut off.
process.on('SIGTERM', () => server.close(() => process.exit(0)));
