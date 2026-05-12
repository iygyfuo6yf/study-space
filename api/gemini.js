export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return res.status(500).json({ error: "Gemini API key not configured" });

  try {
    const { contents, systemInstruction, generationConfig } = req.body;

    // gemini-1.5-flash — free tier works in Australia, supports vision
    const model = "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;

    const body = { contents };
    if (systemInstruction) body.systemInstruction = systemInstruction;
    if (generationConfig) body.generationConfig = generationConfig;

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
