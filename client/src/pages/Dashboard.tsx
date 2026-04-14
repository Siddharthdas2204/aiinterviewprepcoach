import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/useAuthStore";
import { 
  Play, 
  History, 
  BookOpen, 
  Settings, 
  Home, 
  BarChart3, 
  PlusCircle, 
  Bookmark, 
  User,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Clock,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "../components/ThemeToggle";
import { QuestionBank } from "../components/QuestionBank";
import { ProfileSettings } from "../components/ProfileSettings";
import { useTheme } from "../components/ThemeProvider";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer 
} from 'recharts';

export default function Dashboard() {
  const { theme } = useTheme();
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, avg: 0 });
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'bank' | 'settings'>('home');

  useEffect(() => {
    fetchStats();
    fetchRecentSessions();
  }, [user]);

  useEffect(() => {
    console.log("Active Tab Changed to:", activeTab);
  }, [activeTab]);

  const fetchStats = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('sessions')
      .select('overall_score')
      .eq('user_id', user.id);
    
    if (data && data.length > 0) {
      const total = data.length;
      const avg = Math.round(data.reduce((acc, s) => acc + (s.overall_score || 0), 0) / total);
      setStats({ total, avg });
    }
  };

  const fetchRecentSessions = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setRecentSessions(data);
  };

  return (
    <div className="min-h-screen pb-32 transition-colors duration-500">
      {/* Dynamic Animated Background */}
      <div className="blob-container">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12 relative z-10">
        {/* Top Navigation Bar */}
        <nav className="glass px-8 py-5 rounded-[2rem] flex justify-between items-center mb-16 border-white/40 dark:border-white/5 relative z-[100] shadow-2xl">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg border-2 border-white/20">
                 <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                 <h1 className="text-xl font-black tracking-tight text-slate-800 dark:text-white">Prep.AI</h1>
                 <p className="text-[10px] font-black text-primary uppercase tracking-widest">Master Your Craft</p>
              </div>
           </div>
           
           <div className="flex items-center gap-6">
              {profile?.role === 'admin' && (
                <button 
                  onClick={() => navigate('/admin')}
                  className="hidden md:flex items-center gap-2 text-xs font-black text-slate-500 dark:text-slate-400 hover:text-primary tracking-widest uppercase transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" /> Admin
                </button>
              )}
              <ThemeToggle />
              <button 
                onClick={() => setActiveTab('settings')}
                className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden border-2 border-primary dark:border-indigo-prime shadow-xl hover:scale-125 transition-all active:scale-95 relative z-[110]"
              >
                 <img src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.name}`} alt="profile" />
              </button>
           </div>
        </nav>

        <div className="mt-8">
          {activeTab === 'home' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
               {/* Home content exactly as before */}
                <div className="space-y-2 text-center md:text-left">
                 <h2 
                  className="text-5xl font-black tracking-tighter"
                  style={{ color: theme === 'light' ? '#991b1b' : 'white' }}
                 >
                   Welcome back, <span className="text-primary dark:text-indigo-prime">{profile?.name?.split(' ')[0] || 'Interviewer'}</span>
                 </h2>
                 <p className="text-slate-500 dark:text-white/40 font-medium">Your next breakthrough is one session away.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <motion.div 
                    whileHover={{ y: -10 }}
                    onClick={() => navigate('/setup')}
                    className="lg:col-span-2 primary-gradient p-10 rounded-[3rem] text-white flex flex-col justify-between min-h-[300px] cursor-pointer relative overflow-hidden group"
                 >
                    <div className="relative z-10 text-white">
                       <h3 className="text-4xl font-black mb-4 text-white">Start New Mock Session</h3>
                       <p className="max-w-md text-white/80 text-lg font-medium">Generate custom technical questions tailored to your target company and role using Gemini 2.0 AI.</p>
                    </div>
                    <div className="relative z-10 flex items-center gap-2 font-bold text-xl text-white">
                       Get Started <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform text-white" />
                    </div>
                    <Play className="absolute bottom-[-40px] right-[-40px] w-64 h-64 text-white/10 rotate-[-15deg]" />
                 </motion.div>

                 <div className="grid grid-rows-1 gap-8">
                    <motion.div 
                      whileHover={{ scale: 1.05, rotateY: 5, rotateX: -5 }}
                      className="glass p-8 rounded-[2.5rem] flex flex-col justify-center items-center text-center h-full border-primary/20 bg-primary/[0.02]"
                    >
                       <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">Competency Map</p>
                       <div className="w-full h-48">
                         <ResponsiveContainer width="100%" height="100%">
                           <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                             { subject: 'Tech', A: 80, fullMark: 150 },
                             { subject: 'Comm', A: 90, fullMark: 150 },
                             { subject: 'Logic', A: stats.avg || 70, fullMark: 150 },
                             { subject: 'Speed', A: 65, fullMark: 150 },
                             { subject: 'Conf', A: 85, fullMark: 150 },
                           ]}>
                             <PolarGrid stroke={theme === 'dark' ? '#6366f1' : '#3b82f6'} strokeOpacity={0.2} strokeDasharray="3 3" />
                             <PolarAngleAxis dataKey="subject" tick={{ fill: theme === 'dark' ? '#6366f1' : '#3b82f6', fontSize: 10, fontWeight: 'bold' }} />
                             <Radar
                               name="Candidate"
                               dataKey="A"
                               stroke={theme === 'dark' ? '#a855f7' : '#1d4ed8'}
                               fill={theme === 'dark' ? '#6366f1' : '#3b82f6'}
                               fillOpacity={0.6}
                             />
                           </RadarChart>
                         </ResponsiveContainer>
                       </div>
                    </motion.div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <ServiceCard 
                    icon={<History className="w-6 h-6" />} 
                    title="History" 
                    desc="Review past scores"
                    onClick={() => setActiveTab('history')}
                 />
                 <ServiceCard 
                    icon={<BookOpen className="w-6 h-6" />} 
                    title="Vault" 
                    desc="Key question bank"
                    onClick={() => setActiveTab('bank')}
                 />
                 <ServiceCard 
                    icon={<Settings className="w-6 h-6" />} 
                    title="Settings" 
                    desc="Profile preference"
                    onClick={() => setActiveTab('settings')}
                 />
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && <QuestionHistory recentSessions={recentSessions} navigate={navigate} onBack={() => setActiveTab('home')} />}
          {activeTab === 'bank' && <QuestionBank />}
          {activeTab === 'settings' && <ProfileSettings />}
        </div>
      </div>

      {/* Floating Bottom Nav */}
      <div className="fixed bottom-10 left-0 right-0 z-[100] px-6">
        <div className="max-w-md mx-auto h-20 glass rounded-full flex items-center justify-around px-4 shadow-[0_30px_100px_rgba(0,0,0,0.4)] border-white/20">
          <NavBtn icon={<Home className="w-6 h-6" />} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavBtn icon={<BarChart3 className="w-6 h-6" />} active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
          <button 
            onClick={() => navigate('/setup')} 
            className="w-16 h-16 primary-gradient rounded-full flex items-center justify-center text-white -translate-y-8 shadow-2xl hover:scale-110 active:scale-90 transition-transform z-[110]"
          >
            <PlusCircle className="w-8 h-8" />
          </button>
          <NavBtn icon={<History className="w-6 h-6" />} active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
          <NavBtn icon={<User className="w-6 h-6" />} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </div>
      </div>
    </div>
  );
}

function QuestionHistory({ recentSessions, navigate, onBack }: { recentSessions: any[], navigate: any, onBack: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
      <header className="flex justify-between items-center">
         <h2 className="text-3xl font-black text-slate-800 dark:text-white">Performance Log</h2>
         <button onClick={onBack} className="font-bold text-primary px-4 py-2 bg-primary/10 rounded-xl">Back Home</button>
      </header>
      <div className="grid grid-cols-1 gap-4">
         {recentSessions.length === 0 ? (
           <div className="glass p-12 rounded-[2.5rem] text-center text-slate-400">No sessions yet.</div>
         ) : (
           recentSessions.map((s) => (
             <div 
                key={s.id} 
                onClick={() => navigate(`/session/${s.id}/summary`)}
                className="glass glass-hover p-6 rounded-[2.5rem] flex items-center justify-between cursor-pointer"
             >
                <div className="flex items-center gap-6">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white shadow-lg ${
                      s.overall_score >= 80 ? 'bg-emerald-500' : s.overall_score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                   }`}>
                      {s.overall_score}%
                   </div>
                   <div>
                      <p className="font-black text-lg text-slate-800 dark:text-white">{s.job_role}</p>
                      <p className="text-xs font-bold text-slate-400 flex items-center gap-2"><Clock className="w-3 h-3" /> {new Date(s.created_at).toLocaleDateString()}</p>
                   </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-300" />
             </div>
           ))
         )}
      </div>
    </motion.div>
  );
}

