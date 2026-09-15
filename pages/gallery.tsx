import { useState, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { api, Generation } from "@/lib/api";
import { Navbar } from "@/components/navbar";
import { Search, Download, Eye } from "lucide-react";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

function downloadWithWatermark(generation: Generation) {
  if (!generation.imageUrl) return;
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    const padding = 14;
    const text = "gAllerI · studio-ai.replit.app";
    ctx.font = `${Math.max(20, img.naturalWidth * 0.022)}px Inter, sans-serif`;
    const tm = ctx.measureText(text);
    const boxW = tm.width + padding * 2;
    const boxH = Math.max(20, img.naturalWidth * 0.022) + padding * 1.5;
    ctx.fillRect(img.naturalWidth - boxW - 16, img.naturalHeight - boxH - 16, boxW, boxH);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText(text, img.naturalWidth - boxW - 16 + padding, img.naturalHeight - 16 - padding * 0.5);
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `galleri_${generation.id}.png`;
    a.click();
  };
  img.src = generation.imageUrl;
}

function GalleryCard({ gen }: { gen: Generation }) {
  const [hovering, setHovering] = useState(false);

  if (!gen.imageUrl || gen.status !== "completed") return null;

  return (
    <div
      className="masonry-item group relative rounded-2xl overflow-hidden cursor-pointer bg-card border border-white/[0.06] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:border-primary/20 hover:-translate-y-0.5"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <img
        src={gen.imageUrl}
        alt={gen.title || gen.prompt}
        className="w-full block object-cover"
        loading="lazy"
      />

      {/* Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${hovering ? "opacity-100" : "opacity-0"}`}>
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          <p className="text-white text-sm font-medium line-clamp-2 leading-snug">
            {gen.title || gen.prompt}
          </p>
          {gen.style && (
            <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/10">
              {gen.style}
            </span>
          )}
          <div className="flex gap-2 pt-1">
            <Link href={`/image/${gen.id}`}>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-medium transition-colors">
                <Eye className="w-3.5 h-3.5" />
                View
              </button>
            </Link>
            <button
              onClick={() => downloadWithWatermark(gen)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Gallery() {
  const [search, setSearch] = useState("");
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rippleIdRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: generations = [], isLoading } = useQuery({
    queryKey: ["public-gallery"],
    queryFn: () => api.getPublicGallery(200),
  });

  const filtered = search
    ? generations.filter(g =>
        g.prompt.toLowerCase().includes(search.toLowerCase()) ||
        (g.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (g.style || "").toLowerCase().includes(search.toLowerCase())
      )
    : generations;

  const handleRipple = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const id = ++rippleIdRef.current;
    setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples(r => r.filter(rip => rip.id !== id)), 900);
  }, []);

  return (
    <div className="min-h-screen bg-background" onClick={handleRipple} ref={containerRef}>
      {/* Ripples */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {ripples.map(r => (
          <div key={r.id} className="ripple" style={{ left: r.x, top: r.y }} />
        ))}
      </div>

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-primary/4 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/3 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* Hero */}
        <div className="max-w-7xl mx-auto px-6 py-14 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-3">
            g<span className="text-primary font-extrabold">A</span>ller<span className="text-primary font-extrabold">I</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed mb-8">
            A living commons of AI-generated art. Every image was made with intention — explore, be inspired, download freely. Click anywhere to feel the water.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search by prompt, style..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-card border border-white/[0.08] text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 text-sm"
            />
          </div>
        </div>

        {/* Gallery */}
        <div className="max-w-7xl mx-auto px-6 pb-20">
          {isLoading ? (
            <div className="masonry-grid">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="masonry-item">
                  <div
                    className="w-full rounded-2xl bg-card animate-pulse"
                    style={{ height: `${220 + (i % 3) * 80}px` }}
                  />
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <>
              <p className="text-xs text-muted-foreground mb-4">{filtered.length} creation{filtered.length !== 1 ? "s" : ""}</p>
              <div className="masonry-grid">
                {filtered.map(gen => <GalleryCard key={gen.id} gen={gen} />)}
              </div>
            </>
          ) : (
            <div className="text-center py-24 text-muted-foreground/50">
              <p className="text-lg">Nothing here yet.</p>
              <p className="text-sm mt-2">
                {search ? "No results for that search." : "Be the first to create something in Studio."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
