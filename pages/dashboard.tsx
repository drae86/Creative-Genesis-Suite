import { Layout } from "@/components/layout";
import { Link } from "wouter";
import {
  useGetDashboardStats,
  getGetDashboardStatsQueryKey,
  useListRecentGenerations,
  Generation,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  Image as ImageIcon,
  Video,
  Star,
  Library,
  Sparkles,
  ArrowRight,
  Palette,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Velvet Stat Card ─────────────────────────────────────────────────────
const STAT_CONFIGS = [
  {
    label: "Images",
    key: "totalImages" as const,
    icon: ImageIcon,
    spotColor: "rgba(167,139,250,0.22)",
    numColor: "text-violet-300",
    iconColor: "text-violet-400",
    border: "rgba(167,139,250,0.12)",
  },
  {
    label: "Videos",
    key: "totalVideos" as const,
    icon: Video,
    spotColor: "rgba(212,175,55,0.18)",
    numColor: "text-amber-300",
    iconColor: "text-amber-400",
    border: "rgba(212,175,55,0.12)",
  },
  {
    label: "Favourites",
    key: "totalFavorites" as const,
    icon: Star,
    spotColor: "rgba(212,175,55,0.22)",
    numColor: "text-amber-200",
    iconColor: "text-amber-300",
    border: "rgba(212,175,55,0.14)",
  },
  {
    label: "Collections",
    key: "totalCollections" as const,
    icon: Library,
    spotColor: "rgba(167,139,250,0.22)",
    numColor: "text-violet-300",
    iconColor: "text-violet-400",
    border: "rgba(167,139,250,0.12)",
  },
];

function VelvetStatCard({
  cfg,
  value,
  loading,
}: {
  cfg: (typeof STAT_CONFIGS)[number];
  value?: number;
  loading: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-0.5 group"
      style={{
        background: `radial-gradient(ellipse 80% 60% at 50% -10%, ${cfg.spotColor}, hsl(270,40%,4%) 70%)`,
        border: `1px solid ${cfg.border}`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 12px 32px rgba(0,0,0,0.35)`,
      }}
    >
      {/* spotlight bloom */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 rounded-full opacity-60 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none blur-[22px]"
        style={{ background: cfg.spotColor }}
      />

      <cfg.icon
        className={`w-5 h-5 ${cfg.iconColor} relative z-10 mb-5`}
        style={{ filter: `drop-shadow(0 0 6px currentColor)` }}
      />

      <div className="relative z-10">
        {loading ? (
          <Skeleton className="h-9 w-14 mb-1.5 bg-white/5" />
        ) : (
          <p className={`text-4xl font-display font-bold ${cfg.numColor} tracking-tight`}>
            {value ?? 0}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground uppercase tracking-[0.18em] mt-1.5 font-medium">
          {cfg.label}
        </p>
      </div>
    </div>
  );
}

// ─── Mini 3D Circular Wall ────────────────────────────────────────────────
function MiniCircularWall({ images }: { images: Generation[] }) {
  const completed = images.filter(
    (g) => g.status === "completed" && (g.imageUrl || g.thumbnailUrl)
  );
  const count = Math.min(completed.length, 7);
  if (count === 0) return null;
  const radius = Math.max(260, count * 62);

  return (
    <div className="relative w-full h-[340px] overflow-hidden">
      {/* edge fades */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[hsl(270,35%,4%)] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[hsl(270,35%,4%)] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[hsl(270,35%,4%)] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[hsl(270,35%,4%)] to-transparent z-10 pointer-events-none" />

      {/* subtle floor line */}
      <div className="absolute bottom-10 left-[10%] right-[10%] h-px bg-primary/10 z-10 pointer-events-none" />

      <div
        className="absolute inset-0"
        style={{ perspective: "1000px", perspectiveOrigin: "50% 52%" }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 0,
            height: 0,
            transformStyle: "preserve-3d",
            animation: "carouselRotate 40s linear infinite",
          }}
        >
          {completed.slice(0, count).map((img, i) => {
            const angle = (i / count) * 360;
            return (
              <div
                key={img.id}
                style={{
                  position: "absolute",
                  width: "210px",
                  height: "158px",
                  transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                  backfaceVisibility: "hidden",
                  transformOrigin: "center center",
                }}
              >
                {/* hanging wire */}
                <div
                  style={{
                    position: "absolute",
                    top: "-22px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "1px",
                    height: "22px",
                    background: "rgba(157,78,221,0.3)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "-22px",
                    left: "calc(50% - 16px)",
                    width: "32px",
                    height: "1px",
                    background: "rgba(157,78,221,0.25)",
                  }}
                />

                {/* velvet frame */}
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    padding: "7px",
                    background:
                      "linear-gradient(135deg, hsl(270,30%,12%) 0%, hsl(270,40%,8%) 100%)",
                    boxShadow:
                      "0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(157,78,221,0.15)",
                  }}
                >
                  <img
                    src={img.imageUrl || img.thumbnailUrl || ""}
                    alt={img.prompt}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey() },
  });

  const { data: recent, isLoading: recentLoading } = useListRecentGenerations({
    limit: 8,
  }, {
    query: { refetchInterval: 10000 },
  });

  return (
    <Layout>
      <div className="space-y-8 pb-10">

        {/* ── Hero banner ───────────────────────────────── */}
        <section className="relative rounded-3xl overflow-hidden border shadow-[0_0_80px_rgba(157,78,221,0.09),inset_0_1px_0_rgba(255,255,255,0.05)]"
          style={{ borderColor: "rgba(157,78,221,0.18)", background: "hsl(270,40%,4%)" }}>

          {/* animated gradient backdrop */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(125deg, hsl(270,60%,8%) 0%, hsl(250,50%,5%) 30%, hsl(270,35%,4%) 55%, hsl(230,55%,7%) 80%, hsl(270,45%,6%) 100%)",
              backgroundSize: "300% 300%",
              animation: "heroGradientShift 14s ease infinite",
            }}
          />

          {/* slow-drifting orb — right side */}
          <div
            className="absolute top-[-20%] right-[-8%] w-[55%] h-[140%] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(ellipse, rgba(157,78,221,0.13) 0%, rgba(99,60,180,0.07) 45%, transparent 70%)",
              animation: "heroDrift 18s ease-in-out infinite",
              filter: "blur(2px)",
            }}
          />
          {/* secondary cool orb — bottom left */}
          <div
            className="absolute bottom-[-30%] left-[-5%] w-[40%] h-[120%] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(ellipse, rgba(96,130,255,0.09) 0%, transparent 65%)",
              animation: "heroDrift 22s ease-in-out infinite reverse",
              filter: "blur(4px)",
            }}
          />

          {/* top gold rule */}
          <div
            className="absolute top-0 left-[8%] right-[8%] h-px pointer-events-none"
            style={{
              background: "linear-gradient(to right, transparent, rgba(212,175,55,0.35) 25%, rgba(212,175,55,0.6) 50%, rgba(212,175,55,0.35) 75%, transparent)",
              transformOrigin: "left center",
              animation: "heroRuleExpand 1.2s cubic-bezier(0.4,0,0.2,1) forwards",
            }}
          />
          {/* bottom gold rule */}
          <div
            className="absolute bottom-0 left-[8%] right-[8%] h-px pointer-events-none"
            style={{
              background: "linear-gradient(to right, transparent, rgba(212,175,55,0.18) 30%, rgba(212,175,55,0.32) 50%, rgba(212,175,55,0.18) 70%, transparent)",
            }}
          />

          <div className="relative p-10 md:p-14">
            {/* eyebrow line */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 rounded-full" style={{ background: "rgba(212,175,55,0.7)" }} />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em]" style={{ color: "rgba(212,175,55,0.65)" }}>
                AI · Image &amp; Video · 2025
              </span>
              <div className="h-px flex-1 rounded-full" style={{ background: "linear-gradient(to right, rgba(212,175,55,0.35), transparent)" }} />
            </div>

            <h1 className="font-display font-bold tracking-tight mb-0" style={{ fontSize: "clamp(2.8rem, 5.5vw, 4.8rem)", lineHeight: 1.0 }}>
              <span
                style={{
                  backgroundImage: "linear-gradient(105deg, hsl(275,85%,78%) 0%, hsl(260,75%,83%) 25%, hsl(210,85%,82%) 55%, hsl(280,80%,74%) 80%, hsl(265,90%,80%) 100%)",
                  backgroundSize: "250% auto",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  animation: "heroGradientShift 9s ease infinite",
                  display: "block",
                  paddingBottom: "0.08em",
                }}
              >
                ProStudio AI
              </span>
            </h1>

            {/* thin gold divider */}
            <div className="my-4 w-16 h-px" style={{ background: "linear-gradient(to right, rgba(212,175,55,0.7), rgba(212,175,55,0.1))" }} />

            {/* tagline */}
            <p className="text-lg font-light tracking-[0.18em] mb-10" style={{ color: "rgba(255,255,255,0.38)", letterSpacing: "0.15em" }}>
              Pure Potential.
            </p>
            <div className="flex flex-col gap-3 items-start">
              <Link href="/studio">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-12 shadow-[0_0_24px_rgba(157,78,221,0.35)]"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Enter Studio
                </Button>
              </Link>

              {/* Follow Me — peanut with button emerging from his side */}
              <div className="flex items-end" style={{ position: "relative" }}>
                {/* Peanut sits in front (higher z-index), button tucks behind his right side */}
                <Link href="/gallery" className="group cursor-pointer relative z-10" title="The Rogue Peanut Gallery">
                  <img
                    src="/posh-peanut.png"
                    alt="Posh Peanut"
                    className="select-none group-hover:-translate-y-2 group-hover:scale-105 transition-transform duration-200"
                    style={{
                      width: "140px",
                      height: "140px",
                      objectFit: "contain",
                      filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.55))",
                      marginBottom: "-8px",
                      marginRight: "-18px",
                    }}
                  />
                </Link>
                <Link href="/gallery" className="relative z-0">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/70 font-semibold h-12 transition-all duration-200"
                    style={{ borderRadius: "0 8px 8px 0", paddingLeft: "26px", paddingRight: "22px" }}
                  >
                    Follow Me!
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Velvet stats ──────────────────────────────── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STAT_CONFIGS.map((cfg) => (
            <VelvetStatCard
              key={cfg.key}
              cfg={cfg}
              value={stats?.[cfg.key]}
              loading={statsLoading}
            />
          ))}
        </section>

        {/* ── Mini Peanut Gallery carousel ──────────────── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-400" />
                Recent Generations
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Spinning live as new work comes in
              </p>
            </div>

            {/* Peanut trail */}
            <Link
              href="/gallery"
              className="group flex items-center gap-0 text-muted-foreground/50 hover:text-amber-400/90 transition-colors duration-300"
            >
              <span className="text-base leading-none group-hover:animate-bounce transition-all" style={{ animationDelay: "0ms" }}>🥜</span>
              <span className="text-sm leading-none opacity-60 group-hover:opacity-100 mx-0.5" style={{ animationDelay: "80ms" }}>🥜</span>
              <span className="text-xs leading-none opacity-30 group-hover:opacity-70" style={{ animationDelay: "160ms" }}>🥜</span>
              <span className="text-[11px] font-medium tracking-wide ml-2 mr-1 font-display italic">
                Rogue's
              </span>
              <span className="text-[11px] tracking-[0.18em] opacity-60">· · ·</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>

          {/* ── Gallery plaque ── */}
          <Link href="/gallery" className="group flex justify-center mb-3">
            <div className="relative inline-flex flex-col items-center">
              {/* plaque spotlight beam from above */}
              <div
                className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-10 pointer-events-none"
                style={{
                  background: "linear-gradient(to bottom, rgba(255,240,180,0.18) 0%, transparent 100%)",
                  clipPath: "polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)",
                  filter: "blur(2px)",
                }}
              />
              {/* mounting screw top */}
              <div className="w-1.5 h-1.5 rounded-full bg-amber-300/40 mb-1 shadow-[0_0_4px_rgba(251,191,36,0.4)]" />
              {/* plaque body */}
              <div
                className="relative px-5 py-1.5 transition-all duration-200 group-hover:brightness-110"
                style={{
                  background: "linear-gradient(135deg, hsl(42,60%,22%) 0%, hsl(38,55%,18%) 50%, hsl(44,65%,24%) 100%)",
                  border: "1px solid rgba(251,191,36,0.25)",
                  borderRadius: "3px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,230,100,0.12), inset 0 -1px 0 rgba(0,0,0,0.3)",
                }}
              >
                {/* light catch — top-left sheen */}
                <div
                  className="absolute top-0 left-0 w-1/2 h-full pointer-events-none rounded-l-[2px]"
                  style={{
                    background: "linear-gradient(to right, rgba(255,220,80,0.07) 0%, transparent 100%)",
                  }}
                />
                <span
                  className="relative text-[11px] tracking-[0.22em] uppercase font-medium"
                  style={{ color: "rgba(255,215,120,0.85)", fontFamily: "Georgia, serif", letterSpacing: "0.2em" }}
                >
                  view in gallery
                </span>
              </div>
              {/* mounting screw bottom */}
              <div className="w-1.5 h-1.5 rounded-full bg-amber-300/40 mt-1 shadow-[0_0_4px_rgba(251,191,36,0.4)]" />
            </div>
          </Link>

          <div
            className="relative rounded-2xl overflow-hidden border border-primary/10"
            style={{
              background:
                "radial-gradient(ellipse 70% 80% at 50% 50%, hsl(270,35%,6%) 0%, hsl(270,30%,3%) 100%)",
              boxShadow: "inset 0 2px 0 rgba(255,255,255,0.03), 0 16px 48px rgba(0,0,0,0.4)",
            }}
          >
            {/* top spotlight bar */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-full" />
            {/* centre stage spotlight — backlight cone hitting the front frame */}
            <div
              className="absolute inset-0 pointer-events-none z-20"
              style={{
                background:
                  "radial-gradient(ellipse 32% 60% at 50% 48%, rgba(235,220,255,0.18) 0%, rgba(157,78,221,0.10) 40%, transparent 70%)",
              }}
            />
            {/* spotlight beam from above */}
            <div
              className="absolute pointer-events-none z-20"
              style={{
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "140px",
                height: "100%",
                background:
                  "linear-gradient(to bottom, rgba(255,255,255,0.13) 0%, rgba(200,170,255,0.08) 45%, transparent 80%)",
                clipPath: "polygon(28% 0%, 72% 0%, 100% 100%, 0% 100%)",
              }}
            />
            {/* floor reflection */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none z-20"
              style={{
                width: "180px",
                height: "30px",
                background: "radial-gradient(ellipse 100% 100% at 50% 100%, rgba(157,78,221,0.18) 0%, transparent 70%)",
              }}
            />

            {recentLoading ? (
              <div className="h-[260px] flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary/30 animate-pulse" />
              </div>
            ) : recent && recent.length > 0 ? (
              <MiniCircularWall images={recent} />
            ) : (
              <div className="h-[240px] flex flex-col items-center justify-center gap-3 text-center px-8">
                <ImageIcon className="w-10 h-10 text-primary/20" />
                <p className="text-sm text-muted-foreground">
                  Generate your first image in the Studio to see it here.
                </p>
                <Link href="/studio">
                  <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/10">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Open Studio
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

      </div>
    </Layout>
  );
}
