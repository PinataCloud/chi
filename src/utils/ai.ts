import { config } from "../../config";
import OpenAI from "openai";

export const PROVIDER_OPTIONS = ["PINATA", "FILEBASE", "LOCAL"];

export const getAiRecommendation = async (rules: string) => {
  try {
    const aiService = config.aiService;
    let ai = null;
    if (aiService === "OpenAI") {
      ai = new OpenAI({apiKey: config.aiApiKey});
    }

    const completion = await ai?.chat.completions.create({
      messages: [
        { role: "developer", content: `You are an expert on IPFS pinning services. Your job is to find the best pinning service to back up locally pinned files to. You should use the rules that are passed through to help guide you. Please respond with only the pinning service provider name, nothing else. Options for your response are ["Pinata", "Filebase", "Local"]` },
        { role: "user", content: `Which, if any, IPFS pinning service provider should I used based on these conditions: ${rules}`}
      ],
      model: "gpt-4o",
      store: false,
    });

    const answer = completion?.choices[0].message.content;

    if(!PROVIDER_OPTIONS.includes(answer?.toUpperCase() || "")) {
        throw new Error("Invalid response")
    }

    return answer;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
