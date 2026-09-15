import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Heart, Search, Globe, Leaf, Droplets, X, ZoomIn } from "lucide-react";
import { useListGenerations } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Generation } from "@workspace/api-client-react";

function WaterRipple({ x, y, id }: { x: number; y: number; id: number }) {
  return (
    <motion.div
      key={id}
      className="absolute pointer-events-none rounded-full border border-emerald-400/30"
      style={{ left: x - 30, top: y - 30, width: 60, height: 60 }}
      initial={{ scale: 0, opacity: 0.8 }}
      animate={{ scale: 4, opacity: 0 }}
      transition={{ duration: 1.8, ease: "easeOut" }}
    />
  );
}

function downloadWithWatermark(imageUrl: string, filename: string) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);

    const pad = Math.round(img.naturalWidth * 0.025);
    const fontSize = Math.max(16, Math.round(img.naturalWidth * 0.022));

    ctx.font = `bold ${fontSize}px Inter, sans-serif`;
    ctx.textBaseline = "bottom";

    const text = "ProStudio AI · gAllerI";
    const metrics = ctx.measureText(text);
    const tw = metrics.width + pad * 2;
    const th = fontSize + pad * 1.5;
    const bx = img.naturalWidth - tw - pad;
    const by = img.naturalHeight - th - pad;

    ctx.fillStyle = "rgba(0,0,0,0.55)";
    const r = 8;
    ctx.beginPath();
    ctx.moveTo(bx + r, by);
    ctx.lineTo(bx + tw - r, by);
    ctx.quadraticCurveTo(bx + tw, by, bx + tw, by + r);
    ctx.lineTo(bx + tw, by + th - r);
    ctx.quadraticCurveTo(bx + tw, by + th, bx + tw - r, by + th);
    ctx.lineTo(bx + r, by + th);
    ctx.quadraticCurveTo(bx, by + th, bx, by + th - r);
    ctx.lineTo(bx, by + r);
    ctx.quadraticCurveTo(bx, by, bx + r, by);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.90)";
    ctx.fillText(text, bx + pad, by + th - pad * 0.5);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  };
  img.src = imageUrl;
}

