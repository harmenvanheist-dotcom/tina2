// netlify/functions/chatkit-session.js
const ALLOWED = new Set([
  "https://tina2.netlify.app",
  "https://tina2.morgenacademy.nl"
]);

export async function handler(event) {
  const origin = event.headers.origin || "";
  const cors = {
    "Access-Control-Allow-Origin": ALLOWED.has(origin) ? origin : "",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST,OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors };
  }
  if (event.httpMethod !== "POST" || !ALLOWED.has(origin)) {
    return { statusCode: 403, headers: cors, body: JSON.stringify({ error: "forbidden" }) };
  }

  const resp = await fetch("https://api.openai.com/v1/chatkit/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "OpenAI-Beta": "chatkit_beta=v1"
    },
    body: JSON.stringify({
      workflow: { id: "wf_68e61f672dc08190bb4840efe56adf7d0219c7710ef80900" },
      user: "anon"
    })
  });

  const data = await resp.json();
  return { statusCode: resp.status, headers: cors, body: JSON.stringify({ client_secret: data.client_secret }) };
}
