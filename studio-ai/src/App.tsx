import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/dashboard";
import Gallery from "@/pages/gallery";
import Collections from "@/pages/collections";
import Studio from "@/pages/studio";
import ImageDetail from "@/pages/image-detail";
import CollectionDetail from "@/pages/collection-detail";
import Galleri from "@/pages/galleri";
import { Layout } from "@/components/layout";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/studio" component={Studio} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/gallery/:id" component={ImageDetail} />
      <Route path="/collections" component={Collections} />
      <Route path="/collections/:id" component={CollectionDetail} />
      <Route path="/galleri" component={Galleri} />
      <Route component={() => <Layout><div className="p-8 text-center"><h1 className="text-2xl font-bold">404 Not Found</h1></div></Layout>} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster theme="dark" position="bottom-right" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;