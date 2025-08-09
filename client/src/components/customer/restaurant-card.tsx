import { Card, CardContent } from "@/components/ui/card";
import { Star, Clock } from "lucide-react";

interface RestaurantCardProps {
  vendor: {
    id: string;
    name: string;
    cuisine: string;
    rating: string;
    reviewCount: number;
    deliveryTime: string;
    deliveryFee: string;
    imageUrl?: string;
  };
}

export default function RestaurantCard({ vendor }: RestaurantCardProps) {
  const defaultImage = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250";

  return (
    <Card className="bg-surface shadow-material hover:shadow-material-lg transition-shadow cursor-pointer">
      <img 
        src={vendor.imageUrl || defaultImage}
        alt={vendor.name}
        className="w-full h-48 object-cover rounded-t-lg"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = defaultImage;
        }}
      />
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1">{vendor.name}</h3>
        <p className="text-gray-600 text-sm mb-2">{vendor.cuisine}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-secondary fill-current" />
            <span className="ml-1 text-sm font-medium">{vendor.rating}</span>
            <span className="text-gray-500 text-sm ml-1">({vendor.reviewCount})</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            {vendor.deliveryTime}
          </div>
        </div>
        <div className="flex items-center mt-2">
          <span className="text-success text-sm">${vendor.deliveryFee} delivery</span>
        </div>
      </CardContent>
    </Card>
  );
}
