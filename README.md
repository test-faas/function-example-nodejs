# Tower function example — Node.js

A function that builds and serves as-is. Fork it and deploy it, or copy the two files into
your own repository.

## The contract

Tower builds this repository into an image and runs the command in your `package.json`
`start` script — here, `node index.js`. Whatever that starts must:

1. **Listen on the port in `process.env.PORT`.**
2. **Bind `0.0.0.0`, not `localhost`.**
3. **Keep running.**

That is the whole contract. There is no handler signature, and nothing to import from Tower.

### About the port

You choose the port — it is a setting on the function, `8080` by default. Tower puts whatever
you chose into `PORT`, so your code should read `process.env.PORT` rather than hardcode a
number. Then the two can never disagree, and changing the port later is a configuration change
with no code change.

The port is internal. Your function's public URL does not contain it, and does not change when
you change it — callers always use `https://<your-function>/`.

## The two ways to build successfully and still not serve

Both produce a **green build** — the image is created, nothing errors — and then fail at
startup. That is what makes them worth naming.

**A handler that returns.** The natural first attempt on a product called "Functions":

```js
// WRONG: builds fine, never serves.
exports.handler = async () => ({ statusCode: 200, body: 'hello' });
```

Nothing is listening, so the process finishes and exits 0. Tower will tell you the function
exited by itself and that nothing crashed — and your logs will look completely normal, because
your code ran exactly as written.

**Binding localhost.**

```js
// WRONG: starts, then never accepts a request.
server.listen(port, '127.0.0.1');
```

A server on `localhost` is only reachable from inside its own instance.

## Deploying it

1. Fork this repository. Tower builds from a repository your organization has connected.
2. Create a function with `deploymentMode: "source"`, `runtime: "nodejs22"`, and this
   repository as the source. Leave the source path empty — the code is at the repository root.
3. Release the build. Tower does not release a build automatically unless you turn on
   release-on-push.

Then:

```
curl https://<your-function-url>/          # {"message":"Hello from Tower.", ...}
curl https://<your-function-url>/healthz   # ok
```

## What is deliberately not here

- **No dependencies.** `node:http` is enough. Nothing to install means the build cannot break
  because of a transitive update, which matters for a reference you are trusting.
- **No framework.** Express, Fastify and the rest work the same way: the contract is about
  listening on `$PORT` and staying up, not about what you listen with. This example stays
  small so the contract is the only thing in it.
- **No `.github/workflows`.** Enabling auto-deploy in Tower opens a pull request that adds one.
  A workflow committed here would collide with it.
