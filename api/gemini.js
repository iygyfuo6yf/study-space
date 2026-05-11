export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });

  try {
    const { contents, systemInstruction, generationConfig } = req.body;
    const hasImages = contents?.some(c => c.parts?.some(p => p.inline_data));

    const messages = [];
    if (systemInstruction?.parts?.[0]?.text) {
      messages.push({ role: "system", content: systemInstruction.parts[0].text });
    }

    for (const c of (contents || [])) {
      const role = c.role === "model" ? "assistant" : "user";
      if (!c.parts?.length) continue;
      const hasImg = c.parts.some(p => p.inline_data);
      if (hasImg) {
        const content = c.parts.map(p => {
          if (p.inline_data) return { type: "image_url", image_url: { url: `data:${p.inline_data.mime_type};base64,${p.inline_data.data}` } };
          return { type: "text", text: p.text || "" };
        }).filter(p => p.type !== "text" || p.text);
        messages.push({ role, content });
      } else {
        const text = c.parts.map(p => p.text || "").join("\n").trim();
        if (text) messages.push({ role, content: text });
      }
    }

    // Use best free vision model for images, best free text model for text
    const model = hasImages
      ? "google/gemma-3-27b-it:free"   // confirmed free vision model
      : "google/gemma-3-27b-it:free";  // same model works for text too

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://study-space-jet.vercel.app",
        "X-Title": "Study Ace"
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: generationConfig?.maxOutputTokens || 1500,
        temperature: generationConfig?.temperature || 0.7,
      })
    });

    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error.message || "OpenRouter error" });
    const text = data.choices?.[0]?.message?.content || "";
    return res.status(200).json({ candidates: [{ content: { parts: [{ text }] } }] });
  } catch (error) {
    return res.status(500).json({ error: "Failed to reach AI: " + error.message });
  }
}
