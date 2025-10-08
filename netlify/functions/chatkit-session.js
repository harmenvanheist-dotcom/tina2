export async function handler() {
  try {
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
    const ok = resp.ok && data?.client_secret;
    return {
      statusCode: ok ? 200 : resp.status || 502,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(ok ? { client_secret: data.client_secret } : { error: "openai_error", data })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: String(e) })
    };
  }
}
