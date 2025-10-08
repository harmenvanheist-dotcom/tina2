export const handler = async () => {
  const r = await fetch("https://api.openai.com/v1/chatkit/sessions", {
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

  const data = await r.json();
  return {
    statusCode: 200,
    body: JSON.stringify({ client_secret: data.client_secret })
  };
};
