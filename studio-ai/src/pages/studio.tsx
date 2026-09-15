import { useState } from "react";
import { Layout } from "@/components/layout";
import { 
  useCreateGeneration, 
  useGetGeneration,
  getGetGenerationQueryKey,
  GenerationInputType,
} from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Image as ImageIcon, Video, Wand2, Loader2, Clock, Zap, Film } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GenerationCard } from "@/components/generation-card";

const generateSchema = z.object({
  prompt: z.string().min(5, "Prompt must be at least 5 characters"),
  type: z.enum(["image", "video"]),
  aspectRatio: z.string(),
  style: z.string().optional(),
  model: z.string(),
  negativePrompt: z.string().optional(),
  enhancePrompt: z.boolean().default(false),
  duration: z.string().optional(),
});

const STYLES = [
  "Photorealistic", "Cinematic", "Anime", "Abstract", 
  "Fantasy", "Neon Noir", "Oil Painting", "None"
];

const ASPECT_RATIOS = [
  { label: "1:1 Square", value: "1:1" },
  { label: "16:9 Landscape", value: "16:9" },
  { label: "9:16 Portrait", value: "9:16" },
  { label: "4:3 Classic", value: "4:3" },
];

const VIDEO_DURATIONS = [
  { label: "5 sec",  value: "5s",  description: "1 clip",   clips: 1 },
  { label: "10 sec", value: "10s", description: "1 clip",   clips: 1 },
  { label: "30 sec", value: "30s", description: "3 clips stitched", clips: 3 },
  { label: "60 sec", value: "60s", description: "6 clips stitched", clips: 6 },
];

const VIDEO_ENGINES = [
  {
    value: "kling-2.1",
    label: "Kling 2.1",
    provider: "fal.ai",
    description: "Fast · great motion · ~2 min",
    icon: Zap,
  },
  {
    value: "runway-gen4",
    label: "Runway Gen 4",
    provider: "Runway",
    description: "Cinematic · premium quality · ~3 min",
    icon: Film,
  },
];

