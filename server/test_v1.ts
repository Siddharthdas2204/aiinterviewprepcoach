import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function list() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  try {
    // There is no listModels on genAI in the standard JS SDK easily?
    // Actually we can try the REST API directly or just try the most common name.
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("hello");
    console.log("Gemini Pro Success:", result.response.text());
  } catch (err: any) {
    console.error("Gemini Pro Failed:", err.message);
  }
}

list();
