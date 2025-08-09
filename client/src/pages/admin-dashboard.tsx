import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import AppBar from "@/components/layout/app-bar";
import Sidebar from "@/components/layout/sidebar";
import UserManagement from "@/components/admin/user-management";
import DeliveryAssignment from "@/components/admin/delivery-assignment";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Store, Truck, Receipt } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: stats } = useQuery({
    queryKey: ["/api/analytics/stats"],
    retry: false,
  });

  const { data: unassignedOrders = [] } = useQuery({
    queryKey: ["/api/orders/unassigned"],
    refetchInterval: 10000,
    retry: false,
  });

  const { data: availableDrivers = [] } = useQuery({
    queryKey: ["/api/drivers/available"],
    refetchInterval: 10000,
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

  const sidebarItems = [
    { label: "Overview", icon: "dashboard", active: true },
    { label: "User Management", icon: "people" },
    { label: "Delivery Management", icon: "local_shipping" },
    { label: "Analytics", icon: "analytics" },
    { label: "System Settings", icon: "settings" },
  ];

  return (
    <div className="min-h-screen bg-surface-variant">
      <AppBar 
        title="DeliveryHub Admin"
        userRole="Administrator"
      />

      <div className="flex">
        <Sidebar items={sidebarItems} />

        <main className="flex-1 p-6">
          {/* System Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-surface shadow-material">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-primary bg-opacity-10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface shadow-material">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-success bg-opacity-10 rounded-lg">
                    <Store className="h-6 w-6 text-success" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Active Vendors</p>
                    <p className="text-2xl font-bold">{stats?.activeVendors || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface shadow-material">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-warning bg-opacity-10 rounded-lg">
                    <Truck className="h-6 w-6 text-warning" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Active Drivers</p>
                    <p className="text-2xl font-bold">{stats?.activeDrivers || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface shadow-material">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-secondary bg-opacity-10 rounded-lg">
                    <Receipt className="h-6 w-6 text-secondary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Today's Orders</p>
                    <p className="text-2xl font-bold">{stats?.todayOrders || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Management */}
          <div className="mb-8">
            <UserManagement />
          </div>

          {/* Delivery Assignment */}
          <DeliveryAssignment 
            unassignedOrders={unassignedOrders}
            availableDrivers={availableDrivers}
          />
        </main>
      </div>
    </div>
  );
}