function StatusCard({ label, value, color }: { label: string, value: any, color: string }) {
  return (
    <div className="glass p-8 rounded-[2.5rem] flex flex-col justify-center items-center text-center">
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
       <p className={`text-6xl font-black ${color}`}>{value}</p>
    </div>
  );
}

function ServiceCard({ icon, title, desc, onClick }: { icon: any, title: string, desc: string, onClick: () => void }) {
  return (
    <motion.div 
      onClick={onClick}
      whileHover={{ y: -10, rotateX: 5, scale: 1.02 }}
      className="glass glass-hover p-8 rounded-[2.5rem] cursor-pointer group relative overflow-hidden"
    >
       <div className="absolute top-0 left-0 w-full h-1 primary-gradient opacity-0 group-hover:opacity-100 transition-opacity" />
       <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors mb-4 relative z-10">
          {icon}
       </div>
       <h4 className="font-black text-slate-800 dark:text-white mb-1 uppercase tracking-tight relative z-10">{title}</h4>
       <p className="text-xs font-semibold text-slate-400 relative z-10">{desc}</p>
    </motion.div>
  );
}

function NavBtn({ icon, active, onClick }: { icon: any, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`p-3 rounded-2xl transition-all ${active ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
    >
      {icon}
    </button>
  );
}
