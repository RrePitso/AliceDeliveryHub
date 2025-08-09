import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface OrdersTableProps {
  orders: any[];
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  const { toast } = useToast();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      await apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/vendor"] });
      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (orderId: string, status: string) => {
    updateStatusMutation.mutate({ orderId, status });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "preparing":
        return "bg-warning text-white";
      case "ready":
        return "bg-success text-white";
      case "picked_up":
        return "bg-purple-100 text-purple-700";
      case "delivered":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-error text-white";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Card className="bg-surface shadow-material">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <Button className="bg-primary hover:bg-primary-dark text-white">
            View All Orders
          </Button>
        </div>
        
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No orders yet. Orders will appear here when customers place them.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Items</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">#{order.id.slice(0, 8)}</td>
                    <td className="py-3 px-4">{order.customer?.firstName || "Customer"}</td>
                    <td className="py-3 px-4 text-sm">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </td>
                    <td className="py-3 px-4 font-medium">${order.total}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        {order.status === "pending" && (
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary-dark text-white"
                            onClick={() => handleStatusUpdate(order.id, "confirmed")}
                            disabled={updateStatusMutation.isPending}
                          >
                            Confirm
                          </Button>
                        )}
                        {order.status === "confirmed" && (
                          <Button
                            size="sm"
                            className="bg-warning hover:bg-orange-600 text-white"
                            onClick={() => handleStatusUpdate(order.id, "preparing")}
                            disabled={updateStatusMutation.isPending}
                          >
                            Preparing
                          </Button>
                        )}
                        {order.status === "preparing" && (
                          <Button
                            size="sm"
                            className="bg-success hover:bg-green-600 text-white"
                            onClick={() => handleStatusUpdate(order.id, "ready")}
                            disabled={updateStatusMutation.isPending}
                          >
                            Ready
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updateStatusMutation.isPending}
                        >
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
