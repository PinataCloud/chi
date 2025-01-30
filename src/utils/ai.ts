import { config, specs } from "../../config";
import OpenAI from "openai";

export const PROVIDER_OPTIONS = ["PINATA", "FILEBASE", "LOCAL"];

export const getAiRecommendation = async (rules: string) => {
  try {
    const aiService = config.aiService;
    let ai = null;
    if (aiService === "OpenAI") {
      ai = new OpenAI({ apiKey: config.aiApiKey });
    }

    const completion = await ai?.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
          You are an expert on IPFS pinning services. Your job is to select the best pinning service based on user preferences and available provider specifications.
          Follow these decision rules:
          
          - "cheap_storage" → Choose the provider with the lowest storage price per GB.
          - "cheap_bandwidth" → Choose the provider with the lowest bandwidth price per GB.
          - "fast" → Choose the provider with the lowest average TTFB (Time to First Byte).
          - "us_location" → Prioritize providers that support the US.
          - "eu_location" → Prioritize providers that support the EU.
          - "local_location" → Select "Local".
          
          Available providers:
          
          - **Pinata**
            - Location: US
            - Avg TTFB: 300ms
            - Storage Price: $0.07/GB
            - Bandwidth Price: $0.10/GB
          
          - **Filebase**
            - Location: EU
            - Avg TTFB: 500ms
            - Storage Price: $0.08/GB
            - Bandwidth Price: $0.015/GB
    
          Respond with ONLY the provider name: ["Pinata", "Filebase", "Local"]. Do not include any explanation.
        `,
        },
        {
          role: "user",
          content: `Which, if any, IPFS pinning service provider should I use based on these conditions: ${rules}`,
        },
      ],
      model: "gpt-4o",
      store: false,
    });

    const answer = completion?.choices[0].message.content;

    if (!PROVIDER_OPTIONS.includes(answer?.toUpperCase() || "")) {
      throw new Error("Invalid response");
    }

    return answer;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
