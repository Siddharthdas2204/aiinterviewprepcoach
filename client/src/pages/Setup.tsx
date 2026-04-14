import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { 
  Briefcase, 
  Building2, 
  BarChart, 
  ArrowRight, 
  Loader2,
  Sparkles,
  ChevronLeft,
  LayoutList
} from "lucide-react";
import { motion } from "framer-motion";

export default function Setup() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    jobRole: "Node.js Developer",
    companyType: "Startup",
    difficulty: "Medium",
    questionCount: 3
  });

  const handleStart = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/generate-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...formData
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      navigate(`/session/${data.session.id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to start session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-6 pb-24">
      <div className="organic-bg">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
      </div>

      <div className="max-w-2xl w-full relative z-10">
        <button 
          onClick={() => navigate('/dashboard')}
          className="glass-button px-6 py-3 rounded-2xl mb-8 flex items-center gap-2 text-slate-600 font-bold shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Home
        </button>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-10 rounded-[40px] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>

          <header className="mb-10">
            <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Configure Your Session</h1>
            <p className="text-slate-500 font-medium">Customize the AI to target your dream job profile.</p>
          </header>

          <div className="space-y-8">
            {/* Job Role */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <Briefcase className="w-3 h-3 text-primary" /> Targeted Role
              </label>
              <input 
                type="text"
                value={formData.jobRole}
                onChange={(e) => setFormData({...formData, jobRole: e.target.value})}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 p-5 rounded-3xl text-lg font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Type */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <Building2 className="w-3 h-3 text-emerald-500" /> Company Culture
                </label>
                <select 
                  value={formData.companyType}
                  onChange={(e) => setFormData({...formData, companyType: e.target.value})}
                  className="w-full bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 p-5 rounded-3xl text-lg font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner appearance-none"
                >
                  <option value="Startup">Startup</option>
                  <option value="Product Based">Product Based</option>
                  <option value="Service Based">Service Based</option>
                  <option value="MAANG">MAANG</option>
                </select>
              </div>

              {/* Difficulty */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <BarChart className="w-3 h-3 text-amber-500" /> Difficulty
                </label>
                <select 
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                  className="w-full bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 p-5 rounded-3xl text-lg font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner appearance-none"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>

            {/* Question Count */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <LayoutList className="w-3 h-3 text-accent" /> Number of Questions
              </label>
              <div className="flex gap-4">
                 {[3, 5, 10].map((num) => (
                   <button
                    key={num}
                    onClick={() => setFormData({...formData, questionCount: num})}
                    className={`flex-1 py-4 rounded-3xl font-bold transition-all border ${
                      formData.questionCount === num 
                      ? 'primary-gradient text-white border-transparent shadow-lg' 
                      : 'bg-white/50 dark:bg-white/5 text-slate-600 border-white/60 dark:border-white/10 hover:bg-white/80'
                    }`}
                   >
                     {num}
                   </button>
                 ))}
              </div>
            </div>

            <button 
              onClick={handleStart}
              disabled={loading}
              className="w-full primary-gradient py-6 rounded-3xl text-white font-black text-xl shadow-[0_15px_30px_rgba(30,64,175,0.3)] flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Generating Prep...
                </>
              ) : (
                <>
                  Start Training Session <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
