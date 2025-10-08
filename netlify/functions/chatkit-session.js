export async function handler(event) {
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

    const text = await resp.text();
    let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!resp.ok) {
      return {
        statusCode: resp.status,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "openai_error", data })
      };
    }

    if (!data?.client_secret) {
      return {
        statusCode: 502,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "no_client_secret_from_api", data })
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ client_secret: data.client_secret })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: String(e) })
    };
  }
}