function GalleriCard({ gen, onClick }: { gen: Generation; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!gen.imageUrl) return;
    const filename = `galleri-${gen.id}-studio-ai.png`;
    downloadWithWatermark(gen.imageUrl, filename);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative group cursor-pointer break-inside-avoid mb-4"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      data-testid={`galleri-card-${gen.id}`}
    >
      <div className="relative overflow-hidden rounded-xl border border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        {gen.imageUrl ? (
          <img
            src={gen.imageUrl}
            alt={gen.title ?? gen.prompt}
            className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-48 bg-stone-800 flex items-center justify-center">
            <Leaf className="w-8 h-8 text-emerald-700/50" />
          </div>
        )}

        {/* Overlay */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4"
            >
              <p className="text-white text-sm font-medium line-clamp-2 mb-3 drop-shadow">
                {gen.title ?? gen.prompt.slice(0, 80)}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  data-testid={`download-btn-${gen.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-sm hover:bg-emerald-500/30 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
                {gen.isFavorite && (
                  <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-rose-500/20 border border-rose-400/20 text-rose-300 text-xs">
                    <Heart className="w-3 h-3 fill-current" />
                  </div>
                )}
                <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white/10 border border-white/10 text-white/60 text-xs">
                  <ZoomIn className="w-3 h-3" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Style badge */}
        {gen.style && (
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-medium bg-black/50 text-white/70 backdrop-blur-sm border border-white/10">
            {gen.style}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function LightboxModal({ gen, onClose }: { gen: Generation; onClose: () => void }) {
  const handleDownload = () => {
    if (!gen.imageUrl) return;
    downloadWithWatermark(gen.imageUrl, `galleri-${gen.id}-studio-ai.png`);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        className="relative max-w-4xl w-full max-h-[90vh] flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 z-10 w-9 h-9 rounded-full bg-stone-800 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          data-testid="lightbox-close"
        >
          <X className="w-4 h-4" />
        </button>

        {gen.imageUrl && (
          <img
            src={gen.imageUrl}
            alt={gen.title ?? gen.prompt}
            className="w-full max-h-[65vh] object-contain rounded-2xl shadow-2xl"
          />
        )}

        <div className="bg-stone-900/80 backdrop-blur border border-white/5 rounded-xl p-5 space-y-3">
          {gen.title && <h3 className="font-semibold text-white">{gen.title}</h3>}
          <p className="text-sm text-stone-300 leading-relaxed">{gen.prompt}</p>
          {gen.notes && (
            <div className="pt-2 border-t border-white/5">
              <p className="text-xs text-stone-500 italic">{gen.notes}</p>
            </div>
          )}
          <div className="flex items-center gap-3 pt-1 flex-wrap">
            {gen.style && (
              <span className="px-2 py-0.5 rounded-full bg-stone-700/60 text-stone-300 text-xs">{gen.style}</span>
            )}
            <span className="px-2 py-0.5 rounded-full bg-stone-700/60 text-stone-300 text-xs">{gen.aspectRatio}</span>
            <span className="px-2 py-0.5 rounded-full bg-stone-700/60 text-stone-300 text-xs">{gen.type}</span>
            <div className="flex-1" />
            <button
              onClick={handleDownload}
              data-testid="lightbox-download"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-sm font-semibold hover:bg-emerald-600/30 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download with watermark
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Galleri() {
  const [search, setSearch] = useState("");
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const [selected, setSelected] = useState<Generation | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const rippleCounterRef = useRef(0);

  const { data: generations, isLoading } = useListGenerations({
    query: { select: (data) => data.filter((g) => g.status === "completed") }
  });

  const filtered = (generations ?? []).filter((g) =>
    !search || g.prompt.toLowerCase().includes(search.toLowerCase()) || (g.title ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleHeroClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = ++rippleCounterRef.current;
    setRipples((prev) => [...prev.slice(-6), { x, y, id }]);
  }, []);

  // Split into columns for masonry
  const col1: Generation[] = [];
  const col2: Generation[] = [];
  const col3: Generation[] = [];
  filtered.forEach((g, i) => {
    if (i % 3 === 0) col1.push(g);
    else if (i % 3 === 1) col2.push(g);
    else col3.push(g);
  });

  return (
    <Layout>
      {/* Hero: polished concrete + water + garden */}
      <div
        ref={heroRef}
        onClick={handleHeroClick}
        className="relative overflow-hidden rounded-2xl mb-10 cursor-crosshair select-none"
        style={{
          background: "linear-gradient(135deg, #1a1a18 0%, #1e2220 40%, #131a15 70%, #0f1410 100%)",
          minHeight: 240,
        }}
        data-testid="galleri-hero"
      >
        {/* Concrete texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />

        {/* Water shimmer layer */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            background: "repeating-linear-gradient(92deg, transparent 0px, rgba(52,211,153,0.3) 1px, transparent 3px, transparent 40px)",
            animation: "waterFlow 8s linear infinite",
          }}
        />

        {/* Garden glow pockets */}
        <div className="absolute top-[-20%] left-[60%] w-64 h-64 rounded-full blur-[80px]" style={{ background: "rgba(34,197,94,0.08)" }} />
        <div className="absolute bottom-[-30%] left-[10%] w-80 h-80 rounded-full blur-[90px]" style={{ background: "rgba(16,185,129,0.06)" }} />
        <div className="absolute top-[20%] right-[5%] w-48 h-48 rounded-full blur-[60px]" style={{ background: "rgba(6,182,212,0.07)" }} />

        {/* Water ripples on click */}
        {ripples.map((r) => (
          <WaterRipple key={r.id} x={r.x} y={r.y} id={r.id} />
        ))}

        {/* Leaf silhouettes */}
        <svg className="absolute bottom-0 left-0 opacity-10" width="220" height="180" viewBox="0 0 220 180" fill="none">
          <path d="M0 180 C40 120 80 60 160 20 C100 80 80 140 0 180Z" fill="#22c55e" />
          <path d="M0 180 C20 140 60 100 120 60 C70 110 40 150 0 180Z" fill="#16a34a" />
        </svg>
        <svg className="absolute top-0 right-0 opacity-8" width="180" height="200" viewBox="0 0 180 200" fill="none">
          <path d="M180 0 C140 60 100 120 20 180 C80 120 120 60 180 0Z" fill="#10b981" />
          <path d="M180 0 C150 50 120 110 60 200 C90 140 130 80 180 0Z" fill="#059669" />
        </svg>

        {/* Content */}
        <div className="relative z-10 px-10 py-12 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.15)]">
                <Globe className="w-5 h-5 text-emerald-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                g<span className="text-emerald-400 font-extrabold">A</span>ller<span className="text-emerald-400 font-extrabold">I</span>
              </h1>
            </div>
            <p className="text-stone-400 max-w-lg leading-relaxed">
              A living commons of community creations. Every image here was made with intention — explore, be inspired, download freely. Click anywhere to feel the water.
            </p>
            <div className="flex items-center gap-4 mt-5">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <Droplets className="w-3.5 h-3.5 text-cyan-500/60" />
                Click the canvas to create ripples
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <Leaf className="w-3.5 h-3.5 text-emerald-500/60" />
                {filtered.length} creations shared
              </div>
            </div>
          </div>

          {/* Concrete wall texture block */}
          <div
            className="hidden md:block w-40 h-28 rounded-xl opacity-40 flex-shrink-0"
            style={{
              background: "linear-gradient(145deg, #2d2d2b, #222220)",
              boxShadow: "inset 2px 2px 8px rgba(0,0,0,0.5), inset -1px -1px 4px rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div className="w-full h-full rounded-xl" style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.01) 3px, rgba(255,255,255,0.01) 4px), repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(255,255,255,0.008) 6px, rgba(255,255,255,0.008) 7px)",
            }} />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-lg">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
        <Input
          placeholder="Search community creations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-11 bg-stone-900/60 border-white/5 text-white placeholder:text-stone-600 focus:border-emerald-500/30 focus:ring-emerald-500/10 h-11"
          data-testid="galleri-search"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-stone-800/40 border border-white/5 animate-pulse"
              style={{ height: [220, 300, 180, 260, 200, 320, 240, 190, 280][i] }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-stone-800/60 border border-white/5 flex items-center justify-center mb-4">
            <Leaf className="w-8 h-8 text-emerald-700/50" />
          </div>
          <p className="text-stone-400 font-medium mb-1">The garden is empty</p>
          <p className="text-stone-600 text-sm">Start generating in the Studio and the community will grow.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-4">
            {col1.map((g) => <GalleriCard key={g.id} gen={g} onClick={() => setSelected(g)} />)}
          </div>
          <div className="flex flex-col gap-4 md:mt-8">
            {col2.map((g) => <GalleriCard key={g.id} gen={g} onClick={() => setSelected(g)} />)}
          </div>
          <div className="flex flex-col gap-4 md:mt-4">
            {col3.map((g) => <GalleriCard key={g.id} gen={g} onClick={() => setSelected(g)} />)}
          </div>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selected && <LightboxModal gen={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>

      {/* Water flow animation */}
      <style>{`
        @keyframes waterFlow {
          0% { background-position: 0 0; }
          100% { background-position: 200px 0; }
        }
      `}</style>
    </Layout>
  );
}
