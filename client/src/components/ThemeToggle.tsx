import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative w-14 h-8 bg-slate-200 dark:bg-slate-800 rounded-full p-1 transition-colors group"
      aria-label="Toggle Theme"
    >
      <div className={`
        w-6 h-6 rounded-full shadow-lg transform transition-transform duration-300 flex items-center justify-center
        ${theme === "dark" ? "translate-x-6 bg-primary" : "translate-x-0 bg-white"}
      `}>
        {theme === "dark" ? (
          <Moon className="w-4 h-4 text-white" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </div>
    </button>
  );
}
