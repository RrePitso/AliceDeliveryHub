import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DeliveryAssignmentProps {
  unassignedOrders: any[];
  availableDrivers: any[];
}

export default function DeliveryAssignment({ unassignedOrders, availableDrivers }: DeliveryAssignmentProps) {
  const { toast } = useToast();

  const assignOrderMutation = useMutation({
    mutationFn: async ({ orderId, driverId }: { orderId: string; driverId: string }) => {
      await apiRequest("PUT", `/api/orders/${orderId}/status`, {
        status: "picked_up",
        driverId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/unassigned"] });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/available"] });
      toast({
        title: "Order Assigned",
        description: "Order has been assigned to driver successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign order",
        variant: "destructive",
      });
    },
  });

  const handleAssignOrder = (orderId: string, driverId: string) => {
    assignOrderMutation.mutate({ orderId, driverId });
  };

  return (
    <Card className="bg-surface shadow-material">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Delivery Assignment</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Unassigned Orders */}
          <div>
            <h3 className="font-medium mb-3">Unassigned Orders ({unassignedOrders.length})</h3>
            {unassignedOrders.length === 0 ? (
              <div className="border rounded-lg p-6 text-center">
                <p className="text-gray-500">No unassigned orders</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {unassignedOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-3 bg-warning bg-opacity-10">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">#{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-600">{order.vendor?.name || "Restaurant"}</p>
                      </div>
                      <span className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{order.deliveryAddress}</p>
                    <div className="flex space-x-2">
                      {availableDrivers.slice(0, 2).map((driver) => (
                        <Button
                          key={driver.userId}
                          size="sm"
                          className="bg-primary hover:bg-primary-dark text-white text-xs"
                          onClick={() => handleAssignOrder(order.id, driver.userId)}
                          disabled={assignOrderMutation.isPending}
                        >
                          Assign to {driver.user?.firstName || "Driver"}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Drivers */}
          <div>
            <h3 className="font-medium mb-3">Available Drivers ({availableDrivers.length})</h3>
            {availableDrivers.length === 0 ? (
              <div className="border rounded-lg p-6 text-center">
                <p className="text-gray-500">No drivers online</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {availableDrivers.map((driver) => (
                  <div key={driver.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {driver.user?.firstName} {driver.user?.lastName}
                        </p>
                        <div className="flex items-center text-sm text-gray-600">
                          <span>⭐ {driver.rating || "4.8"}</span>
                          <span className="mx-2">•</span>
                          <span>{driver.currentLocation || "Downtown"}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {driver.totalDeliveries || 0} deliveries completed
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-success rounded-full mr-2"></div>
                        <span className="text-sm text-success">Online</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
