import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Clock, Star, X } from 'lucide-react';
import { useCart } from '@/components/customer/cart-context';
import type { Vendor, MenuItem } from '@shared/schema';

interface MenuModalProps {
  vendor: Vendor | null;
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity: number) => void;
}

function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  const [quantity, setQuantity] = useState(1);
  const defaultImage = "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300";

  const handleAddToCart = () => {
    onAddToCart(item, quantity);
    setQuantity(1); // Reset quantity after adding
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex">
          <img
            src={item.imageUrl || defaultImage}
            alt={item.name}
            className="w-24 h-24 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = defaultImage;
            }}
          />
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium text-gray-900">{item.name}</h4>
                <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
              </div>
              <div className="text-right ml-4">
                <div className="font-bold text-lg text-green-600">${item.price}</div>
                {item.preparationTime && (
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {item.preparationTime}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {item.category}
                </Badge>
                {item.isAvailable ? (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    Available
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">
                    Unavailable
                  </Badge>
                )}
              </div>
              
              {item.isAvailable && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={quantity >= 10}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleAddToCart}
                    className="bg-primary hover:bg-primary-dark text-white"
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MenuModal({ vendor, isOpen, onClose }: MenuModalProps) {
  const { addToCart } = useCart();

  const { data: menuItems, isLoading } = useQuery({
    queryKey: ['/api/menu-items', vendor?.id],
    enabled: !!vendor?.id,
  });

  const handleAddToCart = (item: MenuItem, quantity: number) => {
    if (!vendor) return;
    
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity,
      vendorId: vendor.id,
      vendorName: vendor.name,
      imageUrl: item.imageUrl,
    });
  };

  if (!vendor) return null;

  // Group menu items by category
  const itemsByCategory = Array.isArray(menuItems) 
    ? menuItems.reduce((acc: Record<string, MenuItem[]>, item: MenuItem) => {
        const category = item.category || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
      }, {})
    : {};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={vendor.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                alt={vendor.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <DialogTitle className="text-xl font-bold">{vendor.name}</DialogTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                    4.5 (120+ reviews)
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {vendor.deliveryTime}
                  </div>
                  <Badge variant="outline">{vendor.cuisine}</Badge>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex">
                    <div className="w-24 h-24 bg-gray-200 rounded"></div>
                    <div className="flex-1 p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : Object.keys(itemsByCategory).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No menu items available.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(itemsByCategory).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{category}</h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>
                  {category !== Object.keys(itemsByCategory)[Object.keys(itemsByCategory).length - 1] && (
                    <Separator className="mt-6" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Delivery fee: <span className="font-medium">${vendor.deliveryFee}</span>
            </div>
            <Button
              onClick={onClose}
              className="bg-primary hover:bg-primary-dark text-white"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}