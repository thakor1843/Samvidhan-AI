export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    // The hidden System Prompt defines the AI's personality and constraints
    const systemPrompt = {
      role: "system",
      content: `You are Samvidhan AI, a conversational, highly knowledgeable expert on the Constitution of India. 
      - Always answer accurately based on Indian constitutional law.
      - Understand natural language (the user doesn't need to use strict legal terms).
      - If they ask general questions (like "hello"), greet them warmly and offer constitutional help.
      - If they ask about unrelated topics (like movies or cooking), politely decline and remind them you only discuss the Constitution of India.
      - Use markdown (bullet points, bold text) to make your answers easy to read.`
    };

    // Combine the system prompt with the user's conversation history
    const apiMessages = [systemPrompt, ...messages];

    // We use Google's Gemini API via their OpenAI-compatible endpoint
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gemini-1.5-flash", // Fast, highly intelligent, and free
        messages: apiMessages,
        temperature: 0.5 // Keeps answers factual and focused
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "API connection failed");
    }

    // Send the AI's reply back to the frontend
    res.status(200).json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "An error occurred while connecting to the AI." });
  }
}
