import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { Store, ImageIcon } from 'lucide-react';
import { useState } from 'react';

// Restaurant validation schema
const restaurantSchema = z.object({
  name: z.string().min(2, 'Restaurant name must be at least 2 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  cuisine: z.string().min(1, 'Please select a cuisine type'),
  address: z.string().min(10, 'Please provide a complete address'),
  phone: z.string().min(10, 'Please provide a valid phone number'),
  deliveryTime: z.string().min(1, 'Please specify delivery time'),
  deliveryFee: z.string().min(1, 'Please specify delivery fee').regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid delivery fee'),
  imageUrl: z.string().url('Enter a valid image URL').optional().or(z.literal('')),
});

type RestaurantFormData = z.infer<typeof restaurantSchema>;

interface RestaurantFormProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: any;
  onSuccess: () => void;
}

const cuisineTypes = [
  'American',
  'Italian',
  'Chinese',
  'Japanese',
  'Mexican',
  'Indian',
  'Thai',
  'Mediterranean',
  'French',
  'Korean',
  'Vietnamese',
  'Greek',
  'Lebanese',
  'Turkish',
  'Spanish',
  'Brazilian',
];

const deliveryTimeOptions = [
  '15-25 mins',
  '20-30 mins',
  '25-35 mins',
  '30-45 mins',
  '35-50 mins',
  '45-60 mins',
];

export default function RestaurantForm({ isOpen, onClose, editData, onSuccess }: RestaurantFormProps) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string>(editData?.imageUrl || '');

  const form = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: editData?.name || '',
      description: editData?.description || '',
      cuisine: editData?.cuisine || '',
      address: editData?.address || '',
      phone: editData?.phone || '',
      deliveryTime: editData?.deliveryTime || '',
      deliveryFee: editData?.deliveryFee || '',
      imageUrl: editData?.imageUrl || '',
    },
  });

  const createRestaurantMutation = useMutation({
    mutationFn: async (data: RestaurantFormData) => {
      const endpoint = editData ? `/api/vendors/${editData.id}` : '/api/vendors';
      const method = editData ? 'PATCH' : 'POST';
      return await apiRequest(method, endpoint, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors/my'] });
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      toast({
        title: editData ? 'Restaurant Updated' : 'Restaurant Created',
        description: `${form.getValues('name')} has been ${editData ? 'updated' : 'created successfully'}.`,
      });
      onSuccess();
      onClose();
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
        title: 'Error',
        description: 'Failed to save restaurant information. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: RestaurantFormData) => {
    createRestaurantMutation.mutate(data);
  };

  const handleImageUrlChange = (url: string) => {
    setImagePreview(url);
    form.setValue('imageUrl', url);
  };

  const defaultImage = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Store className="h-5 w-5 mr-2" />
            {editData ? 'Edit Restaurant Information' : 'Create Your Restaurant'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Restaurant Image Preview */}
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={imagePreview || defaultImage}
                  alt="Restaurant preview"
                  className="w-60 h-40 object-cover rounded-lg border"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = defaultImage;
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <ImageIcon className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restaurant Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Tony's Italian Kitchen" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cuisine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cuisine Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select cuisine type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cuisineTypes.map((cuisine) => (
                            <SelectItem key={cuisine} value={cuisine}>
                              {cuisine}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="deliveryTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Time</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {deliveryTimeOptions.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliveryFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Fee ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="2.99"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Description and Location */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restaurant Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell customers about your restaurant, specialties, and what makes you unique..."
                          className="resize-none h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Address</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Include street address, city, state, and zip code"
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
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restaurant Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/restaurant-image.jpg"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleImageUrlChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <div className="text-xs text-gray-500">
                        Paste a URL to an image of your restaurant
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex">
                <Store className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Getting Started</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Once your restaurant is set up, you can start adding menu items and managing orders. 
                    High-quality photos and detailed descriptions help attract more customers.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createRestaurantMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white"
                disabled={createRestaurantMutation.isPending}
              >
                {createRestaurantMutation.isPending 
                  ? (editData ? 'Updating...' : 'Creating...') 
                  : (editData ? 'Update Restaurant' : 'Create Restaurant')
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}