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

async function handleResults(env) {
  const results = {};
  for (const option of SURVEY_OPTIONS) {
    const value = await env.SURVEY_VOTES.get("votes:" + option);
    results[option] = parseInt(value, 10) || 0;
  }
  return jsonResponse(results);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/survey/vote" && request.method === "POST") {
      return handleVote(request, env);
    }

    if (url.pathname === "/api/survey/results" && request.method === "GET") {
      return handleResults(env);
    }

    return env.ASSETS.fetch(request);
  },
};
