import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { useCart } from './cart-context';
import { CreditCard, MapPin, Phone, User, CheckCircle } from 'lucide-react';

// Checkout validation schema
const checkoutSchema = z.object({
  deliveryAddress: z.string().min(10, 'Please provide a complete delivery address'),
  phone: z.string().min(10, 'Please provide a valid phone number'),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckoutModal({ isOpen, onClose, onSuccess }: CheckoutModalProps) {
  const { toast } = useToast();
  const { items, getTotalPrice, getDeliveryFee, clearCart } = useCart();

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryAddress: '',
      phone: '',
      notes: '',
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      // Group items by vendor (in case user orders from multiple restaurants)
      const itemsByVendor = items.reduce((acc, item) => {
        if (!acc[item.vendorId]) {
          acc[item.vendorId] = {
            vendorId: item.vendorId,
            vendorName: item.vendorName,
            items: []
          };
        }
        acc[item.vendorId].items.push({
          menuItemId: item.id,
          quantity: item.quantity,
          price: item.price
        });
        return acc;
      }, {} as Record<string, any>);

      // For now, create one order per vendor
      const orders = Object.values(itemsByVendor).map(async (vendorOrder: any) => {
        const orderData = {
          vendorId: vendorOrder.vendorId,
          items: vendorOrder.items,
          deliveryAddress: data.deliveryAddress,
          customerPhone: data.phone,
          notes: data.notes || '',
          totalAmount: getTotalPrice() + getDeliveryFee(),
          status: 'pending'
        };

        return await apiRequest('POST', '/api/orders', orderData);
      });

      return await Promise.all(orders);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      clearCart();
      toast({
        title: 'Order Placed Successfully!',
        description: 'Your order has been sent to the restaurant. You will receive updates via SMS.',
        variant: 'default',
      });
      onSuccess();
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: 'Unauthorized',
          description: 'You are logged out. Logging in again...',
          variant: 'destructive',
        });
        setTimeout(() => {
          window.location.href = '/api/login';
        }, 500);
        return;
      }
      toast({
        title: 'Order Failed',
        description: 'Failed to place your order. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CheckoutFormData) => {
    placeOrderMutation.mutate(data);
  };

  const subtotal = getTotalPrice();
  const deliveryFee = getDeliveryFee();
  const total = subtotal + deliveryFee;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Complete Your Order
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Form */}
          <div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Delivery Information
                  </h3>

                  <FormField
                    control={form.control}
                    name="deliveryAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Include street address, apartment number, city, and any delivery instructions"
                            className="resize-none h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <div className="text-xs text-gray-500">
                          Required for delivery coordination and order updates
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Instructions (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any special requests or dietary restrictions..."
                            className="resize-none h-16"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Payment Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex">
                    <CreditCard className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Payment</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Payment will be collected upon delivery. Cash and card payments accepted.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-dark text-white"
                  size="lg"
                  disabled={placeOrderMutation.isPending || items.length === 0}
                >
                  {placeOrderMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Place Order (${total.toFixed(2)})
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* Order Summary */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.vendorName} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-800">Estimated Delivery</p>
                  <p className="text-sm text-green-700">25-40 minutes after confirmation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}