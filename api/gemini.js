export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const { contents, systemInstruction, generationConfig } = req.body;

    // Convert Gemini format to OpenRouter/OpenAI format
    const messages = [];

    if (systemInstruction?.parts?.[0]?.text) {
      messages.push({ role: "system", content: systemInstruction.parts[0].text });
    }

    if (contents) {
      contents.forEach(c => {
        messages.push({
          role: c.role === "model" ? "assistant" : "user",
          content: c.parts?.[0]?.text || ""
        });
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://study-space-jet.vercel.app",
        "X-Title": "Study Space"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free",
        messages,
        max_tokens: generationConfig?.maxOutputTokens || 1024,
        temperature: generationConfig?.temperature || 0.7,
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message || "OpenRouter error" });
    }

    // Convert back to Gemini response format so app code doesn't need changing
    const text = data.choices?.[0]?.message?.content || "";
    return res.status(200).json({
      candidates: [{ content: { parts: [{ text }] } }]
    });

  } catch (error) {
    return res.status(500).json({ error: "Failed to reach AI API: " + error.message });
  }
}
