import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { ThemeToggle } from "../components/ThemeToggle";
import { 
  Loader2, 
  Mic, 
  MicOff, 
  Send, 
  Timer, 
  CheckCircle2, 
  AlertCircle,
  Volume2,
  VolumeX,
  ChevronLeft,
  Headphones,
  User,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "react-use";

interface Question {
  id: string;
  question_text: string;
  step_number: number;
}

interface Evaluation {
  score: number;
  feedback_good: string;
  feedback_missing: string;
  ideal_answer: string;
}

export default function InterviewSession() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const { width, height } = useWindowSize();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [session, setSessionData] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [timer, setTimer] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);


  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    fetchSessionData();
  }, [sessionId]);

  useEffect(() => {
    if (!isLoading && !evaluation) {
      startTimer();
      if (questions[currentIndex] && voiceEnabled) {
        speakQuestion(questions[currentIndex].question_text);
      }
    } else {
      stopTimer();
      window.speechSynthesis.cancel();
    }
    return () => {
      stopTimer();
      window.speechSynthesis.cancel();
    };
  }, [isLoading, currentIndex, evaluation]);

  const speakQuestion = (text: string) => {
    if (!voiceEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const fetchSessionData = async () => {
    try {
      const { data: session, error: sError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sError) throw sError;
      setSessionData(session);

      const { data: qs, error: qError } = await supabase
        .from('questions')
        .select('*')
        .eq('session_id', sessionId)
        .order('step_number', { ascending: true });

      if (qError) throw qError;
      setQuestions(qs);
    } catch (err) {
      console.error(err);
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const startTimer = () => {
    setTimer(0);
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition. Please use Chrome.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setUserAnswer(transcript);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
    setIsListening(true);
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return;

    setIsEvaluating(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/evaluate-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: questions[currentIndex].id,
          questionText: questions[currentIndex].question_text,
          userAnswer
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setEvaluation(data.evaluation);
      if (data.evaluation.score >= 9) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to evaluate answer. Please try again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = async () => {
    if (currentIndex < questions.length - 1) {
      setEvaluation(null);
      setUserAnswer("");
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        await fetch(`${apiUrl}/complete-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
        navigate(`/session/${sessionId}/summary`);
      } catch (err) {
        console.error(err);
        navigate('/dashboard');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="blob-container"><div className="blob blob-1" /></div>
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 border-4 border-primary rounded-full animate-ping opacity-25" />
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-slate-400 font-black tracking-widest uppercase text-xs">Calibrating AI...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-6 relative overflow-hidden transition-colors duration-500">
      {showConfetti && <ReactConfetti width={width} height={height} recycle={false} />}
      <div className="blob-container">
        <div className="blob blob-1" />
        <div className="blob blob-2 opacity-5" />
      </div>

      <div className="max-w-4xl mx-auto w-full flex flex-col gap-10 relative z-10 pt-4">
        {/* Modern Header */}
        <div className="flex justify-between items-center bg-white/40 dark:bg-black/20 backdrop-blur-xl px-4 py-3 rounded-full border border-white/40 dark:border-white/5">
           <button onClick={() => navigate('/dashboard')} className="glass p-3 rounded-full hover:bg-white transition-all"><ChevronLeft className="w-5 h-5" /></button>
           
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <Timer className="w-4 h-4 text-primary" />
                 <span className="font-extrabold text-slate-700 dark:text-slate-200 font-mono text-sm">{formatTime(timer)}</span>
              </div>
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
              <button 
                onClick={() => {
                  setVoiceEnabled(!voiceEnabled);
                  if (voiceEnabled) window.speechSynthesis.cancel();
                  else speakQuestion(currentQuestion.question_text);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  voiceEnabled ? 'bg-primary text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {voiceEnabled ? <><Volume2 className="w-4 h-4" /> ON</> : <><VolumeX className="w-4 h-4" /> OFF</>}
              </button>
           </div>

           <ThemeToggle />
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
           <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] font-mono">Phase {currentIndex + 1} of {questions.length}</span>
              <span className="text-sm font-black text-slate-400">{Math.round(((currentIndex + 1)/questions.length)*100)}%</span>
           </div>
           <div className="h-3 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden p-0.5">
              <motion.div 
                className="h-full primary-gradient rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                transition={{ type: 'spring', stiffness: 50 }}
              />
           </div>
        </div>

        <AnimatePresence mode="wait">
          {!evaluation ? (
            <motion.div 
              key="question"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="space-y-10"
            >
              {/* Interview Scene Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                {/* 1. The Video Experience */}
                <div className="glass rounded-[3rem] overflow-hidden relative aspect-video lg:aspect-auto min-h-[300px] border-white/20 shadow-2xl group">
                  <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                      <User className="w-16 h-16 text-primary" />
                    </div>
                  </div>
                  <div className="absolute top-6 left-6 flex items-center gap-3">
                     <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]" />
                     <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">Live AI Recruiter</span>
                  </div>
                  {/* Waveform Animation */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-end gap-1 h-8">
                     {[1,2,3,4,5,6,7,8].map((i) => (
                       <motion.div 
                        key={i}
                        animate={{ height: isListening ? [8, 32, 12, 28, 8] : [8, 12, 8] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                        className="w-1 primary-gradient rounded-full"
                       />
                     ))}
                  </div>
                </div>

                {/* 2. The AI Identity */}
                <div className="glass p-10 rounded-[3rem] flex flex-col justify-center text-center relative border-white/60 dark:border-white/5 shadow-2xl overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">Interrogator</p>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white leading-tight tracking-tighter">
                    "{currentQuestion.question_text}"
                  </h3>
                  
                  <button 
                    onClick={() => speakQuestion(currentQuestion.question_text)}
                    className="mt-8 mx-auto flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl font-black text-xs hover:scale-110 active:scale-95 transition-all shadow-xl"
                  >
                    <Headphones className="w-4 h-4" /> REPLAY VOICE
                  </button>
                </div>
              </div>

              {/* Input Area */}
              <div className="relative">
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="The AI is waiting for your response..."
                  className="w-full min-h-[350px] glass rounded-[3rem] p-12 text-2xl font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-[20px] focus:ring-primary/5 transition-all resize-none shadow-2xl placeholder:text-slate-200 dark:placeholder:text-slate-800"
                />
                
                {/* Fixed controls for Input */}
                <div className="absolute bottom-8 right-8 flex gap-6">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleListening}
                    className={`p-8 rounded-[2.5rem] transition-all flex items-center justify-center shadow-2xl border-[6px] ${
                      isListening 
                      ? 'bg-red-500 border-red-100 dark:border-red-900 text-white animate-pulse' 
                      : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSubmitAnswer}
                    disabled={!userAnswer.trim() || isEvaluating}
                    className="p-8 primary-gradient text-white rounded-[2.5rem] shadow-2xl disabled:opacity-50"
                  >
                    {isEvaluating ? <Loader2 className="w-10 h-10 animate-spin" /> : <Send className="w-10 h-10" />}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="evaluation"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Score Card */}
                <div className="glass p-12 rounded-[4rem] flex flex-col items-center justify-center shadow-2xl border-primary/20 bg-primary/[0.02]">
                  <span className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4">Precision</span>
                  <div className={`text-8xl font-black ${
                    evaluation.score >= 8 ? 'text-emerald-500' : evaluation.score >= 5 ? 'text-amber-500' : 'text-red-500'
                  }`}>
                    {evaluation.score}
                  </div>
                  <span className="text-sm font-bold text-slate-300 dark:text-slate-700 mt-2">Scale / 10</span>
                </div>

                <div className="md:col-span-2 space-y-6">
                  <FeedbackCard type="success" label="Key Strengths" content={evaluation.feedback_good} />
                  <FeedbackCard type="warning" label="Strategic Improvement" content={evaluation.feedback_missing} />
                </div>
              </div>

              {/* Expert Vision */}
              <div className="glass p-12 rounded-[4rem] shadow-2xl">
                <h4 className="text-sm font-black text-primary uppercase tracking-widest mb-6">Expert Model Answer</h4>
                <div className="bg-slate-50 dark:bg-black/40 p-10 rounded-[3rem] text-slate-600 dark:text-slate-400 italic font-bold text-lg leading-relaxed shadow-inner">
                  "{evaluation.ideal_answer}"
                </div>
              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full py-8 primary-gradient text-white font-black text-2xl rounded-[3rem] flex items-center justify-center gap-4 hover:scale-[1.02] shadow-2xl transition-all"
              >
                {currentIndex < questions.length - 1 ? 'Unlock Next Challenge' : 'Explore Final Report'}
                <ArrowRight className="w-8 h-8" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FeedbackCard({ type, label, content }: { type: 'success' | 'warning', label: string, content: string }) {
  const isSuccess = type === 'success';
  return (
    <div className={`p-8 rounded-[3.5rem] border ${
      isSuccess ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'
    }`}>
      <div className="flex items-center gap-4 mb-4">
         {isSuccess ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <AlertCircle className="w-6 h-6 text-amber-500" />}
         <h4 className={`text-xs font-black uppercase tracking-widest ${isSuccess ? 'text-emerald-600' : 'text-amber-600'}`}>
            {label}
         </h4>
      </div>
      <p className="text-lg font-bold text-slate-600 dark:text-slate-300 leading-tight">
        {content}
      </p>
    </div>
  );
}
