import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, DollarSign, MapPin } from 'lucide-react';
import type { Vendor } from '@shared/schema';

interface RestaurantCardProps {
  vendor: Vendor;
}

export default function RestaurantCard({ vendor }: RestaurantCardProps) {
  const defaultImage = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400";

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="relative">
        <img
          src={vendor.imageUrl || defaultImage}
          alt={vendor.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = defaultImage;
          }}
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-white/90 text-black">
            <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
            4.5
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors">
              {vendor.name}
            </h3>
            <Badge variant="outline" className="text-xs">
              {vendor.cuisine}
            </Badge>
          </div>
          
          <p className="text-gray-600 text-sm line-clamp-2">
            {vendor.description}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {vendor.deliveryTime}
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              ${vendor.deliveryFee} delivery
            </div>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="truncate">{vendor.address}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}