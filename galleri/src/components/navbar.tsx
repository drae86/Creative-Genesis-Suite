import { Link, useLocation } from "wouter";
import { ExternalLink } from "lucide-react";

export function Navbar() {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/">
          <span className="text-2xl font-bold tracking-tight cursor-pointer select-none">
            g<span className="text-primary font-extrabold">A</span>ller<span className="text-primary font-extrabold">I</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <Link href="/">
            <span className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              location === "/" 
                ? "bg-primary/10 text-primary border border-primary/20" 
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            }`}>
              Gallery
            </span>
          </Link>
          <Link href="/glass-room">
            <span className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              location === "/glass-room"
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              Glass Room
            </span>
          </Link>
          <a
            href="/studio"
            className="ml-3 px-4 py-2 rounded-lg text-sm font-semibold bg-primary/15 border border-primary/25 text-primary hover:bg-primary/25 transition-colors flex items-center gap-1.5"
          >
            Open Studio
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </nav>
      </div>
    </header>
  );
}
