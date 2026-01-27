import { Outlet, Link, useLocation } from "react-router-dom";
import { FlaskConical, LineChart, History, FileText } from "lucide-react";

export default function Layout() {
  const location = useLocation();
  
  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };
  
  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <h1 className="text-2xl font-bold heading-font text-primary" data-testid="app-title">LLM Feedback Lab</h1>
          <p className="text-sm text-muted-foreground mt-1">Human evaluation platform</p>
        </div>
        <nav className="px-4 space-y-2">
          <Link
            to="/"
            data-testid="nav-prompt-lab"
            className={`flex items-center gap-3 px-4 py-3 rounded-md font-medium transition-all ${
              isActive("/") && location.pathname === "/"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "hover:bg-accent text-foreground"
            }`}
          >
            <FlaskConical className="w-5 h-5" />
            Prompt Lab
          </Link>
          <Link
            to="/analytics"
            data-testid="nav-analytics"
            className={`flex items-center gap-3 px-4 py-3 rounded-md font-medium transition-all ${
              isActive("/analytics")
                ? "bg-primary text-primary-foreground shadow-sm"
                : "hover:bg-accent text-foreground"
            }`}
          >
            <LineChart className="w-5 h-5" />
            Analytics
          </Link>
          <Link
            to="/history"
            data-testid="nav-history"
            className={`flex items-center gap-3 px-4 py-3 rounded-md font-medium transition-all ${
              isActive("/history")
                ? "bg-primary text-primary-foreground shadow-sm"
                : "hover:bg-accent text-foreground"
            }`}
          >
            <History className="w-5 h-5" />
            History
          </Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}