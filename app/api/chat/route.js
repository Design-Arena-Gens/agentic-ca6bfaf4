export async function POST(req) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    const userText = Array.isArray(messages)
      ? (messages[messages.length - 1]?.content || "")
      : "";

    async function getAssistantText() {
      if (!apiKey) {
        const canned =
          "You are chatting with a local fallback assistant. " +
          "Provide an OpenAI API key (env OPENAI_API_KEY) to enable real responses.\n\n" +
          "Echo: " + userText + "\n\n" +
          "Tip: Ask me to summarize, brainstorm, or explain a topic.";
        return canned;
      }

      const completionRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.7,
          messages: (
            Array.isArray(messages) && messages.length
              ? messages
              : [{ role: "user", content: userText || "Hello!" }]
          ).slice(-16),
        }),
      });

      if (!completionRes.ok) {
        const errText = await completionRes.text();
        return `OpenAI error (${completionRes.status}): ${errText}`;
      }

      const data = await completionRes.json();
      const text = data?.choices?.[0]?.message?.content || "(no content)";
      return text;
    }

    const fullText = await getAssistantText();

    const encoder = new TextEncoder();
    const body = new ReadableStream({
      async start(controller) {
        const chunkSize = 24;
        for (let i = 0; i < fullText.length; i += chunkSize) {
          const slice = fullText.slice(i, i + chunkSize);
          controller.enqueue(encoder.encode(slice));
          // Tiny delay to create a streaming feel without slowing too much
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 8));
        }
        controller.close();
      },
    });

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return new Response(`Error: ${err?.message || "unknown"}`, { status: 500 });
  }
}
