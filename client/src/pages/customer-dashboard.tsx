import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import AppBar from "@/components/layout/app-bar";
import RestaurantCard from "@/components/customer/restaurant-card";
import OrderHistory from "@/components/customer/order-history";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function CustomerDashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: vendors = [], isLoading: vendorsLoading } = useQuery({
    queryKey: ["/api/vendors"],
    retry: false,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders/customer"],
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-variant">
      <AppBar 
        title="DeliveryHub"
        userRole="Customer"
        actions={
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full px-2 py-1">
                0
              </span>
            </Button>
          </div>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input 
                type="text" 
                placeholder="Search restaurants..." 
                className="w-full px-4 py-3"
              />
            </div>
            <Button className="bg-primary hover:bg-primary-dark text-white">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {vendorsLoading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface rounded-lg shadow-material p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))
          ) : vendors.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No restaurants available at the moment.</p>
            </div>
          ) : (
            vendors.map((vendor: any) => (
              <RestaurantCard key={vendor.id} vendor={vendor} />
            ))
          )}
        </div>

        {/* Recent Orders */}
        <OrderHistory orders={orders} isLoading={ordersLoading} />
      </main>
    </div>
  );
}
