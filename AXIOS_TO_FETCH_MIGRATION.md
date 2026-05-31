# I Removed Axios From My App

This was not one of those dramatic rewrites where I tried to reinvent networking because I was bored on a Tuesday.

I removed Axios because of the security mess around it.

The Fireship summary was the thing that pushed me over the edge. The short version was ugly: attackers allegedly compromised the maintainer's npm account, malicious Axios versions were published, and a rogue dependency called `plain-crypto-js` got pulled in. That package reportedly used a `post-install` script as a RAT dropper, figured out the OS, downloaded a second-stage payload, opened the door for remote access, and then tried to clean up after itself.

That is such an absurd sentence for a JavaScript dependency that it almost becomes funny.

Almost.

The practical advice was also pretty serious:

- check `package.json` for the affected Axios versions
- check `node_modules` for `plain-crypto-js`
- if anything looks compromised, do not just delete the package and move on
- rotate keys and tokens immediately
- follow proper incident cleanup steps, like the ones security teams such as Step Security talk about

That part really matters. Once a machine is compromised, deleting one folder is not "problem solved." That is just you tidying the crime scene.

So I made the call: Axios goes out.

Also, sorry Fireship for using your yt thumbnail.

## Why I Did Not Want a Big Rewrite

I did not want to touch every API call in the app.

I did not want to replace Axios with raw `fetch` and then discover, one bug at a time, all the little conveniences Axios had been quietly handling for me.

And I definitely did not want a migration that looked clever in a commit diff but broke half the app in practice.

So the plan was very simple: keep the app experience the same, swap the implementation underneath it.

## What Axios Was Actually Doing For Me

Once I looked at the code properly, the situation got much better.

The app was not using the entire Axios universe. No wild interceptor maze. No advanced request orchestration. No philosophical dependency on Axios as a lifestyle.

It mostly needed:

- a shared `api` client
- `get`, `post`, `patch`, `put`, and `delete`
- a base URL
- JSON request handling
- proper promise-based errors on failed requests
- one clean custom error type
- automatic unwrapping of the API envelope

That changed everything.

At that point, this stopped being "rewrite Axios" and became "replace the exact 10 percent of Axios this app actually uses."

That is a much nicer problem.

## What I Built Instead

I created a tiny internal client on top of `fetch`.

Not a framework. Not a networking platform. Not "Axios, but artisanal."

Just a small wrapper that does the useful parts:

- joins `baseURL` with the request path
- handles query params
- serializes JSON bodies
- merges headers
- rejects on non-2xx responses
- parses API responses
- maps server failures into `ApiClientError`

So the rest of the app still gets to say:

```ts
api.get(...)
api.post(...)
api.patch(...)
api.put(...)
api.delete(...)
```

and move on with its life.

That was important to me. I wanted the migration to feel boring to the rest of the codebase.

Boring is underrated. Boring is where reliable software lives.

## The Part I Refused To Break

One thing I was careful about was error handling.

The app already expected a custom error shape with a message, status, and code. Some UI states depend on that, especially around expired, revoked, or missing share links.

So I kept that contract intact.

That way the UI did not need to learn a new language just because I changed the transport layer under the hood.

I also left the upload progress flow alone. That part uses `XMLHttpRequest`, and honestly, that was the correct choice for this app. Sometimes engineering maturity is just knowing when not to touch the thing that already works.

## How I Migrated It Without Chaos

I kept the API surface familiar, swapped imports to the internal client, removed Axios from dependencies, updated the lockfile, and then verified everything properly.

Not "looks fine to me" verified.

Actually verified.

I ran tests, TypeScript, and a production build.

The build passed. The app still behaved the same. No broken flows. No weird side effects. No emergency cleanup commit with a message like `fix: actual fix this time`.

That was the goal from day one.

## The Bigger Thought Sitting Behind All This

npm trust is in a weird place right now.

Some days the JavaScript ecosystem feels like pure magic. Other days it feels like we are all one dependency away from a documentary called *The Package Installed Itself*.

And the hilarious part is that I still love JS and TS.

Seriously. JS and TS helped me do one of the biggest things teenage me dreamed about: buying a MacBook with money I made from writing code. That will always mean something to me.

So this is not me pretending I suddenly hate the ecosystem.

But it is me becoming much less sentimental about unnecessary dependencies.

And yes, I do have a keen plan to move more critical things toward Go or Rust sooner rather than later. Not because JavaScript failed me, but because the npm supply-chain circus keeps reminding me that smaller dependency graphs are just healthier.

## Final Note

I did not remove Axios because `fetch` is trendy.

I removed it because the dependency had become a liability, and the app only needed a tiny slice of what it provided.

So I kept the useful behavior, dropped the extra package, and made the system simpler without breaking anything.

That is my favorite kind of migration.

Small.
Practical.
Slightly petty.
Very effective.
