import { Layout } from "@/components/layout";
import { useParams, useLocation } from "wouter";
import { 
  useGetGeneration, 
  getGetGenerationQueryKey,
  useUpdateGeneration,
  useDeleteGeneration,
  useCreateVariation,
  useListCollections,
  useAddToCollection,
  getListCollectionsQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Heart, Trash2, Wand2, Plus, Download, Share2, Info, Tag } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageBadge, BadgeEditor } from "@/components/image-badge";

export default function ImageDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: generation, isLoading } = useGetGeneration(Number(id), {
    query: {
      enabled: !!id,
      queryKey: getGetGenerationQueryKey(Number(id))
    }
  });

  const { data: collections } = useListCollections({
    query: { queryKey: getListCollectionsQueryKey() }
  });

  const updateGeneration = useUpdateGeneration();
  const deleteGeneration = useDeleteGeneration();
  const createVariation = useCreateVariation();
  const addToCollection = useAddToCollection();

  const handleFavorite = () => {
    if (!generation) return;
    updateGeneration.mutate({
      id: generation.id,
      data: { isFavorite: !generation.isFavorite }
    }, {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetGenerationQueryKey(generation.id), data);
        toast.success(data.isFavorite ? "Added to favorites" : "Removed from favorites");
      }
    });
  };

  const handleDelete = () => {
    if (!generation) return;
    deleteGeneration.mutate({ id: generation.id }, {
      onSuccess: () => {
        toast.success("Generation deleted");
        setLocation("/gallery");
      }
    });
  };

  const handleVariation = () => {
    if (!generation) return;
    createVariation.mutate({
      id: generation.id,
      data: {
        prompt: generation.prompt,
        aspectRatio: generation.aspectRatio,
        style: generation.style
      }
    }, {
      onSuccess: (newGen) => {
        toast.success("Started new variation");
        setLocation(`/gallery/${newGen.id}`);
      }
    });
  };

  const handleAddToCollection = (collectionId: number) => {
    if (!generation) return;
    addToCollection.mutate({
      id: collectionId,
      data: { generationId: generation.id }
    }, {
      onSuccess: () => toast.success("Added to collection")
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-32" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="w-full aspect-video rounded-xl" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!generation) {
    return (
      <Layout>
        <div className="text-center py-20">Generation not found.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => window.history.back()} className="hover:bg-secondary/50">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleFavorite} className={generation.isFavorite ? "text-primary border-primary/50 bg-primary/10" : ""}>
              <Heart className={`w-4 h-4 mr-2 ${generation.isFavorite ? "fill-current" : ""}`} />
              {generation.isFavorite ? "Favorited" : "Favorite"}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" /> Add to Collection
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card border-border/50">
                {collections?.length ? (
                  collections.map(c => (
                    <DropdownMenuItem key={c.id} onClick={() => handleAddToCollection(c.id)}>
                      {c.name}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground text-center">No collections found</div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-destructive/20">
                <DialogHeader>
                  <DialogTitle>Delete Generation?</DialogTitle>
                </DialogHeader>
                <p className="text-muted-foreground">This action cannot be undone. This generation will be permanently removed.</p>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={deleteGeneration.isPending}>
                    {deleteGeneration.isPending ? "Deleting..." : "Delete Permanently"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Visual */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl overflow-hidden bg-black/50 border border-border/50 shadow-2xl flex items-center justify-center min-h-[500px] relative">
              {generation.imageUrl ? (
                <img 
                  src={generation.imageUrl} 
                  alt={generation.prompt}
                  className="w-full h-auto object-contain max-h-[800px]"
                />
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  Media unavailable
                </div>
              )}
              {/* Badge sticker overlay */}
              {generation.badgeName && (
                <div className="absolute bottom-3 left-3">
                  <ImageBadge name={generation.badgeName} link={generation.badgeLink} />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden shadow-lg">
              <div className="p-4 border-b border-border/50 bg-secondary/30 flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" /> Prompt Details
                </h3>
                <Button size="sm" variant="secondary" onClick={handleVariation} disabled={createVariation.isPending}>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Vary
                </Button>
              </div>
              <ScrollArea className="h-[200px] p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Final Prompt</h4>
                    <p className="text-sm font-mono leading-relaxed">{generation.enhancedPrompt || generation.prompt}</p>
                  </div>
                  {generation.enhancedPrompt && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Original Prompt</h4>
                      <p className="text-sm font-mono leading-relaxed opacity-70">{generation.prompt}</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 shadow-lg space-y-4">
              <h3 className="font-semibold border-b border-border/50 pb-2 mb-2">Metadata</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs">Model</span>
                  <span className="font-medium">{generation.model}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Aspect Ratio</span>
                  <span className="font-medium">{generation.aspectRatio}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Style</span>
                  <span className="font-medium">{generation.style || "None"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Created</span>
                  <span className="font-medium">{format(new Date(generation.createdAt), "MMM d, yyyy")}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Type</span>
                  <Badge variant="secondary" className="capitalize mt-1 bg-secondary/50">{generation.type}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Status</span>
                  <Badge variant={generation.status === "completed" ? "default" : "destructive"} className="capitalize mt-1">
                    {generation.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Name Badge editor */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden shadow-lg">
              <div className="p-4 border-b border-border/50 bg-secondary/30 flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Name Badge</h3>
                {generation.badgeName && (
                  <div className="ml-auto">
                    <ImageBadge name={generation.badgeName} link={generation.badgeLink} />
                  </div>
                )}
              </div>
              <div className="p-4">
                <BadgeEditor
                  currentName={generation.badgeName}
                  currentLink={generation.badgeLink}
                  isSaving={updateGeneration.isPending}
                  onSave={(name, link) => {
                    updateGeneration.mutate(
                      { id: generation.id, data: { badgeName: name, badgeLink: link } },
                      {
                        onSuccess: (data) => {
                          queryClient.setQueryData(getGetGenerationQueryKey(generation.id), data);
                          toast.success("Badge updated");
                        },
                      }
                    );
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1" variant="outline" onClick={() => window.open(generation.imageUrl || '', '_blank')}>
                <Download className="w-4 h-4 mr-2" /> Download
              </Button>
              <Button className="flex-1" variant="outline" onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied to clipboard");
              }}>
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}