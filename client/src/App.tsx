import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Setup from "./pages/Setup";
import InterviewSession from "./pages/InterviewSession";
import SessionSummary from "./pages/SessionSummary";
import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import { ThemeProvider } from "./components/ThemeProvider";

// Route Guards
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <Sparkles className="w-8 h-8 text-primary animate-pulse" />
      <p className="text-muted-foreground font-medium animate-pulse">Waking up the AI...</p>
    </div>
  );
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

function App() {
  const { user, loading } = useAuthStore();

  // Custom loading screen to prevent flash of unauthenticated content
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Sparkles className="w-8 h-8 text-primary animate-pulse" />
        <p className="text-muted-foreground font-medium animate-pulse">Waking up the AI...</p>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/setup" element={
            <ProtectedRoute>
              <Setup />
            </ProtectedRoute>
          } />
          
          {/* Placeholder for future routes */}
          <Route path="/session/:id" element={
            <ProtectedRoute>
              <InterviewSession />
            </ProtectedRoute>
          } />

          <Route path="/session/:id/summary" element={
            <ProtectedRoute>
              <SessionSummary />
            </ProtectedRoute>
          } />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