export default function Studio() {
  const queryClient = useQueryClient();
  const [activeGenerationId, setActiveGenerationId] = useState<number | null>(null);
  
  const createGeneration = useCreateGeneration();
  
  const { data: activeGeneration } = useGetGeneration(activeGenerationId || 0, {
    query: {
      enabled: !!activeGenerationId,
      queryKey: getGetGenerationQueryKey(activeGenerationId || 0),
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        if (status === "pending" || status === "generating") return 2000;
        return false;
      }
    }
  });

  const form = useForm<z.infer<typeof generateSchema>>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      prompt: "",
      type: "image",
      aspectRatio: "16:9",
      style: "Cinematic",
      model: "kling-2.1",
      negativePrompt: "",
      enhancePrompt: false,
      duration: "5s",
    }
  });

  const watchType = form.watch("type");
  const watchDuration = form.watch("duration");
  const watchModel = form.watch("model");

  const onSubmit = (data: z.infer<typeof generateSchema>) => {
    setActiveGenerationId(null);
    createGeneration.mutate({
      data: {
        ...data,
        type: data.type as GenerationInputType,
        style: data.style === "None" ? null : data.style,
      }
    }, {
      onSuccess: (newGen) => {
        setActiveGenerationId(newGen.id);
        toast.success(data.type === "video" ? "Video generation queued!" : "Generation started!");
      },
      onError: () => toast.error("Failed to start generation")
    });
  };

  const isGenerating = activeGeneration?.status === "pending" || activeGeneration?.status === "generating" || createGeneration.isPending;

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-8 pb-10 h-full">
        {/* Workspace panel */}
        <div className="flex-1 flex flex-col space-y-6">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              Studio Workspace
            </h1>
            <p className="text-muted-foreground">Craft your prompts and fine-tune your settings to generate stunning visuals.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1 flex flex-col">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-[0_0_30px_rgba(0,0,0,0.2)]">
                <CardContent className="p-6 space-y-6">
                  {/* Type Toggle */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Tabs value={field.value} onValueChange={field.onChange} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
                              <TabsTrigger value="image" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                                <ImageIcon className="w-4 h-4 mr-2" /> Image
                              </TabsTrigger>
                              <TabsTrigger value="video" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                                <Video className="w-4 h-4 mr-2" /> Video
                              </TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Video engine + duration — only shown for video type */}
                  {watchType === "video" && (
                    <div className="space-y-4">
                      {/* Engine picker */}
                      <div className="space-y-2">
                        <span className="text-sm font-semibold">Video Engine</span>
                        <div className="grid grid-cols-2 gap-2">
                          {VIDEO_ENGINES.map((eng) => {
                            const Icon = eng.icon;
                            const active = watchModel === eng.value;
                            return (
                              <button
                                key={eng.value}
                                type="button"
                                onClick={() => form.setValue("model", eng.value)}
                                className={`p-3 rounded-xl border text-left transition-all ${
                                  active
                                    ? "border-primary/60 bg-primary/10 text-white shadow-[0_0_12px_rgba(157,78,221,0.2)]"
                                    : "border-border/40 bg-secondary/20 text-muted-foreground hover:border-border/70 hover:text-white"
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <Icon className={`w-3.5 h-3.5 ${active ? "text-primary" : ""}`} />
                                  <span className="text-sm font-bold">{eng.label}</span>
                                  <span className={`text-[10px] ml-auto px-1.5 py-0.5 rounded ${active ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                                    {eng.provider}
                                  </span>
                                </div>
                                <p className="text-[11px] opacity-70">{eng.description}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Duration picker */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="text-sm font-semibold">Duration</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {VIDEO_DURATIONS.map((d) => {
                            const active = watchDuration === d.value;
                            const isLong = d.clips > 1;
                            return (
                              <button
                                key={d.value}
                                type="button"
                                onClick={() => form.setValue("duration", d.value)}
                                className={`p-3 rounded-xl border text-left transition-all ${
                                  active
                                    ? "border-primary/50 bg-primary/10 text-white shadow-[0_0_10px_rgba(157,78,221,0.15)]"
                                    : "border-border/40 bg-secondary/20 text-muted-foreground hover:border-border/70 hover:text-white"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-0.5">
                                  <p className="text-sm font-bold">{d.label}</p>
                                  {isLong && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">
                                      {d.clips}× clips
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs opacity-70">{d.description}</p>
                              </button>
                            );
                          })}
                        </div>
                        {(watchDuration === "30s" || watchDuration === "60s") && (
                          <p className="text-xs text-amber-400/70 flex items-center gap-1.5">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                            {watchDuration === "60s" ? "6 clips generated & stitched — uses 6× credits, ~15–25 min" : "3 clips generated & stitched — uses 3× credits, ~8–12 min"}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Main Prompt */}
                  <FormField
                    control={form.control}
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center mb-2">
                          <FormLabel className="text-base font-semibold">Prompt</FormLabel>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => form.setValue("enhancePrompt", !form.getValues("enhancePrompt"))}
                            data-active={form.getValues("enhancePrompt")}
                          >
                            <Wand2 className={`w-4 h-4 mr-2 ${form.getValues("enhancePrompt") ? "text-primary" : "text-muted-foreground"}`} />
                            <span className={form.getValues("enhancePrompt") ? "text-primary font-medium" : "text-muted-foreground"}>
                              Auto-Enhance
                            </span>
                          </Button>
                        </div>
                        <FormControl>
                          <Textarea 
                            placeholder={watchType === "video"
                              ? "A slow aerial push over a neon-drenched Tokyo skyline at midnight, rain streaking neon reflections across glass towers, cinematic lens flare, 24fps film grain..."
                              : "A vast cinematic landscape of a futuristic neon city under heavy rain, volumetric light shafts, ultra-detailed, 8K..."
                            }
                            className="min-h-[160px] resize-y text-base bg-background/50 border-primary/20 focus-visible:ring-primary shadow-inner"
                            {...field} 
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground/60 mt-1">No character limit — describe in as much detail as you like.</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Settings Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="aspectRatio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Aspect Ratio</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background/50">
                                <SelectValue placeholder="Select ratio" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ASPECT_RATIOS.map(ratio => (
                                <SelectItem key={ratio.value} value={ratio.value}>{ratio.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="style"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Style Preset</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background/50">
                                <SelectValue placeholder="Select style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {STYLES.map(style => (
                                <SelectItem key={style} value={style}>{style}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="negativePrompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Negative Prompt</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="ugly, blurry, low quality, bad anatomy..." 
                            className="bg-background/50"
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(157,78,221,0.4)] mt-auto"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    {watchType === "video" ? "Queuing video..." : "Generating..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 mr-2" />
                    {watchType === "video" ? "Generate Video" : "Generate Image"}
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>

        {/* Output Panel */}
        <div className="lg:w-[450px] xl:w-[500px] flex flex-col">
          <div className="sticky top-6 space-y-4">
            <h2 className="text-xl font-display font-semibold px-1">Output</h2>
            
            <div className="bg-card/30 border border-border/50 rounded-2xl min-h-[400px] flex items-center justify-center p-4 relative overflow-hidden shadow-lg">
              {activeGeneration ? (
                <div className="w-full animate-in fade-in zoom-in duration-500">
                  <GenerationCard generation={activeGeneration} />
                  
                  {activeGeneration.status === "completed" && (
                    <div className="mt-4 space-y-2 p-4 bg-secondary/20 rounded-xl border border-border/50">
                      <p className="text-xs font-mono text-muted-foreground break-words line-clamp-3">
                        <span className="text-primary font-semibold">Prompt:</span> {activeGeneration.enhancedPrompt || activeGeneration.prompt}
                      </p>
                      <div className="flex gap-2 text-[10px] text-muted-foreground font-mono">
                        <span className="px-2 py-1 bg-background/50 rounded">{activeGeneration.model}</span>
                        <span className="px-2 py-1 bg-background/50 rounded">{activeGeneration.aspectRatio}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-4 text-muted-foreground/50">
                  <ImageIcon className="w-16 h-16 mx-auto opacity-20" />
                  <p>Your generation will appear here.</p>
                </div>
              )}

              {isGenerating && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(157,78,221,0.3)_360deg)] animate-[spin_3s_linear_infinite]" />
                  <div className="absolute inset-[2px] bg-card rounded-2xl" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
