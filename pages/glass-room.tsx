import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, GlassRoomEntry } from "@/lib/api";
import { Navbar } from "@/components/navbar";
import { Eye, Clock, User, Mail, ExternalLink } from "lucide-react";
import { Link } from "wouter";

function daysLeft(displayUntil: string): number {
  const diff = new Date(displayUntil).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function GlassCard({ entry }: { entry: GlassRoomEntry }) {
  const [open, setOpen] = useState(false);
  const days = daysLeft(entry.displayUntil);
  const gen = entry.generation;

  if (!gen.imageUrl || gen.status !== "completed") return null;

  return (
    <div className="glass-panel rounded-2xl overflow-hidden group relative transition-all duration-500 hover:shadow-[0_16px_48px_rgba(0,0,0,0.6)] hover:-translate-y-1">
      {/* Image — no download overlay */}
      <div className="relative overflow-hidden">
        <img
          src={gen.imageUrl}
          alt={gen.title || gen.prompt}
          className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          loading="lazy"
          onContextMenu={e => e.preventDefault()}
          draggable={false}
        />
        {/* View-only badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur border border-white/10 text-[10px] text-white/70 font-medium">
          <Eye className="w-3 h-3" />
          View only
        </div>
        {/* Days remaining */}
        <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur border border-primary/20 text-[10px] text-primary font-semibold">
          <Clock className="w-3 h-3" />
          {days}d left
        </div>
      </div>

      {/* Info */}
      <div className="p-5 space-y-3">
        <p className="text-white font-medium line-clamp-2 text-sm leading-snug">
          {gen.title || gen.prompt}
        </p>
        <div className="flex flex-wrap gap-2 text-[10px]">
          {gen.style && (
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60">
              {gen.style}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60">
            {gen.aspectRatio}
          </span>
        </div>

        {/* Creator info */}
        <div className="pt-2 border-t border-white/[0.06]">
          {entry.creatorName ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <User className="w-3 h-3 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{entry.creatorName}</p>
                {entry.contactPublic && entry.creatorContact && (
                  <button
                    onClick={() => setOpen(!open)}
                    className="text-[10px] text-primary hover:text-primary/80 flex items-center gap-1 mt-0.5"
                  >
                    <Mail className="w-3 h-3" />
                    Contact creator
                  </button>
                )}
                {open && entry.creatorContact && (
                  <p className="text-[11px] mt-1.5 px-2 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary/90 font-mono break-all">
                    {entry.creatorContact}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/50 italic">Anonymous creator</p>
          )}
        </div>

        <Link href={`/image/${gen.id}`}>
          <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs font-medium transition-colors mt-1">
            <ExternalLink className="w-3.5 h-3.5" />
            Full view
          </button>
        </Link>
      </div>
    </div>
  );
}

export default function GlassRoom() {
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["glass-room"],
    queryFn: () => api.getGlassRoom(50),
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Glass Room ambient */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-primary/[0.03] blur-[160px] rounded-full" />
        <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-primary/[0.02] to-transparent" />
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* Hero */}
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Glass Room — View Only Exhibition
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            The Glass Room
          </h1>
          <p className="text-muted-foreground text-base max-w-lg mx-auto leading-relaxed">
            A curated exhibition space for the community's finest work. Each piece is displayed for up to 20 days, then returns to the gallery. No downloads — pure viewing.
          </p>
          <div className="mt-6 flex justify-center gap-6 text-sm text-muted-foreground/70">
            <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> View only — no downloads</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 20-day display limit</span>
            <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> Optional creator contact</span>
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-7xl mx-auto px-6 pb-24">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-card/50 h-80 animate-pulse" />
              ))}
            </div>
          ) : entries.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {entries.map(entry => (
                <GlassCard key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <div className="text-center py-28 space-y-4">
              <div className="w-20 h-20 rounded-full glass-panel flex items-center justify-center mx-auto">
                <Eye className="w-8 h-8 text-primary/50" />
              </div>
              <p className="text-lg font-medium text-white/70">The Glass Room is empty.</p>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Submit your best work from Studio AI's image detail page to be featured here.
              </p>
              <a
                href="/studio"
                className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-xl bg-primary/15 border border-primary/25 text-primary text-sm font-semibold hover:bg-primary/25 transition-colors"
              >
                Create in Studio
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
