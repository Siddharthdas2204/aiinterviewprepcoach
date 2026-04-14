import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { ThemeToggle } from "../components/ThemeToggle";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { 
  Users, 
  TrendingUp, 
  ShieldCheck,
  Search,
  LogOut
} from "lucide-react";


interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  role: string;
  created_at: string;
  avg_score?: number;
  total_sessions?: number;
}

export default function AdminDashboard() {
  const { profile, signOut } = useAuthStore();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [globalStats, setGlobalStats] = useState({
    totalUsers: 0,
    totalSessions: 0,
    avgScore: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  if (profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // 1. Fetch all users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (userError) throw userError;

      // 2. Fetch all sessions for stats
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('id, overall_score, user_id');

      if (sessionError) throw sessionError;

      // Calculate stats for each user
      const enrichedUsers = userData.map(u => {
        const userSessions = sessionData.filter(s => s.user_id === u.id);
        const scores = userSessions.filter(s => s.overall_score !== null).map(s => s.overall_score as number);
        const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        
        return {
          ...u,
          total_sessions: userSessions.length,
          avg_score: Number(avg.toFixed(1))
        };
      });

      setUsers(enrichedUsers);

      // Global aggregate stats
      const totalSessions = sessionData.length;
      const allScores = sessionData.filter(s => s.overall_score !== null).map(s => s.overall_score as number);
      const globalAvg = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;

      setGlobalStats({
        totalUsers: userData.length,
        totalSessions,
        avgScore: Number(globalAvg.toFixed(1))
      });

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center">
      <div className="max-w-7xl w-full px-4 md:px-8 py-8 md:py-12 space-y-10">
        
        {/* Admin Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border border-zinc-200 p-6 rounded-3xl shadow-sm border-l-4 border-l-primary">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary text-primary-foreground rounded-2xl shadow-lg shadow-primary/20">
               <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase">Admin Command Intelligence</h1>
              <p className="text-muted-foreground text-sm font-medium">Monitoring system performance and user engagement metrics.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <ThemeToggle />
             <div className="h-8 w-[1px] bg-border mx-1 hidden md:block" />
             <button 
              onClick={signOut}
              className="px-4 py-2 hover:bg-secondary text-foreground text-sm font-bold flex items-center gap-2 rounded-xl border border-zinc-200 transition-all"
             >
                <LogOut className="w-4 h-4" />
                Logout
             </button>
          </div>
        </header>

        {/* Aggregate Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-card border border-zinc-200 p-6 rounded-2xl flex flex-col justify-between gap-4 shadow-sm hover:border-primary/50 transition-colors">
                <div className="p-2 bg-primary/10 w-fit rounded-lg text-primary"><Users size={20} /></div>
                <div>
                   <p className="text-xs font-black uppercase text-muted-foreground tracking-widest opacity-60">Total Base</p>
                   <p className="text-3xl font-black tracking-tighter mt-1">{globalStats.totalUsers}</p>
                   <p className="text-[10px] font-bold text-muted-foreground mt-1 tracking-tight">Registered users</p>
                </div>
            </div>
            <div className="bg-card border border-zinc-200 p-6 rounded-2xl flex flex-col justify-between gap-4 shadow-sm hover:border-blue-500/50 transition-colors">
                <div className="p-2 bg-blue-500/10 w-fit rounded-lg text-blue-500"><TrendingUp size={20} /></div>
                <div>
                   <p className="text-xs font-black uppercase text-muted-foreground tracking-widest opacity-60">System Throughput</p>
                   <p className="text-3xl font-black tracking-tighter mt-1">{globalStats.totalSessions}</p>
                   <p className="text-[10px] font-bold text-muted-foreground mt-1 tracking-tight">Interviews generated</p>
                </div>
            </div>
            <div className="bg-card border border-zinc-200 p-6 rounded-2xl flex flex-col justify-between gap-4 shadow-sm hover:border-emerald-500/50 transition-colors">
                <div className="p-2 bg-emerald-500/10 w-fit rounded-lg text-emerald-500"><ShieldCheck size={20} /></div>
                <div>
                   <p className="text-xs font-black uppercase text-muted-foreground tracking-widest opacity-60">Avg Competency</p>
                   <p className="text-3xl font-black tracking-tighter mt-1">{globalStats.avgScore}<span className="text-lg opacity-40 ml-1">/10</span></p>
                   <p className="text-[10px] font-bold text-muted-foreground mt-1 tracking-tight">Global performance</p>
                </div>
            </div>
            <div className="bg-card border border-zinc-200 p-6 rounded-2xl flex flex-col justify-between gap-4 shadow-sm hover:border-purple-500/50 transition-colors">
                <div className="p-2 bg-purple-500/10 w-fit rounded-lg text-purple-500"><ShieldCheck size={20} /></div>
                <div>
                   <p className="text-xs font-black uppercase text-muted-foreground tracking-widest opacity-60">Cloud Health</p>
                   <p className="text-3xl font-black tracking-tighter mt-1 leading-none">99.9%</p>
                   <p className="text-[10px] font-bold text-emerald-500 mt-2 tracking-tight">Active status</p>
                </div>
            </div>
        </section>

        {/* User Management Section */}
        <section className="bg-card border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-8 border-b border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black tracking-tight">User Operations</h2>
                    <p className="text-muted-foreground text-sm font-medium">Direct management and performance tracking of all system participants.</p>
                </div>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Search accounts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-background border border-zinc-200 pl-11 pr-6 py-3 rounded-2xl text-sm w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-secondary/50 text-xs font-black uppercase tracking-widest text-muted-foreground">
                        <tr>
                            <th className="px-8 py-5">User Profile</th>
                            <th className="px-8 py-5">Access Group</th>
                            <th className="px-8 py-5 text-center">Engagement</th>
                            <th className="px-8 py-5 text-center">Avg Rating</th>
                            <th className="px-8 py-5 text-right">Integrity</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {isLoading ? (
                           [1,2,3].map(i => (
                             <tr key={i} className="animate-pulse">
                                <td colSpan={5} className="px-8 py-10 bg-card/50"></td>
                             </tr>
                           ))
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-20 text-center text-muted-foreground font-medium italic">No accounts found matching your search.</td>
                            </tr>
                        ) : filteredUsers.map(u => (
                            <tr key={u.id} className="group hover:bg-secondary/20 transition-colors">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-border overflow-hidden shrink-0 border border-zinc-200">
                                            {u.avatar_url ? <img src={u.avatar_url} /> : <div className="w-full h-full flex items-center justify-center font-bold text-xs">{u.name?.charAt(0)}</div>}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm truncate">{u.name || 'Undefined Identity'}</p>
                                            <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                                        u.role === 'admin' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-primary/10 text-primary border-primary/20'
                                    }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <span className="font-black text-sm">{u.total_sessions}</span>
                                    <p className="text-[9px] uppercase font-bold opacity-40">Sessions</p>
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-secondary rounded-lg border border-zinc-200">
                                       <span className="font-black text-sm text-primary">{u.avg_score || '--'}</span>
                                       <TrendingUp className="w-3 h-3 text-emerald-500" />
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                     <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                                         <ChevronRight size={18} />
                                     </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="p-6 bg-secondary/20 text-center">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">End of identity database {filteredUsers.length} records</p>
            </div>
        </section>
      </div>
    </div>
  );
}
