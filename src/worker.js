// Serves the static site, plus a tiny JSON API for the "what's missing in
// Layton" survey pop-up, backed by the SURVEY_VOTES KV namespace.

const SURVEY_OPTIONS = [
  "community-garden",
  "youth-hub",
  "free-activities",
  "food-essentials",
  "work-training",
  "none",
];

function jsonResponse(obj, status) {
  return new Response(JSON.stringify(obj, null, 2), {
    status: status || 200,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

async function handleVote(request, env) {
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return jsonResponse({ error: "invalid body" }, 400);
  }

  const choice = body && body.choice;
  if (!SURVEY_OPTIONS.includes(choice)) {
    return jsonResponse({ error: "invalid choice" }, 400);
  }

  const key = "votes:" + choice;
  const current = parseInt(await env.SURVEY_VOTES.get(key), 10) || 0;
  await env.SURVEY_VOTES.put(key, String(current + 1));

  return jsonResponse({ ok: true });
}

// Constant-time string comparison so the key can't be guessed by timing.
function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Results are private. They need the RESULTS_KEY secret, passed as ?key=...
// If the secret has not been set, the endpoint behaves as if it does not exist.
async function handleResults(request, env) {
  if (!env.RESULTS_KEY) {
    return new Response("Not found", { status: 404 });
  }
  const provided = new URL(request.url).searchParams.get("key");
  if (!safeEqual(provided, env.RESULTS_KEY)) {
    return new Response("Not found", { status: 404 });
  }

  const results = {};
  for (const option of SURVEY_OPTIONS) {
    const value = await env.SURVEY_VOTES.get("votes:" + option);
    results[option] = parseInt(value, 10) || 0;
  }
  const res = jsonResponse(results);
  res.headers.set("cache-control", "no-store");
  res.headers.set("x-robots-tag", "noindex");
  return res;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/survey/vote" && request.method === "POST") {
      return handleVote(request, env);
    }

    if (url.pathname === "/api/survey/results" && request.method === "GET") {
      return handleResults(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
