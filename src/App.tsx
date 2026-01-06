import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import Index from "./pages/Index";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <ScrollToTop />
        <Index />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
