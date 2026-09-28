# Layton Unlocked - static site

A static, code-based rebuild of thesortingagent.com (soon to be laytonunlocked.com), built with
[Eleventy](https://www.11ty.dev/). The design intentionally matches the **current live WordPress
site's look** (colours, fonts, layout, card styles) - this was not a redesign, it's a like-for-like
rebuild so Adam can move off WordPress hosting without changing how the site looks or feels.

The live site's design tokens, HTML structure and CSS were read directly off thesortingagent.com
(read-only, no admin login) on 28 Sept 2026 and ported into `src/css/style.css` and the page
templates below.

## Getting started

```bash
npm install
npm run serve   # local dev server with live reload, http://localhost:8080
npm run build   # builds the static site into _site/
```

## Project structure

```
src/
  _includes/base.njk     - shared page shell: nav, footer, newsletter form
  _data/activities.json  - the 54 "regular activities" shown on What's On (was a JSON
                            blob embedded in the WordPress page - now a real data file)
  _data/events.json      - one-off events (was WordPress posts in the "Events" category)
  css/style.css           - the whole design system, ported from the live site
  js/whats-on.js          - client-side category/day filtering for the activities grid
  index.njk               - homepage
  whats-on.njk             - What's On page (pinned event + regular activities + one-offs)
  food-essentials.njk      - Food & Essentials page
```

Adding a new regular activity or one-off event means editing the matching JSON file and
re-deploying - no WordPress admin, no database.

## What's accurate vs. what needs a follow-up pass

This was built from a read-only pull of the live site, so it should look right at a glance, but a
few things are worth Adam's eye before this replaces the live site:

- **Regular activities** (`_data/activities.json`): pulled in full from the live site's JSON data
  block - all 54 entries, should be accurate as of 28 Sept 2026.
- **One-off events** (`_data/events.json`): 8 upcoming events are included with real dates/times/
  locations where available. A few (Speed Quiz at Cask Layton, PLAY Expo, SkaFace, Bonkers Bingo,
  A Bublé Christmas) have placeholder copy marked `[CONFIRM DETAILS]`/similar in their description -
  the exact wording lives in the WordPress post body, which wasn't pulled for every event this
  round. The handover doc already documents the REST API pattern for reading a post's full content
  (`GET /wp-json/wp/v2/posts/{id}?context=edit`) - worth doing a full pass before launch, and this
  list will need refreshing regularly either way since events change week to week.
- **Food & Essentials links**: most service cards use the real Facebook page/website links; a
  handful use a generic `facebook.com/` placeholder where the exact link wasn't captured. Worth a
  quick pass to confirm the real URLs before launch.
- **Images**: every image is referenced by its filename/URL (matching the live site's WordPress
  media library), but the actual image files aren't bundled in this repo - WordPress media wasn't
  copied over. Either export the images from WordPress (Media Library) into `src/images/`, or
  they can be pulled in a follow-up session. Until then, most image slots render as an empty
  gradient/placeholder - everything else on the page (layout, colours, text) is unaffected.

## Deploying to Cloudflare

This repo is set up for **Cloudflare Workers (static assets)** - Cloudflare's current
recommended way to host a static site (the successor to Cloudflare Pages). `wrangler.jsonc`
points at the built `_site/` folder. Not yet connected to GitHub or Cloudflare - those need
an account only Adam can create/sign into, so this needs a few steps from him:

### Recommended: GitHub + Cloudflare auto-deploy (no CLI needed after setup)

1. Create a free GitHub account (if he doesn't have one already) at github.com.
2. Create a new repo (e.g. `layton-unlocked`) and push this folder to it:
   ```bash
   cd layton-unlocked
   git init
   git add .
   git commit -m "Initial static rebuild of Layton Unlocked"
   git branch -M main
   git remote add origin https://github.com/<your-username>/layton-unlocked.git
   git push -u origin main
   ```
   (This folder is already a git repo with one commit - `git init`/`add`/`commit` above are
   only needed if starting fresh; otherwise skip straight to adding the remote and pushing.)
3. In the Cloudflare dashboard: **Workers & Pages -> Create -> Connect to Git** -> pick the
   `layton-unlocked` repo -> build command `npm run build`, deploy command
   `npx wrangler deploy`, build output isn't needed (wrangler handles it via `wrangler.jsonc`).
4. Cloudflare will build and deploy automatically on every push to `main` from then on - no
   CLI or tokens needed on Adam's end after this one-time setup.
5. Point laytonunlocked.com's DNS at the new Worker (Cloudflare will show the custom domain
   step once the first deploy succeeds; the domain is currently Fasthosts-registered,
   domain-forwarding to thesortingagent.com - Fasthosts can keep the domain, just repoint the
   DNS record, or the domain can be moved into the same Cloudflare account for one-click
   custom domains).

### Alternative: deploy once from the command line

If Adam wants the site live today before setting up GitHub:
```bash
cd layton-unlocked
npm install
npx wrangler login     # opens a browser to sign into Cloudflare, no token typing needed
npm run deploy          # builds the site and runs `wrangler deploy`
```
This publishes to a `*.workers.dev` URL immediately. The GitHub-connected flow above can
still be set up afterwards for ongoing auto-deploys.

thesortingagent.com (WordPress) stays live and untouched throughout either path until the new
site is confirmed working - see the handover doc for the plan to repurpose it as Adam's
portfolio site afterwards.

## Guardrail

This project never logged into or edited the live WordPress site - everything here was built from
public, read-only pages plus the existing project handover doc. thesortingagent.com is untouched.
