# Tower function example — Node.js

A function that builds and serves as-is. Fork it and deploy it, or copy the two files into
your own repository.

## The contract

Tower builds this repository into an image and runs `npm start`. Whatever that starts must:

1. **Listen on the port in `process.env.PORT`.** Tower sets it; do not choose your own.
2. **Bind `0.0.0.0`, not `localhost`.** A server on `localhost` is unreachable from outside
   the instance — it starts cleanly and never passes a health check.
3. **Keep running.** The process must stay up to serve requests.

That is the whole contract. There is no handler signature, no framework, and nothing to
import from Tower.

## The two ways to build successfully and still not serve

Both of these produce a **green build** — the image is created, nothing errors — and then
fail at startup. That is what makes them worth naming.

**A handler that returns.** The natural first attempt on a product called "Functions":

```js
// WRONG: builds fine, never serves.
exports.handler = async () => ({ statusCode: 200, body: 'hello' });
```

Nothing is listening, so the process finishes and exits 0. Tower reports that the function
exited by itself and that nothing crashed — and your logs will look completely normal,
because your code ran exactly as written.

**Binding localhost.**

```js
// WRONG: starts, then fails its health check.
server.listen(port, '127.0.0.1');
```

## Deploying it

1. Fork this repository (Tower builds from a repository your organization has connected).
2. Create a function with `deploymentMode: "source"`, `runtime: "nodejs22"`, and this
   repository as the source.
3. Release the build. Tower does not release automatically unless you turn on
   release-on-push.

Then:

```
curl https://<your-function-url>/          # {"message":"Hello from Tower.", ...}
curl https://<your-function-url>/healthz   # ok
```

## What is deliberately not here

- **No dependencies.** `node:http` is enough. Nothing to install means the build cannot
  break because of a transitive update, which matters for a reference you are trusting.
- **No `.github/workflows`.** Enabling auto-deploy in Tower opens a pull request that adds
  one. A workflow committed here would collide with it.
- **No framework.** Express or Fastify work fine — the contract is the same. This example
  stays small so the contract is the only thing in it.
