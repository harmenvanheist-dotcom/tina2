// netlify/functions/chatkit-session.js
export async function handler(event) {
  const ALLOWED = new Set([
    "https://tina2.netlify.app",
    "https://tina2.morgenacademy.nl"
  ]);
  const origin = event.headers.origin || "";
  if (!ALLOWED.has(origin)) {
    return { statusCode: 403, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ error: "forbidden" }) };
  }

  const resp = await fetch("https://api.openai.com/v1/chatkit/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
      "OpenAI-Beta": "chatkit_beta=v1"
    },
    body: JSON.stringify({
      workflow: { id: "wf_68e61f672dc08190bb4840efe56adf7d0219c7710ef80900" },
      user: "anon" // of bv. device id
    })
  });

  const data = await resp.json();
  return {
    statusCode: resp.status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": origin },
    body: JSON.stringify({ client_secret: data.client_secret })
  };
}
