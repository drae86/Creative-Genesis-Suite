import { Generation } from "@workspace/api-client-react";
import { Link } from "wouter";
import { AspectRatio } from "./ui/aspect-ratio";
import { Badge } from "./ui/badge";
import { Heart, Sparkles, Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function GenerationCard({ generation }: { generation: Generation }) {
  const [w, h] = generation.aspectRatio.split(":").map(Number);
  const ratio = w / h || 1;

  const isPending = generation.status === "pending" || generation.status === "generating";
  const isFailed = generation.status === "failed";

  return (
    <Link href={`/gallery/${generation.id}`}>
      <div className="group relative rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(157,78,221,0.2)]">
        <AspectRatio ratio={ratio}>
          {isPending ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              <Sparkles className="w-8 h-8 text-primary animate-pulse mb-3" />
              <span className="text-sm font-medium text-muted-foreground animate-pulse">Generating...</span>
            </div>
          ) : isFailed ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-destructive/10 text-destructive p-4 text-center">
              <AlertCircle className="w-8 h-8 mb-3 opacity-80" />
              <span className="text-sm font-medium">Generation Failed</span>
            </div>
          ) : (
            <div className="relative w-full h-full">
              {generation.type === "video" ? (
                <video
                  src={generation.imageUrl || generation.thumbnailUrl || ""}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={generation.imageUrl || generation.thumbnailUrl || ""}
                  alt={generation.prompt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {generation.type === "video" && (
                <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[10px] font-mono text-violet-300 border border-violet-500/30">
                  VIDEO
                </div>
              )}
            </div>
          )}
        </AspectRatio>

        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex flex-col gap-2">
          <p className="text-xs text-white/90 line-clamp-2 drop-shadow-md">
            {generation.prompt}
          </p>
          <div className="flex items-center justify-between mt-1">
            <Badge variant="secondary" className="bg-black/50 text-white border-none backdrop-blur-md text-[10px]">
              {generation.model}
            </Badge>
            <div className="flex items-center gap-2 text-white/70">
              {generation.isFavorite && <Heart className="w-3.5 h-3.5 fill-current text-primary" />}
              <span className="text-[10px] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(generation.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}