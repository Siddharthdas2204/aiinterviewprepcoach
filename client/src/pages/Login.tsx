import { useAuthStore } from "../store/useAuthStore";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { Sparkles, BrainCircuit, Mic2, BarChart3 } from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";

export default function Login() {
  const { user, profile } = useAuthStore();

  if (user) {
    if (profile?.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <main className="z-10 flex flex-col items-center text-center px-4 w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 flex flex-col items-center"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-secondary mb-4 border border-zinc-200">
            <BrainCircuit className="w-8 h-8 text-primary" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-muted-foreground pb-2">
            Ace Your Next <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
              Technical Interview
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mt-4">
            Practice with an intelligent AI coach. Get real-time feedback, perfectly tailored questions, and comprehensive scoring.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-12 w-full max-w-sm"
        >
          <button
            onClick={handleGoogleLogin}
            className="w-full relative group hover:scale-[1.02] transition-all duration-300"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-70 transition duration-300" />
            <div className="relative flex items-center justify-center gap-3 bg-card px-8 py-4 rounded-xl border border-zinc-200 shadow-2xl">
              <svg viewBox="0 0 24 24" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-lg font-semibold text-card-foreground">Continue with Google</span>
            </div>
          </button>
          <p className="mt-4 text-sm text-center text-muted-foreground">
            Takes less than 10 seconds. No credit card required.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
        >
          <div className="p-6 rounded-2xl bg-card border border-zinc-200 flex flex-col items-center text-center gap-3">
            <div className="p-3 rounded-full bg-secondary text-primary">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg">AI Generated Scenarios</h3>
            <p className="text-muted-foreground text-sm">Dynamic questions tailored precisely to your targeted job role and difficulty level.</p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-zinc-200 flex flex-col items-center text-center gap-3">
            <div className="p-3 rounded-full bg-secondary text-primary">
              <Mic2 className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg">Voice or Text Input</h3>
            <p className="text-muted-foreground text-sm">Practice answering out loud with our built in voice recognition algorithms.</p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-zinc-200 flex flex-col items-center text-center gap-3">
            <div className="p-3 rounded-full bg-secondary text-primary">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg">Detailed Analytics</h3>
            <p className="text-muted-foreground text-sm">Track your progress over time with structured feedback on strengths and weaknesses.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
