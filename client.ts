import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import Index from "./pages/Index";
import Lancamentos from "./pages/Lancamentos";
import { LayoutDashboard, ClipboardList, ChevronLeft, ChevronRight } from "lucide-react";

const queryClient = new QueryClient();

// Brand colors matching the clinic logo (gold/bronze tone)
const BRAND = {
  bg:         "#2D2417",   // dark warm brown
  bgHover:    "#3D3020",   // slightly lighter on hover
  bgActive:   "#4A3A28",   // active item bg
  border:     "#5A4A30",   // subtle border
  accent:     "#C9A96E",   // gold accent (logo color)
  accentSoft: "#E8D5A3",   // lighter gold for text
  text:       "#F5EDD8",   // warm white text
  textMuted:  "#A89070",   // muted warm text
};

const App = () => {
  const [tab,      setTab]      = useState<"dashboard" | "lancamentos">("dashboard");
  const [sideOpen, setSideOpen] = useState(true);

  const NAV = [
    { id: "dashboard",   label: "Dashboard",    icon: LayoutDashboard },
    { id: "lancamentos", label: "Lançamentos",  icon: ClipboardList   },
  ] as const;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <div className="flex min-h-screen bg-background relative">

          {/* Mobile overlay */}
          {sideOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/40 lg:hidden"
              onClick={() => setSideOpen(false)}
            />
          )}

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <aside
            className="flex flex-col flex-shrink-0 z-40 fixed lg:relative top-0 left-0 h-screen transition-all duration-200 ease-in-out"
            style={{
              width:           sideOpen ? 220 : 56,
              backgroundColor: BRAND.bg,
              borderRight:     `1px solid ${BRAND.border}`,
              transform:       undefined,
            }}
          >


            {/* ── Nav items ────────────────────────────────────────────── */}
            <nav className="flex-1 py-4 space-y-1" style={{ padding: "16px 8px" }}>
              {NAV.map(({ id, label, icon: Icon }) => {
                const isActive = tab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    title={!sideOpen ? label : undefined}
                    className="w-full flex items-center rounded-lg transition-all duration-150"
                    style={{
                      gap:             sideOpen ? 10 : 0,
                      padding:         sideOpen ? "10px 12px" : "10px 0",
                      justifyContent:  sideOpen ? "flex-start" : "center",
                      backgroundColor: isActive ? BRAND.bgActive : "transparent",
                      borderLeft:      isActive ? `3px solid ${BRAND.accent}` : "3px solid transparent",
                      color:           isActive ? BRAND.accent : BRAND.textMuted,
                    }}
                    onMouseEnter={e => {
                      if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = BRAND.bgHover;
                    }}
                    onMouseLeave={e => {
                      if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                    }}
                  >
                    <Icon style={{ width: 18, height: 18, flexShrink: 0 }} />
                    {sideOpen && (
                      <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, truncate: true }}>
                        {label}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* ── Toggle button ────────────────────────────────────────── */}
            <div style={{ padding: 8, borderTop: `1px solid ${BRAND.border}` }}>
              <button
                onClick={() => setSideOpen(o => !o)}
                className="w-full flex items-center justify-center rounded-lg transition-colors"
                style={{ padding: "8px", color: BRAND.textMuted }}
                title={sideOpen ? "Recolher" : "Expandir"}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = BRAND.bgHover; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
              >
                {sideOpen
                  ? <ChevronLeft  style={{ width: 18, height: 18 }} />
                  : <ChevronRight style={{ width: 18, height: 18 }} />
                }
              </button>
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────────────────────── */}
          <main
            className="flex-1 min-w-0 overflow-auto min-h-screen transition-all duration-200"
            style={{ marginLeft: 0 }}
          >
            {tab === "dashboard" ? <Index /> : <Lancamentos />}
          </main>

        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
