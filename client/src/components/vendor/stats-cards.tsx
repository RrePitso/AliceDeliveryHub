import { Card, CardContent } from "@/components/ui/card";
import { Receipt, DollarSign, Clock, Star } from "lucide-react";

interface StatsCardsProps {
  orders: any[];
}

export default function StatsCards({ orders }: StatsCardsProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter(order => 
    new Date(order.createdAt) >= today
  );

  const todayRevenue = todayOrders.reduce((sum, order) => 
    sum + parseFloat(order.total || 0), 0
  );

  const pendingOrders = orders.filter(order => 
    order.status === "pending" || order.status === "confirmed" || order.status === "preparing"
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="bg-surface shadow-material">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-primary bg-opacity-10 rounded-lg">
              <Receipt className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Today's Orders</p>
              <p className="text-2xl font-bold">{todayOrders.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-surface shadow-material">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-success bg-opacity-10 rounded-lg">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Today's Revenue</p>
              <p className="text-2xl font-bold">${todayRevenue.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-surface shadow-material">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-warning bg-opacity-10 rounded-lg">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold">{pendingOrders.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-surface shadow-material">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-secondary bg-opacity-10 rounded-lg">
              <Star className="h-6 w-6 text-secondary" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Rating</p>
              <p className="text-2xl font-bold">4.5</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
