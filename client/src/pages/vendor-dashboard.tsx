import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import AppBar from "@/components/layout/app-bar";
import Sidebar from "@/components/layout/sidebar";
import StatsCards from "@/components/vendor/stats-cards";
import OrdersTable from "@/components/vendor/orders-table";
import MenuManagement from "@/components/vendor/menu-management";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function VendorDashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: vendor } = useQuery({
    queryKey: ["/api/vendors/my"],
    retry: false,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders/vendor", vendor?.id],
    enabled: !!vendor?.id,
    retry: false,
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ["/api/menu-items", vendor?.id],
    enabled: !!vendor?.id,
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

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Vendor Profile Required</h2>
          <p className="text-gray-600 mb-4">You need to set up your vendor profile first.</p>
          <Button className="bg-primary hover:bg-primary-dark text-white">
            Set Up Vendor Profile
          </Button>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { label: "Dashboard", icon: "dashboard", active: true },
    { label: "Menu Management", icon: "restaurant_menu" },
    { label: "Orders", icon: "receipt_long" },
    { label: "Analytics", icon: "analytics" },
    { label: "Settings", icon: "settings" },
  ];

  return (
    <div className="min-h-screen bg-surface-variant">
      <AppBar 
        title="DeliveryHub"
        userRole="Vendor Portal"
        actions={
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full px-2 py-1">
                5
              </span>
            </Button>
          </div>
        }
      />

      <div className="flex">
        <Sidebar items={sidebarItems} />

        <main className="flex-1 p-6">
          <StatsCards orders={orders} />
          
          <div className="mb-8">
            <OrdersTable orders={orders} />
          </div>

          <MenuManagement menuItems={menuItems} vendorId={vendor.id} />
        </main>
      </div>
    </div>
  );
}
