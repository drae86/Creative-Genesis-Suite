import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Image, Video, Globe, Zap, Infinity, Shield, Star } from "lucide-react";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const features = [
  { icon: Infinity, title: "Unlimited generations", description: "No daily cap — generate as many images and videos as you need" },
  { icon: Image, title: "4K resolution output", description: "Every image at maximum quality, pixel-perfect for print and display" },
  { icon: Video, title: "Extended video durations", description: "Create videos from 30 seconds up to 12 minutes in a single prompt" },
  { icon: Zap, title: "Priority processing", description: "Your generations jump the queue — results in seconds, not minutes" },
  { icon: Globe, title: "gAllerI featured creator", description: "Your work gets pinned to the top of the community gallery each week" },
  { icon: Shield, title: "Glass Room access", description: "Submit up to 10 works monthly to the exclusive Glass Room exhibition" },
];

export function UpgradeDialog({ open, onOpenChange }: UpgradeDialogProps) {
  const [joined, setJoined] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[#0d0d12] border border-primary/20 shadow-[0_0_60px_rgba(157,78,221,0.15)] p-0 overflow-hidden">
        {/* Header glow */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
        <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />

        <div className="relative p-8">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shadow-[0_0_15px_rgba(157,78,221,0.3)]">
                <Star className="w-5 h-5 text-primary fill-primary/30" />
              </div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-primary/80 bg-clip-text text-transparent">
                Membership
              </DialogTitle>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              ProStudio AI Membership unlocks the full creative power of the platform — unlimited generations, maximum quality, and exclusive exhibition access.
            </p>
          </DialogHeader>

          <div className="space-y-3 mb-7">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-primary/15 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <f.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.description}</p>
                </div>
              </div>
            ))}
          </div>

          {!joined ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground text-center">Join the waitlist — Membership is launching soon.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
                  data-testid="upgrade-email"
                />
                <Button
                  onClick={() => { if (email.includes("@")) setJoined(true); }}
                  className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-[0_0_15px_rgba(157,78,221,0.4)] px-5"
                  data-testid="upgrade-join"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Join
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(157,78,221,0.3)]">
                <Star className="w-6 h-6 text-primary fill-primary/50" />
              </div>
              <p className="font-semibold text-white">You're on the list.</p>
              <p className="text-xs text-muted-foreground">We'll reach out as soon as Pro launches. Keep creating.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
