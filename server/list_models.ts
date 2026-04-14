import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data: any = await response.json();
    if (data.models) {
        console.log("Model Names:");
        data.models.forEach((m: any) => console.log(m.name));
    } else {
        console.log("Error or No Models:", data);
    }
  } catch (err: any) {
    console.error("Fetch failed:", err.message);
  }
}

listModels();
