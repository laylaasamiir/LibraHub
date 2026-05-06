export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { base64Image } = req.body;

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: base64Image } },
              {
                type: "text",
                text: "Analyze this book cover. Return ONLY a JSON object with: title, author, version (if not found set to 1), category, description. All fields must be in English only. No markdown.",
              },
            ],
          },
        ],
      }),
    },
  );

  const data = await response.json();
  res.status(200).json(data);
}
