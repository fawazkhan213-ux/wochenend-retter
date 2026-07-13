import { createServerFn } from "@tanstack/react-start";

// Uses Lovable AI Gateway (OpenAI-compatible) to suggest 3 shopping items
// based on the user's historical additions and what's already on the list.
// Client passes a compact history + current list. Server returns strings.

type SuggestInput = {
  history: Array<{ text: string; count: number }>;
  current: string[];
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export const suggestItems = createServerFn({ method: "POST" })
  .inputValidator((data: SuggestInput) => {
    if (!Array.isArray(data?.history) || !Array.isArray(data?.current)) {
      throw new Error("history and current arrays required");
    }
    return data;
  })
  .handler(async ({ data }): Promise<string[]> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");
    if (data.history.length === 0) return [];

    const historyLine = data.history
      .slice(0, 30)
      .map((h) => `${h.text} (${h.count}×)`)
      .join(", ");
    const currentLine = data.current.join(", ") || "(leer)";

    const res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        "Lovable-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "Du bist ein hilfreicher Einkaufsassistent. Schlage genau 3 typische deutsche Supermarkt-Artikel vor, die der Nutzer wahrscheinlich vergessen hat. Nutze die Kauf-Historie als Signal. Antworte NUR als JSON-Objekt: {\"items\": [\"Artikel1\", \"Artikel2\", \"Artikel3\"]}. Keine Erklärungen. Keine Duplikate zur aktuellen Liste.",
          },
          {
            role: "user",
            content: `Historie (häufig gekauft): ${historyLine}\nAktuelle Liste: ${currentLine}`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`suggestItems failed [${res.status}]: ${body}`);
      if (res.status === 429) throw new Error("Rate limit — später erneut versuchen.");
      if (res.status === 402) throw new Error("AI-Guthaben aufgebraucht.");
      throw new Error(`AI request failed [${res.status}]`);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content ?? "{}";
    try {
      const parsed = JSON.parse(content) as { items?: unknown };
      if (!Array.isArray(parsed.items)) return [];
      const currentLower = new Set(data.current.map((c) => c.toLowerCase().trim()));
      return parsed.items
        .filter((v): v is string => typeof v === "string")
        .map((v) => v.trim())
        .filter((v) => v.length > 0 && !currentLower.has(v.toLowerCase()))
        .slice(0, 3);
    } catch {
      return [];
    }
  });