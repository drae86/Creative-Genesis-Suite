import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageBadgeProps {
  name: string | null | undefined;
  link: string | null | undefined;
  className?: string;
}

export function ImageBadge({ name, link, className }: ImageBadgeProps) {
  const [hovered, setHovered] = useState(false);

  if (!name) return null;

  const displayName = name === "anon" || name === "Anon" ? "Anon" : name;
  const isAnon = displayName === "Anon";

  const inner = (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide",
        "border backdrop-blur-md shadow-lg transition-all duration-200",
        isAnon
          ? "bg-black/40 border-white/10 text-white/50"
          : "bg-black/50 border-primary/30 text-primary/90",
        link && !isAnon && "hover:border-primary/60 hover:text-primary cursor-pointer",
        hovered && !isAnon && link && "bg-primary/15",
        className
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {isAnon ? (
        <>
          <span className="opacity-50 text-[9px]">◈</span>
          <span>anon</span>
        </>
      ) : (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0" />
          <span>{displayName}</span>
          {link && <ExternalLink className="w-2.5 h-2.5 opacity-60" />}
        </>
      )}
    </span>
  );

  if (link && !isAnon) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }

  return inner;
}

interface BadgeEditorProps {
  currentName: string | null | undefined;
  currentLink: string | null | undefined;
  onSave: (name: string | null, link: string | null) => void;
  isSaving?: boolean;
}

export function BadgeEditor({ currentName, currentLink, onSave, isSaving }: BadgeEditorProps) {
  const [mode, setMode] = useState<"none" | "anon" | "named">(
    !currentName ? "none" : currentName === "Anon" || currentName === "anon" ? "anon" : "named"
  );
  const [name, setName] = useState(
    currentName && currentName !== "Anon" && currentName !== "anon" ? currentName : ""
  );
  const [link, setLink] = useState(currentLink ?? "");

  const handleSave = () => {
    if (mode === "none") {
      onSave(null, null);
    } else if (mode === "anon") {
      onSave("Anon", null);
    } else {
      onSave(name.trim() || null, link.trim() || null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Mode tabs */}
      <div className="flex gap-1.5 p-0.5 rounded-lg bg-secondary/30 border border-border/30">
        {(["none", "anon", "named"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "flex-1 text-[11px] font-medium py-1.5 rounded-md transition-all duration-150 capitalize",
              mode === m
                ? "bg-primary/15 text-primary border border-primary/25 shadow-sm"
                : "text-muted-foreground hover:text-foreground/70"
            )}
          >
            {m === "none" ? "No badge" : m === "anon" ? "◈ Anon" : "Named"}
          </button>
        ))}
      </div>

      {mode === "named" && (
        <div className="space-y-2">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1 block">
              Display name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="your name or handle"
              maxLength={32}
              className="w-full text-sm bg-secondary/30 border border-border/40 rounded-lg px-3 py-2 focus:outline-none focus:border-primary/40 focus:bg-secondary/50 transition-colors placeholder:text-muted-foreground/40"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1 block">
              Link <span className="normal-case opacity-60">(optional)</span>
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              className="w-full text-sm bg-secondary/30 border border-border/40 rounded-lg px-3 py-2 focus:outline-none focus:border-primary/40 focus:bg-secondary/50 transition-colors placeholder:text-muted-foreground/40"
            />
          </div>
        </div>
      )}

      {mode === "anon" && (
        <p className="text-[11px] text-muted-foreground/50 px-1">
          Badge shows as <span className="font-mono">◈ anon</span> — no name or link attached.
        </p>
      )}

      {/* Preview */}
      {mode !== "none" && (
        <div className="flex items-center gap-2 px-1">
          <span className="text-[10px] text-muted-foreground/50">Preview:</span>
          <ImageBadge
            name={mode === "anon" ? "Anon" : name || "your name"}
            link={mode === "named" ? (link || null) : null}
          />
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={isSaving || (mode === "named" && !name.trim())}
        className={cn(
          "w-full py-2 rounded-lg text-xs font-semibold transition-all duration-150",
          "bg-primary/15 hover:bg-primary/25 border border-primary/25 hover:border-primary/40 text-primary",
          "disabled:opacity-40 disabled:cursor-not-allowed"
        )}
      >
        {isSaving ? "Saving…" : "Save Badge"}
      </button>
    </div>
  );
}
