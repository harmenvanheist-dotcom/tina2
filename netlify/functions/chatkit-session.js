// Netlify Function: maakt of ververst een ChatKit-sessie
// Vereist env var: OPENAI_API_KEY

const ALLOWED_ORIGINS = new Set([
  "https://tina2.netlify.app",
  "https://tina2.morgenacademy.nl"
]);

const WORKFLOW_ID = "wf_68e61f672dc08190bb4840efe56adf7d0219c7710ef80900";
const CHATKIT_SESSIONS_URL = "https://api.openai.com/v1/chatkit/sessions";
const HEADERS_BASE = {
  "Content-Type": "application/json",
  "OpenAI-Beta": "chatkit_beta=v1",
};

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, OpenAI-Beta, OpenAI-Organization, ChatKit-Client-Version",
  };
}

exports.handler = async (event) => {
  const origin = event.headers.origin || "";
  const allowed = ALLOWED_ORIGINS.has(origin);

  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors(allowed ? origin : "*"), body: "" };
  }

  if (!allowed) {
    return { statusCode: 403, headers: cors("*"), body: JSON.stringify({ error: "forbidden" }) };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: cors(origin), body: JSON.stringify({ error: "method_not_allowed" }) };
  }

  try {
    const parsedBody = (() => {
      if (!event.body) return {};
      try {
        const asJson = JSON.parse(event.body);
        return typeof asJson === "object" && asJson !== null ? asJson : {};
      } catch (parseErr) {
        throw new Error(`invalid_json_body: ${parseErr.message}`);
      }
    })();

    const {
      refresh,
      user,
      workflow, // voorkom overschrijven van vaste workflow id
      ...rest
    } = parsedBody;

    const payload = {
      workflow: { id: WORKFLOW_ID },
      user: typeof user === "string" && user.trim() ? user : "anon",
    };

    // Optioneel refresh pad
    if (refresh && refresh.client_secret) {
      payload.refresh = { client_secret: refresh.client_secret };
    }

    // Neem overige configuratie (zoals audio-capabilities) mee naar ChatKit
    for (const [key, value] of Object.entries(rest)) {
      payload[key] = value;
    }

    const resp = await fetch(CHATKIT_SESSIONS_URL, {
      method: "POST",
      headers: {
        ...HEADERS_BASE,
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return { statusCode: resp.status, headers: cors(origin), body: JSON.stringify(data) };
    }

    // Geef uitsluitend het client_secret terug aan de browser
    return {
      statusCode: 200,
      headers: cors(origin),
      body: JSON.stringify({ client_secret: data.client_secret }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: cors(origin),
      body: JSON.stringify({ error: "server_error", detail: String(err && err.message || err) }),
    };
  }
};
