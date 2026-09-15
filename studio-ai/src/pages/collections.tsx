import { useState } from "react";
import { Layout } from "@/components/layout";
import { 
  useListCollections, 
  getListCollectionsQueryKey,
  useCreateCollection
} from "@workspace/api-client-react";
import { Link } from "wouter";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FolderPlus, Image as ImageIcon, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const createCollectionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional()
});

export default function Collections() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  
  const { data: collections, isLoading } = useListCollections({
    query: { queryKey: getListCollectionsQueryKey() }
  });

  const createCollection = useCreateCollection();

  const form = useForm<z.infer<typeof createCollectionSchema>>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: { name: "", description: "" }
  });

  const onSubmit = (data: z.infer<typeof createCollectionSchema>) => {
    createCollection.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCollectionsQueryKey() });
        setOpen(false);
        form.reset();
        toast.success("Collection created");
      },
      onError: () => toast.error("Failed to create collection")
    });
  };

  return (
    <Layout>
      <div className="space-y-8 pb-10">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">Collections</h1>
            <p className="text-muted-foreground">Organize your generations into themed albums.</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(157,78,221,0.3)]">
                <FolderPlus className="w-5 h-5 mr-2" />
                New Collection
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card border-primary/20 shadow-[0_0_40px_rgba(157,78,221,0.1)]">
              <DialogHeader>
                <DialogTitle>Create Collection</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Name</Label>
                        <FormControl>
                          <Input placeholder="e.g. Cyberpunk Cityscapes" {...field} className="bg-background/50 focus-visible:ring-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Description (optional)</Label>
                        <FormControl>
                          <Textarea placeholder="What's this collection about?" {...field} className="bg-background/50 focus-visible:ring-primary" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="pt-4">
                    <Button type="submit" disabled={createCollection.isPending} className="bg-primary hover:bg-primary/90">
                      {createCollection.isPending ? "Creating..." : "Create Collection"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="w-full aspect-square rounded-2xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : collections && collections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {collections.map((collection) => (
              <Link key={collection.id} href={`/collections/${collection.id}`}>
                <div className="group cursor-pointer">
                  <div className="relative rounded-2xl overflow-hidden bg-secondary/30 border border-border/50 group-hover:border-primary/50 transition-all duration-300 aspect-square mb-4 shadow-sm group-hover:shadow-[0_0_20px_rgba(157,78,221,0.15)]">
                    {collection.coverImageUrl ? (
                      <img 
                        src={collection.coverImageUrl} 
                        alt={collection.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-card">
                        <FolderPlus className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="font-display font-semibold text-lg truncate group-hover:text-primary transition-colors">
                    {collection.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card/20 rounded-3xl border border-dashed border-border/50">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <FolderPlus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">No collections yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create a collection to organize your favorite generations, moodboards, and projects.
            </p>
            <Button onClick={() => setOpen(true)} variant="outline" className="border-primary/20 hover:bg-primary/10">
              Create First Collection
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}