import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { api } from "@/lib/api";
import { Navbar } from "@/components/navbar";
import { ArrowLeft, Clock, Layers } from "lucide-react";

export default function Lightbox() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const id = parseInt(params.id || "0", 10);

  const { data: gen, isLoading } = useQuery({
    queryKey: ["generation", id],
    queryFn: () => api.getGeneration(id),
    enabled: !!id,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-white text-sm transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to gallery
        </button>

        {isLoading ? (
          <div className="rounded-2xl bg-card animate-pulse h-[70vh]" />
        ) : gen ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="rounded-2xl overflow-hidden border border-white/[0.07] shadow-2xl">
              <img src={gen.imageUrl || ""} alt={gen.title || gen.prompt} className="w-full block" />
            </div>
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{gen.title || "Untitled"}</h1>
                <p className="text-muted-foreground text-sm leading-relaxed">{gen.enhancedPrompt || gen.prompt}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Style", value: gen.style || "None" },
                  { label: "Ratio", value: gen.aspectRatio },
                  { label: "Model", value: gen.model },
                  { label: "Type", value: gen.type },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded-xl bg-card border border-white/[0.06]">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-sm font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
              {gen.notes && (
                <div className="p-4 rounded-xl bg-card border border-white/[0.06]">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> Notes
                  </p>
                  <p className="text-sm text-white/80 leading-relaxed">{gen.notes}</p>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                <Clock className="w-3.5 h-3.5" />
                {new Date(gen.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-24 text-muted-foreground">Image not found.</div>
        )}
      </div>
    </div>
  );
}
