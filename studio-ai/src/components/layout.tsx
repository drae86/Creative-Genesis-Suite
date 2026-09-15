import { useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, LayoutGrid, Sparkles, Globe, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "./theme-provider";
import { UpgradeDialog } from "./upgrade-dialog";
import { useGetDashboardActivity } from "@workspace/api-client-react";
import { formatDistanceToNow } from "date-fns";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const { data: activity } = useGetDashboardActivity({ limit: 5 });

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Sparkles, label: "Studio", href: "/studio" },
  ];

  const isGalleri = location === "/galleri";

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row overflow-hidden selection:bg-primary/30">

        {/* ── Sidebar ──────────────────────────────────── */}
        <aside className="w-full md:w-64 border-b md:border-r border-border/50 bg-card/30 backdrop-blur-xl md:h-screen flex flex-col z-20 sticky top-0 md:relative">

          {/* Logo */}
          <div className="p-6 flex items-center gap-3 border-b border-border/50 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(157,78,221,0.5)]">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-wide bg-gradient-to-r from-white via-primary/90 to-blue-400/80 bg-clip-text text-transparent">
              ProStudio <span className="text-primary/90">AI</span>
            </span>
          </div>

          {/* Nav */}
          <nav className="px-4 py-5 space-y-1 overflow-x-auto md:overflow-x-visible flex md:flex-col items-center md:items-stretch shrink-0">
            {navItems.map((item) => {
              const active =
                location === item.href ||
                (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 whitespace-nowrap cursor-pointer",
                      active
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(157,78,221,0.1)]"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    )}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                  >
                    <item.icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                </Link>
              );
            })}

            {/* Peanut Gallery */}
            <Link href="/gallery">
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 whitespace-nowrap cursor-pointer",
                  location.startsWith("/gallery")
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(251,191,36,0.1)]"
                    : "text-muted-foreground hover:bg-amber-900/20 hover:text-amber-400"
                )}
                data-testid="nav-gallery"
              >
                <Palette className="w-[18px] h-[18px]" />
                <span className="tracking-wide leading-tight text-sm">
                  <span className="block text-[10px] font-normal opacity-50 -mb-0.5">The Rogue</span>
                  Peanut Gallery
                </span>
              </div>
            </Link>

            {/* Divider */}
            <div className="hidden md:block border-t border-border/30 my-1.5" />

            {/* gAllerI */}
            <Link href="/galleri">
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 whitespace-nowrap cursor-pointer",
                  isGalleri
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]"
                    : "text-muted-foreground hover:bg-emerald-900/20 hover:text-emerald-400"
                )}
                data-testid="nav-galleri"
              >
                <Globe className="w-[18px] h-[18px]" />
                <span className="tracking-wide text-sm">
                  g<span className="font-extrabold" style={{ fontSize: "1.05em" }}>A</span>ller
                  <span className="font-extrabold" style={{ fontSize: "1.05em" }}>I</span>
                </span>
              </div>
            </Link>
          </nav>

          {/* ── Recent Activity ─────────────────────────── */}
          <div className="flex-1 overflow-y-scroll hidden md:block px-4 py-2 min-h-0 sidebar-scroll">
            {activity && activity.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.18em] px-2 mb-2">
                  Recent Activity
                </p>
                <div className="space-y-0.5">
                  {activity.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-secondary/30 transition-colors cursor-default"
                    >
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-secondary/60 shrink-0 border border-border/30">
                        {item.generation.imageUrl || item.generation.thumbnailUrl ? (
                          <img
                            src={item.generation.thumbnailUrl || item.generation.imageUrl || ""}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-foreground/75 line-clamp-1 leading-tight">
                          {item.description}
                        </p>
                        <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Membership ──────────────────────────────── */}
          <div className="p-4 shrink-0 hidden md:block">
            <div
              className="p-4 rounded-xl relative overflow-hidden"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(157,78,221,0.2) 0%, hsl(270,35%,5%) 70%)",
                border: "1px solid rgba(157,78,221,0.15)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-12 bg-primary/20 blur-[20px] rounded-full pointer-events-none" />
              <h4 className="font-display font-semibold mb-0.5 relative z-10 text-sm">Membership</h4>
              <p className="text-xs text-muted-foreground relative z-10 mb-3">
                Unlock the full platform.
              </p>
              <button
                onClick={() => setUpgradeOpen(true)}
                className="w-full text-xs font-semibold py-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground transition-colors shadow-[0_0_12px_rgba(157,78,221,0.35)]"
              >
                Membership
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main Content ─────────────────────────────── */}
        <main className="flex-1 h-[calc(100vh-80px)] md:h-screen overflow-y-auto relative bg-gradient-to-br from-background via-[hsl(270,35%,4%)] to-[hsl(240,40%,5%)]">
          {/* Primary orbs */}
          <div className="absolute top-[-10%] left-[5%] w-[45%] h-[45%] rounded-full bg-primary/12 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-15%] right-[-5%] w-[45%] h-[45%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
          <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-violet-500/8 blur-[100px] pointer-events-none" />
          {/* Light pockets — scattered smaller glows revealing texture */}
          <div className="absolute top-[12%] left-[32%] w-[22%] h-[18%] rounded-full bg-purple-400/7 blur-[70px] pointer-events-none" />
          <div className="absolute top-[58%] left-[12%] w-[18%] h-[16%] rounded-full bg-primary/8 blur-[55px] pointer-events-none" />
          <div className="absolute top-[28%] right-[28%] w-[16%] h-[16%] rounded-full bg-violet-300/5 blur-[60px] pointer-events-none" />
          <div className="absolute bottom-[22%] left-[42%] w-[24%] h-[18%] rounded-full bg-primary/6 blur-[80px] pointer-events-none" />
          <div className="absolute top-[72%] right-[35%] w-[14%] h-[14%] rounded-full bg-blue-400/5 blur-[50px] pointer-events-none" />
          {/* Subtle grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(270,70%,65%) 1px, transparent 1px), linear-gradient(90deg, hsl(270,70%,65%) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          <div className="relative z-10 p-6 md:p-10 max-w-7xl mx-auto min-h-full flex flex-col">
            {children}
          </div>
        </main>
      </div>
      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </ThemeProvider>
  );
}
