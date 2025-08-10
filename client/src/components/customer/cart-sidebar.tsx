import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Trash2, ShoppingBag, CreditCard } from 'lucide-react';
import { useCart } from './cart-context';
import CheckoutModal from './checkout-modal';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, removeFromCart, updateQuantity, getTotalPrice, getTotalItems, getDeliveryFee } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
  };

  const subtotal = getTotalPrice();
  const deliveryFee = getDeliveryFee();
  const total = subtotal + deliveryFee;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:w-96">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Your Order ({getTotalItems()} items)
            </SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-gray-500">
              <ShoppingBag className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Your cart is empty</p>
              <p className="text-sm text-center">
                Browse our restaurants and add some delicious items to get started!
              </p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg border p-3">
                    <div className="flex items-start space-x-3">
                      <img
                        src={item.imageUrl || "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{item.vendorName}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Badge variant="secondary" className="px-2">
                              {item.quantity}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= 10}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-green-600">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">${total.toFixed(2)}</span>
                </div>
                
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-primary hover:bg-primary-dark text-white"
                  size="lg"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={() => {
          setIsCheckoutOpen(false);
          onClose();
        }}
      />
    </>
  );
}