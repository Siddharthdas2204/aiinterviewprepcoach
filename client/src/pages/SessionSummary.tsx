import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { 
  ArrowLeft, 
  Share2, 
  Download, 
  ChevronRight, 
  MessageSquare, 
  Zap,
  TrendingUp,
  Award
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion } from "framer-motion";

export default function SessionSummary() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessionResult();
  }, [sessionId]);

  const fetchSessionResult = async () => {
    const { data: session, error: sError } = await supabase
      .from('sessions')
      .select('*, questions(*, answers(*))')
      .eq('id', sessionId)
      .single();

    if (sError) navigate('/dashboard');
    else setData(session);
    setLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-400 font-medium">Analyzing Performance...</p>
    </div>
  );

  // Prepare Chart Data
  const chartData = data?.questions.map((q: any, i: number) => ({
    name: `Q${i+1}`,
    score: q.answers[0]?.score || 0,
    avg: 7 // Mock average for dual layer
  })) || [];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-12">
      {/* Organic Background Shapes */}
      <div className="organic-bg">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12 relative z-10">
        <div className="flex justify-between items-center mb-12">
          <button 
            onClick={() => navigate('/dashboard')}
            className="glass-button px-5 py-3 rounded-2xl flex items-center gap-2 text-slate-700 font-semibold shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Home
          </button>
          <div className="flex gap-3">
             <button className="glass-button p-3 rounded-2xl text-slate-500"><Download className="w-5 h-5" /></button>
             <button className="primary-gradient p-3 rounded-2xl text-white shadow-lg"><Share2 className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Progress Section (Left) */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-10 rounded-[40px] flex flex-col items-center text-center shadow-2xl relative overflow-hidden"
            >
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">Performance Score</h3>
              
              <div className="relative w-56 h-56 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="112"
                    cy="112"
                    r="95"
                    stroke="currentColor"
                    strokeWidth="14"
                    fill="transparent"
                    className="text-slate-100"
                  />
                  <motion.circle
                    cx="112"
                    cy="112"
                    r="95"
                    stroke="url(#radialGradient)"
                    strokeWidth="14"
                    fill="transparent"
                    strokeDasharray={596.6}
                    initial={{ strokeDashoffset: 596.6 }}
                    animate={{ strokeDashoffset: 596.6 - (596.6 * (data?.overall_score || 0)) / 100 }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="radialGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#1e40af" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-black text-slate-800 tracking-tighter">{data?.overall_score}</span>
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Readiness</span>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-2 px-6 py-2 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-black uppercase">
                <TrendingUp className="w-3 h-3" /> Better than 85% of peers
              </div>
            </motion.div>

            <div className="glass-card p-8 rounded-[40px] space-y-6">
              <MetricItem icon={<Zap className="text-amber-500" />} label="Technical Accuracy" value="High" />
              <MetricItem icon={<MessageSquare className="text-primary" />} label="Confidence Rate" value="8.4/10" />
              <MetricItem icon={<Award className="text-accent" />} label="Communication" value="82%" />
            </div>
          </div>

          {/* Visualization Section (Right) */}
          <div className="lg:col-span-8 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-10 rounded-[40px] min-h-[450px]"
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Skill Progression</h3>
                  <p className="text-slate-400 font-medium">Score trend across interview questions</p>
                </div>
                <div className="flex gap-4">
                   <div className="flex items-center gap-2">
                     <div className="w-4 h-4 rounded-md primary-gradient" /> 
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <div className="w-4 h-4 rounded-md bg-slate-200" /> 
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Market Avg</span>
                   </div>
                </div>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1e40af" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#1e40af" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 600}} 
                      dy={10}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13}} />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '25px', 
                        border: 'none', 
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                        padding: '15px 20px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#1e40af" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#scoreGradient)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="avg" 
                      stroke="#cbd5e1" 
                      strokeWidth={2} 
                      strokeDasharray="8 8"
                      fill="transparent" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Detailed Cards */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800 px-4">Detailed Feedback</h3>
              <div className="grid grid-cols-1 gap-4">
                {data?.questions.map((q: any, i: number) => (
                  <motion.div 
                    key={q.id}
                    className="glass-card p-6 rounded-[30px] flex items-center justify-between group hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-white/50 rounded-2xl flex items-center justify-center font-black text-xl text-primary shadow-sm">
                        {i + 1}
                      </div>
                      <div className="max-w-md">
                        <p className="font-bold text-slate-800 line-clamp-1">{q.question_text}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Logical</span>
                          <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full">Concise</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-2xl font-black text-slate-800">{q.answers[0]?.score || 0}<span className="text-xs font-bold text-slate-400 ml-1">/10</span></p>
                      </div>
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/50 rounded-2xl flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <span className="text-sm font-bold text-slate-500 tracking-tight">{label}</span>
      </div>
      <span className="font-black text-slate-800">{value}</span>
    </div>
  );
}
