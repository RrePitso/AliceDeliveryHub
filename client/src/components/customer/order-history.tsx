import { Card, CardContent } from "@/components/ui/card";

interface Order {
  id: string;
  vendor?: { name: string };
  items: any[];
  total: string;
  status: string;
  createdAt: string;
}

interface OrderHistoryProps {
  orders: Order[];
  isLoading: boolean;
}

export default function OrderHistory({ orders, isLoading }: OrderHistoryProps) {
  if (isLoading) {
    return (
      <Card className="bg-surface shadow-material">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-6 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-surface shadow-material">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No orders yet. Start by ordering from your favorite restaurant!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4"></div>
                  <div>
                    <h4 className="font-medium">{order.vendor?.name || "Restaurant"}</h4>
                    <p className="text-sm text-gray-600">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    order.status === "delivered" 
                      ? "bg-success text-white" 
                      : order.status === "cancelled"
                      ? "bg-error text-white"
                      : "bg-warning text-white"
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <p className="text-sm font-medium mt-1">${order.total}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
