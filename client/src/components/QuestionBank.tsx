import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/useAuthStore";
import { 
  Search, 
  ChevronRight, 
  MessageSquare,
  Sparkles,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";

export function QuestionBank() {
  const { user } = useAuthStore();
  const [questions, setQuestions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, [user]);

  const fetchQuestions = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('sessions')
      .select('questions(*)')
      .eq('user_id', user.id);
    
    if (data) {
      const allQs = data.flatMap(s => s.questions);
      // Unique questions only
      const uniqueQs = Array.from(new Set(allQs.map(q => q.question_text)))
        .map(text => allQs.find(q => q.question_text === text));
      setQuestions(uniqueQs);
    }
    setLoading(false);
  };

  const filtered = questions.filter(q => 
    q.question_text.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex justify-center p-20">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white">Knowledge Vault</h2>
          <p className="text-slate-400 font-medium italic">Collection of all AI-generated questions from your sessions.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/50 dark:bg-white/10 border border-white/40 dark:border-white/5 pl-12 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
          />
        </div>
      </header>

      {filtered.length === 0 ? (
        <div className="glass p-20 rounded-[3rem] text-center">
           <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 opacity-20" />
           <h3 className="text-xl font-black text-slate-300">Vault is empty.</h3>
           <p className="text-slate-400">Complete a mock session to start building your bank.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((q, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.01 }}
              className="glass p-6 rounded-[2.5rem] flex items-center justify-between group cursor-default"
            >
              <div className="flex items-center gap-6">
                 <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <MessageSquare className="w-5 h-5" />
                 </div>
                 <p className="font-bold text-slate-700 dark:text-slate-200 line-clamp-2 max-w-2xl">{q.question_text}</p>
              </div>
              <div className="flex items-center gap-4">
                 <span className="hidden md:inline text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Common</span>
                 <ChevronRight className="w-5 h-5 text-slate-300" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
