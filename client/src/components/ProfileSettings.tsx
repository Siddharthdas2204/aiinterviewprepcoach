import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/useAuthStore";
import { 
  Mail, 
  LogOut, 
  Activity,
  Settings as SettingsIcon,
  Trash2,
  ChevronRight
} from "lucide-react";

export function ProfileSettings() {
  const { profile, user } = useAuthStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-black text-slate-800 dark:text-white">Account Settings</h2>
        <p className="text-slate-400 font-medium italic">Manage your profile and platform preferences.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Card */}
        <div className="glass p-10 rounded-[3rem] relative overflow-hidden group">
           <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full border-4 border-primary/20 p-1 mb-4 shadow-xl">
                 <img 
                    src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.name}`} 
                    className="w-full h-full rounded-full object-cover"
                    alt="avatar"
                 />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1">{profile?.name || 'User'}</h3>
              <p className="text-slate-400 font-bold text-sm mb-6 flex items-center gap-2"><Mail className="w-4 h-4" /> {user?.email}</p>
              
              <div className="w-full grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-3xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Role</p>
                    <p className="font-black text-primary uppercase text-xs">{profile?.role || 'Candidate'}</p>
                 </div>
                 <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-3xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Joined</p>
                    <p className="font-black text-slate-600 dark:text-slate-200 text-xs">
                       {new Date(profile?.created_at).toLocaleDateString()}
                    </p>
                 </div>
              </div>
           </div>
           <SettingsIcon className="absolute bottom-[-30px] left-[-30px] w-48 h-48 opacity-[0.03] rotate-12" />
        </div>

        {/* Stats & Actions */}
        <div className="flex flex-col gap-6">
           <div className="glass p-8 rounded-[2.5rem] flex items-center gap-6">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                 <Activity className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Growth Status</p>
                 <p className="text-xl font-black text-slate-800 dark:text-white">Active Training</p>
              </div>
           </div>

           <div className="flex flex-col gap-4">
              <button 
                onClick={handleLogout}
                className="w-full glass p-6 rounded-[2rem] flex items-center justify-between group hover:bg-red-500 transition-all border-red-500/10"
              >
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 group-hover:bg-white/20 group-hover:text-white">
                       <LogOut className="w-5 h-5" />
                    </div>
                    <span className="font-black text-slate-700 dark:text-slate-200 group-hover:text-white uppercase tracking-widest text-xs">Sign Out</span>
                 </div>
                 <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-white" />
              </button>

              <button className="w-full glass p-6 rounded-[2rem] flex items-center justify-between group opacity-50 cursor-not-allowed">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-500/10 rounded-xl flex items-center justify-center text-slate-500">
                       <Trash2 className="w-5 h-5" />
                    </div>
                    <span className="font-black text-slate-400 uppercase tracking-widest text-xs">Delete Data</span>
                 </div>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
