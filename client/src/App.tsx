import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { CartProvider } from "@/components/customer/cart-context";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import CustomerDashboard from "@/pages/customer-dashboard";
import VendorDashboard from "@/pages/vendor-dashboard";
import DriverDashboard from "@/pages/driver-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <CartProvider>
          <Route path="/" component={CustomerDashboard} />
          <Route path="/vendor" component={VendorDashboard} />
          <Route path="/driver" component={DriverDashboard} />
          <Route path="/admin" component={AdminDashboard} />
        </CartProvider>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
