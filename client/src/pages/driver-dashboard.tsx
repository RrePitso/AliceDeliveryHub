import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import DriverStats from "@/components/driver/driver-stats";
import DeliveryCard from "@/components/driver/delivery-card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import { Phone, CheckCircle, User, History, Wallet, Home } from "lucide-react";

export default function DriverDashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(false);

  const { data: driver } = useQuery({
    queryKey: ["/api/drivers/my"],
    retry: false,
  });

  const { data: unassignedOrders = [] } = useQuery({
    queryKey: ["/api/orders/unassigned"],
    refetchInterval: 10000, // Poll every 10 seconds
    retry: false,
  });

  const { data: driverOrders = [] } = useQuery({
    queryKey: ["/api/orders/driver"],
    refetchInterval: 5000, // Poll every 5 seconds
    retry: false,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (isOnline: boolean) => {
      await apiRequest("PUT", "/api/drivers/status", { isOnline });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/my"] });
      toast({
        title: "Status Updated",
        description: `You are now ${isOnline ? "online" : "offline"}`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    },
  });

  const acceptDeliveryMutation = useMutation({
    mutationFn: async (orderId: string) => {
      await apiRequest("PUT", `/api/orders/${orderId}/status`, {
        status: "picked_up",
        driverId: driver?.userId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/unassigned"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/driver"] });
      toast({
        title: "Delivery Accepted",
        description: "You have accepted this delivery",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to accept delivery",
        variant: "destructive",
      });
    },
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

  useEffect(() => {
    if (driver) {
      setIsOnline(driver.isOnline);
    }
  }, [driver]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Driver Profile Required</h2>
          <p className="text-gray-600 mb-4">You need to set up your driver profile first.</p>
          <Button className="bg-primary hover:bg-primary-dark text-white">
            Set Up Driver Profile
          </Button>
        </div>
      </div>
    );
  }

  const handleToggleOnline = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    updateStatusMutation.mutate(newStatus);
  };

  const activeDelivery = driverOrders.find((order: any) => 
    order.status === "picked_up" || order.status === "ready"
  );

  const recentDeliveries = driverOrders.filter((order: any) => 
    order.status === "delivered"
  ).slice(0, 5);

  return (
    <div className="min-h-screen bg-surface-variant pb-20">
      {/* Header */}
      <header className="bg-surface shadow-material border-b sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-lg font-bold text-primary">DeliveryHub Driver</h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={isOnline}
                  onCheckedChange={handleToggleOnline}
                  disabled={updateStatusMutation.isPending}
                />
                <span className="text-sm font-medium">
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Driver Stats */}
        <DriverStats driver={driver} />

        {/* Active Delivery */}
        {activeDelivery && (
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Active Delivery</h2>
            <div className="bg-surface rounded-lg shadow-material p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium">{activeDelivery.vendor?.name || "Restaurant"}</h3>
                  <p className="text-sm text-gray-600">Order #{activeDelivery.id.slice(0, 8)}</p>
                </div>
                <span className="px-3 py-1 bg-warning text-white text-sm rounded-full">
                  {activeDelivery.status === "picked_up" ? "In Transit" : "Ready"}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                    activeDelivery.status === "picked_up" ? "bg-success" : "bg-gray-300"
                  }`}>
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm">Picked up from restaurant</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                    activeDelivery.status === "picked_up" ? "bg-primary" : "bg-gray-300"
                  }`}>
                    <span className="material-icons text-white text-sm">local_shipping</span>
                  </div>
                  <span className="text-sm">En route to customer</span>
                </div>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Customer Address:</span>
                </div>
                <p className="text-sm mb-3">{activeDelivery.deliveryAddress}</p>
                
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    disabled={!activeDelivery.customerPhone}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Customer
                  </Button>
                  <Button 
                    className="flex-1 bg-success hover:bg-green-600 text-white"
                    onClick={() => {
                      // Mark as delivered
                      acceptDeliveryMutation.mutate(activeDelivery.id);
                    }}
                  >
                    Mark Delivered
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Available Deliveries */}
        {isOnline && (
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Available Deliveries</h2>
            
            {unassignedOrders.length === 0 ? (
              <div className="bg-surface rounded-lg shadow-material p-6 text-center">
                <p className="text-gray-500">No deliveries available at the moment.</p>
                <p className="text-sm text-gray-400 mt-2">
                  We'll notify you when new orders are ready for pickup.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {unassignedOrders.map((delivery: any) => (
                  <DeliveryCard
                    key={delivery.id}
                    delivery={delivery}
                    onAccept={() => acceptDeliveryMutation.mutate(delivery.id)}
                    isAccepting={acceptDeliveryMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent Deliveries */}
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Recent Deliveries</h2>
          
          {recentDeliveries.length === 0 ? (
            <div className="bg-surface rounded-lg shadow-material p-6 text-center">
              <p className="text-gray-500">No recent deliveries.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDeliveries.map((delivery: any) => (
                <div key={delivery.id} className="bg-surface rounded-lg shadow-material p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{delivery.vendor?.name || "Restaurant"}</h4>
                      <p className="text-sm text-gray-600">
                        Completed {new Date(delivery.updatedAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-success">${delivery.deliveryFee}</p>
                      <p className="text-sm text-gray-600">2.3 miles</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <button className="flex flex-col items-center py-2 text-primary">
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button className="flex flex-col items-center py-2 text-gray-600">
            <History className="h-5 w-5" />
            <span className="text-xs mt-1">History</span>
          </button>
          <button className="flex flex-col items-center py-2 text-gray-600">
            <Wallet className="h-5 w-5" />
            <span className="text-xs mt-1">Earnings</span>
          </button>
          <button className="flex flex-col items-center py-2 text-gray-600">
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
