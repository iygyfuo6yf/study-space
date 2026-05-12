export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return res.status(500).json({ error: "Gemini API key not configured" });

  try {
    const { contents, systemInstruction, generationConfig } = req.body;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${geminiKey}`;

    const body = {
      contents,
      generationConfig: {
        temperature: generationConfig?.temperature ?? 0.7,
        maxOutputTokens: generationConfig?.maxOutputTokens ?? 4000,
      }
    };
    if (systemInstruction) body.systemInstruction = systemInstruction;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error.message || "Gemini error" });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Failed: " + error.message });
  }
}
