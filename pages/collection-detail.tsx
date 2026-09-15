import { Layout } from "@/components/layout";
import { useParams, useLocation } from "wouter";
import { 
  useGetCollection, 
  getGetCollectionQueryKey,
  useDeleteCollection,
  useRemoveFromCollection
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Trash2, FolderOpen, ImageMinus } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { GenerationCard } from "@/components/generation-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";

export default function CollectionDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: collection, isLoading } = useGetCollection(Number(id), {
    query: {
      enabled: !!id,
      queryKey: getGetCollectionQueryKey(Number(id))
    }
  });

  const deleteCollection = useDeleteCollection();
  const removeFromCollection = useRemoveFromCollection();

  const handleDelete = () => {
    if (!collection) return;
    deleteCollection.mutate({ id: collection.id }, {
      onSuccess: () => {
        toast.success("Collection deleted");
        setLocation("/collections");
      }
    });
  };

  const handleRemoveItem = (generationId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!collection) return;
    
    removeFromCollection.mutate({
      id: collection.id,
      generationId
    }, {
      onSuccess: () => {
        toast.success("Removed from collection");
        queryClient.invalidateQueries({ queryKey: getGetCollectionQueryKey(collection.id) });
      }
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-32" />
          <div className="h-40 bg-secondary/20 rounded-2xl flex items-center p-8">
            <div className="space-y-4 w-full">
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="w-full aspect-square rounded-xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!collection) {
    return (
      <Layout>
        <div className="text-center py-20">Collection not found.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 pb-10">
        <Button variant="ghost" onClick={() => window.history.back()} className="hover:bg-secondary/50 -ml-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Collections
        </Button>

        <div className="relative overflow-hidden rounded-3xl bg-card border border-border/50 shadow-lg min-h-[200px] flex flex-col justify-end p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-background to-background z-0" />
          
          <div className="relative z-10 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-3 mb-2 text-primary">
                <FolderOpen className="w-6 h-6" />
                <span className="font-semibold tracking-wider uppercase text-sm">Collection</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">{collection.name}</h1>
              {collection.description && (
                <p className="text-muted-foreground text-lg max-w-2xl">{collection.description}</p>
              )}
              <p className="text-sm font-medium mt-4">
                {collection.generations?.length || 0} items
              </p>
            </div>

            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-destructive/20 text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Collection
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-destructive/20">
                <DialogHeader>
                  <DialogTitle>Delete Collection?</DialogTitle>
                </DialogHeader>
                <p className="text-muted-foreground">This will only delete the collection, not the generated images inside it.</p>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={deleteCollection.isPending}>
                    {deleteCollection.isPending ? "Deleting..." : "Delete"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {collection.generations && collection.generations.length > 0 ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {collection.generations.map((gen) => (
              <div key={gen.id} className="break-inside-avoid relative group">
                <GenerationCard generation={gen} />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-full shadow-md z-10"
                  onClick={(e) => handleRemoveItem(gen.id, e)}
                  title="Remove from collection"
                >
                  <ImageMinus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card/20 rounded-3xl border border-dashed border-border/50">
            <FolderOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">This collection is empty</h3>
            <p className="text-muted-foreground">
              Add generations from the gallery or the studio to see them here.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}