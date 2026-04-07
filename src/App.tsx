import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import Index from "./pages/Index";
import Lancamentos from "./pages/Lancamentos";
import ThemeToggle from "@/components/dashboard/ThemeToggle";
import { LayoutDashboard, ClipboardList, ChevronLeft, ChevronRight } from "lucide-react";

const queryClient = new QueryClient();

const App = () => {
  const [tab, setTab] = useState<"dashboard" | "lancamentos">("dashboard");
  const [sideOpen, setSideOpen] = useState(true);

  const NAV = [
    { id: "dashboard",   label: "Dashboard",   icon: LayoutDashboard },
    { id: "lancamentos", label: "Lançamentos", icon: ClipboardList   },
  ] as const;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <div className="flex min-h-screen bg-background relative">
          {sideOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/40 lg:hidden"
              onClick={() => setSideOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className="flex flex-col flex-shrink-0 z-40 fixed lg:relative top-0 left-0 h-screen transition-all duration-200 ease-in-out bg-sidebar border-r border-sidebar-border"
            style={{ width: sideOpen ? 220 : 56 }}
          >
            {/* Brand */}
            {sideOpen && (
              <div className="px-4 py-5 border-b border-sidebar-border">
                <h2 className="text-sm font-bold text-sidebar-primary tracking-wide">CLÍNICA DRA GREICE</h2>
                <p className="text-[10px] text-sidebar-foreground/50 mt-0.5">Painel Financeiro</p>
              </div>
            )}

            {/* Nav items */}
            <nav className="flex-1 py-4 px-2 space-y-1">
              {NAV.map(({ id, label, icon: Icon }) => {
                const isActive = tab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    title={!sideOpen ? label : undefined}
                    className={`w-full flex items-center rounded-lg transition-all duration-150 ${
                      sideOpen ? "gap-2.5 px-3 py-2.5" : "justify-center py-2.5"
                    } ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary border-l-[3px] border-sidebar-primary"
                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 border-l-[3px] border-transparent"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                    {sideOpen && (
                      <span className={`text-[13px] truncate ${isActive ? "font-semibold" : "font-normal"}`}>
                        {label}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Bottom: theme toggle + collapse */}
            <div className="border-t border-sidebar-border p-2 space-y-1">
              <div className="flex justify-center">
                <ThemeToggle />
              </div>
              <button
                onClick={() => setSideOpen(o => !o)}
                className="w-full flex items-center justify-center rounded-lg transition-colors py-2 text-sidebar-foreground/60 hover:bg-sidebar-accent/50"
                title={sideOpen ? "Recolher" : "Expandir"}
              >
                {sideOpen
                  ? <ChevronLeft className="h-[18px] w-[18px]" />
                  : <ChevronRight className="h-[18px] w-[18px]" />
                }
              </button>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 overflow-auto min-h-screen transition-all duration-200">
            {tab === "dashboard" ? <Index /> : <Lancamentos />}
          </main>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
