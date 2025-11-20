import { GoogleGenAI } from "@google/genai";
import { CoinSide } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getOracleWisdom = async (question: string, result: CoinSide): Promise<string> => {
  if (!question.trim()) return "";

  const sentiment = result === CoinSide.HEADS ? "YES/POSITIVE" : "NO/NEGATIVE";
  
  const prompt = `
    You are a mystical, slightly sassy, ancient coin spirit.
    The user asked a yes/no question: "${question}".
    The coin flip result is: ${result} (which implies ${sentiment}).
    
    Provide a very short, witty, one-sentence interpretation of this fate.
    Do not just say yes or no, give a mystical reason why.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "The mists of fate are cloudy...";
  } catch (error) {
    console.error("Oracle error:", error);
    return "The spirits are silent right now (Network Error).";
  }
};