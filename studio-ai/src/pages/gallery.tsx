import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout";
import {
  useListGenerations,
  ListGenerationsType,
  Generation,
} from "@workspace/api-client-react";
import { Search, Download, ExternalLink, Image as ImageIcon, Video, Sparkles, Radio } from "lucide-react";
import { ImageBadge } from "@/components/image-badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

// ─── Row layout patterns (5-column grid) ───────────────────────────────────
const ROW_PATTERNS: number[][] = [
  [2, 1, 1, 1],
  [1, 1, 1, 1, 1],
  [1, 2, 1, 1],
  [1, 1, 1, 2],
  [1, 1, 2, 1],
];

interface Row { items: Generation[]; spans: number[] }

function groupIntoRows(generations: Generation[]): Row[] {
  const rows: Row[] = [];
  let i = 0, pi = 0;
  while (i < generations.length) {
    const pattern = ROW_PATTERNS[pi % ROW_PATTERNS.length];
    const count = pattern.length;
    const items = generations.slice(i, i + count);
    if (items.length === 0) break;
    rows.push({ items, spans: pattern.slice(0, items.length) });
    i += count; pi++;
  }
  return rows;
}

// ─── Track Lighting Rail ───────────────────────────────────────────────────
function TrackLighting({ count = 7, opacity = 1 }: { count?: number; opacity?: number }) {
  return (
    <div className="relative w-full pointer-events-none" style={{ height: "36px", opacity }}>
      {/* rail */}
      <div
        className="absolute top-[14px] left-[4%] right-[4%] h-[3px] rounded-full"
        style={{
          background: "linear-gradient(to right, transparent, hsl(30,15%,16%) 8%, hsl(30,18%,20%) 50%, hsl(30,15%,16%) 92%, transparent)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      />
      {/* fixture + bulb */}
      {[...Array(count)].map((_, i) => {
        const pct = 5 + (i / Math.max(count - 1, 1)) * 90;
        return (
          <div key={i} className="absolute" style={{ left: `${pct}%`, top: "8px", transform: "translateX(-50%)" }}>
            <div
              style={{
                width: "9px", height: "11px",
                background: "linear-gradient(to bottom, hsl(30,12%,18%), hsl(30,10%,12%))",
                borderRadius: "2px 2px 5px 5px",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                margin: "0 auto",
              }}
            />
            <div
              style={{
                width: "7px", height: "7px", borderRadius: "50%",
                background: "rgba(255,225,130,0.95)",
                boxShadow: "0 0 8px 4px rgba(255,200,80,0.3)",
                margin: "0 auto", marginTop: "-2px",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

// ─── Spot Beam ─────────────────────────────────────────────────────────────
function SpotBeam({ left, width = 110, height = 380, intensity = 0.07 }: {
  left: string; width?: number; height?: number; intensity?: number;
}) {
  return (
    <div
      className="absolute pointer-events-none z-0"
      style={{
        top: "36px", left, transform: "translateX(-50%)",
        width: `${width}px`, height: `${height}px`,
        background: `linear-gradient(to bottom, rgba(255,218,120,${intensity}) 0%, rgba(255,200,90,${intensity * 0.45}) 50%, transparent 85%)`,
        clipPath: "polygon(22% 0%, 78% 0%, 100% 100%, 0% 100%)",
      }}
    />
  );
}

// ─── Gallery Room wrapper ──────────────────────────────────────────────────
function GalleryRoom({ children }: { children: React.ReactNode }) {
  const beamPositions = ["10%", "24%", "38%", "50%", "62%", "76%", "90%"];
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        background: "linear-gradient(180deg, hsl(222,16%,6%) 0%, hsl(222,14%,5%) 65%, hsl(222,12%,7%) 100%)",
        minHeight: "500px",
      }}
    >
      {/* ceiling strip */}
      <div
        className="absolute top-0 left-0 right-0 z-10"
        style={{
          height: "36px",
          background: "hsl(222,18%,4%)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      />

      {/* track + beams */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4">
        <TrackLighting count={7} />
      </div>
      {/* ambient fill beams from each fixture */}
      {beamPositions.map((l, i) => (
        <SpotBeam key={i} left={l} height={420} intensity={i === 3 ? 0.08 : 0.09} />
      ))}

      {/* key spotlight — always hits the front-facing image position */}
      <div
        className="absolute pointer-events-none z-0"
        style={{
          top: "36px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "220px",
          height: "440px",
          background: "linear-gradient(to bottom, rgba(255,232,160,0.72) 0%, rgba(255,215,100,0.38) 30%, rgba(255,200,80,0.12) 65%, transparent 90%)",
          clipPath: "polygon(28% 0%, 72% 0%, 100% 100%, 0% 100%)",
          filter: "blur(2px)",
        }}
      />
      {/* halo bloom at the top of the key beam — simulates the hot spot of a real theatre spot */}
      <div
        className="absolute pointer-events-none z-0"
        style={{
          top: "28px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80px",
          height: "60px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(255,240,180,0.55) 0%, transparent 70%)",
          filter: "blur(6px)",
        }}
      />
      {/* floor pool — warm light puddle where the front image stands */}
      <div
        className="absolute pointer-events-none z-0"
        style={{
          bottom: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "260px",
          height: "50px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(255,210,80,0.18) 0%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      {/* left wall depth */}
      <div className="absolute inset-y-0 left-0 w-20 pointer-events-none z-10"
        style={{ background: "linear-gradient(to right, hsl(222,18%,3.5%) 0%, transparent 100%)" }} />
      {/* right wall depth */}
      <div className="absolute inset-y-0 right-0 w-20 pointer-events-none z-10"
        style={{ background: "linear-gradient(to left, hsl(222,18%,3.5%) 0%, transparent 100%)" }} />

      {/* floor */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-10" style={{ height: "90px" }}>
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to top, hsl(222,12%,9%) 0%, transparent 100%)" }} />
        {/* floor reflection line */}
        <div className="absolute bottom-16 left-[12%] right-[12%] h-px"
          style={{ background: "linear-gradient(to right, transparent, rgba(255,210,90,0.07) 25%, rgba(255,210,90,0.11) 50%, rgba(255,210,90,0.07) 75%, transparent)" }} />
        {/* baseboard */}
        <div className="absolute bottom-0 left-0 right-0 h-2"
          style={{ background: "hsl(222,14%,9%)", borderTop: "1px solid rgba(255,255,255,0.04)" }} />
      </div>

      {children}
    </div>
  );
}

// ─── Download with artist attribution ─────────────────────────────────────
async function downloadWithAttribution(imageUrl: string, generation: Generation) {
  const img = new window.Image();
  img.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = imageUrl;
  });

  const hasAttr = !!(generation.badgeName || generation.badgeLink);
  const scale = Math.max(1, img.naturalWidth / 800);
  const footerH = hasAttr ? Math.round(56 * scale) : 0;

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight + footerH;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  if (hasAttr) {
    const pad = Math.round(14 * scale);
    ctx.fillStyle = "rgba(0,0,0,0.84)";
    ctx.fillRect(0, img.naturalHeight, canvas.width, footerH);

    if (generation.badgeName) {
      const nameSize = Math.max(14, Math.round(18 * scale));
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.font = `bold ${nameSize}px Inter,sans-serif`;
      ctx.fillText(generation.badgeName, pad, img.naturalHeight + nameSize + Math.round(8 * scale));
    }
    if (generation.badgeLink) {
      const linkSize = Math.max(11, Math.round(14 * scale));
      ctx.fillStyle = "rgba(160,160,255,0.82)";
      ctx.font = `${linkSize}px Inter,sans-serif`;
      ctx.fillText(generation.badgeLink, pad, img.naturalHeight + footerH - Math.round(10 * scale));
    }
    const markSize = Math.max(10, Math.round(12 * scale));
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.font = `${markSize}px Inter,sans-serif`;
    const mark = "ProStudio AI";
    const mw = ctx.measureText(mark).width;
    ctx.fillText(mark, canvas.width - mw - pad, img.naturalHeight + footerH - Math.round(10 * scale));
  }

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prostudio-ai-${generation.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, "image/png");
}

// ─── 3D Circular Wall (rotunda) ─────────────────────────────────────────────
function CircularWall({ images, liveId }: { images: Generation[]; liveId: string | null }) {
  const count = Math.min(images.length, 8);
  const radius = Math.max(290, count * 62);

  const containerRef = useRef<HTMLDivElement>(null);
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (count === 0) return;
    const DURATION = 55000;
    const start = Date.now();
    let raf: number;

    const tick = () => {
      const elapsed = Date.now() - start;
      const carouselAngle = (elapsed % DURATION) / DURATION * 360;

      if (containerRef.current) {
        containerRef.current.style.transform =
          `translateX(-50%) translateY(-50%) rotateY(${carouselAngle}deg)`;
      }

      frameRefs.current.forEach((frame, i) => {
        if (!frame) return;
        const imageAngle = (i / count) * 360;
        const raw = ((carouselAngle + imageAngle) % 360 + 360) % 360;
        const normalized = raw > 180 ? raw - 360 : raw;
        const frontness = Math.cos(normalized * Math.PI / 180);
        const brightness = 0.45 + Math.max(0, frontness) * 0.8;
        const s = frontness > 0.72 ? 1 + (frontness - 0.72) * 0.45 : 1;
        frame.style.filter = `brightness(${brightness.toFixed(3)})`;
        frame.style.transform = `rotateY(${imageAngle}deg) translateZ(${radius}px) scale(${s.toFixed(4)})`;
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [count, radius]);

  if (count === 0) return null;

  return (
    <div className="relative w-full h-[440px] overflow-hidden select-none">
      {/* fades into room walls */}
      <div className="absolute bottom-0 inset-x-0 h-28 pointer-events-none z-10"
        style={{ background: "linear-gradient(to top, hsl(222,12%,7%) 0%, transparent 100%)" }} />
      <div className="absolute top-0 inset-x-0 h-16 pointer-events-none z-10"
        style={{ background: "linear-gradient(to bottom, hsl(222,16%,6%) 0%, transparent 100%)" }} />
      <div className="absolute inset-y-0 left-0 w-28 pointer-events-none z-10"
        style={{ background: "linear-gradient(to right, hsl(222,18%,3.5%) 0%, transparent 100%)" }} />
      <div className="absolute inset-y-0 right-0 w-28 pointer-events-none z-10"
        style={{ background: "linear-gradient(to left, hsl(222,18%,3.5%) 0%, transparent 100%)" }} />

      <div className="absolute inset-0" style={{ perspective: "1100px", perspectiveOrigin: "50% 50%" }}>
        <div
          ref={containerRef}
          style={{
            position: "absolute", left: "50%", top: "52%",
            width: 0, height: 0,
            transformStyle: "preserve-3d",
            transform: "translateX(-50%) translateY(-50%) rotateY(0deg)",
          }}
        >
          {images.slice(0, count).map((img, i) => {
            const imageAngle = (i / count) * 360;
            const isReady = img.status === "completed" && (img.imageUrl || img.thumbnailUrl);
            const isLive = img.id === liveId;
            return (
              <div
                key={img.id}
                ref={(el) => { frameRefs.current[i] = el; }}
                style={{
                  position: "absolute",
                  width: "204px", height: "154px",
                  transform: `rotateY(${imageAngle}deg) translateZ(${radius}px)`,
                  backfaceVisibility: "hidden",
                  transformOrigin: "center center",
                  filter: "brightness(0.45)",
                }}
              >
                {/* wire */}
                <div style={{
                  position: "absolute", top: "-26px", left: "50%", transform: "translateX(-50%)",
                  width: "1px", height: "26px", background: "rgba(180,148,72,0.3)",
                }} />
                <div style={{
                  position: "absolute", top: "-26px", left: "calc(50% - 18px)",
                  width: "36px", height: "1px", background: "rgba(180,148,72,0.2)",
                }} />

                {/* dark velvet frame */}
                <div
                  style={{
                    width: "100%", height: "100%",
                    padding: "8px",
                    background: "linear-gradient(145deg, hsl(28,15%,10%) 0%, hsl(28,10%,7%) 60%, hsl(28,14%,9%) 100%)",
                    boxShadow: isLive
                      ? "0 14px 44px rgba(0,0,0,0.75), 0 0 0 2px rgba(239,68,68,0.65), inset 0 1px 0 rgba(255,200,90,0.08)"
                      : "0 14px 44px rgba(0,0,0,0.75), 0 0 0 1px rgba(180,148,72,0.14), inset 0 1px 0 rgba(255,200,90,0.06)",
                    animation: isLive ? "liveGlow 2s ease-in-out infinite" : undefined,
                  }}
                >
                  {isLive && (
                    <div style={{
                      position: "absolute", top: "8px", right: "8px", zIndex: 10,
                      display: "flex", alignItems: "center", gap: "4px",
                      background: "#ef4444", color: "white",
                      fontSize: "9px", fontWeight: 700,
                      padding: "2px 6px", borderRadius: "999px",
                    }}>
                      <span style={{
                        width: "5px", height: "5px", borderRadius: "50%",
                        background: "white", animation: "pulse 1s ease-in-out infinite", display: "inline-block",
                      }} />
                      LIVE
                    </div>
                  )}
                  {isReady ? (
                    <img
                      src={img.imageUrl || img.thumbnailUrl || ""}
                      alt={img.prompt}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{
                      width: "100%", height: "100%",
                      background: "hsl(222,14%,9%)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Sparkles style={{ width: 20, height: 20, color: "rgba(255,200,90,0.2)" }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Framed gallery tile ───────────────────────────────────────────────────
function FramedTile({ generation, span, isLive, tiltDeg }: {
  generation: Generation; span: number; isLive: boolean; tiltDeg: number;
}) {
  const isReady = generation.status === "completed" && (generation.imageUrl || generation.thumbnailUrl);
  const imageUrl = generation.imageUrl || generation.thumbnailUrl || "";

  return (
    <div
      className="relative group"
      style={{ gridColumn: `span ${span}`, transform: `rotate(${tiltDeg}deg)` }}
    >
      {/* individual spotlight beam */}
      <div
        className="absolute pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          top: "-72px", left: "50%", transform: "translateX(-50%)",
          width: "90px", height: "82px",
          background: "linear-gradient(to bottom, rgba(255,218,110,0.18) 0%, rgba(255,200,80,0.07) 70%, transparent 100%)",
          clipPath: "polygon(18% 0%, 82% 0%, 100% 100%, 0% 100%)",
          filter: "blur(1px)",
        }}
      />
      {/* ambient light patch on wall behind image */}
      <div
        className="absolute -inset-3 rounded-sm pointer-events-none z-0"
        style={{
          background: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(255,200,80,0.04) 0%, transparent 70%)",
          opacity: 0,
          transition: "opacity 0.5s",
        }}
      />

      {/* wire */}
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10">
        <div className="w-8 h-px" style={{ background: "rgba(175,145,70,0.3)" }} />
        <div className="w-px h-5" style={{ background: "rgba(175,145,70,0.25)" }} />
      </div>

      {/* frame */}
      <div
        className={cn(
          "relative transition-all duration-500 ease-out z-10",
          "group-hover:scale-[1.022] group-hover:-translate-y-1.5",
          isLive ? "ring-2 ring-red-400/60" : ""
        )}
        style={{
          padding: span === 2 ? "10px 10px 30px" : "8px 8px 26px",
          background: "linear-gradient(150deg, hsl(28,16%,10%) 0%, hsl(28,10%,7%) 55%, hsl(28,15%,9%) 100%)",
          boxShadow: isLive
            ? "0 16px 50px rgba(0,0,0,0.65), 0 0 0 2px rgba(239,68,68,0.5), inset 0 1px 0 rgba(255,200,80,0.07)"
            : "0 12px 38px rgba(0,0,0,0.6), 0 0 0 1px rgba(175,145,70,0.12), inset 0 1px 0 rgba(255,200,80,0.06)",
          animation: isLive ? "liveGlow 2s ease-in-out infinite" : undefined,
        }}
      >
        {/* inner gold liner */}
        <div
          className="absolute pointer-events-none"
          style={{
            inset: span === 2 ? "5px 5px 22px" : "4px 4px 18px",
            border: "1px solid rgba(175,145,70,0.1)",
            pointerEvents: "none",
          }}
        />

        {isLive && (
          <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
            LIVE
          </div>
        )}

        {/* image */}
        <div
          className={cn("relative overflow-hidden", span === 2 ? "aspect-[3/2]" : "aspect-[3/4]")}
          style={{ background: "hsl(222,14%,8%)" }}
        >
          {isReady ? (
            <>
              <img
                src={imageUrl}
                alt={generation.prompt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                loading="lazy"
              />
              {generation.badgeName && (
                <div className="absolute bottom-2 left-2 z-10">
                  <ImageBadge name={generation.badgeName} link={generation.badgeLink} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={(e) => { e.stopPropagation(); downloadWithAttribution(imageUrl, generation); }}
                  className="rounded-full p-2 shadow-lg transition-colors cursor-pointer"
                  style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.12)" }}
                  title={generation.badgeName ? `Download with ${generation.badgeName} credit` : "Download"}
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <Link href={`/gallery/${generation.id}`}>
                  <div
                    className="rounded-full p-2 shadow-lg cursor-pointer transition-colors"
                    style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.12)" }}
                    title="View details"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </Link>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <Sparkles className="w-7 h-7 animate-pulse" style={{ color: "rgba(255,200,80,0.3)" }} />
              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>Generating…</span>
            </div>
          )}
        </div>

        {/* caption */}
        <div className="pt-2.5 pb-0 px-0.5">
          <p className="text-[10px] font-mono uppercase tracking-widest truncate" style={{ color: "rgba(175,145,70,0.55)" }}>
            {generation.style || generation.model || "AI"}
          </p>
          <p className="text-[11px] leading-snug line-clamp-2 mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>
            {generation.prompt}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Stable tilt ───────────────────────────────────────────────────────────
function getTilt(idx: number) {
  const tilts = [0.6, -0.9, 0.3, -0.5, 0.8, -0.25, 0.7, -1.0, 0.2, -0.65, 0.95, -0.4];
  return tilts[idx % tilts.length];
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function RoguePeanutGallery() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<ListGenerationsType | "all">("all");
  const [liveId, setLiveId] = useState<string | null>(null);
  const prevFirstId = useRef<string | null>(null);

  const { data: generations, isLoading } = useListGenerations(
    { search: search || undefined, type: type !== "all" ? type : undefined },
    { query: { refetchInterval: 8000 } }
  );

  useEffect(() => {
    if (!generations || generations.length === 0) return;
    const firstId = generations[0].id;
    if (firstId !== prevFirstId.current) {
      prevFirstId.current = firstId;
      setLiveId(firstId);
    }
  }, [generations]);

  const rows = groupIntoRows(generations ?? []);
  const wallImages = (generations ?? []).filter(
    (g) => g.status === "completed" && (g.imageUrl || g.thumbnailUrl)
  );

  return (
    <Layout>
      <div
        className="min-h-full -m-6 md:-m-10"
        style={{ background: "hsl(222,14%,5%)", color: "rgba(255,255,255,0.88)" }}
      >

        {/* ── Header ─────────────────────────────────────── */}
        <div
          className="px-8 md:px-16 pt-12 pb-8"
          style={{
            background: "linear-gradient(to bottom, hsl(222,16%,6%), hsl(222,14%,5%))",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.25em] mb-2"
                style={{ color: "rgba(175,145,70,0.65)" }}>
                ProStudio AI · Est. 2025
              </p>
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight"
                style={{ color: "rgba(255,255,255,0.95)" }}>
                The Rogue Peanut Gallery
              </h1>
              <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                Every image free to download &amp; use — no restrictions, unlimited saves.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono"
              style={{ color: "rgba(255,255,255,0.28)" }}>
              <Radio className="w-3.5 h-3.5 animate-pulse" style={{ color: "rgba(239,68,68,0.65)" }} />
              Live · updates in real-time
            </div>
          </div>
        </div>

        {/* ── Exhibition Floor (rotunda) ──────────────────── */}
        {wallImages.length > 0 && (
          <div>
            <p
              className="text-center text-[10px] font-mono uppercase tracking-[0.3em] py-3"
              style={{
                color: "rgba(175,145,70,0.38)",
                background: "hsl(222,16%,5.5%)",
                borderBottom: "1px solid rgba(255,255,255,0.03)",
              }}
            >
              — Exhibition Floor —
            </p>
            <GalleryRoom>
              <CircularWall images={wallImages} liveId={liveId} />
            </GalleryRoom>
          </div>
        )}

        {/* ── Controls (sticky) ──────────────────────────── */}
        <div
          className="px-8 md:px-16 py-4 flex flex-col sm:flex-row gap-3 sticky top-0 z-30"
          style={{
            background: "hsl(222,14%,5%)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          }}
        >
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "rgba(255,255,255,0.22)" }} />
            <Input
              placeholder="Search prompts, styles…"
              className="pl-9 text-white/70 placeholder:text-white/22 focus-visible:ring-white/15"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Tabs value={type} onValueChange={(v) => setType(v as ListGenerationsType | "all")}>
            <TabsList style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <TabsTrigger value="all" className="data-[state=active]:text-white data-[state=active]:bg-white/10 text-white/50">All</TabsTrigger>
              <TabsTrigger value="image" className="data-[state=active]:text-white data-[state=active]:bg-white/10 text-white/50">
                <ImageIcon className="w-3.5 h-3.5 mr-1.5" />Images
              </TabsTrigger>
              <TabsTrigger value="video" className="data-[state=active]:text-white data-[state=active]:bg-white/10 text-white/50">
                <Video className="w-3.5 h-3.5 mr-1.5" />Videos
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* ── Collection wall ─────────────────────────────── */}
        <div
          className="px-8 md:px-16 pt-10 pb-16"
          style={{ background: "hsl(222,14%,5%)" }}
        >
          {/* track lighting above collection */}
          <div className="relative mb-14">
            <div className="absolute -top-4 -left-8 -right-8 md:-left-16 md:-right-16">
              <TrackLighting count={10} opacity={0.6} />
            </div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] pt-5"
              style={{ color: "rgba(175,145,70,0.35)" }}>
              — The Collection —
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-5 gap-6">
              {[...Array(10)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="rounded-none"
                  style={{
                    gridColumn: `span ${i % 4 === 0 ? 2 : 1}`,
                    height: `${i % 3 === 0 ? 280 : 220}px`,
                    background: "rgba(255,255,255,0.04)",
                  }}
                />
              ))}
            </div>
          ) : rows.length > 0 ? (
            <div className="space-y-16">
              {rows.map((row, ri) => (
                <div key={ri} className="grid gap-8" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
                  {row.items.map((gen, ii) => {
                    const globalIdx = rows.slice(0, ri).reduce((acc, r) => acc + r.items.length, 0) + ii;
                    return (
                      <FramedTile
                        key={gen.id}
                        generation={gen}
                        span={row.spans[ii]}
                        isLive={gen.id === liveId}
                        tiltDeg={getTilt(globalIdx)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-24"
              style={{ border: "1px dashed rgba(255,255,255,0.07)", borderRadius: "4px" }}
            >
              <ImageIcon className="w-12 h-12 mx-auto mb-4" style={{ color: "rgba(255,255,255,0.08)" }} />
              <h3 className="text-lg font-medium mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                Nothing here yet
              </h3>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.18)" }}>
                {search ? "Try a different search." : "Head to the Studio and generate something."}
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────── */}
        <div
          className="px-8 md:px-16 py-8 text-center"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          <p className="text-[11px] font-mono tracking-widest uppercase"
            style={{ color: "rgba(255,255,255,0.12)" }}>
            The Rogue Peanut Gallery · All works free for public use · ProStudio AI
          </p>
        </div>

      </div>
    </Layout>
  );
}
