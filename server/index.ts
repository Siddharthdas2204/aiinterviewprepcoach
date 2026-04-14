import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

// Initialize Supabase Admin Client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'AI Interview Coach Server is running!' });
});

// Generate Questions
app.post('/api/generate-questions', async (req, res) => {
  try {
    const { userId, jobRole, companyType, difficulty, questionCount = 5 } = req.body;

    if (!userId || !jobRole || !companyType || !difficulty) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const systemPrompt = `You are an expert technical interview coach. Generate ${questionCount} interview questions for a candidate answering for the role of ${jobRole} at a ${companyType}. The difficulty should be ${difficulty}. 
    Output purely as a JSON array of strings, where each string is a singular interview question.
    Ensure questions are realistic, engaging, and appropriate for the difficulty.`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const questionsJson = JSON.parse(result.response.text());

    // 1. Create a Session in DB
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: userId,
        job_role: jobRole,
        company_type: companyType,
        difficulty: difficulty
      })
      .select()
      .single();

    if (sessionError) throw sessionError;
    if (!sessionData) throw new Error("Failed to create session");

    // 2. Insert Questions into DB
    const questionsToInsert = questionsJson.map((text: string, index: number) => ({
      session_id: sessionData.id,
      question_text: text,
      step_number: index + 1
    }));

    const { data: qData, error: qError } = await supabase
      .from('questions')
      .insert(questionsToInsert)
      .select();

    if (qError) throw qError;

    res.json({ session: sessionData, questions: qData });

  } catch (error: any) {
    console.error("Error generating questions:", error);
    res.status(500).json({ error: error.message });
  }
});

// Evaluate Answer
app.post('/api/evaluate-answer', async (req, res) => {
  try {
    const { questionId, questionText, userAnswer } = req.body;

    if (!questionId || !questionText || !userAnswer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const prompt = `You are evaluating a candidate's answer to an interview question.
    Question: ${questionText}
    Candidate's Answer: ${userAnswer}
    
    Evaluate the answer and provide feedback. Output exactly and only a JSON object with this shape:
    {
      "score": <a number from 1 to 10>,
      "good": "<What was good about their answer>",
      "missing": "<What important things did they miss or could improve>",
      "ideal": "<A sample ideal concise answer they could have given>"
    }`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const evaluation = JSON.parse(result.response.text());

    // Insert into DB
    const { data, error } = await supabase
      .from('answers')
      .insert({
        question_id: questionId,
        user_answer: userAnswer,
        score: evaluation.score,
        feedback_good: evaluation.good,
        feedback_missing: evaluation.missing,
        ideal_answer: evaluation.ideal
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ evaluation: data });
  } catch (error: any) {
    console.error("Error evaluating answer:", error);
    res.status(500).json({ error: error.message });
  }
});


// Complete Session calculation
app.post('/api/complete-session', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    // Fetch all answers for this session
    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select('id, answers(score)')
      .eq('session_id', sessionId);
      
    if (qError) throw qError;
    if (!questions) throw new Error("No questions found for this session");

    let totalScore = 0;
    let answeredCount = 0;

    questions.forEach((q: any) => {
      if (q.answers && q.answers.length > 0) {
        totalScore += q.answers[0].score || 0;
        answeredCount++;
      }
    });

    const overallScore = answeredCount > 0 ? Math.round(totalScore / answeredCount) : 0;

    const { error: updateError } = await supabase
      .from('sessions')
      .update({ overall_score: overallScore })
      .eq('id', sessionId);

    if (updateError) throw updateError;

    res.json({ success: true, overallScore });

  } catch (error: any) {
    console.error("Error calculating session total:", error);
    res.status(500).json({ error: error.message });
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
